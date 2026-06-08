import Link from "next/link";
import {
  type ProductDetail,
  getProductBySlug,
  pickAttribute,
} from "@/lib/catalog";
import ProductListingCard from "@/components/products/ProductListingCard";
import ProductSpecificationsTab from "@/components/products/ProductSpecificationsTab";
import ProductResourcesTab from "@/components/products/ProductResourcesTab";
import ProductDetailAnimations from "@/components/products/ProductDetailAnimations";
import { mediaImageUrl, sanityImageUrl } from "@/lib/sanity";

type SearchParams = Record<string, string | string[] | undefined>;

function toSingle(value: string | string[] | undefined) {
  if (Array.isArray(value)) {
    return value[0];
  }

  return value;
}

function tabHref(slug: string, key: string) {
  return `/products/${slug}?tab=${key}`;
}

function ProductFeatureSections({ product }: { product: ProductDetail }) {
  if (!product.featureBlocks?.length) {
    return null;
  }

  return (
    <section className="mt-12 space-y-10 md:space-y-14">
      {product.featureBlocks.map((block, index) => {
        const mediaUrl = mediaImageUrl(block.media, 1200);
        const reverse = block.alignment === "right" || index % 2 === 1;

        return (
          <article
            key={block._key}
            className={`js-pdp-feature grid items-center gap-6 md:grid-cols-2 md:gap-10 ${reverse ? "md:[&>*:first-child]:order-2" : ""}`}
          >
            <div className="overflow-hidden rounded-[8px] border border-[#eceef2] bg-[#f7f7f8]">
              <div className="aspect-16/11">
                {mediaUrl ? (
                  <img
                    src={mediaUrl}
                    alt={block.title}
                    className="js-pdp-feature-image h-full w-full object-cover"
                  />
                ) : (
                  <div className="product-placeholder h-full w-full" />
                )}
              </div>
            </div>
            <div>
              <h3 className="m-0 text-[28px] font-semibold leading-[1.12] tracking-[-0.02em] text-[#111827] md:text-[34px]">
                {block.title}
              </h3>
              {block.description ? (
                <p className="m-0 mt-3 text-[15px] leading-7 text-[#4b5563] md:text-[16px]">
                  {block.description}
                </p>
              ) : null}
            </div>
          </article>
        );
      })}
    </section>
  );
}

function RelatedProductsSection({ product }: { product: ProductDetail }) {
  if (!product.relatedProducts?.length) {
    return null;
  }

  return (
    <section className="js-pdp-related mt-14">
      <h2 className="js-pdp-related-heading m-0 text-[20px] font-semibold leading-none tracking-[-0.02em] text-[#111827] md:text-[36px]">
        Related Products
      </h2>
      <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4 lg:gap-4">
        {product.relatedProducts.map((related) => (
          <ProductListingCard
            key={related._id}
            className="js-pdp-related-card"
            name={related.name}
            slug={related.slug}
            imageUrl={sanityImageUrl(related.listingCardImage, 620)}
            listingBadgeText={related.listingBadgeText}
          />
        ))}
      </div>
    </section>
  );
}

