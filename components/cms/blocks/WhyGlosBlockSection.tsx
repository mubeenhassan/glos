import { sanityImageUrl } from "@/lib/sanity";
import { blockFieldDataAttribute } from "@/components/cms/sanityData";
import type { CmsBlockProps } from "@/components/cms/types";
import { cleanOptionalText, cmsSectionWidthClassName, cx } from "@/components/cms/utils";

const sectionClassName =
  "cms-why-glos-section relative isolate w-full overflow-hidden";

const overlayClassName =
  "absolute inset-0 bg-[linear-gradient(180deg,rgba(8,10,14,0.72)_0%,rgba(8,10,14,0.82)_100%)]";

const innerClassName = cx(
  cmsSectionWidthClassName,
  "relative z-[2] py-14 md:py-16 lg:py-32 md:px-0 px-4",
);

const layoutClassName =
  "grid grid-cols-1 items-center gap-10 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] lg:gap-12 xl:gap-16";

const copyClassName = "min-w-0";

const titleClassName =
  "m-0 font-[500] md:font-[600] text-[20px] leading-tight tracking-normal text-white md:text-[48px] ";

const eyebrowClassName =
  "m-0 mt-4 text-[18px] font-[500] leading-snug text-[var(--color-brand-orange)] md:mt-5 md:text-[20px]";

const descriptionClassName =
  "m-0 mt-5 max-w-xl text-base leading-7 text-white/[0.92] md:mt-6 md:text-[17px] md:leading-6";

const cardsGridClassName = "grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-4 md:gap-5";

const cardClassName =
  "flex min-h-[148px] flex-col rounded-[10px] bg-[#FFFFFF26] p-5  backdrop-blur-[14px] md:min-h-[160px] md:p-6";

const cardTitleClassName =
  "m-0 font-[500] text-[16px] leading-snug text-white md:text-[24px]" ;

const cardDescriptionClassName =
  "m-0 mt-3 text-sm leading-6 text-white/[0.88] md:text-[18px] md:leading-7";

export default function WhyGlosBlockSection({
  block,
  pageId,
}: CmsBlockProps<"whyGlosBlock">) {
  const title = cleanOptionalText(block.title) || "Why GLOS";
  const eyebrow = cleanOptionalText(block.eyebrow);
  const description = cleanOptionalText(block.description);
  const backgroundUrl = sanityImageUrl(block.backgroundImage, 2400);

  const features = (block.features || [])
    .map((feature, index) => {
      const featureTitle = cleanOptionalText(feature.title);
      const featureDescription = cleanOptionalText(feature.description);
      if (!featureTitle || !featureDescription) {
        return null;
      }
      return {
        key: feature._key || `${featureTitle}-${index}`,
        title: featureTitle,
        description: featureDescription,
      };
    })
    .filter(
      (feature): feature is { key: string; title: string; description: string } =>
        Boolean(feature),
    );

  if (!backgroundUrl && !description && features.length === 0) {
    return null;
  }

  return (
    <section className={sectionClassName} aria-label={title}>
      {backgroundUrl ? (
        <div className="pointer-events-none absolute inset-0" aria-hidden>
          <img
            className="h-full w-full object-cover"
            src={backgroundUrl}
            alt=""
          />
          <div className={overlayClassName} />
        </div>
      ) : (
        <div className="absolute inset-0 bg-[#111111]" aria-hidden />
      )}

      <div className={innerClassName}>
        <div className={layoutClassName}>
          <div className={copyClassName}>
            <h2
              className={titleClassName}
              data-sanity={blockFieldDataAttribute({
                pageId,
                blockKey: block._key,
                field: "title",
              })}
            >
              {title}
            </h2>
            {eyebrow ? (
              <p
                className={eyebrowClassName}
                data-sanity={blockFieldDataAttribute({
                  pageId,
                  blockKey: block._key,
                  field: "eyebrow",
                })}
              >
                {eyebrow}
              </p>
            ) : null}
            {description ? (
              <p
                className={descriptionClassName}
                data-sanity={blockFieldDataAttribute({
                  pageId,
                  blockKey: block._key,
                  field: "description",
                })}
              >
                {description}
              </p>
            ) : null}
          </div>

          {features.length > 0 ? (
            <div className={cardsGridClassName}>
              {features.map((feature) => (
                <article key={feature.key} className={cardClassName}>
                  <h3 className={cardTitleClassName}>{feature.title}</h3>
                  <p className={cardDescriptionClassName}>
                    {feature.description}
                  </p>
                </article>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
