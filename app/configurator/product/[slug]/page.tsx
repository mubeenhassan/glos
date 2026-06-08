import Link from "next/link";
import {
  attributeValueToLabel,
  filterVariantsBySelections,
  getConfiguratorBySlug,
  parseMultiParam,
  pickAttribute,
  type AttributeDefinition,
  type ProductVariant,
} from "@/lib/catalog";
import {
  asSearchParamsObject,
  configuratorHref,
  toSingle,
  type SearchParams,
} from "@/lib/configuratorFilters";
import { mediaImageUrl, sanityImageUrl, valueToToken } from "@/lib/sanity";
import ConfiguratorFilterPanel from "@/components/configurator/ConfiguratorFilterPanel";
import ConfiguratorMobileFiltersSheet from "@/components/configurator/ConfiguratorMobileFiltersSheet";
import ConfiguratorSkuDetailPanel from "@/components/configurator/ConfiguratorSkuDetailPanel";
import ConfiguratorVariantCard from "@/components/configurator/ConfiguratorVariantCard";
import ConfiguratorPageAnimations from "@/components/configurator/ConfiguratorPageAnimations";
import { buildSkuDetailPayload } from "@/lib/configuratorSkuDetail";

function formatNumericFilterLabel(value: number, unit?: string) {
  const formatted = Number.isInteger(value)
    ? value.toString()
    : value.toFixed(2).replace(/\.?0+$/, "");
  return unit ? `${formatted} ${unit}` : formatted;
}

function formatNumericParamValue(value: number) {
  return Number.isInteger(value)
    ? String(value)
    : value.toFixed(2).replace(/\.?0+$/, "");
}

function parseNumericRangeParam(
  rawValue: string | string[] | undefined,
  minBound: number,
  maxBound: number,
) {
  const value = toSingle(rawValue);
  if (!value) {
    return null;
  }

  const match = value.match(/^(-?\d+(?:\.\d+)?)-(-?\d+(?:\.\d+)?)$/);
  if (!match) {
    return null;
  }

  let min = Number(match[1]);
  let max = Number(match[2]);

  if (Number.isNaN(min) || Number.isNaN(max)) {
    return null;
  }

  if (min > max) {
    [min, max] = [max, min];
  }

  const clampedMin = Math.max(minBound, Math.min(min, maxBound));
  const clampedMax = Math.max(minBound, Math.min(max, maxBound));
  return {
    min: clampedMin,
    max: clampedMax,
  };
}

function dedupeDefinitions(definitions: AttributeDefinition[]) {
  const seenIds = new Set<string>();
  const seenKeys = new Set<string>();

  return definitions.filter((definition) => {
    if (seenIds.has(definition._id) || seenKeys.has(definition.key)) {
      return false;
    }

    seenIds.add(definition._id);
    seenKeys.add(definition.key);
    return true;
  });
}

function getColumnValue(variant: ProductVariant, key: string) {
  if (key === "sku") {
    return variant.sku;
  }

  const spec = pickAttribute(variant.specAttributes, key);
  const config = pickAttribute(variant.configSelections, key);

  return attributeValueToLabel(spec) || attributeValueToLabel(config) || "—";
}

function toValueTokens(
  value: ProductVariant["specAttributes"][number] | undefined,
) {
  if (!value) {
    return [];
  }

  if (value.singleOptionValue?.value) {
    return [valueToToken(value.singleOptionValue.value)];
  }

  if (value.multiOptionValues?.length) {
    return value.multiOptionValues.map((item) => valueToToken(item.value));
  }

  if (typeof value.booleanValue === "boolean") {
    return [String(value.booleanValue)];
  }

  if (typeof value.textValue === "string" && value.textValue.length > 0) {
    return [valueToToken(value.textValue)];
  }

  if (typeof value.numberValue === "number") {
    return [formatNumericParamValue(value.numberValue)];
  }

  return [];
}

function getVariantAttribute(variant: ProductVariant, key: string) {
  return (
    pickAttribute(variant.configSelections, key) ||
    pickAttribute(variant.specAttributes, key)
  );
}

