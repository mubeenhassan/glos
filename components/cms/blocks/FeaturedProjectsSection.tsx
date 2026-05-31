import { resolveButtonHref } from "@/lib/cms";
import { sanityImageUrl } from "@/lib/sanity";
import FeaturedProjectsSlider, {
  type FeaturedProjectSlide,
} from "@/components/FeaturedProjectsSlider";
import { CmsButtonsRow } from "@/components/cms/CmsButtons";
import type { CmsBlockProps } from "@/components/cms/types";

const featuredSectionClassName =
  "cms-featured-projects-section cms-section-width grid gap-8 py-12 md:gap-12 md:py-16 lg:gap-16 lg:py-20";

const featuredHeadingClassName =
  "js-featured-heading m-0 text-center font-[600] text-4xl leading-tight tracking-normal text-[#121827] md:text-6xl lg:text-[clamp(2.7rem,4.6vw,5.5rem)]";

export default function FeaturedProjectsSection({
  block,
}: CmsBlockProps<"featuredProjectsBlock">) {
  const projects: FeaturedProjectSlide[] = (block.projects || [])
    .filter((project) => Boolean(project?.title))
    .map((project, index) => {
      const imageUrl = sanityImageUrl(project.coverImage, 1000);
      const meta = [
        project.location,
        project.projectType,
        project.completionYear,
      ]
        .filter(Boolean)
        .join(" • ");

      return {
        key: project._id || `${project.title}-${index}`,
        title: project.title as string,
        description: project.description,
        meta,
        imageUrl,
        imageAlt: project.coverImage?.alt || project.title || "Project image",
        href: project.slug ? `/projects/${project.slug}` : undefined,
      };
    });

  if (projects.length === 0) {
    return null;
  }

  const cta = block.cta?.[0];
  const resolvedCta = resolveButtonHref(cta);
  const arrowHref = resolvedCta.href || "/projects";

  return (
    <section className={featuredSectionClassName}>
      <h2 className={featuredHeadingClassName}>
        {block.title || "Featured Projects"}
      </h2>
      <div className="js-featured-slider">
        <FeaturedProjectsSlider projects={projects} arrowHref={arrowHref} />
      </div>
      <div className="js-featured-cta">
        <CmsButtonsRow
          buttons={block.cta}
          className="justify-center"
          buttonClassName="!min-h-14 !min-w-48 !rounded-lg !px-7 !font-extrabold"
        />
      </div>
    </section>
  );
}
