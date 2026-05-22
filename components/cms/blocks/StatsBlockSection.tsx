import type { CmsBlockProps } from "@/components/cms/types";
import { cleanOptionalText } from "@/components/cms/utils";
import AnimatedStatValue from "@/components/cms/AnimatedStatValue";

const statsSectionClassName =
  "cms-stats-section mx-auto grid w-[calc(100%_-_36px)] gap-6 py-8 md:w-[calc(100%_-_60px)] md:gap-8 md:py-12 lg:w-[min(1680px,calc(100%_-_80px))]";

const statsHeadingClassName =
  "js-stats-heading m-0 max-w-3xl font-[600] text-3xl leading-tight tracking-normal text-[#121827] md:text-5xl";

export default function StatsBlockSection({
  block,
}: CmsBlockProps<"statsBlock">) {
  const stats = (block.stats || [])
    .map((stat, index) => {
      const value = cleanOptionalText(stat.value);
      const label = cleanOptionalText(stat.label);
      if (!value || !label) {
        return null;
      }
      return {
        key: stat._key || `${value}-${index}`,
        value,
        label,
      };
    })
    .filter((stat): stat is { key: string; value: string; label: string } =>
      Boolean(stat),
    );

  if (stats.length === 0) {
    return null;
  }

  return (
    <section
      className={statsSectionClassName}
      aria-label={block.heading || "Highlights"}
    >
      {block.heading ? (
        <h2 className={statsHeadingClassName}>{block.heading}</h2>
      ) : null}
      <div className="grid grid-cols-2 gap-5 md:gap-4 lg:grid-cols-4">
        {stats.map((stat) => (
          <article
            key={stat.key}
            className="js-stat-tile flex min-h-[165px] flex-col items-center justify-center rounded-[8px] bg-[#FAFAFA] px-4 py-6 text-center transition-colors duration-200 hover:bg-[#f6f5f5] md:min-h-[170px] md:py-8"
          >
            <div className="font-[600] leading-none tracking-normal text-[30px] text-[#111827] md:text-[49px]">
              <AnimatedStatValue value={stat.value} />
            </div>
            <div className="mt-5 text-sm text-[#374151] md:text-[20px]">
              {stat.label}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
