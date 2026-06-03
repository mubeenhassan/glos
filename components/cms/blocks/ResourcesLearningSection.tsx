import { CmsButtonsRow } from "@/components/cms/CmsButtons";
import type { CmsBlockProps } from "@/components/cms/types";

const resourcesSectionClassName =
  "cms-resources-learning-section cms-section-width grid grid-cols-1 items-start gap-5 py-10 text-center md:gap-8 md:py-16 lg:grid-cols-[minmax(280px,0.76fr)_minmax(420px,1fr)] lg:gap-20 lg:text-left xl:gap-32";

const resourcesHeadingWrapClassName = "min-w-0";

const resourcesHeadingClassName =
  "js-resources-heading m-0 font-[600] text-[22px] leading-tight tracking-normal text-[#121827] md:text-5xl lg:text-[clamp(2.4rem,3.4vw,4.5rem)]";

const resourcesCopyClassName =
  "mx-auto grid max-w-[340px] gap-4 md:max-w-3xl md:gap-7 lg:mx-0";

const resourcesIntroClassName =
  "js-resources-copy-item m-0 text-[18px] font-extrabold leading-snug text-[var(--color-brand-orange)] md:text-xl lg:text-[#121827]";

const resourcesDescriptionClassName =
  "js-resources-copy-item m-0 text-base leading-6 text-[#3f4656] md:text-lg md:leading-7";

export default function ResourcesLearningSection({
  block,
}: CmsBlockProps<"resourcesLearningBlock">) {
  return (
    <section className={resourcesSectionClassName}>
      <div className={resourcesHeadingWrapClassName}>
        <h2 className={resourcesHeadingClassName}>
          {block.title || "Resources & Learning"}
        </h2>
        <div className="js-resources-cta">
          <CmsButtonsRow
            buttons={block.cta}
            className="mt-10 justify-center md:mt-6 lg:justify-start"
            buttonClassName="md:!min-h-14 !min-h-10 !w-full !min-w-full md:!rounded-lg !px-6 !font-extrabold sm:!w-auto sm:!min-w-44"
          />
        </div>
      </div>

      <div className={resourcesCopyClassName}>
        {block.intro ? (
          <p className={resourcesIntroClassName}>{block.intro}</p>
        ) : null}
        {block.description ? (
          <p className={resourcesDescriptionClassName}>{block.description}</p>
        ) : null}
      </div>
    </section>
  );
}
