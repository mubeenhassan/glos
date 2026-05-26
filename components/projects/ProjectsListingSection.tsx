import { Suspense } from "react";
import Link from "next/link";
import { sanityImageUrl } from "@/lib/sanity";
import {
  categoryLabelFor,
  DEFAULT_PROJECT_CATEGORIES,
  getProjects,
  type ProjectCardSummary,
  type ProjectsCategoryFilter,
} from "@/lib/projects";
import SplitTitle from "@/components/cms/SplitTitle";
import type {
  CmsBlockProps,
  CmsPageSearchParams,
} from "@/components/cms/types";
import { cleanOptionalText, cx, toSingleParam } from "@/components/cms/utils";
import ProjectsFilterChips from "@/components/projects/ProjectsFilterChips";

const projectsListingSectionClassName =
  "cms-projects-listing-section mx-auto w-[calc(100%_-_24px)] py-8 md:w-[calc(100%_-_60px)] md:py-14 lg:w-[min(1680px,calc(100%_-_80px))] lg:py-16 mt-8 md:mt-20";

const projectsListingHeaderClassName =
  "grid grid-cols-1 items-start gap-3 md:grid-cols-[minmax(0,0.95fr)_minmax(360px,0.7fr)] md:gap-10";

const projectsListingHeadingClassName =
  "m-0 break-words font-[600] text-[24px] mt-6 md:mt-0 leading-[1.06] tracking-normal text-[#111827] md:text-[clamp(3rem,4.3vw,4.5rem)]";

const projectsListingDescriptionClassName =
  "m-0 max-w-2xl text-sm leading-6 text-body-text md:justify-self-end md:pt-4 md:text-right md:text-[17px] md:leading-7";

const projectsGridClassName =
  "cms-gallery-grid grid grid-cols-2 gap-3 md:mt-20 md:gap-6 lg:grid-cols-3 lg:gap-[26px]";

const projectCardBaseClassName =
  "cms-gallery-item group relative block min-h-0 overflow-hidden rounded-[9px] bg-[#eceef2] transition-transform duration-300 hover:-translate-y-1 focus-visible:-translate-y-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-orange)]/50 focus-visible:ring-offset-2 md:aspect-[4/5] md:min-h-[280px]";

function projectCardLayoutClassName(index: number) {
  const isMobileFeature = index % 5 === 0;

  return cx(
    isMobileFeature
      ? "col-span-2 aspect-[5/4] md:col-span-1"
      : "col-span-1 aspect-[4/5]",
  );
}

const galleryWordOuterClassName =
  "gallery-word-outer inline-block overflow-hidden align-bottom pb-[0.1em] -mb-[0.1em]";

const galleryWordInnerClassName =
  "gallery-word-inner inline-block will-change-transform";

function normalizeProjectListingCategories(
  raw: CmsBlockProps<"projectsListingBlock">["block"]["categories"],
): ProjectsCategoryFilter[] {
  if (!raw || raw.length === 0) {
    return DEFAULT_PROJECT_CATEGORIES;
  }

  const categories = raw
    .map((category) => {
      const value = cleanOptionalText(category?.value)?.toLowerCase();
      if (!value) {
        return null;
      }

      return {
        value,
        label:
          cleanOptionalText(category?.label) ||
          categoryLabelFor(value, DEFAULT_PROJECT_CATEGORIES) ||
          value,
      };
    })
    .filter((category): category is ProjectsCategoryFilter =>
      Boolean(category),
    );

  return categories.length > 0 ? categories : DEFAULT_PROJECT_CATEGORIES;
}

