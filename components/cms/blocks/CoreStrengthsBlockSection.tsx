import { sanityImageUrl } from "@/lib/sanity";
import { blockFieldDataAttribute } from "@/components/cms/sanityData";
import type { CmsBlockProps } from "@/components/cms/types";
import { cleanOptionalText, cmsSectionWidthClassName, cx } from "@/components/cms/utils";

const sectionClassName = cx(
  "cms-core-strengths-section",
  cmsSectionWidthClassName,
  "bg-white py-4 lg:py-20",
);

const headerClassName = "mx-auto max-w-3xl text-center";

const titleClassName =
  "m-0 font-[500] md:font-[600] text-[20px] leading-tight tracking-normal text-[#111827] md:text-[40px] lg:text-[48px]";

const gridClassName =
  "mt-3 grid grid-cols-1 gap-5 md:mt-12 md:grid-cols-2 md:gap-6 lg:mt-14 lg:grid-cols-3 lg:gap-6";

const cardClassName =
  "flex h-full flex-col rounded-[8px] bg-[#FAFAFA] px-6 py-7 md:px-7 md:py-8";

const iconWrapClassName =
  "h-[50px] w-[50px] rounded-full md:h-[64px] md:w-[64px]";

const iconImageClassName = "w-full h-full object-contain";

const cardTitleClassName =
  "m-0 mt-5 font-[500] md:font-[600] text-[18px] leading-snug text-[#111827] md:mt-6 md:text-[24px]";

const cardDescriptionClassName =
  "m-0 mt-2 text-sm leading-6 text-[#374151] md:mt-4 md:text-[15px] md:leading-7 lg:text-[18px]";

export default function CoreStrengthsBlockSection({
  block,
  pageId,
}: CmsBlockProps<"coreStrengthsBlock">) {
  const title = cleanOptionalText(block.title) || "Core Strengths";

  const strengths = (block.strengths || [])
    .map((strength, index) => {
      const cardTitle = cleanOptionalText(strength.title);
      const description = cleanOptionalText(strength.description);
      const iconUrl = sanityImageUrl(strength.icon, 120);

      if (!cardTitle || !description) {
        return null;
      }

      return {
        key: strength._key || `${cardTitle}-${index}`,
        title: cardTitle,
        description,
        iconUrl,
        iconAlt: strength.icon?.alt || cardTitle,
      };
    })
    .filter(
      (
        strength,
      ): strength is {
        key: string;
        title: string;
        description: string;
        iconUrl: string | null;
        iconAlt: string;
      } => Boolean(strength),
    );

  if (strengths.length === 0) {
    return null;
  }

  return (
    <section className={sectionClassName} aria-label={title}>
      <header className={headerClassName}>
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
      </header>

      <div className={gridClassName}>
        {strengths.map((strength) => (
          <article key={strength.key} className={cardClassName}>
            <div className={iconWrapClassName}>
              {strength.iconUrl ? (
                <img
                  className={iconImageClassName}
                  src={strength.iconUrl}
                  alt={strength.iconAlt}
                />
              ) : (
                <span
                  className="h-2.5 w-2.5 rounded-full bg-white"
                  aria-hidden
                />
              )}
            </div>
            <h3 className={cardTitleClassName}>{strength.title}</h3>
            <p className={cardDescriptionClassName}>{strength.description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
