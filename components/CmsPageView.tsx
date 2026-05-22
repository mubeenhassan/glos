import { Fragment } from "react";
import type { CmsContentBlock, CmsPage } from "@/lib/cms";
import GalleryAnimations from "@/components/GalleryAnimations";
import ImageCollageAnimations from "@/components/ImageCollageAnimations";
import ResourcesProjectsAnimations from "@/components/ResourcesProjectsAnimations";
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
import type { CmsPageSearchParams } from "@/components/cms/types";
import { cx } from "@/components/cms/utils";
import ProjectsListingSection from "@/components/projects/ProjectsListingSection";

export { CmsButtonsRow } from "@/components/cms/CmsButtons";

const cmsPageClassName =
  "flex flex-col w-full gap-8 bg-white md:gap-12 lg:gap-20";

const leadingHeroPageClassName = "pt-0 md:pt-4 overflow-hidden";

function EmptyCmsPage({ page }: { page: CmsPage }) {
  return (
    <main className="mx-auto my-6 w-[min(1380px,calc(100%_-_30px))] flex-1">
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
      block._type === "resourcesLearningBlock" ||
      block._type === "featuredProjectsBlock" ||
      block._type === "statsBlock" ||
      block._type === "ctaBannerBlock",
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
      )}
    >
      {hasGalleryAnimation ? <GalleryAnimations /> : null}
      {hasImageCollage ? <ImageCollageAnimations /> : null}
      {hasResourcesOrProjects ? <ResourcesProjectsAnimations /> : null}
      {renderedBlocks}
    </main>
  );
}
