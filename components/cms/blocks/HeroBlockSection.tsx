import { mediaImageUrl } from "@/lib/sanity";
import HeroGsapAnimations from "@/components/HeroGsapAnimations";
import { CmsButtonLink } from "@/components/cms/CmsButtons";
import SplitTitle from "@/components/cms/SplitTitle";
import { blockFieldDataAttribute } from "@/components/cms/sanityData";
import type { CmsBlockProps } from "@/components/cms/types";
import { cx } from "@/components/cms/utils";

const heroSectionClassName =
  "cms-hero-block relative md:mx-auto md:mt-1 min-h-screen md:block flex items-center justify-center w-full md:w-[calc(100%_-_8px)] overflow-hidden md:rounded-2xl bg-[#111111] px-5 pb-11 pt-32 text-white md:min-h-[560px] md:px-6 md:pb-16 md:pt-40 lg:min-h-[640px] lg:px-12 lg:pt-44 xl:min-h-[clamp(610px,78vh,1040px)] lg:w-[min(100%_-_8px,1728px)] lg:px-[clamp(28px,4.2vw,74px)] lg:pb-[clamp(64px,9vh,122px)] lg:pt-[clamp(150px,16vh,218px)]";

const heroBackgroundClassName = "absolute inset-0";

const heroBackgroundMediaClassName = "h-full w-full object-cover";

const heroOverlayClassName =
  "absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,0.62)_0%,rgba(0,0,0,0.3)_45%,rgba(0,0,0,0.22)_100%),linear-gradient(180deg,rgba(0,0,0,0.26)_0%,rgba(0,0,0,0.08)_42%,rgba(0,0,0,0.42)_100%)]";

const heroContentBaseClassName =
  "cms-hero-content max-w-[1380px] mx-auto relative z-[2] grid md:min-h-[344px] w-full min-w-0 grid-cols-1 items-center justify-center md:items-start gap-6 text-left md:min-h-[360px] lg:grid-cols-[minmax(0,1fr)_minmax(300px,0.7fr)] lg:items-end lg:gap-11 xl:min-h-[calc(clamp(610px,72vh,940px)_-_clamp(150px,16vh,218px)_-_clamp(64px,9vh,122px))] xl:grid-cols-[minmax(0,1fr)_minmax(320px,0.54fr)] xl:gap-[clamp(32px,7vw,136px)] ";

const heroContentAlignmentClassNames = {
  left: "",
  center: "lg:grid-cols-[minmax(0,920px)] lg:justify-center lg:text-center",
  right:
    "lg:grid-cols-[minmax(300px,0.7fr)_minmax(0,1fr)] xl:grid-cols-[minmax(320px,0.54fr)_minmax(0,1fr)]",
};

const heroTitleColumnBaseClassName = "cms-hero-title-column self-start";

const heroActionColumnBaseClassName =
  "cms-hero-action-column self-end max-w-[720px]";

const heroTitleClassName =
  "m-0 text-[2rem] font-[600] leading-[1.08] md:text-left text-center tracking-normal text-white md:text-5xl lg:text-[5rem] ";

const heroDescriptionClassName =
  "md:mt-3.5 text-center md:text-left text-base leading-[1.32] text-white/[0.92] md:m-0 md:text-[clamp(0.96rem,2.2vw,1.16rem)] lg:text-[18px] lg:leading-[1.28]";

const heroCtaRowBaseClassName =
  "js-hero-cta-row mt-5 flex flex-wrap gap-3 md:mt-7 lg:mt-[clamp(24px,2.6vw,38px)]";

