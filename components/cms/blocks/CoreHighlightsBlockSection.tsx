import { sanityImageUrl } from "@/lib/sanity";
import { blockFieldDataAttribute } from "@/components/cms/sanityData";
import type { CmsBlockProps } from "@/components/cms/types";
import { cleanOptionalText, cmsSectionWidthClassName, cx } from "@/components/cms/utils";

const sectionClassName =
  "cms-core-highlights-section relative isolate w-full overflow-hidden ";

const overlayClassName =
  "absolute inset-0 bg-[linear-gradient(180deg,rgba(10,12,16,0.68)_0%,rgba(10,12,16,0.8)_100%)]";

const innerClassName = cx(
  cmsSectionWidthClassName,
  "relative z-[2] flex flex-col items-center py-14 md:py-16 lg:py-32 md:px-0 px-4",
);

const titleClassName =
  "m-0 max-w-3xl text-center font-[500] text-[20px] md:font-[600] leading-tight tracking-normal text-white md:text-[40px] lg:text-[48px]";

const gridClassName =
  "mt-10 grid w-full grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-4 md:mt-12 md:gap-5 lg:mt-14 lg:grid-cols-4 lg:gap-6";

const cardClassName =
  "flex h-full min-h-[140px] flex-col rounded-[10px] bg-[#FFFFFF26] p-5 backdrop-blur-[14px] md:min-h-[152px] md:p-6";

const cardTitleClassName =
  "m-0 font-[500] text-[18px] leading-snug text-white md:text-[17px] lg:text-[24px]";

const cardDescriptionClassName =
  "m-0 mt-3 text-sm leading-6 text-white/[0.88] md:mt-3.5 md:text-[14px] md:leading-[1.65] lg:text-[18px]";

export default function CoreHighlightsBlockSection({
  block,
  pageId,
}: CmsBlockProps<"coreHighlightsBlock">) {
  const title = cleanOptionalText(block.title) || "Core Highlights";
  const backgroundUrl = sanityImageUrl(block.backgroundImage, 2400);

  const highlights = (block.highlights || [])
    .map((highlight, index) => {
      const cardTitle = cleanOptionalText(highlight.title);
      const description = cleanOptionalText(highlight.description);
      if (!cardTitle || !description) {
        return null;
      }
      return {
        key: highlight._key || `${cardTitle}-${index}`,
        title: cardTitle,
        description,
      };
    })
    .filter(
      (highlight): highlight is { key: string; title: string; description: string } =>
        Boolean(highlight),
    );

  if (highlights.length === 0 && !backgroundUrl) {
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

        {highlights.length > 0 ? (
          <div className={gridClassName}>
            {highlights.map((highlight) => (
              <article key={highlight.key} className={cardClassName}>
                <h3 className={cardTitleClassName}>{highlight.title}</h3>
                <p className={cardDescriptionClassName}>{highlight.description}</p>
              </article>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}
