import { mediaImageUrl, sanityImageUrl } from "@/lib/sanity";
import ProductSpotlightClient, {
  type SpotlightItem,
} from "@/components/ProductSpotlightClient";
import type { CmsBlockProps } from "@/components/cms/types";

const productSectionClassName =
  "cms-product-spotlight relative isolate w-full overflow-hidden py-16 md:py-20 lg:py-24";

export default function ProductSpotlightSection({
  block,
}: CmsBlockProps<"productSpotlightBlock">) {
  const items: SpotlightItem[] = (block.items || [])
    .map((item, index) => {
      const product = item.product;
      const imageUrl =
        sanityImageUrl(item.imageOverride, 1100) ||
        sanityImageUrl(product?.listingCardImage, 1100) ||
        sanityImageUrl(product?.heroImage, 1100) ||
        mediaImageUrl(product?.heroMedia, 1100);

      if (!product?.slug || !product.name) {
        return null;
      }

      return {
        key: item._key || product._id || product.slug,
        index,
        imageUrl,
        imageAlt: item.imageOverride?.alt || product.name,
        hotspotX: typeof item.hotspotX === "number" ? item.hotspotX : 50,
        hotspotY: typeof item.hotspotY === "number" ? item.hotspotY : 50,
        name: product.name,
        slug: product.slug,
        badgeText: product.listingBadgeText || product.category || null,
        description:
          product.shortDescription ||
          product.heroDescription ||
          "Explore this product in detail.",
      } satisfies SpotlightItem;
    })
    .filter((item): item is SpotlightItem => Boolean(item));

  if (items.length === 0) {
    return null;
  }

  return (
    <section className={productSectionClassName}>
      <ProductSpotlightClient
        items={items}
        title={block.title || "Our Products"}
      />
    </section>
  );
}
