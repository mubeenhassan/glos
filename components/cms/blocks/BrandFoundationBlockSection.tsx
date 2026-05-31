import { sanityImageUrl } from "@/lib/sanity";
import type { CmsBlockProps } from "@/components/cms/types";
import { blockFieldDataAttribute } from "@/components/cms/sanityData";
import { cleanOptionalText, cmsSectionWidthClassName, cx } from "@/components/cms/utils";

const sectionClassName = cx(
  "cms-brand-foundation-section",
  cmsSectionWidthClassName,
  "flex flex-col gap-10 pb-0 pt-24 md:gap-12 md:pb-16 md:pt-36 lg:gap-14 lg:pb-20 lg:pt-40",
);

const introRowClassName =
  "grid grid-cols-1 items-start gap-3 md:grid-cols-[minmax(0,1fr)_minmax(280px,0.72fr)] md:gap-10 lg:gap-16";

const introTitleClassName =
  "m-0 font-[500] md:font-[600] text-[24px] leading-[1.04] tracking-normal text-[#111827] md:text-[46px] lg:text-[72px]";

const introTaglineClassName =
  "m-0 text-base leading-7 text-[#374151] md:text-[18px] md:leading-8 lg:max-w-[520px] lg:text-[20px]";

const foundationTitleClassName =
  "m-0 font-[500] md:font-[600] text-[20px] md:text-left text-center leading-tight tracking-normal text-[#111827] md:text-[40px] lg:text-[48px]";

const foundationGridClassName =
  "grid grid-cols-1 items-start gap-4 lg:grid-cols-[minmax(0,0.94fr)_minmax(0,1.06fr)] lg:items-stretch lg:gap-[24px]";

const mainImageWrapClassName =
  "relative min-h-[300px] overflow-hidden rounded-[10px] bg-[#eceef2] md:min-h-[480px] lg:h-full lg:min-h-0";

const mainImageClassName = "absolute inset-0 h-full w-full object-cover";

const supportingGridClassName =
  "grid grid-cols-2 md:grid-cols-[minmax(0,2.5fr)_minmax(0,1.5fr)] items-stretch gap-4 lg:gap-6";

const supportingImageWrapClassName =
  "relative h-[200px] overflow-hidden rounded-[10px] bg-[#eceef2] sm:h-[260px] md:h-[300px] lg:h-[340px]";

const supportingImageClassName = "absolute inset-0 h-full w-full object-cover";

const bodyCopyClassName = "flex flex-col gap-5 md:gap-6";

const paragraphClassName =
  "m-0 text-base leading-7 text-[#374151] md:text-[18px] md:leading-8 lg:text-[20px] lg:leading-[1.65]";

function BrandImage({
  url,
  alt,
  className,
  wrapClassName,
}: {
  url: string;
  alt: string;
  className: string;
  wrapClassName: string;
}) {
  return (
    <figure className={wrapClassName}>
      <img className={className} src={url} alt={alt} />
    </figure>
  );
}

export default function BrandFoundationBlockSection({
  block,
  pageId,
}: CmsBlockProps<"brandFoundationBlock">) {
  const introTitle = cleanOptionalText(block.introTitle) || "Brand";
  const introTagline = cleanOptionalText(block.introTagline);
  const sectionTitle = cleanOptionalText(block.sectionTitle) || "Our Foundation";

  const mainImageUrl = sanityImageUrl(block.mainImage, 1600);
  const supportingImages = (block.supportingImages || [])
    .map((image, index) => {
      const url = sanityImageUrl(image, 900);
      if (!url) {
        return null;
      }
      return {
        key: image.asset?._ref || `supporting-${index}`,
        url,
        alt: image.alt || sectionTitle,
      };
    })
    .filter((image): image is { key: string; url: string; alt: string } =>
      Boolean(image),
    );

  const paragraphs = (block.paragraphs || [])
    .map((paragraph, index) => {
      const text = cleanOptionalText(paragraph.text);
      if (!text) {
        return null;
      }
      return {
        key: paragraph._key || `paragraph-${index}`,
        text,
      };
    })
    .filter((paragraph): paragraph is { key: string; text: string } =>
      Boolean(paragraph),
    );

  if (!introTagline && !mainImageUrl && paragraphs.length === 0) {
    return null;
  }

  return (
    <section className={sectionClassName} aria-label={introTitle}>
      <header className={introRowClassName}>
        <h1
          className={introTitleClassName}
          data-sanity={blockFieldDataAttribute({
            pageId,
            blockKey: block._key,
            field: "introTitle",
          })}
        >
          {introTitle}
        </h1>
        {introTagline ? (
          <p
            className={introTaglineClassName}
            data-sanity={blockFieldDataAttribute({
              pageId,
              blockKey: block._key,
              field: "introTagline",
            })}
          >
            {introTagline}
          </p>
        ) : null}
      </header>

      <div className="flex flex-col gap-6 md:gap-8 lg:gap-10">
        <h2
          className={foundationTitleClassName}
          data-sanity={blockFieldDataAttribute({
            pageId,
            blockKey: block._key,
            field: "sectionTitle",
          })}
        >
          {sectionTitle}
        </h2>

        <div className={foundationGridClassName}>
          {mainImageUrl ? (
            <BrandImage
              url={mainImageUrl}
              alt={block.mainImage?.alt || sectionTitle}
              className={mainImageClassName}
              wrapClassName={mainImageWrapClassName}
            />
          ) : (
            <div
              className={cx(
                mainImageWrapClassName,
                "grid place-items-center text-sm text-[#6b7280]",
              )}
            >
              Main image
            </div>
          )}

          <div className="flex min-w-0 flex-col gap-6 md:gap-7 lg:gap-8">
            {supportingImages.length > 0 ? (
              <div className={supportingGridClassName}>
                {supportingImages.map((image) => (
                  <BrandImage
                    key={image.key}
                    url={image.url}
                    alt={image.alt}
                    className={supportingImageClassName}
                    wrapClassName={supportingImageWrapClassName}
                  />
                ))}
              </div>
            ) : null}

            {paragraphs.length > 0 ? (
              <div className={bodyCopyClassName}>
                {paragraphs.map((paragraph) => (
                  <p key={paragraph.key} className={paragraphClassName}>
                    {paragraph.text}
                  </p>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
