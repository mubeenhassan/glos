import { Fragment } from "react";
import type { CmsContentBlock, CmsPage } from "@/lib/cms";
import GalleryAnimations from "@/components/GalleryAnimations";
import ImageCollageAnimations from "@/components/ImageCollageAnimations";
import ResourcesProjectsAnimations from "@/components/ResourcesProjectsAnimations";
import BrandPageAnimations from "@/components/BrandPageAnimations";
import ContactPageAnimations from "@/components/ContactPageAnimations";
import ContentImageCtaSection from "@/components/cms/blocks/ContentImageCtaSection";
import CtaBannerBlockSection from "@/components/cms/blocks/CtaBannerBlockSection";
import FeaturedProjectsSection from "@/components/cms/blocks/FeaturedProjectsSection";
import HeroBlockSection from "@/components/cms/blocks/HeroBlockSection";
import ImageCollageCtaSection from "@/components/cms/blocks/ImageCollageCtaSection";
import ImageGallerySection from "@/components/cms/blocks/ImageGallerySection";
import PinnedProductShowcaseSection from "@/components/cms/blocks/PinnedProductShowcaseSection";
import ProductSpotlightSection from "@/components/cms/blocks/ProductSpotlightSection";
import ResourcesLearningSection from "@/components/cms/blocks/ResourcesLearningSection";
import StatsBlockSection from "@/components/cms/blocks/StatsBlockSection";
import BrandFoundationBlockSection from "@/components/cms/blocks/BrandFoundationBlockSection";
import DesignPhilosophyBlockSection from "@/components/cms/blocks/DesignPhilosophyBlockSection";
import OurVisionBlockSection from "@/components/cms/blocks/OurVisionBlockSection";
import OurPurposeBlockSection from "@/components/cms/blocks/OurPurposeBlockSection";
import WhyGlosBlockSection from "@/components/cms/blocks/WhyGlosBlockSection";
import CoreStrengthsBlockSection from "@/components/cms/blocks/CoreStrengthsBlockSection";
import CoreHighlightsBlockSection from "@/components/cms/blocks/CoreHighlightsBlockSection";
import PageIntroBlockSection from "@/components/cms/blocks/PageIntroBlockSection";
import ResourcesDownloadsBlockSection from "@/components/cms/blocks/ResourcesDownloadsBlockSection";
import FaqSectionBlockSection from "@/components/cms/blocks/FaqSectionBlockSection";
import ContactSectionBlockSection from "@/components/cms/blocks/ContactSectionBlockSection";
import FindUsMapBlockSection from "@/components/cms/blocks/FindUsMapBlockSection";
import type { CmsPageSearchParams } from "@/components/cms/types";
import { cmsSectionWidthClassName, cx } from "@/components/cms/utils";
import ProjectsListingSection from "@/components/projects/ProjectsListingSection";

export { CmsButtonsRow } from "@/components/cms/CmsButtons";

const cmsPageClassName =
  "flex flex-col w-full gap-8 bg-white md:gap-12 lg:gap-20";

const leadingHeroPageClassName = "pt-0 overflow-hidden";

const leadingBrandFoundationPageClassName = "bg-white";

const leadingPageIntroClassName = "bg-white";

function EmptyCmsPage({ page }: { page: CmsPage }) {
  return (
    <main className={cx(cmsSectionWidthClassName, "my-6 flex-1")}>
      <section className="rounded-[18px] border border-[var(--line)] bg-white p-6 shadow-[var(--shadow-soft)] md:p-9">
        <h1 className="m-0 mb-3 font-[600] text-3xl font-semibold leading-tight tracking-[-0.03em] md:text-5xl">
          {page.title || "Untitled page"}
        </h1>
        <p className="m-0 text-[var(--muted)]">
          No content blocks have been added to this page yet.
        </p>
      </section>
    </main>
  );
}

