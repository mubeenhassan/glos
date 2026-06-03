import Link from 'next/link'
import type {ProductVariant} from '@/lib/catalog'

type TableColumn = {
  _id: string
  key: string
  title: string
}

type ConfiguratorVariantCardProps = {
  variant: ProductVariant
  nonSkuColumns: TableColumn[]
  detailHref: string
  getColumnValue: (variant: ProductVariant, key: string) => string
}

function VariantField({
  label,
  value,
  href,
}: {
  label: string
  value: string
  href?: string
}) {
  return (
    <div className="min-w-0 overflow-hidden">
      <p className="m-0 truncate text-[12px] md:text-sm font-bold leading-4 text-[#111827]">{label}</p>
      {href ? (
        <Link
          className="mt-1 block min-h-5 min-w-0 truncate text-[15px] font-bold leading-5 text-[#FB612E] underline underline-offset-2"
          href={href}
          scroll={false}
          title={value}
        >
          {value}
        </Link>
      ) : (
        <p className="m-0 mt-1 min-h-5 truncate text-[14px] md:text-[15px] font-normal leading-5 text-[#374151]" title={value}>
          {value}
        </p>
      )}
    </div>
  )
}

export default function ConfiguratorVariantCard({
  variant,
  nonSkuColumns,
  detailHref,
  getColumnValue,
}: ConfiguratorVariantCardProps) {
  const desktopGridColumns = `minmax(140px, 1.35fr) ${nonSkuColumns.map(() => 'minmax(88px, 1fr)').join(' ')} 56px`

  return (
    <article className="rounded-[10px] bg-white md:bg-[#FAFAFA] p-[17px] md:p-6 md:border-0 border border-[#E5E7EB]">
      <div className="mb-4 flex items-start justify-between gap-3 md:hidden">
        <div className="min-w-0 flex-1">
          <p className="m-0 truncate text-[12px] font-bold leading-4 text-[#6A7282]">Product Code</p>
          <Link
            className="mt-1 block min-h-5 min-w-0 truncate text-[16px] font-bold leading-5 !text-[#FB612E] !underline !underline-offset-2"
            href={detailHref}
            scroll={false}
            title={variant.sku}
          >
            {variant.sku}
          </Link>
        </div>
        <Link
          className="inline-flex size-8 shrink-0 items-center justify-center text-xl leading-none text-[#6A7282] hover:text-[#111827]"
          href={detailHref}
          scroll={false}
          aria-label={`View details for ${variant.sku}`}
        >
          <span aria-hidden="true">⋯</span>
        </Link>
      </div>

      <div
        className="hidden gap-x-4 gap-y-3 min-[1261px]:grid"
        style={{gridTemplateColumns: desktopGridColumns}}
      >
        <VariantField label="Product Code" value={variant.sku} href={detailHref} />

        {nonSkuColumns.map((column) => (
          <VariantField
            key={`${variant._id}-${column._id}-desktop`}
            label={column.title}
            value={getColumnValue(variant, column.key)}
          />
        ))}

        <div className="min-w-0 overflow-hidden">
          <p className="m-0 truncate text-sm font-bold leading-4 text-[#111827]">Action</p>
          <div className="mt-1 flex min-h-5 items-center">
            <Link
              className="inline-flex size-5 items-center justify-center text-xl leading-none text-[#6b7280] hover:text-[#111827]"
              href={detailHref}
              scroll={false}
              aria-label={`View details for ${variant.sku}`}
            >
              <span aria-hidden="true">⋯</span>
            </Link>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-x-4 gap-y-4 min-[1261px]:hidden">
        {nonSkuColumns.map((column) => (
          <VariantField
            key={`${variant._id}-${column._id}-mobile`}
            label={column.title}
            value={getColumnValue(variant, column.key)}
          />
        ))}
      </div>
    </article>
  )
}
