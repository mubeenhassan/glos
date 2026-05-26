import { sanityImageUrl } from "@/lib/sanity";
import { CmsButtonsRow } from "@/components/cms/CmsButtons";
import SplitTitle from "@/components/cms/SplitTitle";
import { blockFieldDataAttribute } from "@/components/cms/sanityData";
import type { CmsBlockProps } from "@/components/cms/types";
import { cx } from "@/components/cms/utils";

const collageSectionClassName =
  "cms-collage-section mx-auto grid w-[min(1380px,calc(100%_-_30px))] grid-cols-1 items-center gap-8 py-12 md:py-20 lg:grid-cols-[minmax(420px,0.98fr)_minmax(360px,0.82fr)] lg:gap-20 lg:py-20 xl:gap-32";

const collageMediaClassName =
  "js-collage-media relative min-h-[360px] md:min-h-[560px] lg:min-h-[clamp(520px,47vw,780px)]";

const collageImageClassName =
  "js-collage-image absolute m-0 overflow-hidden rounded-lg bg-white shadow-[0_28px_74px_rgba(16,24,40,0.1)] will-change-transform";

const collageCopyClassName =
  "mx-auto max-w-[340px] text-center lg:mx-0 lg:max-w-2xl lg:text-left";

const collageTitleClassName =
  "m-0 font-[600] text-[22px] leading-tight tracking-normal text-[#121827] md:text-5xl lg:text-[clamp(3.1rem,5.1vw,5.2rem)] lg:leading-none";

const collageEyebrowClassName =
  "mt-5 mb-0 text-[18px] font-extrabold leading-snug text-[var(--color-brand-orange)] md:mt-6 md:text-[20px]";

const collageDescriptionClassName =
  "mt-5 mb-0 text-base leading-6 text-[#3f4656] md:mt-6 md:text-[18px] md:leading-7 lg:text-[20px]";

const collageWordOuterClassName =
  "collage-word-outer inline-block overflow-hidden pb-[0.08em] -mb-[0.08em] align-bottom";

const collageWordInnerClassName =
  "collage-word-inner inline-block will-change-transform";

export default function ImageCollageCtaSection({
  block,
  pageId,
}: CmsBlockProps<"imageCollageCtaBlock">) {
  const mainImageUrl = sanityImageUrl(block.mainImage, 1200);
  const topImageUrl = sanityImageUrl(block.topImage, 760);
  const bottomImageUrl = sanityImageUrl(block.bottomImage, 760);

  if (!mainImageUrl || !topImageUrl || !bottomImageUrl) {
    return null;
  }

  return (
    <section className={collageSectionClassName}>
      <div
        className={collageMediaClassName}
        aria-label={block.title || "Image collage"}
      >
        <figure
          className={cx(
            collageImageClassName,
            "left-0 top-[18%] z-[1] h-[58%] w-[48%] lg:left-[6%] lg:top-[24%] lg:h-[52%] lg:w-[72%]",
          )}
        >
          <img
            className="h-full w-full object-cover"
            src={mainImageUrl}
            alt={block.mainImage?.alt || block.title || "Main section image"}
          />
        </figure>
        <figure
          className={cx(
            collageImageClassName,
            "right-0 top-0 z-[2] h-[47%] w-[47%] lg:h-[45%] lg:w-[43%]",
          )}
        >
          <img
            className="h-full w-full object-cover"
            src={topImageUrl}
            alt={block.topImage?.alt || block.title || "Top section image"}
          />
        </figure>
        <figure
          className={cx(
            collageImageClassName,
            "bottom-[4%] right-0 z-[3] h-[47%] w-[47%] lg:bottom-0 lg:left-0 lg:right-auto lg:h-[43%] lg:w-[39%]",
          )}
        >
          <img
            className="h-full w-full object-cover"
            src={bottomImageUrl}
            alt={
              block.bottomImage?.alt || block.title || "Bottom section image"
            }
          />
        </figure>
      </div>

      <div className={collageCopyClassName}>
        <SplitTitle
          title={block.title || "What We Do"}
          className={collageTitleClassName}
          wordOuterClassName={collageWordOuterClassName}
          wordInnerClassName={collageWordInnerClassName}
          dataSanity={blockFieldDataAttribute({
            pageId,
            blockKey: block._key,
            field: "title",
          })}
        />
        {block.eyebrow ? (
          <p className={cx(collageEyebrowClassName, "js-collage-copy-item")}>
            {block.eyebrow}
          </p>
        ) : null}
        {block.description ? (
          <p
            className={cx(collageDescriptionClassName, "js-collage-copy-item")}
          >
            {block.description}
          </p>
        ) : null}
        <div className="js-collage-copy-item">
          <CmsButtonsRow
            buttons={block.cta}
            className="mt-7 justify-center md:mt-9 lg:justify-start"
            buttonClassName="!min-h-14 !w-full !min-w-full !rounded-[8px] !text-[15px] !px-7 !font-extrabold sm:!w-auto sm:!min-w-44 lg:!rounded-[6px]"
          />
        </div>
      </div>
    </section>
  );
}