const heroButtonClassName =
  "!min-h-12 !w-full !min-w-full !rounded-[8px] !border-[var(--color-brand-orange)] !bg-[var(--color-brand-orange)] !px-3.5 !py-2.5 !text-[0.9rem] !font-extrabold !text-white hover:!border-[var(--color-brand-orange-hover)] hover:!bg-[var(--color-brand-orange-hover)] focus-visible:!border-[var(--color-brand-orange-hover)] focus-visible:!bg-[var(--color-brand-orange-hover)] md:!w-auto md:!min-w-[200px] md:!px-5 md:!py-3 md:!text-[0.94rem] lg:!min-h-[68px] lg:!min-w-[260px] lg:!rounded-lg lg:!px-7 lg:!py-3.5 lg:!text-[clamp(0.9rem,0.84vw,1rem)]";

const heroWordOuterClassName =
  "hero-word-outer inline-block overflow-hidden pb-[0.08em] -mb-[0.08em] align-bottom md:pb-[0.1em] md:-mb-[0.1em]";

const heroWordInnerClassName =
  "hero-word-inner inline-block will-change-transform";

export default function HeroBlockSection({
  block,
  pageId,
}: CmsBlockProps<"heroBlock">) {
  const backgroundImageUrl =
    block.backgroundMedia?.type === "image"
      ? mediaImageUrl(block.backgroundMedia, 2400)
      : null;
  const backgroundVideoUrl =
    block.backgroundMedia?.type === "video"
      ? block.backgroundMedia.videoUrl
      : null;
  const overlayOpacity =
    typeof block.overlayOpacity === "number"
      ? block.overlayOpacity / 100
      : 0.45;
  const contentAlignment =
    block.contentAlignment === "center" || block.contentAlignment === "right"
      ? block.contentAlignment
      : "left";
  const heroContentClassName = cx(
    heroContentBaseClassName,
    heroContentAlignmentClassNames[contentAlignment],
  );
  const heroTitleColumnClassName = cx(
    heroTitleColumnBaseClassName,
    contentAlignment === "right" && "lg:col-start-2 text-center md:text-right",
  );
  const heroActionColumnClassName = cx(
    heroActionColumnBaseClassName,
    contentAlignment === "center" && "lg:mx-auto",
    contentAlignment === "right" && "lg:col-start-1 lg:row-start-1",
  );
  const heroCtaRowClassName = cx(
    heroCtaRowBaseClassName,
    contentAlignment === "center" && "lg:justify-center",
    contentAlignment === "right" && "lg:justify-end",
  );

  return (
    <section className={heroSectionClassName}>
      {backgroundVideoUrl ? (
        <div className={heroBackgroundClassName} aria-hidden>
          <video
            className={heroBackgroundMediaClassName}
            autoPlay
            muted
            loop
            playsInline
          >
            <source src={backgroundVideoUrl} />
          </video>
        </div>
      ) : backgroundImageUrl ? (
        <div className={heroBackgroundClassName} aria-hidden>
          <img
            className={heroBackgroundMediaClassName}
            src={backgroundImageUrl}
            alt=""
          />
        </div>
      ) : null}
      <div
        className={heroOverlayClassName}
        style={{ opacity: overlayOpacity }}
        aria-hidden
      />

      <HeroGsapAnimations />

      <div className={heroContentClassName}>
        <div className={heroTitleColumnClassName}>
          <SplitTitle
            as="h1"
            title={block.title || "Untitled section"}
            className={heroTitleClassName}
            wordOuterClassName={heroWordOuterClassName}
            wordInnerClassName={heroWordInnerClassName}
            dataSanity={blockFieldDataAttribute({
              pageId,
              blockKey: block._key,
              field: "title",
            })}
          />
        </div>

        {block.description || (block.cta && block.cta.length > 0) ? (
          <div className={heroActionColumnClassName}>
            {block.description ? (
              <p className={heroDescriptionClassName}>{block.description}</p>
            ) : null}
            {block.cta && block.cta.length > 0 ? (
              <div className={heroCtaRowClassName}>
                {block.cta.map((button, index) => (
                  <CmsButtonLink
                    key={button._key || `${button.text}-${index}`}
                    button={button}
                    className={heroButtonClassName}
                  />
                ))}
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </section>
  );
}
