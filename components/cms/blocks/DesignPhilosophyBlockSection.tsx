import type { CmsImage } from "@/lib/cms";
import { sanityImageUrl } from "@/lib/sanity";
import { blockFieldDataAttribute } from "@/components/cms/sanityData";
import type { CmsBlockProps } from "@/components/cms/types";
import { cleanOptionalText, cmsSectionWidthClassName, cx } from "@/components/cms/utils";

const sectionClassName =
  "cms-design-philosophy-section w-full bg-[#F8F8F8] pb-4 lg:pt-20 pt-0 lg:pb-20";

const innerClassName = cx(
  cmsSectionWidthClassName,
  "grid grid-cols-1 items-center gap-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-14 xl:gap-20",
);

const copyClassName = "min-w-0 lg:py-4";

const titleClassName =
  "m-0 font-[500] md:font-[600] text-[20px] leading-tight tracking-normal text-[#111827] md:text-[40px] lg:text-[48px]";

const bodyClassName = "mt-4  flex flex-col gap-5 md:mt-8 md:gap-6";

const paragraphClassName =
  "m-0 text-base leading-7 text-[#374151] md:text-[18px] md:leading-8 lg:text-[20px] lg:leading-[1.65]";

const collageShellClassName =
  "relative mx-auto w-full max-w-[640px] lg:max-w-none";

const desktopCollageClassName =
  "relative hidden aspect-[1.05] w-full min-h-[420px] lg:block lg:min-h-[560px] xl:min-h-[620px]";

const mobileGridClassName = "grid grid-cols-2 gap-3 md:gap-4 lg:hidden";

const collageTileClassName =
  "m-0 overflow-hidden rounded-[12px] bg-[#eceef2] shadow-[0_12px_40px_rgba(16,24,40,0.08)]";

const collageImageClassName = "h-full w-full object-cover";

const desktopTiles = {
  topLeft:
    "absolute left-0 top-0 z-[1] h-[24%] w-[34%] sm:h-[26%] sm:w-[32%]",
  topRight:
    "absolute right-0 top-0 z-[3] h-[46%] w-[34%] sm:h-[48%] sm:w-[32%]",
  center:
    "absolute left-[18%] top-[10%] z-[0] h-[58%] w-[68%] sm:left-[20%] sm:top-[12%] sm:h-[56%] sm:w-[54%]",
  bottomLeft:
    "absolute bottom-0 left-0 z-[2] h-[34%] w-[40%] sm:h-[42%] sm:w-[42%]",
  bottomRight:
    "absolute bottom-[6%] right-0 z-[1] h-[28%] w-[34%] sm:bottom-[8%] sm:h-[30%] sm:w-[32%]",
} as const;

function resolveCollageImage(image: CmsImage | undefined, width: number) {
  const url = sanityImageUrl(image, width);
  if (!url) {
    return null;
  }
  return {
    url,
    alt: image?.alt || "Design philosophy",
  };
}

function CollageFigure({
  className,
  wrapClassName,
  url,
  alt,
}: {
  className: string;
  wrapClassName: string;
  url: string;
  alt: string;
}) {
  return (
    <figure className={cx(collageTileClassName, wrapClassName)}>
      <img className={className} src={url} alt={alt} />
    </figure>
  );
}

export default function DesignPhilosophyBlockSection({
  block,
  pageId,
}: CmsBlockProps<"designPhilosophyBlock">) {
  const title = cleanOptionalText(block.title) || "Design Philosophy";

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

  const images = {
    center: resolveCollageImage(block.collageCenter, 1400),
    topLeft: resolveCollageImage(block.collageTopLeft, 800),
    topRight: resolveCollageImage(block.collageTopRight, 900),
    bottomLeft: resolveCollageImage(block.collageBottomLeft, 900),
    bottomRight: resolveCollageImage(block.collageBottomRight, 800),
  };

  const hasCollage = Object.values(images).some(Boolean);

  if (paragraphs.length === 0 && !hasCollage) {
    return null;
  }

  return (
    <section className={sectionClassName} aria-label={title}>
      <div className={innerClassName}>
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
          {paragraphs.length > 0 ? (
            <div className={bodyClassName}>
              {paragraphs.map((paragraph) => (
                <p key={paragraph.key} className={paragraphClassName}>
                  {paragraph.text}
                </p>
              ))}
            </div>
          ) : null}
        </div>

        {hasCollage ? (
          <div className={collageShellClassName}>
            <div
              className={desktopCollageClassName}
              aria-label={`${title} image collage`}
            >
              {images.topLeft ? (
                <CollageFigure
                  url={images.topLeft.url}
                  alt={images.topLeft.alt}
                  className={collageImageClassName}
                  wrapClassName={desktopTiles.topLeft}
                />
              ) : null}
              {images.topRight ? (
                <CollageFigure
                  url={images.topRight.url}
                  alt={images.topRight.alt}
                  className={collageImageClassName}
                  wrapClassName={desktopTiles.topRight}
                />
              ) : null}
              {images.center ? (
                <CollageFigure
                  url={images.center.url}
                  alt={images.center.alt}
                  className={collageImageClassName}
                  wrapClassName={desktopTiles.center}
                />
              ) : null}
              {images.bottomLeft ? (
                <CollageFigure
                  url={images.bottomLeft.url}
                  alt={images.bottomLeft.alt}
                  className={collageImageClassName}
                  wrapClassName={desktopTiles.bottomLeft}
                />
              ) : null}
              {images.bottomRight ? (
                <CollageFigure
                  url={images.bottomRight.url}
                  alt={images.bottomRight.alt}
                  className={collageImageClassName}
                  wrapClassName={desktopTiles.bottomRight}
                />
              ) : null}
            </div>

            <div className={mobileGridClassName}>
              {images.center ? (
                <CollageFigure
                  url={images.center.url}
                  alt={images.center.alt}
                  className={collageImageClassName}
                  wrapClassName="col-span-2 aspect-[16/10]"
                />
              ) : null}
              {images.topRight ? (
                <CollageFigure
                  url={images.topRight.url}
                  alt={images.topRight.alt}
                  className={collageImageClassName}
                  wrapClassName="aspect-square"
                />
              ) : null}
              {images.topLeft ? (
                <CollageFigure
                  url={images.topLeft.url}
                  alt={images.topLeft.alt}
                  className={collageImageClassName}
                  wrapClassName="aspect-square"
                />
              ) : null}
              {images.bottomLeft ? (
                <CollageFigure
                  url={images.bottomLeft.url}
                  alt={images.bottomLeft.alt}
                  className={collageImageClassName}
                  wrapClassName="aspect-square"
                />
              ) : null}
              {images.bottomRight ? (
                <CollageFigure
                  url={images.bottomRight.url}
                  alt={images.bottomRight.alt}
                  className={collageImageClassName}
                  wrapClassName="aspect-square"
                />
              ) : null}
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
