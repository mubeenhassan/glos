import { blockFieldDataAttribute } from "@/components/cms/sanityData";
import type { CmsBlockProps } from "@/components/cms/types";
import { cleanOptionalText, cmsSectionWidthClassName, cx } from "@/components/cms/utils";

const sectionClassName = cx(
  "cms-page-intro-section",
  cmsSectionWidthClassName,
  "bg-white pb-8 pt-28 md:pb-10 md:pt-36 lg:pb-12 lg:pt-40",
);

const introRowClassName =
  "grid grid-cols-1 items-start gap-5 md:grid-cols-[minmax(0,1fr)_minmax(260px,0.68fr)] md:items-center md:gap-10 lg:gap-16";

const introTitleClassName =
  "m-0 font-[500] md:font-[600] text-[24px] leading-[1.04] tracking-normal text-[#111827] md:text-[56px] lg:text-[72px]";

const introTaglineClassName =
  "m-0 text-base leading-7 text-[#374151] md:text-right md:text-[17px] md:leading-8 lg:max-w-[520px] lg:justify-self-end lg:text-[18px] lg:leading-8";

export default function PageIntroBlockSection({
  block,
  pageId,
}: CmsBlockProps<"pageIntroBlock">) {
  const title = cleanOptionalText(block.title);
  const tagline = cleanOptionalText(block.tagline);

  if (!title && !tagline) {
    return null;
  }

  return (
    <section className={sectionClassName} aria-label={title || "Page intro"}>
      <header className={introRowClassName}>
        {title ? (
          <h1
            className={introTitleClassName}
            data-sanity={blockFieldDataAttribute({
              pageId,
              blockKey: block._key,
              field: "title",
            })}
          >
            {title}
          </h1>
        ) : null}
        {tagline ? (
          <p
            className={introTaglineClassName}
            data-sanity={blockFieldDataAttribute({
              pageId,
              blockKey: block._key,
              field: "tagline",
            })}
          >
            {tagline}
          </p>
        ) : null}
      </header>
    </section>
  );
}