type FilterOptionLike = {
  label: string;
  value: string;
};

function resolveFilterTokensFromAttribute(
  attribute: ProductVariant["specAttributes"][number],
  definition: AttributeDefinition,
  options: FilterOptionLike[],
) {
  if (
    definition.valueType === "number" &&
    typeof attribute.numberValue === "number"
  ) {
    const numericToken = formatNumericParamValue(attribute.numberValue);
    const matchedOption = options.find(
      (option) => option.value === numericToken,
    );
    return [matchedOption?.value ?? numericToken];
  }

  if (attribute.singleOptionValue) {
    const selected = attribute.singleOptionValue;
    const matchedOption = options.find(
      (option) =>
        valueToToken(option.value) === valueToToken(selected.value) ||
        valueToToken(option.label) === valueToToken(selected.label) ||
        valueToToken(option.label) === valueToToken(selected.value),
    );

    if (matchedOption) {
      return [valueToToken(matchedOption.value)];
    }
  }

  if (attribute.multiOptionValues?.length) {
    const tokens = attribute.multiOptionValues.flatMap((selected) => {
      const matchedOption = options.find(
        (option) =>
          valueToToken(option.value) === valueToToken(selected.value) ||
          valueToToken(option.label) === valueToToken(selected.label),
      );

      return matchedOption
        ? [valueToToken(matchedOption.value)]
        : [valueToToken(selected.value)];
    });

    return Array.from(new Set(tokens));
  }

  return toValueTokens(attribute);
}

function getVariantFilterTokens(
  variant: ProductVariant | undefined,
  definition: AttributeDefinition,
  options: FilterOptionLike[] = [],
) {
  if (!variant) {
    return [];
  }

  const attribute = getVariantAttribute(variant, definition.key);
  if (!attribute) {
    return [];
  }

  return resolveFilterTokensFromAttribute(attribute, definition, options);
}

