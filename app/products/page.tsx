import Link from "next/link";
import {
  attributeValueToLabel,
  attributeValueToTokens,
  filterVariantsBySelections,
  getListingData,
  parseMultiParam,
  pickAttribute,
  type AttributeDefinition,
} from "@/lib/catalog";
import { sanityImageUrl, valueToToken } from "@/lib/sanity";
import NumericRangeFilter from "@/components/NumericRangeFilter";
import ProductsDiscreteRangeFilter from "@/components/products/ProductsDiscreteRangeFilter";
import ProductsFilterCheckboxGroup from "@/components/products/ProductsFilterCheckboxGroup";
import ProductsFilterDropdown from "@/components/products/ProductsFilterDropdown";
import ProductsMobileFiltersSheet from "@/components/products/ProductsMobileFiltersSheet";
import ProductsFilterSidebar from "@/components/products/ProductsFilterSidebar";
import ProductListingCard from "@/components/products/ProductListingCard";
import ProductsCatalogAnimations from "@/components/ProductsCatalogAnimations";
import ProductsSortDropdown from "@/components/products/ProductsSortDropdown";

type SearchParams = Record<string, string | string[] | undefined>;

function toSingle(value: string | string[] | undefined) {
  if (Array.isArray(value)) {
    return value[0];
  }

  return value;
}

function asSearchParamsObject(raw: SearchParams) {
  const params = new URLSearchParams();

  Object.entries(raw).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach((item) => params.append(key, item));
      return;
    }

    if (typeof value === "string" && value.length > 0) {
      params.set(key, value);
    }
  });

  return params;
}

function toggleFilter(
  base: URLSearchParams,
  definition: AttributeDefinition,
  value: string,
  single = false,
) {
  const next = new URLSearchParams(base.toString());
  const selected = parseMultiParam(next.get(definition.key));

  let updated: string[];

  if (single) {
    updated = selected.includes(value) ? [] : [value];
  } else {
    updated = selected.includes(value)
      ? selected.filter((item) => item !== value)
      : [...selected, value];
  }

  if (updated.length === 0) {
    next.delete(definition.key);
  } else {
    next.set(definition.key, updated.join(","));
  }

  next.set("page", "1");

  return `/products?${next.toString()}`;
}

function clearFilter(base: URLSearchParams, key: string) {
  const next = new URLSearchParams(base.toString());
  next.delete(key);
  next.set("page", "1");
  return `/products?${next.toString()}`;
}

function parseNumberFromToken(token: string) {
  const match = token.match(/-?\d+(\.\d+)?/);
  return match ? Number(match[0]) : Number.NaN;
}

function usesCheckboxMultiFilter(
  definition: AttributeDefinition,
  control: string,
) {
  if (definition.valueType === "multiOption") {
    return true;
  }

  if (control === "checkboxgroup") {
    return true;
  }

  return definition.key === "finish";
}

function normalizeFilterLabel(value: string | undefined) {
  return valueToToken((value || "").replace(/[^a-zA-Z0-9]/g, ""));
}

function usesForcedDropdownFilter(definition: AttributeDefinition) {
  const key = normalizeFilterLabel(definition.key);
  const title = normalizeFilterLabel(definition.title);
  return (
    key === "wattage" ||
    key === "beamangle" ||
    title === "wattage" ||
    title === "beamangle"
  );
}

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

function swatchColor(label: string) {
  const token = valueToToken(label);
  if (token.includes("black")) return "#1d1e22";
  if (token.includes("white")) return "#f3f3f3";
  if (token.includes("grey") || token.includes("gray")) return "#b8bac0";
  if (token.includes("gold")) return "#b58b4d";
  if (token.includes("aluminium") || token.includes("aluminum"))
    return "#c8cacf";
  if (token.includes("bronze")) return "#7f6550";
  return "#cfd2d8";
}