function ProjectListingCard({
  project,
  index,
}: {
  project: ProjectCardSummary;
  index: number;
}) {
  const imageUrl = sanityImageUrl(project.coverImage, 1100);
  const alt = project.coverImage?.alt || project.title;

  return (
    <Link
      href={`/projects/${project.slug}`}
      className={cx(projectCardBaseClassName, projectCardLayoutClassName(index))}
      aria-label={project.title}
    >
      {imageUrl ? (
        <img
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-[700ms] ease-out group-hover:scale-[1.035]"
          src={imageUrl}
          alt={alt}
          loading="lazy"
        />
      ) : (
        <div className="absolute inset-0 grid place-items-center bg-[linear-gradient(135deg,#f7f8fb_0%,#e5e9f1_100%)] p-7 text-center text-[#5b6371]">
          <span className="font-[600] text-lg">{project.title}</span>
        </div>
      )}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 translate-y-4 bg-[linear-gradient(180deg,rgba(0,0,0,0)_0%,rgba(0,0,0,0.68)_100%)] opacity-0 transition-all duration-500 ease-out group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100"
        aria-hidden
      />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 p-4 text-white md:p-5">
        <h3 className="m-0 translate-y-4 font-[600] text-base leading-tight opacity-0 drop-shadow-[0_2px_14px_rgba(0,0,0,0.42)] transition-all duration-500 ease-out group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100 md:text-xl">
          {project.title}
        </h3>
      </div>
    </Link>
  );
}

export default async function ProjectsListingSection({
  block,
  searchParams,
  basePath,
}: CmsBlockProps<"projectsListingBlock"> & {
  searchParams?: CmsPageSearchParams;
  basePath: string;
}) {
  const projects = await getProjects();
  const categories = normalizeProjectListingCategories(block.categories);
  const showAllFilter = block.showAllFilter !== false;
  const allFilterLabel = cleanOptionalText(block.allFilterLabel) || "All";
  const requestedCategory =
    toSingleParam(searchParams?.category)?.toLowerCase().trim() || null;
  const defaultCategory =
    !showAllFilter && categories.length > 0 ? categories[0].value : null;
  const activeCategory =
    requestedCategory &&
    categories.some((category) => category.value === requestedCategory)
      ? requestedCategory
      : defaultCategory;
  const filteredProjects = activeCategory
    ? projects.filter((project) => project.category === activeCategory)
    : projects;
  const maxItems =
    typeof block.maxItems === "number" &&
    Number.isFinite(block.maxItems) &&
    block.maxItems > 0
      ? Math.floor(block.maxItems)
      : null;
  const visibleProjects = maxItems
    ? filteredProjects.slice(0, maxItems)
    : filteredProjects;
  const activeCategoryLabel = categoryLabelFor(activeCategory, categories);

  return (
    <section
      className={projectsListingSectionClassName}
      aria-label={block.title || "Projects"}
    >
      <header className={projectsListingHeaderClassName}>
        <SplitTitle
          title={block.title || "Projects"}
          className={projectsListingHeadingClassName}
          wordOuterClassName={galleryWordOuterClassName}
          wordInnerClassName={galleryWordInnerClassName}
        />
        {block.description ? (
          <p className={projectsListingDescriptionClassName}>
            {block.description}
          </p>
        ) : null}
      </header>

      {categories.length > 0 ? (
        <div className="my-8 md:my-12">
          <Suspense fallback={<div className="h-11" aria-hidden />}>
            <ProjectsFilterChips
              categories={categories}
              showAllFilter={showAllFilter}
              allFilterLabel={allFilterLabel}
              activeValue={activeCategory}
              basePath={basePath}
            />
          </Suspense>
        </div>
      ) : null}

      {visibleProjects.length === 0 ? (
        <section className="grid place-items-center gap-4 rounded-[18px] border border-dashed border-[#d8dce5] bg-[#fafbfd] px-6 py-12 text-center md:px-10">
          <h3 className="m-0 font-[600] text-2xl leading-tight text-[#121827]">
            No projects to show
          </h3>
          <p className="m-0 max-w-md text-[15px] leading-7 text-[#4a5160]">
            {activeCategory
              ? `There are no projects published for "${activeCategoryLabel || activeCategory}" yet.`
              : "Publish projects in Sanity Studio to populate this section."}
          </p>
          {activeCategory ? (
            <Link
              href={basePath}
              className="btn !min-h-11 !rounded-lg !px-5"
            >
              Show all projects
            </Link>
          ) : null}
        </section>
      ) : (
        <div className={projectsGridClassName}>
          {visibleProjects.map((project, index) => (
            <ProjectListingCard
              key={project._id}
              project={project}
              index={index}
            />
          ))}
        </div>
      )}
    </section>
  );
}
