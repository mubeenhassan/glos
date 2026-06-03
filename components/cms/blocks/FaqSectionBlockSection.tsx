import { getFaqEntries } from "@/lib/faq";
import FaqAccordion from "@/components/resources/FaqAccordion";
import { blockFieldDataAttribute } from "@/components/cms/sanityData";
import type { CmsBlockProps } from "@/components/cms/types";
import { cleanOptionalText, cmsSectionWidthClassName, cx } from "@/components/cms/utils";

const sectionClassName = cx(
  "cms-faq-section",
  cmsSectionWidthClassName,
  "pb-12 pt-4 md:pb-16 md:pt-8 lg:pb-20",
);

const innerClassName = "";

const titleClassName =
  "m-0 text-center font-[600] text-[20px] leading-tight tracking-normal text-[#111827] md:text-[40px] lg:text-[48px]";

export default async function FaqSectionBlockSection({
  block,
  pageId,
}: CmsBlockProps<"faqSectionBlock">) {
  const title =
    cleanOptionalText(block.title) || "Frequently Asked Questions";
  const selectedFaqIds = (block.entries || [])
    .map((item) => item._ref)
    .filter((value): value is string => Boolean(value));
  const items = await getFaqEntries(selectedFaqIds);

  if (items.length === 0) {
    return null;
  }

  return (
    <section className={sectionClassName} aria-label={title}>
      <div className={innerClassName}>
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
        <div className="mt-8 md:mt-10 lg:mt-12">
          <FaqAccordion items={items} />
        </div>
      </div>
    </section>
  );
}
