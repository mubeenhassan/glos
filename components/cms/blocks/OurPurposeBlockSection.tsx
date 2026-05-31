import { sanityImageUrl } from "@/lib/sanity";
import { blockFieldDataAttribute } from "@/components/cms/sanityData";
import type { CmsBlockProps } from "@/components/cms/types";
import { cleanOptionalText, cmsSectionWidthClassName, cx } from "@/components/cms/utils";

const sectionClassName = cx(
  "cms-our-purpose-section",
  cmsSectionWidthClassName,
  "py-12 md:py-16 lg:py-20",
);

const gridClassName =
  "grid grid-cols-1 items-center gap-8 md:gap-10 lg:grid-cols-2 lg:gap-12 xl:gap-16";

const mediaClassName =
  "relative min-h-[240px] overflow-hidden rounded-[12px] bg-[#eceef2] md:min-h-[320px] xl:min-h-[500px] ";

const imageClassName = "absolute inset-0 h-full w-full object-cover";

const copyClassName = "min-w-0 lg:py-4 md:text-left text-center";

const titleClassName =
  "m-0 font-[500] md:font-[600] text-[20px] leading-tight tracking-normal text-[#111827] md:text-[40px] lg:text-[48px]";

const descriptionClassName =
  "m-0 mt-5 max-w-xl text-base leading-7 text-[#374151] md:mt-6 md:text-[18px] md:leading-8 lg:mt-8 lg:text-[20px] lg:leading-[1.65]";

export default function OurPurposeBlockSection({
  block,
  pageId,
}: CmsBlockProps<"ourPurposeBlock">) {
  const title = cleanOptionalText(block.title) || "Our Purpose";
  const description = cleanOptionalText(block.description);
  const imageUrl = sanityImageUrl(block.image, 1600);

  if (!description && !imageUrl) {
    return null;
  }

  return (
    <section className={sectionClassName} aria-label={title}>
      <div className={gridClassName}>
        <div className={mediaClassName}>
          {imageUrl ? (
            <img
              className={imageClassName}
              src={imageUrl}
              alt={block.image?.alt || title}
            />
          ) : (
            <div className="grid h-full min-h-[inherit] place-items-center text-sm text-[#6b7280]">
              Image
            </div>
          )}
        </div>

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
      </div>
    </section>
  );
}
