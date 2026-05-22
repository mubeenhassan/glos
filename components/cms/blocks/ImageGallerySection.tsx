import { sanityImageUrl } from "@/lib/sanity";
import SplitTitle from "@/components/cms/SplitTitle";
import { blockFieldDataAttribute } from "@/components/cms/sanityData";
import type { CmsBlockProps } from "@/components/cms/types";
import { cx } from "@/components/cms/utils";

const gallerySectionClassName =
  "cms-gallery-section mx-auto grid w-[min(1380px,calc(100%_-_30px))] gap-7 pb-6 md:gap-12 lg:gap-16";

const galleryHeadingClassName =
  "mx-auto m-0 w-full max-w-5xl overflow-hidden text-center text-3xl leading-tight tracking-normal text-[#121827] font-[600] md:text-5xl lg:text-6xl";

const galleryGridClassName =
  "cms-gallery-grid grid grid-cols-2 gap-3 md:gap-4 md:grid-cols-3 lg:grid-cols-[1.12fr_0.78fr_0.78fr_1.12fr] lg:auto-rows-[clamp(170px,15.6vw,298px)]";

const galleryItemClassName =
  "cms-gallery-item m-0 aspect-square min-h-0 overflow-hidden rounded-[10px] bg-white md:aspect-auto md:rounded-[18px]";

const galleryWordOuterClassName =
  "gallery-word-outer inline-block overflow-hidden align-bottom pb-[0.1em] -mb-[0.1em]";

const galleryWordInnerClassName =
  "gallery-word-inner inline-block will-change-transform";

export default function ImageGallerySection({
  block,
  pageId,
}: CmsBlockProps<"imageGalleryBlock">) {
  const images = (block.images || [])
    .map((image) => ({
      key: image.asset?._ref,
      url: sanityImageUrl(image, 1200),
      alt: image.alt || block.title || "Gallery image",
    }))
    .filter((image): image is { key: string; url: string; alt: string } =>
      Boolean(image.key && image.url),
    );

  if (images.length === 0) {
    return null;
  }

  return (
    <section className={gallerySectionClassName}>
      <SplitTitle
        title={block.title || "Transforming the Way Spaces Come Alive"}
        className={galleryHeadingClassName}
        wordOuterClassName={galleryWordOuterClassName}
        wordInnerClassName={galleryWordInnerClassName}
        dataSanity={blockFieldDataAttribute({
          pageId,
          blockKey: block._key,
          field: "title",
        })}
      />
      <div className={galleryGridClassName}>
        {images.map((image, index) => (
          <figure
            className={cx(
              galleryItemClassName,
              index === 0 && "lg:row-span-2",
              index === 3 && "lg:col-start-4 lg:row-span-2",
              index === 4 &&
                "col-span-2  md:col-span-1 md:aspect-auto lg:col-span-2 lg:col-start-2",
              index === 5 && "lg:col-[1/2]",
              index === 6 && "lg:col-[2/4]",
              index === 7 && "lg:col-[4/5]",
            )}
            key={`${image.key}-${index}`}
          >
            <img
              className="h-full w-full object-cover"
              src={image.url}
              alt={image.alt}
            />
          </figure>
        ))}
      </div>
    </section>
  );
}
