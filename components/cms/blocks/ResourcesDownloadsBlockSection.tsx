import { Suspense } from "react";
import {
  getDownloadResources,
  normalizeResourcesDownloadTabs,
  resolveActiveDownloadTab,
  type DownloadResourceItem,
} from "@/lib/resources";
import ResourcesFilterTabs from "@/components/resources/ResourcesFilterTabs";
import DownloadResourceCard, {
  downloadResourcesGridClassName,
} from "@/components/resources/DownloadResourceCard";
import type { CmsBlockProps, CmsPageSearchParams } from "@/components/cms/types";
import { cleanOptionalText, cmsSectionWidthClassName, cx, toSingleParam } from "@/components/cms/utils";

const sectionClassName = cx(
  "cms-resources-downloads-section",
  cmsSectionWidthClassName,
  "pb-10 pt-0 md:pb-16 md:pt-6 lg:pb-20",
);

function TabsFallback() {
  return (
    <div
      className="h-[50px] w-full max-w-md animate-pulse rounded-[8px] bg-[#FAFAFA] md:h-[56px]"
      aria-hidden
    />
  );
}

function toCardItem(item: DownloadResourceItem) {
  return {
    categoryLabel: item.categoryLabel,
    fileSizeLabel: item.fileSizeLabel || undefined,
    title: item.title,
    fileUrl: item.fileUrl,
    downloadLabel: item.downloadLabel,
  };
}

export default async function ResourcesDownloadsBlockSection({
  block,
  searchParams,
  basePath = "/resources",
}: CmsBlockProps<"resourcesDownloadsBlock"> & {
  searchParams?: CmsPageSearchParams;
  basePath?: string;
}) {
  const tabs = normalizeResourcesDownloadTabs(block.tabs);
  const tabParam = toSingleParam(searchParams?.tab);
  const activeTab = resolveActiveDownloadTab(tabParam, tabs);
  const emptyMessage =
    cleanOptionalText(block.emptyStateMessage) ||
    "No downloads are available in this category yet.";

  const allResources = await getDownloadResources();
  const selectedResourceIds = new Set(
    (block.resources || []).map((item) => item._ref).filter((value): value is string => Boolean(value)),
  );
  const resourcesInScope =
    selectedResourceIds.size > 0
      ? allResources.filter((item) => selectedResourceIds.has(item._id))
      : allResources;
  const filtered = resourcesInScope.filter((item) => item.tab === activeTab);

  return (
    <section className={sectionClassName} aria-label="Resource downloads">
      <Suspense fallback={<TabsFallback />}>
        <ResourcesFilterTabs
          tabs={tabs}
          activeValue={activeTab}
          basePath={basePath}
        />
      </Suspense>

      {filtered.length > 0 ? (
        <div className={cx("mt-8 md:mt-10", downloadResourcesGridClassName)}>
          {filtered.map((item) => (
            <DownloadResourceCard key={item._id} item={toCardItem(item)} />
          ))}
        </div>
      ) : (
        <p className="m-0 mt-8 text-base leading-7 text-[#6b7280] md:mt-10">
          {emptyMessage}
        </p>
      )}
    </section>
  );
}
