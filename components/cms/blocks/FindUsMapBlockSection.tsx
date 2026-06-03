import { blockFieldDataAttribute } from "@/components/cms/sanityData";
import type { CmsBlockProps } from "@/components/cms/types";
import { cleanOptionalText, cmsSectionWidthClassName, cx } from "@/components/cms/utils";
import { normalizeGoogleMapsEmbedUrl } from "@/lib/googleMaps";

const sectionClassName = cx(
  "cms-find-us-map-section",
  cmsSectionWidthClassName,
  "pb-12 pt-4 md:pb-16 md:pt-8 lg:pb-20",
);

const titleClassName =
  "m-0 text-center font-[500] md:font-[600] text-[24px] leading-tight tracking-normal text-[#111827] md:text-[40px] lg:text-[48px]";

const mapWrapClassName =
  "mt-8 overflow-hidden rounded-[8px]  bg-[#fafafa] md:mt-10 lg:mt-12";

const mapFrameClassName = "block h-[280px] w-full border-0 sm:h-[360px] md:h-[420px] lg:h-[500px]";

export default function FindUsMapBlockSection({
  block,
  pageId,
}: CmsBlockProps<"findUsMapBlock">) {
  const title = cleanOptionalText(block.title) || "Find Us";
  const rawEmbedSource =
    block.embedInputType === "html" ? block.embedHtml : block.embedUrl;
  const embedSrc = normalizeGoogleMapsEmbedUrl(rawEmbedSource);

  if (!embedSrc) {
    return null;
  }

  return (
    <section className={sectionClassName} aria-label={title}>
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
      <div className={mapWrapClassName}>
        <iframe
          src={embedSrc}
          title={`${title} — map`}
          className={mapFrameClassName}
          loading="lazy"
          allowFullScreen
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>
    </section>
  );
}