async function RenderBlock({
  block,
  pageId,
  searchParams,
  basePath,
}: {
  block: CmsContentBlock;
  pageId?: string;
  searchParams?: CmsPageSearchParams;
  basePath: string;
}) {
  switch (block._type) {
    case "heroBlock":
      return <HeroBlockSection block={block} pageId={pageId} />;
    case "contentImageCta":
      return <ContentImageCtaSection block={block} />;
    case "imageGalleryBlock":
      return <ImageGallerySection block={block} pageId={pageId} />;
    case "productSpotlightBlock":
      return <ProductSpotlightSection block={block} />;
    case "imageCollageCtaBlock":
      return <ImageCollageCtaSection block={block} pageId={pageId} />;
    case "pinnedProductShowcaseBlock":
      return <PinnedProductShowcaseSection block={block} />;
    case "resourcesLearningBlock":
      return <ResourcesLearningSection block={block} />;
    case "featuredProjectsBlock":
      return <FeaturedProjectsSection block={block} />;
    case "projectsListingBlock":
      return (
        <ProjectsListingSection
          block={block}
          searchParams={searchParams}
          basePath={basePath}
        />
      );
    case "statsBlock":
      return <StatsBlockSection block={block} />;
    case "ctaBannerBlock":
      return <CtaBannerBlockSection block={block} />;
    case "brandFoundationBlock":
      return <BrandFoundationBlockSection block={block} pageId={pageId} />;
    case "designPhilosophyBlock":
      return <DesignPhilosophyBlockSection block={block} pageId={pageId} />;
    case "ourVisionBlock":
      return <OurVisionBlockSection block={block} pageId={pageId} />;
    case "ourPurposeBlock":
      return <OurPurposeBlockSection block={block} pageId={pageId} />;
    case "whyGlosBlock":
      return <WhyGlosBlockSection block={block} pageId={pageId} />;
    case "coreStrengthsBlock":
      return <CoreStrengthsBlockSection block={block} pageId={pageId} />;
    case "coreHighlightsBlock":
      return <CoreHighlightsBlockSection block={block} pageId={pageId} />;
    case "pageIntroBlock":
      return <PageIntroBlockSection block={block} pageId={pageId} />;
    case "resourcesDownloadsBlock":
      return (
        <ResourcesDownloadsBlockSection
          block={block}
          searchParams={searchParams}
          basePath={basePath}
        />
      );
    case "faqSectionBlock":
      return <FaqSectionBlockSection block={block} pageId={pageId} />;
    case "contactSectionBlock":
      return <ContactSectionBlockSection block={block} pageId={pageId} />;
    case "findUsMapBlock":
      return <FindUsMapBlockSection block={block} pageId={pageId} />;
    default:
      return null;
  }
}

function getBasePath(page: CmsPage) {
  if (page.slug === "home") {
    return "/";
  }

  return page.slug ? `/${page.slug}` : "/";
}

export async function CmsPageView({
  page,
  searchParams,
  basePath = getBasePath(page),
}: {
  page: CmsPage;
  searchParams?: CmsPageSearchParams;
  basePath?: string;
}) {
  const blocks = page.contentBlocks ?? [];

  if (blocks.length === 0) {
    return <EmptyCmsPage page={page} />;
  }

  const hasLeadingHero = blocks[0]?._type === "heroBlock";
  const hasLeadingBrandFoundation =
    blocks[0]?._type === "brandFoundationBlock";
  const hasLeadingPageIntro = blocks[0]?._type === "pageIntroBlock";
  const hasImageCollage = blocks.some(
    (block) => block._type === "imageCollageCtaBlock",
  );
  const hasGalleryAnimation = blocks.some(
    (block) =>
      block._type === "imageGalleryBlock" ||
      block._type === "projectsListingBlock",
  );
  const hasResourcesOrProjects = blocks.some(
    (block) =>
      block._type === "resourcesDownloadsBlock" ||
      block._type === "faqSectionBlock" ||
      block._type === "resourcesLearningBlock" ||
      block._type === "featuredProjectsBlock" ||
      block._type === "statsBlock" ||
      block._type === "ctaBannerBlock",
  );
  const hasBrandNarrativeBlocks = blocks.some(
    (block) =>
      block._type === "brandFoundationBlock" ||
      block._type === "designPhilosophyBlock" ||
      block._type === "ourVisionBlock" ||
      block._type === "ourPurposeBlock" ||
      block._type === "whyGlosBlock" ||
      block._type === "coreStrengthsBlock" ||
      block._type === "coreHighlightsBlock",
  );
  const hasContactBlocks = blocks.some(
    (block) =>
      block._type === "contactSectionBlock" || block._type === "findUsMapBlock",
  );

  const renderedBlocks = await Promise.all(
    blocks.map(async (block, index) => {
      const rendered = await RenderBlock({
        block,
        pageId: page._id,
        searchParams,
        basePath,
      });

      if (!rendered) {
        return null;
      }

      return (
        <Fragment key={block._key || `${block._type}-${index}`}>
          {rendered}
        </Fragment>
      );
    }),
  );

  return (
    <main
      className={cx(
        cmsPageClassName,
        hasLeadingHero && leadingHeroPageClassName,
        hasLeadingBrandFoundation && leadingBrandFoundationPageClassName,
        hasLeadingPageIntro && leadingPageIntroClassName,
      )}
    >
      {hasGalleryAnimation ? <GalleryAnimations /> : null}
      {hasImageCollage ? <ImageCollageAnimations /> : null}
      {hasResourcesOrProjects ? <ResourcesProjectsAnimations /> : null}
      {hasBrandNarrativeBlocks ? <BrandPageAnimations /> : null}
      {hasContactBlocks ? <ContactPageAnimations /> : null}
      {renderedBlocks}
    </main>
  );
}