export default async function ConfiguratorPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<SearchParams>;
}) {
  const [{ slug }, rawSearch] = await Promise.all([params, searchParams]);
  const { product, config, options } = await getConfiguratorBySlug(slug);

  if (!product) {
    return (
      <main className="page-wrap">
        <section className="section">
          <h3>Configurator not found</h3>
          <Link href="/products" className="btn" style={{ marginTop: 10 }}>
            Back to products
          </Link>
        </section>
      </main>
    );
  }

  const filterDefinitions = dedupeDefinitions(config.filterDefinitions);
  const tableColumns = dedupeDefinitions(config.tableColumns);
  const defaultVisibleColumns = dedupeDefinitions(config.defaultVisibleColumns);

  const urlParams = asSearchParamsObject(rawSearch);

  const requestedSkuId = toSingle(rawSearch.skuId);
  const normalizedRequestedSkuId = requestedSkuId
    ? valueToToken(requestedSkuId)
    : undefined;

  const selectedVariantBySku =
    (requestedSkuId
      ? product.variants.find(
          (variant) =>
            variant._id === requestedSkuId ||
            valueToToken(variant.sku) === normalizedRequestedSkuId,
        )
      : undefined) ?? undefined;

  const numericFilterMetaByDefinitionKey = new Map<
    string,
    {
      minBound: number;
      maxBound: number;
      selectedMin: number;
      selectedMax: number;
      step: number;
    }
  >();

  const numericFilterOptionsByDefinitionKey = new Map<
    string,
    { _id: string; label: string; value: string; definitionRef: string }[]
  >();

  filterDefinitions
    .filter((definition) => definition.valueType === "number")
    .forEach((definition) => {
      const uniqueValues = new Set<number>();

      product.variants.forEach((variant) => {
        const attribute =
          pickAttribute(variant.configSelections, definition.key) ||
          pickAttribute(variant.specAttributes, definition.key);

        if (typeof attribute?.numberValue === "number") {
          uniqueValues.add(attribute.numberValue);
        }
      });

      const sortedValues = Array.from(uniqueValues).sort((a, b) => a - b);
      if (sortedValues.length > 0) {
        const minBound = sortedValues[0];
        const maxBound = sortedValues[sortedValues.length - 1];
        const selectedRange = parseNumericRangeParam(
          rawSearch[definition.key],
          minBound,
          maxBound,
        );

        numericFilterMetaByDefinitionKey.set(definition.key, {
          minBound,
          maxBound,
          selectedMin: selectedRange?.min ?? minBound,
          selectedMax: selectedRange?.max ?? maxBound,
          step: sortedValues.some((value) => !Number.isInteger(value))
            ? 0.1
            : 1,
        });
      }

      const numericOptions = sortedValues.map((value) => {
        const valueToken = String(value);
        return {
          _id: `${definition._id}-${valueToken}`,
          label: formatNumericFilterLabel(value, definition.unit),
          value: valueToken,
          definitionRef: definition._id,
        };
      });

      numericFilterOptionsByDefinitionKey.set(definition.key, numericOptions);
    });

  const selectedFilters = filterDefinitions.reduce<Record<string, string[]>>(
    (acc, definition) => {
      if (definition.valueType === "number") {
        const meta = numericFilterMetaByDefinitionKey.get(definition.key);
        if (!meta) {
          acc[definition.key] = [];
          return acc;
        }

        const hasActiveRange =
          meta.selectedMin !== meta.minBound ||
          meta.selectedMax !== meta.maxBound;
        acc[definition.key] = hasActiveRange
          ? [
              `${formatNumericParamValue(meta.selectedMin)}-${formatNumericParamValue(meta.selectedMax)}`,
            ]
          : [];

        return acc;
      }

      acc[definition.key] = parseMultiParam(rawSearch[definition.key]);
      return acc;
    },
    {},
  );

  const stockedOnly = toSingle(rawSearch.stocked) === "1";
  const skuQuery = toSingle(rawSearch.q) || "";

  const optionsByDefinition = new Map<string, typeof options>();
  options.forEach((option) => {
    const existing = optionsByDefinition.get(option.definitionRef) ?? [];
    existing.push(option);
    optionsByDefinition.set(option.definitionRef, existing);
  });

  if (selectedVariantBySku) {
    filterDefinitions
      .filter((definition) => definition.valueType === "number")
      .forEach((definition) => {
        const attribute = getVariantAttribute(
          selectedVariantBySku,
          definition.key,
        );

        if (typeof attribute?.numberValue !== "number") {
          return;
        }

        const meta = numericFilterMetaByDefinitionKey.get(definition.key);
        if (!meta) {
          return;
        }

        const value = attribute.numberValue;
        numericFilterMetaByDefinitionKey.set(definition.key, {
          ...meta,
          selectedMin: value,
          selectedMax: value,
        });
      });
  }

  const lockedFiltersFromSku = filterDefinitions.reduce<
    Record<string, string[]>
  >((acc, definition) => {
    const definitionOptions =
      definition.valueType === "number"
        ? (numericFilterOptionsByDefinitionKey.get(definition.key) ?? [])
        : (optionsByDefinition.get(definition._id) ?? []);
    const tokens = getVariantFilterTokens(
      selectedVariantBySku,
      definition,
      definitionOptions,
    );

    if (tokens.length > 0) {
      acc[definition.key] = tokens;
    }

    return acc;
  }, {});

  const lockFiltersToSelectedSku = Boolean(selectedVariantBySku);
  const activeFilters = lockFiltersToSelectedSku
    ? lockedFiltersFromSku
    : selectedFilters;
  const effectiveStockedOnly = lockFiltersToSelectedSku
    ? Boolean(selectedVariantBySku?.isStocked && stockedOnly)
    : stockedOnly;

  const sizeParam = Number(
    toSingle(rawSearch.pageSize) || config.defaultPageSize,
  );
  const pageSize = config.pageSizeOptions.includes(sizeParam)
    ? sizeParam
    : config.defaultPageSize;

  const listFilteredVariants = filterVariantsBySelections(
    product.variants,
    selectedFilters,
    stockedOnly,
    skuQuery,
  );

  const page = Number(toSingle(rawSearch.page) || "1");
  const totalPages = Math.max(
    1,
    Math.ceil(listFilteredVariants.length / pageSize),
  );
  const safePage = Math.min(Math.max(page, 1), totalPages);
  const pagedVariants = listFilteredVariants.slice(
    (safePage - 1) * pageSize,
    safePage * pageSize,
  );

  const visibleColumns =
    defaultVisibleColumns.length > 0 ? defaultVisibleColumns : tableColumns;
  const nonSkuColumns = visibleColumns.filter((column) => column.key !== "sku");

  const selectedVariant = selectedVariantBySku;

  const featuredVariant =
    selectedVariant || pagedVariants[0] || listFilteredVariants[0];
  const previewMedia =
    (featuredVariant?.previewMedia && featuredVariant.previewMedia.length > 0
      ? featuredVariant.previewMedia
      : product.heroMedia) || [];
  const previewUrl =
    mediaImageUrl(previewMedia[0], 960) ||
    mediaImageUrl(featuredVariant?.previewMedia?.[0], 960);
  const previewThumbs = previewMedia.slice(0, 4);
  const skuDetail = buildSkuDetailPayload(selectedVariant);
  const hasActiveFilters =
    stockedOnly ||
    Boolean(skuQuery) ||
    Boolean(requestedSkuId) ||
    Object.values(selectedFilters).some((values) => values.length > 0);

  const stockedParams = new URLSearchParams(urlParams.toString());
  if (stockedOnly) {
    stockedParams.delete("stocked");
  } else {
    stockedParams.set("stocked", "1");
  }
  stockedParams.set("page", "1");

  const clearSkuParams = new URLSearchParams(urlParams.toString());
  clearSkuParams.delete("skuId");
  const clearFiltersHref = configuratorHref(product.slug, "");
  const prevPageHref =
    safePage > 1
      ? configuratorHref(
          product.slug,
          (() => {
            const prevParams = new URLSearchParams(urlParams.toString());
            prevParams.set("page", String(safePage - 1));
            return prevParams.toString();
          })(),
        )
      : null;
  const nextPageHref =
    safePage < totalPages
      ? configuratorHref(
          product.slug,
          (() => {
            const nextParams = new URLSearchParams(urlParams.toString());
            nextParams.set("page", String(safePage + 1));
            return nextParams.toString();
          })(),
        )
      : null;
  const sidebarTitle = product.family || product.name;

  const stockCheckClass = (active: boolean) =>
    active
      ? 'border-[#FB612E] bg-[#FB612E]'
      : 'border-black/10 bg-white'

  const filterPanelProps = {
    sidebarTitle,
    hasActiveFilters,
    clearFiltersHref,
    enableStockOnlyToggle: config.enableStockOnlyToggle !== false,
    lockFiltersToSelectedSku,
    effectiveStockedOnly,
    stockedOnly,
    stockedParams,
    stockCheckClass,
    filterDefinitions,
    numericFilterMetaByDefinitionKey,
    numericFilterOptionsByDefinitionKey,
    optionsByDefinition,
    activeFilters,
    productSlug: product.slug,
    urlParams,
  };

  return (
    <main className="configurator-page w-full py-32 pt-40 max-[1260px]:py-20 max-[1260px]:pt-28">
      <div className="cms-section-width grid gap-5 max-[1260px]:gap-6">
        <header className="mb-10 flex flex-col-reverse md:flex-row gap-3 max-[1260px]:mb-0 min-[1261px]:mb-10 min-[1261px]:flex-row min-[1261px]:flex-wrap min-[1261px]:items-end min-[1261px]:justify-between min-[1261px]:gap-4">
          <h1 className="js-cfg-title m-0 truncate text-[24px] md:text-[clamp(2rem,4vw,3.8rem)] font-[500] md:font-[600] leading-[1.02] tracking-[-0.03em] text-[#111827] max-[1260px]:text-[2rem]">
            {product.name}
          </h1>
          <nav
            className="js-cfg-breadcrumb flex flex-wrap items-center gap-1 md:gap-2 text-sm font-[400] text-[#6b7280] [&_a:hover]:text-(--color-brand-orange)"
            aria-label="Breadcrumb"
          >
            <Link href="/">Home</Link>
            <span aria-hidden="true" className="text-[#0000001A]">
              /
            </span>
            <Link href="/products">Products</Link>  
            <span aria-hidden="true" className="text-[#0000001A]">
              /
            </span>
            <Link
              href={`/products/${product.slug}`}
              className="hidden min-[1261px]:inline"
            >
              {product.name}
            </Link>
            <span
              aria-hidden="true"
              className="hidden text-[#0000001A] min-[1261px]:inline"
            >
              /
            </span>
            <span className="font-semibold text-[#FB612E] min-[1261px]:hidden">
              {product.name}
            </span>
            <span className="hidden font-semibold text-(--color-brand-orange) min-[1261px]:inline">
              Product Configuration
            </span>
          </nav>
        </header>

        <div className="grid grid-cols-1 gap-6 min-[1261px]:grid-cols-[minmax(300px,360px)_minmax(0,1fr)] min-[1261px]:items-start min-[1261px]:gap-8">
          <section className="order-1 min-[1261px]:col-start-2 min-[1261px]:row-start-1">
            <div className="js-cfg-preview w-full overflow-hidden rounded-lg">
              {previewUrl ? (
                <img
                  src={previewUrl}
                  alt={featuredVariant?.sku || product.name}
                  className="js-cfg-preview-image h-full max-h-[320px] w-full object-cover max-[1260px]:max-h-[240px]"
                />
              ) : (
                <div className="product-placeholder min-h-[240px]" />
              )}
            </div>
            <div className="mt-4 md:flex hidden items-center gap-3 overflow-x-auto min-[1261px]:mt-4 min-[1261px]:gap-4">
              {previewThumbs.map((item, index) => {
                const thumb = mediaImageUrl(item, 160);

                return (
                  <span
                    key={index}
                    className="js-cfg-preview-thumb grid h-[72px] w-[96px] shrink-0 overflow-hidden rounded-lg bg-white min-[1261px]:max-h-[162px] min-[1261px]:max-w-[226px] min-[1261px]:h-auto min-[1261px]:w-auto min-[1261px]:flex-1"
                  >
                    {thumb ? (
                      <img
                        src={thumb}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="mx-auto h-1 w-[18px] rounded-full bg-[#d1d5db]" />
                    )}
                  </span>
                );
              })}
            </div>
          </section>

          <div className="js-cfg-sidebar order-2 flex flex-col gap-6 min-[1261px]:col-start-1 min-[1261px]:row-start-1 min-[1261px]:row-span-2 min-[1261px]:gap-8 min-[1261px]:self-start min-[1261px]:sticky min-[1261px]:top-24">
            <section>
              <div className="mb-4 flex items-start justify-between gap-3">
                <h2 className="m-0 text-sm font-bold leading-5 text-[#111827]">
                  Products in this Collection
                </h2>
                {hasActiveFilters ? (
                  <Link
                    className="whitespace-nowrap text-sm font-semibold text-[#FB612E] hover:text-[#FB612E] min-[1261px]:hidden"
                    href={clearFiltersHref}
                    scroll={false}
                  >
                    Clear all
                  </Link>
                ) : null}
              </div>
              <div className="flex gap-4 overflow-x-auto">
                {(product.availableModels || []).map((item) => {
                  const modelImage = sanityImageUrl(item.listingCardImage, 260);

                  return (
                    <Link
                      key={item._id}
                      href={configuratorHref(item.slug, "")}
                      className="js-cfg-collection-model w-[96px] shrink-0 overflow-hidden rounded-lg bg-[#fafafa]"
                    >
                      <div className="grid aspect-square place-items-center">
                        {modelImage ? (
                          <img
                            src={modelImage}
                            alt={item.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="product-placeholder" />
                        )}
                      </div>
                    </Link>
                  );
                })}
              </div>
            </section>

            <div className="hidden products-filter-sidebar min-[1261px]:flex min-[1261px]:flex-col min-[1261px]:gap-4">
              <ConfiguratorFilterPanel {...filterPanelProps} />
            </div>
          </div>

          <div className="order-3 min-[1261px]:hidden">
            <ConfiguratorMobileFiltersSheet clearFiltersHref={clearFiltersHref}>
              <ConfiguratorFilterPanel
                {...filterPanelProps}
                showClearInHeader={false}
              />
            </ConfiguratorMobileFiltersSheet>
          </div>

          <section className="order-4 flex min-h-[360px] flex-col gap-4 min-[1261px]:col-start-2 min-[1261px]:row-start-2">
            <h2 className="m-0 text-[18px] font-[700] leading-5 text-[#111827] min-[1261px]:hidden">
              Available Products ({listFilteredVariants.length})
            </h2>

            <div className="cfg-sku-list-anchor">
              <div className="cfg-sku-rows relative">
                {skuDetail ? (
                  <ConfiguratorSkuDetailPanel
                    detail={skuDetail}
                    closeHref={configuratorHref(
                      product.slug,
                      clearSkuParams.toString(),
                    )}
                  />
                ) : null}

                <div className="js-cfg-variant-list flex flex-col gap-3 min-[1261px]:gap-3">
                {pagedVariants.length === 0 ? (
                  <div className="rounded-lg border border-[#eceef2] bg-white px-5 py-6">
                    <span className="text-sm leading-5 text-[#6b7280]">
                      No variants match these filters.
                    </span>
                  </div>
                ) : null}

                {pagedVariants.map((variant) => {
                  const detailParams = new URLSearchParams(urlParams.toString());
                  detailParams.set("skuId", variant._id);
                  const detailHref = configuratorHref(
                    product.slug,
                    detailParams.toString(),
                  );

                  return (
                    <ConfiguratorVariantCard
                      key={variant._id}
                      variant={variant}
                      nonSkuColumns={nonSkuColumns}
                      detailHref={detailHref}
                      getColumnValue={getColumnValue}
                    />
                  );
                })}
                </div>
              </div>

              <div className="js-cfg-pagination flex flex-wrap items-center justify-between gap-4 pt-1">
                <p className="m-0 text-sm leading-5 text-[#6b7280]">
                  Page {safePage} of {totalPages}
                </p>

                <div className="inline-flex gap-2">
                  {prevPageHref ? (
                    <Link
                      href={prevPageHref}
                      scroll={false}
                      className="inline-flex min-h-10 min-w-[104px] items-center justify-center rounded-md border border-[#e5e7eb] bg-white px-4 text-sm font-medium text-[#111827] hover:border-[#d1d5db]"
                    >
                      Previous
                    </Link>
                  ) : (
                    <span className="pointer-events-none inline-flex min-h-10 min-w-[104px] items-center justify-center rounded-md border border-[#e5e7eb] bg-white px-4 text-sm font-medium text-[#111827] opacity-45">
                      Previous
                    </span>
                  )}
                  {nextPageHref ? (
                    <Link
                      href={nextPageHref}
                      scroll={false}
                      className="inline-flex min-h-10 min-w-[104px] items-center justify-center rounded-md border border-[#e5e7eb] bg-white px-4 text-sm font-medium text-[#111827] hover:border-[#d1d5db]"
                    >
                      Next
                    </Link>
                  ) : (
                    <span className="pointer-events-none inline-flex min-h-10 min-w-[104px] items-center justify-center rounded-md border border-[#e5e7eb] bg-white px-4 text-sm font-medium text-[#111827] opacity-45">
                      Next
                    </span>
                  )}
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
      <ConfiguratorPageAnimations />
    </main>
  );
}
