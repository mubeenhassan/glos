import { mediaImageUrl } from "@/lib/sanity";
import { CmsButtonsRow } from "@/components/cms/CmsButtons";
import type { CmsBlockProps } from "@/components/cms/types";
import { cx } from "@/components/cms/utils";

const sectionHeadingClassName =
  "m-0 font-[600] text-3xl font-semibold leading-tight tracking-[-0.02em] text-[#121827] md:text-4xl lg:text-5xl";

const splitSectionClassName =
  "mx-auto w-[min(1380px,calc(100%_-_30px))] py-4 md:py-6";

const splitGridClassName = "grid grid-cols-1 items-center gap-4 lg:grid-cols-2";

const splitCopyClassName = "min-w-0";

const splitTextClassName =
  "mt-4 max-w-2xl text-base leading-7 text-[var(--muted)]";

const splitMediaClassName =
  "min-h-60 overflow-hidden rounded-lg border border-[var(--line)] bg-white";

const placeholderClassName =
  "grid min-h-60 w-full place-items-center text-sm text-[var(--muted)]";

export default function ContentImageCtaSection({
  block,
}: CmsBlockProps<"contentImageCta">) {
  const imageUrl = mediaImageUrl({ image: block.mainImage }, 1400);
  const imageFirst = block.imagePosition === "left";

  return (
    <section className={splitSectionClassName}>
      <div className={splitGridClassName}>
        <div className={cx(splitCopyClassName, imageFirst && "lg:order-2")}>
          <h2 className={sectionHeadingClassName}>
            {block.title || "Untitled section"}
          </h2>
          {block.description ? (
            <p className={splitTextClassName}>{block.description}</p>
          ) : null}
          <CmsButtonsRow buttons={block.cta} />
        </div>

        <div className={cx(splitMediaClassName, imageFirst && "lg:order-1")}>
          {imageUrl ? (
            <img
              className="h-full w-full object-cover"
              src={imageUrl}
              alt={block.mainImage?.alt || block.title || "Section image"}
            />
          ) : (
            <div className={placeholderClassName}>No image selected</div>
          )}
        </div>
      </div>
    </section>
  );
}
