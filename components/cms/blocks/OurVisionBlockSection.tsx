import type { CmsImage } from "@/lib/cms";
import { sanityImageUrl } from "@/lib/sanity";
import { blockFieldDataAttribute } from "@/components/cms/sanityData";
import type { CmsBlockProps } from "@/components/cms/types";
import { cleanOptionalText, cmsSectionWidthClassName, cx } from "@/components/cms/utils";

const sectionClassName = "cms-our-vision-section w-full bg-white py-0 lg:py-20";

const innerClassName = cx(cmsSectionWidthClassName, "flex flex-col items-center");

const headerClassName = "mx-auto max-w-[1000px] text-center";

const titleClassName =
  "m-0 font-[500] text-[20px] md:font-[600] leading-tight tracking-normal text-[#111827] md:text-[40px] lg:text-[48px]";

const bodyClassName = "mt-6 flex flex-col gap-5 md:mt-8 md:gap-6";

const paragraphClassName =
  "m-0 text-base leading-7 text-[#374151] md:text-[18px] md:leading-8 lg:text-[20px] lg:leading-[1.65]";

const galleryFrameClassName =
  "relative mt-10 w-full overflow-hidden rounded-[10px] md:rounded-[20px] p-4 md:mt-12 md:rounded-[24px]  lg:mt-14 lg:rounded-[28px] lg:p-6";

const galleryTileClassName =
  "m-0 overflow-hidden rounded-[10px] bg-white/20 shadow-[0_8px_28px_rgba(16,24,40,0.12)] md:rounded-[14px] lg:rounded-[16px]";

const galleryImageClassName = "h-full w-full object-cover";

const mobileGridClassName =
  "relative z-[2] grid grid-cols-2 gap-3 md:gap-4 lg:hidden";

const desktopCollageClassName =
  "relative z-[2] hidden h-[520px] lg:block lg:h-[600px] xl:h-[760px]";

function resolveImage(image: CmsImage | undefined, width: number) {
  const url = sanityImageUrl(image, width);
  if (!url) {
    return null;
  }
  return {
    url,
    alt: image?.alt || "Our vision",
  };
}

function GalleryTile({
  className,
  url,
  alt,
}: {
  className: string;
  url: string;
  alt: string;
}) {
  return (
    <figure className={cx(galleryTileClassName, className)}>
      <img className={galleryImageClassName} src={url} alt={alt} />
    </figure>
  );
}

export default function OurVisionBlockSection({
  block,
  pageId,
}: CmsBlockProps<"ourVisionBlock">) {
  const title = cleanOptionalText(block.title) || "Our Vision";

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

  const backgroundUrl = sanityImageUrl(block.backgroundImage, 2000);
  const images = {
    topLeft: resolveImage(block.galleryTopLeft, 900),
    topCenter: resolveImage(block.galleryTopCenter, 1400),
    topRight: resolveImage(block.galleryTopRight, 900),
    bottomLeft: resolveImage(block.galleryBottomLeft, 900),
    bottomCenter: resolveImage(block.galleryBottomCenter, 700),
    bottomRight: resolveImage(block.galleryBottomRight, 1200),
  };

  const hasGallery = Boolean(
    backgroundUrl && Object.values(images).some(Boolean),
  );

  if (paragraphs.length === 0 && !hasGallery) {
    return null;
  }

  return (
    <section className={sectionClassName} aria-label={title}>
      <div className={innerClassName}>
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
          {paragraphs.length > 0 ? (
            <div className={bodyClassName}>
              {paragraphs.map((paragraph) => (
                <p key={paragraph.key} className={paragraphClassName}>
                  {paragraph.text}
                </p>
              ))}
            </div>
          ) : null}
        </header>

        {hasGallery ? (
          <div
            className={galleryFrameClassName}
            aria-label={`${title} gallery`}
          >
            {backgroundUrl ? (
              <div className="pointer-events-none absolute inset-0" aria-hidden>
                <img
                  className="h-full w-full scale-110 object-cover blur-2xl brightness-[0.92] saturate-[1.08]"
                  src={backgroundUrl}
                  alt=""
                />
                <div className="absolute inset-0 bg-[#b8a99a]/35" />
              </div>
            ) : null}

            <div className={mobileGridClassName}>
              {images.topLeft ? (
                <GalleryTile
                  className="aspect-[4/3]"
                  url={images.topLeft.url}
                  alt={images.topLeft.alt}
                />
              ) : null}
              {images.topRight ? (
                <GalleryTile
                  className="aspect-[4/3]"
                  url={images.topRight.url}
                  alt={images.topRight.alt}
                />
              ) : null}
              {images.bottomLeft ? (
                <GalleryTile
                  className="aspect-[4/3]"
                  url={images.bottomLeft.url}
                  alt={images.bottomLeft.alt}
                />
              ) : null}
              {images.bottomRight ? (
                <GalleryTile
                  className="aspect-[4/3]"
                  url={images.bottomRight.url}
                  alt={images.bottomRight.alt}
                />
              ) : null}
            </div>

            <div className={desktopCollageClassName}>
              {images.topLeft ? (
                <GalleryTile
                  className="absolute left-[2%] top-[5%] h-[37%] w-[26%]"
                  url={images.topLeft.url}
                  alt={images.topLeft.alt}
                />
              ) : null}
              {images.topCenter ? (
                <GalleryTile
                  className="absolute left-[38%] top-[4%] h-[40%] w-[25%]"
                  url={images.topCenter.url}
                  alt={images.topCenter.alt}
                />
              ) : null}
              {images.topRight ? (
                <GalleryTile
                  className="absolute right-[8%] top-[3%] h-[50%] w-[18%]"
                  url={images.topRight.url}
                  alt={images.topRight.alt}
                />
              ) : null}
              {images.bottomLeft ? (
                <GalleryTile
                  className="absolute left-[4%] top-[49%] h-[49%] w-[24%]"
                  url={images.bottomLeft.url}
                  alt={images.bottomLeft.alt}
                />
              ) : null}
              {images.bottomCenter ? (
                <GalleryTile
                  className="absolute left-[33%] top-[56%] h-[40%] w-[16%]"
                  url={images.bottomCenter.url}
                  alt={images.bottomCenter.alt}
                />
              ) : null}
              {images.bottomRight ? (
                <GalleryTile
                  className="absolute right-[3%] top-[55%] h-[44%] w-[35%]"
                  url={images.bottomRight.url}
                  alt={images.bottomRight.alt}
                />
              ) : null}
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
