import { resolveButtonHref, type CmsContentBlock } from "@/lib/cms";
import { mediaImageUrl, sanityImageUrl } from "@/lib/sanity";
import PinnedProductShowcase from "@/components/PinnedProductShowcase";
import type { CmsBlockProps } from "@/components/cms/types";

function productAttributeValueToLabel(
  attribute: NonNullable<
    NonNullable<
      Extract<
        CmsContentBlock,
        { _type: "pinnedProductShowcaseBlock" }
      >["product"]
    >["productAttributes"]
  >[number],
) {
  if (attribute.singleOptionValue?.label) {
    return attribute.singleOptionValue.label;
  }

  if (attribute.multiOptionValues && attribute.multiOptionValues.length > 0) {
    return attribute.multiOptionValues
      .map((item) => item.label || item.value)
      .filter(Boolean)
      .join(", ");
  }

  if (attribute.textValue) {
    return attribute.textValue;
  }

  if (typeof attribute.numberValue === "number") {
    const unit = attribute.definition?.unit
      ? ` ${attribute.definition.unit}`
      : "";
    return `${attribute.numberTextValue || String(attribute.numberValue)}${unit}`;
  }

  if (typeof attribute.booleanValue === "boolean") {
    return attribute.booleanValue ? "Yes" : "No";
  }

  return null;
}

export default function PinnedProductShowcaseSection({
  block,
}: CmsBlockProps<"pinnedProductShowcaseBlock">) {
  const product = block.product;
  const backgroundImageUrl = sanityImageUrl(block.backgroundImage, 2400);
  const productImageUrl =
    sanityImageUrl(block.productImageOverride, 1200) ||
    sanityImageUrl(product?.listingCardImage, 1200) ||
    sanityImageUrl(product?.heroImage, 1200) ||
    mediaImageUrl(product?.heroMedia, 1200);

  if (!backgroundImageUrl || !product?.slug || !product.name) {
    return null;
  }

  const title = block.title || product.name;
  const detailTitle = block.detailTitle || product.name;
  const description =
    block.description ||
    product.shortDescription ||
    product.heroDescription ||
    "Explore this product in detail.";
  const cta = block.cta?.[0];
  const resolvedCta = cta?.text ? resolveButtonHref(cta) : null;
  const downloads =
    block.downloadLinks && block.downloadLinks.length > 0
      ? block.downloadLinks
          .filter((download) => Boolean(download.label && download.url))
          .map((download, index) => ({
            key: download._key || `${download.label}-${index}`,
            label: download.label as string,
            url: download.url as string,
          }))
      : (product.resources || [])
          .filter((resource) => Boolean(resource.title && resource.url))
          .map((resource, index) => ({
            key: resource._id || `${resource.title}-${index}`,
            label: resource.title as string,
            url: resource.url as string,
          }));
  const specs =
    block.specItems && block.specItems.length > 0
      ? block.specItems
          .filter((spec) => Boolean(spec.label))
          .map((spec, index) => ({
            key: spec._key || `${spec.label}-${index}`,
            label: spec.label as string,
            color: spec.color,
          }))
      : [
          ...(product.productAttributes || [])
            .map((attribute, index) => {
              const value = productAttributeValueToLabel(attribute);
              const title = attribute.definition?.title;

              if (!value) {
                return null;
              }

              return {
                key: `${title || "attribute"}-${index}`,
                label: title ? `${title}: ${value}` : value,
                color: index % 2 === 0 ? "#f2b44c" : "#f0cf3a",
              };
            })
            .filter(
              (spec): spec is { key: string; label: string; color: string } =>
                Boolean(spec),
            )
            .slice(0, 4),
        ];

  const resolvedSpecs =
    specs.length > 0
      ? specs
      : [
          { key: "product-name", label: product.name, color: "#f2b44c" },
          {
            key: "product-type",
            label: "Product resources available",
            color: "#f0cf3a",
          },
        ];

  return (
    <PinnedProductShowcase
      title={title}
      detailTitle={detailTitle}
      description={description}
      backgroundImageUrl={backgroundImageUrl}
      backgroundAlt={block.backgroundImage?.alt || title}
      productImageUrl={productImageUrl}
      productImageAlt={block.productImageOverride?.alt || product.name}
      productHref={`/products/${product.slug}`}
      configureHref={`/configurator/product/${product.slug}`}
      cta={
        resolvedCta?.href
          ? {
              text: cta?.text || "Configure",
              href: resolvedCta.href,
              isExternal: resolvedCta.isExternal,
              openInNewTab: resolvedCta.openInNewTab,
            }
          : undefined
      }
      specs={resolvedSpecs}
      downloads={downloads}
      productSlug={product.slug}
    />
  );
}
