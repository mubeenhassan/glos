export type DownloadResourceCardItem = {
  categoryLabel: string
  fileSizeLabel?: string
  title: string
  fileUrl: string
  downloadLabel?: string
}

const cardClassName =
  'flex h-full flex-col rounded-[8px] bg-[#FAFAFA] p-5 md:p-6'

const cardMetaClassName = 'flex items-center gap-[16px]'

const categoryPillClassName =
  'inline-flex rounded-[8px] bg-[#FB612E1A] px-[16px] py-[7px] text-[11px] font-semibold leading-none text-[var(--color-brand-orange)] md:text-[14px]'

const fileSizeClassName =
  'shrink-0 text-[12px] leading-none text-[#374151] md:text-[20px]'

const cardTitleClassName =
  'm-0 mt-4 font-[400] md:font-[600] text-[18px] leading-snug text-[#111827] md:mt-5 md:text-[24px]'

const downloadButtonClassName =
  'mt-5 inline-flex min-h-[48px] w-full items-center justify-center rounded-[8px] bg-[#111827] px-4 text-[14px] font-semibold transition-colors duration-200 hover:bg-[#1f2937] !text-white md:mt-6 md:min-h-[52px] md:text-[16px]'

export const downloadResourcesGridClassName =
  'grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-[24px]'

type DownloadResourceCardProps = {
  item: DownloadResourceCardItem
}

export default function DownloadResourceCard({item}: DownloadResourceCardProps) {
  const downloadLabel = item.downloadLabel?.trim() || 'Download PDF'

  return (
    <article className={cardClassName}>
      <div className={cardMetaClassName}>
        <span className={categoryPillClassName}>{item.categoryLabel}</span>
        {item.fileSizeLabel ? (
          <span className={fileSizeClassName}>{item.fileSizeLabel}</span>
        ) : null}
      </div>
      <h3 className={cardTitleClassName}>{item.title}</h3>
      <a
        className={downloadButtonClassName}
        href={item.fileUrl}
        download
        target="_blank"
        rel="noreferrer noopener"
      >
        {downloadLabel}
      </a>
    </article>
  )
}