type FilterOption = {
  _id: string;
  label: string;
  value: string;
  definitionRef: string;
};

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const [rawSearch, listingData] = await Promise.all([
    searchParams,
    getListingData(),
  ]);

  const urlParams = asSearchParamsObject(rawSearch);
  const configuredTabs = (listingData.config.tabs || []).filter(
    (tab): tab is NonNullable<typeof tab> => Boolean(tab?.key && tab?.label),
  );
  const listingTabs =
    configuredTabs.length > 0
      ? configuredTabs
      : [
          {
            _key: "all",
            key: "all",
            label: "All Products",
            mode: "all" as const,
          },
        ];
  const requestedTab = toSingle(rawSearch.tab);
  const activeTabConfig =
    listingTabs.find((item) => item.key === requestedTab) || listingTabs[0];
  const activeTabKey = activeTabConfig?.key || "all";
  const stockOnlyMode = activeTabConfig?.mode === "inStock";
  const sort =
    toSingle(rawSearch.sort) || listingData.config.defaultSort || "recommended";
  const page = Number(toSingle(rawSearch.page) || "1");
  const pageSize = listingData.config.itemsPerPage || 24;

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
  const derivedFilterOptionsByDefinitionKey = new Map<string, FilterOption[]>();

  (listingData.config.filterDefinitions || [])
    .filter((definition) => definition.valueType === "number")
    .forEach((definition) => {
      const uniqueValues = new Set<number>();

      listingData.products.forEach((product) => {
        product.variants.forEach((variant) => {
          const attribute =
            pickAttribute(variant.configSelections, definition.key) ||
            pickAttribute(variant.specAttributes, definition.key);
          if (typeof attribute?.numberValue === "number") {
            uniqueValues.add(attribute.numberValue);
          }
        });
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

      const options = sortedValues.map((value) => {
        const valueToken = String(value);
        return {
          _id: `${definition._id}-${valueToken}`,
          label: formatNumericFilterLabel(value, definition.unit),
          value: valueToken,
          definitionRef: definition._id,
        };
      });

      numericFilterOptionsByDefinitionKey.set(definition.key, options);
    });
  (listingData.config.filterDefinitions || [])
    .filter(
      (definition) =>
        definition.valueType === "text" || definition.valueType === "boolean",
    )
    .forEach((definition) => {
      const deduped = new Map<string, FilterOption>();

      listingData.products.forEach((product) => {
        product.variants.forEach((variant) => {
          const attribute =
            pickAttribute(variant.configSelections, definition.key) ||
            pickAttribute(variant.specAttributes, definition.key);

          if (!attribute) {
            return;
          }

          const tokens = attributeValueToTokens(attribute);
          const label = attributeValueToLabel(attribute);
          const rawTextValue =
            typeof attribute.textValue === "string"
              ? attribute.textValue
              : undefined;

          tokens.forEach((token) => {
            if (!token || deduped.has(token)) {
              return;
            }

            const fallbackLabel =
              definition.valueType === "boolean"
                ? token === "true"
                  ? "Yes"
                  : "No"
                : token;

            deduped.set(token, {
              _id: `${definition._id}-${token}`,
              label: label || rawTextValue || fallbackLabel,
              value: rawTextValue || token,
              definitionRef: definition._id,
            });
          });
        });
      });

      const options = Array.from(deduped.values()).sort((a, b) => {
        if (definition.valueType === "boolean") {
          if (valueToToken(a.value) === valueToToken(b.value)) {
            return 0;
          }
          return valueToToken(a.value) === "true" ? -1 : 1;
        }
        return a.label.localeCompare(b.label);
      });

      derivedFilterOptionsByDefinitionKey.set(definition.key, options);
    });

  const selectedFilters = (listingData.config.filterDefinitions || []).reduce<
    Record<string, string[]>
  >((acc, definition) => {
    if (definition.valueType !== "number") {
      acc[definition.key] = parseMultiParam(rawSearch[definition.key]);
      return acc;
    }

    const meta = numericFilterMetaByDefinitionKey.get(definition.key);
    if (!meta) {
      acc[definition.key] = [];
      return acc;
    }

    const hasActiveRange =
      meta.selectedMin !== meta.minBound || meta.selectedMax !== meta.maxBound;
    acc[definition.key] = hasActiveRange
      ? [
          `${formatNumericParamValue(meta.selectedMin)}-${formatNumericParamValue(meta.selectedMax)}`,
        ]
      : [];
    return acc;
  }, {});

  const filteredProducts = listingData.products
    .map((product) => {
      const matchingVariants = filterVariantsBySelections(
        product.variants,
        selectedFilters,
        stockOnlyMode,
      );

      if (matchingVariants.length === 0) {
        return null;
      }

      return {
        ...product,
        matchingVariants,
      };
    })
    .filter((product): product is NonNullable<typeof product> =>
      Boolean(product),
    );

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sort === "nameAsc") {
      return a.name.localeCompare(b.name);
    }

    if (sort === "nameDesc") {
      return b.name.localeCompare(a.name);
    }

    if (sort === "newest") {
      if (a.isNew === b.isNew) {
        return a.name.localeCompare(b.name);
      }

      return a.isNew ? -1 : 1;
    }

    return (a.sortPriority ?? 9999) - (b.sortPriority ?? 9999);
  });

  const totalPages = Math.max(1, Math.ceil(sortedProducts.length / pageSize));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const startIndex = (safePage - 1) * pageSize;
  const pagedProducts = sortedProducts.slice(startIndex, startIndex + pageSize);

  const baseForReset = new URLSearchParams();
  if (sort) {
    baseForReset.set("sort", sort);
  }
  if (activeTabKey) {
    baseForReset.set("tab", activeTabKey);
  }

  const sortOptions = [
    { key: "recommended", label: "Featured" },
    { key: "newest", label: "Newest" },
    { key: "nameAsc", label: "A-Z" },
  ] as const;

  const activeFilterCount = Object.values(selectedFilters).reduce(
    (count, values) => count + values.length,
    0,
  );

  const preferredFilterOrderGroups = [
    ["brightness"],
    ["finish", "finishing"],
    ["colortemperature", "colourtemperature"],
    ["beamangle"],
    ["length", "lengthmm"],
    ["width", "widthmm"],
    ["diameter", "diametermm"],
    ["voltage"],
    ["weight"],
  ];

  const orderedFilterDefinitions = [
    ...(listingData.config.filterDefinitions || []),
  ].sort((a, b) => {
    const aTokens = [
      normalizeFilterLabel(a.key),
      normalizeFilterLabel(a.title),
    ].filter(Boolean);
    const bTokens = [
      normalizeFilterLabel(b.key),
      normalizeFilterLabel(b.title),
    ].filter(Boolean);

    const aRank = preferredFilterOrderGroups.findIndex((group) =>
      aTokens.some((token) => group.includes(token)),
    );
    const bRank = preferredFilterOrderGroups.findIndex((group) =>
      bTokens.some((token) => group.includes(token)),
    );
    const normalizedARank = aRank === -1 ? undefined : aRank;
    const normalizedBRank = bRank === -1 ? undefined : bRank;

    if (normalizedARank !== undefined && normalizedBRank !== undefined) {
      return normalizedARank - normalizedBRank;
    }
    if (normalizedARank !== undefined) {
      return -1;
    }
    if (normalizedBRank !== undefined) {
      return 1;
    }
    return (a.title || "").localeCompare(b.title || "");
  });

  function buildProductsHref(overrides: Record<string, string | undefined>) {
    const params = new URLSearchParams(urlParams.toString());
    Object.entries(overrides).forEach(([key, value]) => {
      if (value === undefined || value === "") {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    });
    return `/products?${params.toString()}`;
  }

  const prevPageHref =
    safePage > 1 ? buildProductsHref({ page: String(safePage - 1) }) : null;
  const nextPageHref =
    safePage < totalPages
      ? buildProductsHref({ page: String(safePage + 1) })
      : null;

  function renderFilterDefinition(
    definition: (typeof orderedFilterDefinitions)[number],
  ) {
    const numericMeta = numericFilterMetaByDefinitionKey.get(definition.key);
    const options =
      definition.valueType === "number"
        ? numericFilterOptionsByDefinitionKey.get(definition.key) || []
        : (() => {
            const configuredOptions = listingData.options.filter(
              (option) => option.definitionRef === definition._id,
            );
            if (configuredOptions.length > 0) {
              return configuredOptions;
            }
            return (
              derivedFilterOptionsByDefinitionKey.get(definition.key) || []
            );
          })();
    const selected = selectedFilters[definition.key] || [];
    const singleSelect = definition.valueType === "singleOption";
    const selectedLabels = options
      .filter((option) => selected.includes(valueToToken(option.value)))
      .map((option) => option.label);
    const control = definition.uiControl || "chips";
    const shouldRenderAsDropdown =
      control === "dropdown" || usesForcedDropdownFilter(definition);
    const clearHref = clearFilter(urlParams, definition.key);
    const sortedRangeOptions = [...options].sort((a, b) => {
      const aNumber = parseNumberFromToken(a.value || a.label);
      const bNumber = parseNumberFromToken(b.value || b.label);
      if (Number.isNaN(aNumber) || Number.isNaN(bNumber)) {
        return a.label.localeCompare(b.label);
      }
      return aNumber - bNumber;
    });
    const activeRangeIndex = sortedRangeOptions.findIndex((option) =>
      selected.includes(valueToToken(option.value)),
    );

    return (
      <div className="products-filter-block filter-block" key={definition._id}>
        <h4 className="filter-title">{definition.title}</h4>
        {definition.valueType === "number" && control === "range" ? (
          numericMeta ? (
            <NumericRangeFilter
              key={`${definition.key}-${numericMeta.selectedMin}-${numericMeta.selectedMax}`}
              paramKey={definition.key}
              minBound={numericMeta.minBound}
              maxBound={numericMeta.maxBound}
              selectedMin={numericMeta.selectedMin}
              selectedMax={numericMeta.selectedMax}
              step={numericMeta.step}
              unit={definition.unit}
            />
          ) : (
            <span className="meta">No numeric values configured</span>
          )
        ) : options.length === 0 ? (
          <span className="meta">No options configured</span>
        ) : shouldRenderAsDropdown ? (
          <ProductsFilterDropdown
            displayLabel={selectedLabels[0] || "Any"}
            options={[
              {
                label: "Any",
                href: clearHref,
                active: selected.length === 0,
              },
              ...options.map((option) => {
                const token = valueToToken(option.value);
                return {
                  label: option.label,
                  href: toggleFilter(urlParams, definition, token, true),
                  active: selected.includes(token),
                };
              }),
            ]}
          />
        ) : control === "range" ? (
          <ProductsDiscreteRangeFilter
            clearHref={clearHref}
            activeIndex={activeRangeIndex}
            optionHrefs={sortedRangeOptions.map((option) =>
              toggleFilter(urlParams, definition, valueToToken(option.value), true),
            )}
          />
        ) : usesCheckboxMultiFilter(definition, control) ? (
          <ProductsFilterCheckboxGroup
            options={options.map((option) => {
              const token = valueToToken(option.value);
              return {
                id: option._id,
                label: option.label,
                href: toggleFilter(urlParams, definition, token, false),
                active: selected.includes(token),
              };
            })}
          />
        ) : control === "swatch" ? (
          <div className="filter-check-list">
            {options.map((option) => {
              const token = valueToToken(option.value);
              const isActive = selected.includes(token);
              return (
                <Link
                  key={option._id}
                  href={toggleFilter(urlParams, definition, token, singleSelect)}
                  className={`filter-check-item ${isActive ? "active" : ""}`}
                >
                  <span
                    className="filter-swatch"
                    style={{
                      backgroundColor: swatchColor(option.label),
                    }}
                    aria-hidden="true"
                  />
                  <span>{option.label}</span>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="filter-chip-list">
            {options.map((option) => {
              const normalizedValue = valueToToken(option.value);
              const isActive = selected.includes(normalizedValue);

              return (
                <Link
                  key={option._id}
                  href={toggleFilter(
                    urlParams,
                    definition,
                    normalizedValue,
                    singleSelect,
                  )}
                  className={`chip ${isActive ? "chip-active" : ""}`}
                >
                  {option.label}
                </Link>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  return (
    <main className="products-catalog-page page-wrap cms-section-width pb-[40px] bg-white px-2 md:px-0">
      <section className="js-products-hero mb-8 grid grid-cols-1 items-end gap-3 md:gap-6 pb-6 md:grid-cols-[1fr_auto] md:pb-8 lg:mb-10 lg:pb-10">
        <h1 className="js-products-hero-title m-0 text-[24px] font-[500] md:font-semibold leading-[1.02] tracking-[-0.02em] text-[#111827] lg:text-[72px]">
          Our Products
        </h1>
        <p className="js-products-hero-sub m-0 text-[16px] md:text-[20px] leading-7 text-[#4b5563] md:text-right">
          Explore Our Innovative Lighting Solutions
        </p>
      </section>

      <div className="js-products-toolbar mb-3 hidden items-center justify-between gap-4 lg:flex">
        <h2 className="m-0 text-[24px] font-bold leading-none tracking-[-0.02em] text-[#111827]">
          All Products
        </h2>
        <ProductsSortDropdown
          options={sortOptions}
          activeSort={sort}
          queryString={urlParams.toString()}
        />
      </div>

      <div className="js-products-toolbar mb-3 flex items-center justify-between gap-4 lg:hidden">
        <h2 className="m-0 text-[18px] md:text-[24px] font-bold leading-none tracking-[-0.02em] text-[#111827]">
          All Products
        </h2>
        <ProductsMobileFiltersSheet>
          <div className="max-w-[420px] mx-auto">
            <ProductsFilterSidebar
              clearAllHref={`/products?${baseForReset.toString()}`}
              defaultExpanded={true}
              showCollapseToggle={false}
            >
              {orderedFilterDefinitions.map(renderFilterDefinition)}
            </ProductsFilterSidebar>
          </div>
        </ProductsMobileFiltersSheet>
      </div>

      <div className="mb-4 mt-2 md:mt-0 lg:hidden">
        <ProductsSortDropdown
          options={sortOptions}
          activeSort={sort}
          queryString={urlParams.toString()}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[256px_minmax(0,1fr)] lg:gap-8">
        <ProductsFilterSidebar
          clearAllHref={`/products?${baseForReset.toString()}`}
          className="js-products-sidebar hidden lg:block"
        >
          {orderedFilterDefinitions.map(renderFilterDefinition)}
        </ProductsFilterSidebar>

        <section className="min-w-0">
          <div className="js-products-tabs mb-4 hidden max-w-full flex-nowrap items-center overflow-x-auto gap-1 rounded-[8px] bg-[#FAFAFA] [-ms-overflow-style:none] [scrollbar-width:none] [-webkit-overflow-scrolling:touch] [&::-webkit-scrollbar]:hidden lg:inline-flex">
            {listingTabs.map((tabItem) => (
              <Link
                key={tabItem._key || tabItem.key}
                href={buildProductsHref({ tab: tabItem.key, page: "1" })}
                className={`inline-flex min-h-[48px] shrink-0 items-center rounded-[8px] px-3 text-[12px] font-medium transition-colors md:px-4 md:text-[13px] ${
                  activeTabKey === tabItem.key
                    ? "bg-(--color-brand-orange) text-white!"
                    : "text-[#374151] hover:bg-(--color-brand-orange)/10"
                }`}
              >
                {tabItem.label}
              </Link>
            ))}
          </div>

          <div className="js-products-grid grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4 lg:gap-4">
            {pagedProducts.map((product) => (
              <ProductListingCard
                key={product._id}
                className="js-products-card"
                name={product.name}
                slug={product.slug}
                imageUrl={sanityImageUrl(product.listingCardImage, 620)}
                category={product.category}
                listingBadgeText={product.listingBadgeText}
                isNew={product.isNew}
              />
            ))}
          </div>

          <div className="js-products-pagination mt-8 flex items-center justify-between">
            <p className="m-0 text-[14px] text-[#6b7280]">
              Page {safePage} of {totalPages}
            </p>
            <div className="flex items-center gap-2">
              {prevPageHref ? (
                <Link
                  href={prevPageHref}
                  className="inline-flex min-h-[40px] items-center rounded-[8px] border border-[#e5e7eb] px-5 text-[14px] font-medium text-[#111827] hover:bg-[#f9fafb]"
                >
                  Previous
                </Link>
              ) : (
                <span className="inline-flex min-h-[40px] items-center rounded-[8px] border border-[#f1f2f4] px-5 text-[14px] font-medium text-[#c2c7cf]">
                  Previous
                </span>
              )}
              {nextPageHref ? (
                <Link
                  href={nextPageHref}
                  className="inline-flex min-h-[40px] items-center rounded-[8px] border border-[#e5e7eb] px-5 text-[14px] font-medium text-[#111827] hover:bg-[#f9fafb]"
                >
                  Next
                </Link>
              ) : (
                <span className="inline-flex min-h-[40px] items-center rounded-[8px] border border-[#f1f2f4] px-5 text-[14px] font-medium text-[#c2c7cf]">
                  Next
                </span>
              )}
            </div>
          </div>
        </section>
      </div>
      <ProductsCatalogAnimations />
    </main>
  );
}
