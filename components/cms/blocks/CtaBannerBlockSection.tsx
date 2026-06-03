import { CmsButtonsRow } from "@/components/cms/CmsButtons";
import type { CmsBlockProps } from "@/components/cms/types";
import { cleanOptionalText, cx } from "@/components/cms/utils";

const ctaBannerSectionBaseClassName =
  "cms-cta-banner-section cms-section-width flex flex-col items-center gap-4 overflow-hidden rounded-[8px] px-6 py-10 text-center md:gap-5 md:px-12 md:py-20 mb-16 md:mb-20";

export default function CtaBannerBlockSection({
  block,
}: CmsBlockProps<"ctaBannerBlock">) {
  const heading = cleanOptionalText(block.heading);
  const description = cleanOptionalText(block.description);
  const hasButtons = Boolean(
    block.cta?.some((button) => cleanOptionalText(button.text)),
  );

  if (!heading && !description && !hasButtons) {
    return null;
  }

  const tone = block.tone || "subtle";
  const toneClassName =
    tone === "dark"
      ? "bg-[#111111] text-white"
      : tone === "brand"
        ? "bg-[var(--color-brand-orange)] text-white"
        : "bg-[#FAFAFA] text-[#111827]";
  const descriptionClassName =
    tone === "subtle" ? "text-[#374151]" : "text-white/82";
  const buttonClassName = cx(
    "!min-h-14 !min-w-44 !rounded-[8px] !px-7 !font-[600] !text-[16px]",
    tone === "brand" &&
      "!border-white !bg-white !text-[#121827] hover:!border-white hover:!bg-[#fff4ef] focus-visible:!border-white focus-visible:!bg-[#fff4ef]",
  );

  return (
    <section
      className={cx(ctaBannerSectionBaseClassName, toneClassName)}
      aria-label={heading || "Call to action"}
    >
      {heading ? (
        <h2 className="js-cta-banner-item m-0 font-[600] text-2xl leading-tight tracking-normal md:text-[clamp(1.8rem,2.8vw,3rem)]">
          {heading}
        </h2>
      ) : null}
      {description ? (
        <p
          className={cx(
            "js-cta-banner-item m-0 max-w-[685px] my-4 text-[15px] md:text-[20px]",
            descriptionClassName,
          )}
        >
          {description}
        </p>
      ) : null}
      {hasButtons ? (
        <div className="js-cta-banner-item">
          <CmsButtonsRow
            buttons={block.cta}
            className="justify-center"
            buttonClassName={buttonClassName}
          />
        </div>
      ) : null}
    </section>
  );
}