export default async function ProductDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<SearchParams>;
}) {
  const [{ slug }, rawSearchParams] = await Promise.all([params, searchParams]);
  const product = await getProductBySlug(slug);

  if (!product) {
    return (
      <main className="page-wrap">
        <section className="section">
          <h3>Product not found</h3>
          <Link href="/products" className="btn" style={{ marginTop: 10 }}>
            Back to products
          </Link>
        </section>
      </main>
    );
  }

  const heroMedia = product.heroMedia?.[0];
  const heroImageUrl = mediaImageUrl(heroMedia, 1200);
  const detailVariant =
    product.detailVariant &&
    product.variants.some(
      (variant) => variant._id === product.detailVariant?._id,
    )
      ? product.detailVariant
      : product.variants[0];

  const mergedSpecs = [
    ...(product.productAttributes || []),
    ...(detailVariant?.specAttributes || []).filter(
      (item) =>
        !pickAttribute(product.productAttributes, item.definition?.key || ""),
    ),
  ];

  const resources = [
    ...(product.resources || []),
    ...(detailVariant?.downloads || []),
  ].filter(
    (item, index, all) =>
      all.findIndex((other) => other._id === item._id) === index,
  );

  const hasModels = (product.availableModels || []).length > 0;
  const hasSpecs = mergedSpecs.length > 0;
  const hasResources = resources.length > 0;
  const hasHighlights = (product.iconHighlights || []).length > 0;
  const hasPerfectFor = (product.perfectFor || []).length > 0;
  const hasRelated = (product.relatedProducts || []).length > 0;

  const tabs = [
    { key: "models", label: "Available models", visible: hasModels },
    { key: "specifications", label: "Specifications", visible: hasSpecs },
    { key: "resources", label: "Resources", visible: hasResources },
    { key: "highlights", label: "Highlights", visible: hasHighlights },
    { key: "perfectFor", label: "Perfect for", visible: hasPerfectFor },
    { key: "related", label: "Related products", visible: hasRelated },
  ].filter((tab) => tab.visible);

  const requestedTab = toSingle(rawSearchParams.tab);
  const activeTab =
    tabs.find((tab) => tab.key === requestedTab)?.key ||
    tabs[0]?.key ||
    "specifications";

  const galleryItems = (product.heroMedia || []).slice(0, 4);
  const currentVisual =
    detailVariant?.previewMedia?.[0] || product.heroMedia?.[0];
  const currentImageUrl = mediaImageUrl(currentVisual, 1300);
  const heroLabel = product.family || product.category || product.name;

  return (
    <main className="product-detail-page page-wrap pb-14 md:pb-18 px-3 md:px-0">
      <section>
        <div className="mb-4 flex md:flex-row flex-col-reverse md:items-center justify-between md:gap-4 gap-2">
          <h1 className="js-pdp-hero-label m-0 text-[24px] font-[500] md:font-[600] leading-[1.02] tracking-[-0.02em] text-[#111827] md:text-[72px]">
            {heroLabel}
          </h1>
          <p className="js-pdp-breadcrumb m-0  md:text-[14px] text-[12px] text-[#374151] md:space-x-[12px] space-x-2 items-center">
            <Link href="/" className="hover:text-[#111827]">
              Home
            </Link>{" "}
            <span>/</span>
            <Link href="/products" className="hover:text-[#111827]">
              Products
            </Link>
            <span>/</span>
            <span className="text-[#FB612E] font-[600]">{product.name}</span>
          </p>
        </div>

        <div className="grid gap-6  md:grid-cols-[1.04fr_0.96fr] md:gap-16 md:mt-16">
          <div>
            <div className="js-pdp-hero-media aspect-16/10 overflow-hidden rounded-[8px] border border-[#eceef2] bg-[#f6f6f7]">
              {currentImageUrl ? (
                <img
                  src={currentImageUrl}
                  alt={product.name}
                  className="js-pdp-hero-image h-full w-full object-cover"
                />
              ) : (
                <div className="product-placeholder h-full w-full" />
              )}
            </div>
            {galleryItems.length > 1 ? (
              <div className="mt-3 grid grid-cols-4 gap-2">
                {galleryItems.map((item, index) => {
                  const url = mediaImageUrl(item, 360);
                  return (
                    <div
                      key={item._key || `${index}`}
                      className="js-pdp-thumb aspect-4/3 overflow-hidden rounded-[6px] border border-[#eceef2] bg-[#f6f6f7]"
                    >
                      {url ? (
                        <img
                          src={url}
                          alt={`${product.name} preview ${index + 1}`}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="product-placeholder h-full w-full" />
                      )}
                    </div>
                  );
                })}
              </div>
            ) : null}
          </div>

          <div className="flex flex-col justify-center space-y-[20px]">
            {(product.listingBadgeText || detailVariant?.isStocked) && (
              <div className="js-pdp-intro-item">
                <span className="inline-flex min-h-[24px] items-center inline-block rounded-[8px] bg-[#FB612E1A] md:px-[16px] px-2 md:py-[7px] py-1.5  font-[500] md:font-semibold leading-none text-[#FB612E] text-[14px]">
                  {product.listingBadgeText || "In Stock"}
                </span>
              </div>
            )}
            <h2 className="js-pdp-intro-item text-[20px]  font-[500] md:font-[600] leading-[1.04] tracking-[-0.02em] text-[#111827] md:text-[48px]">
              {product.name}
            </h2>
            {product.shortDescription ? (
              <p className="js-pdp-intro-item font-[400] text-[17px] leading-6 text-[#374151] md:text-[20px]">
                {product.shortDescription}
              </p>
            ) : null}
            {product.heroDescription ? (
              <p className="js-pdp-intro-item font-[400] text-[17px] leading-6 text-[#374151] md:text-[20px]">
                {product.heroDescription}
              </p>
            ) : null}

            <div className="js-pdp-intro-item md:mt-5 mt-3">
              <Link
                className="inline-flex min-h-[46px] items-center justify-center rounded-[8px] bg-[#FB612E] md:px-[32px] px-4 md:py-[16px] py-3 w-full text-[16px] font-[600] !text-white transition-colors hover:bg-(--color-brand-orange-hover)"
                href={`/configurator/product/${product.slug}`}
              >
                Product Configurator
              </Link>
            </div>

            {/* <div className="mt-5 flex flex-wrap gap-2.5">
              {product.brand ? (
                <span className="rounded-[999px] border border-[#eceef2] bg-[#fafafa] px-3 py-1.5 text-[12px] text-[#4b5563]">
                  Brand: {product.brand}
                </span>
              ) : null}
              {product.category ? (
                <span className="rounded-[999px] border border-[#eceef2] bg-[#fafafa] px-3 py-1.5 text-[12px] text-[#4b5563]">
                  Category: {product.category}
                </span>
              ) : null}
              {detailVariant?.sku ? (
                <span className="rounded-[999px] border border-[#eceef2] bg-[#fafafa] px-3 py-1.5 text-[12px] text-[#4b5563]">
                  SKU: {detailVariant.sku}
                </span>
              ) : null}
            </div> */}
          </div>
        </div>
      </section>

      <section className="mt-20">
        {tabs.length > 0 ? (
          <div className="flex">
            <div className="js-pdp-tabs flex  flex-nowrap items-center overflow-x-auto rounded-[8px] bg-[#FAFAFA] [-ms-overflow-style:none] [scrollbar-width:none] [-webkit-overflow-scrolling:touch] [&::-webkit-scrollbar]:hidden">
              {tabs.map((tab) => (
                <Link
                  key={tab.key}
                  href={tabHref(product.slug, tab.key)}
                  scroll={false}
                  className={`js-pdp-tab inline-flex md:min-h-[42px] min-h-[36px] shrink-0 items-center rounded-[6px] md:px-4 px-[12px] text-[14px] font-[600] transition-colors ${
                    activeTab === tab.key
                      ? "bg-(--color-brand-orange) !text-white"
                      : "text-[#374151] hover:bg-white"
                  }`}
                >
                  {tab.label}
                </Link>
              ))}
            </div>
          </div>
        ) : null}

        <div className="js-pdp-tab-panel mt-7">
          {activeTab === "models" ? (
            <>
              <h3 className="m-0 text-[20px] font-[500] md:font-[600] leading-[1.02] tracking-[-0.02em] text-[#111827] md:text-[28px]">
                Available Models
              </h3>
              <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
                {(product.availableModels || []).map((model) => {
                  const modelImageUrl = sanityImageUrl(
                    model.listingCardImage,
                    360,
                  );
                  const isActive = model.slug === product.slug;
                  return (
                    <Link
                      href={`/products/${model.slug}`}
                      key={model._id}
                      className={`rounded-[8px] border p-2.5 transition-colors ${
                        isActive
                          ? "border-(--color-brand-orange) bg-[#fff7f3]"
                          : "border-[#eceef2] hover:border-[#d7dbe2]"
                      }`}
                    >
                      <div className="aspect-16/11 overflow-hidden rounded-[6px] bg-[#f6f6f7]">
                        {modelImageUrl ? (
                          <img
                            src={modelImageUrl}
                            alt={model.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="product-placeholder h-full w-full" />
                        )}
                      </div>
                      <p className="m-0 mt-2 text-[14px] font-medium text-[#111827]">
                        {model.name}
                      </p>
                    </Link>
                  );
                })}
              </div>
            </>
          ) : null}

          {activeTab === "specifications" ? (
            <ProductSpecificationsTab attributes={mergedSpecs} />
          ) : null}

          {activeTab === "resources" ? (
            <ProductResourcesTab resources={resources} />
          ) : null}

          {activeTab === "highlights" ? (
            <>
              <h3 className="m-0 text-[28px] font-semibold tracking-[-0.02em] text-[#111827]">
                Highlights
              </h3>
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                {(product.iconHighlights || []).map((highlight) => (
                  <article
                    key={highlight._key}
                    className="rounded-[8px] border border-[#eceef2] bg-white p-4"
                  >
                    <p className="m-0 text-[18px] font-semibold leading-tight text-[#111827]">
                      {highlight.title}
                    </p>
                    {highlight.description ? (
                      <p className="m-0 mt-2 text-[14px] leading-6 text-[#4b5563]">
                        {highlight.description}
                      </p>
                    ) : null}
                  </article>
                ))}
              </div>
            </>
          ) : null}

          {activeTab === "perfectFor" ? (
            <>
              <h3 className="m-0 text-[28px] font-semibold tracking-[-0.02em] text-[#111827]">
                Perfect For
              </h3>
              <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {(product.perfectFor || []).map((item) => {
                  const imageUrl = sanityImageUrl(item.image, 450);

                  return (
                    <article
                      key={item._id}
                      className="overflow-hidden rounded-[8px] border border-[#eceef2] bg-white"
                    >
                      <div className="aspect-16/11 bg-[#f6f6f7]">
                        {imageUrl ? (
                          <img
                            src={imageUrl}
                            alt={item.title}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="product-placeholder h-full w-full" />
                        )}
                      </div>
                      <div className="p-3.5">
                        <p className="m-0 text-[17px] font-semibold text-[#111827]">
                          {item.title}
                        </p>
                        {item.description ? (
                          <p className="m-0 mt-2 text-[14px] leading-6 text-[#4b5563]">
                            {item.description}
                          </p>
                        ) : null}
                      </div>
                    </article>
                  );
                })}
              </div>
            </>
          ) : null}

          {activeTab === "related" ? (
            <RelatedProductsSection product={product} />
          ) : null}
        </div>
      </section>

      <ProductFeatureSections product={product} />
      {activeTab !== "related" ? (
        <RelatedProductsSection product={product} />
      ) : null}
      <ProductDetailAnimations />
    </main>
  );
}
