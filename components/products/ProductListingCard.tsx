import Link from 'next/link'
import {FiSliders} from 'react-icons/fi'

export type ProductListingCardProps = {
  name: string
  slug: string
  imageUrl?: string | null
  category?: string
  listingBadgeText?: string
  isNew?: boolean
  className?: string
}

export default function ProductListingCard({
  name,
  slug,
  imageUrl,
  category,
  listingBadgeText,
  isNew,
  className,
}: ProductListingCardProps) {
  const showBadge = Boolean(listingBadgeText || isNew)

  return (
    <article className={['group', className].filter(Boolean).join(' ')}>
      <div className="relative">
        <Link
          href={`/products/${slug}`}
          aria-label={`View ${name}`}
          className="block overflow-hidden rounded-[8px] border border-[#0000001A] bg-[#ffffff] p-2.5 lg:p-3.5"
        >
          <div className="aspect-square overflow-hidden">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={name}
                className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-[1.03]"
              />
            ) : (
              <div className="product-placeholder" />
            )}
          </div>
        </Link>

        <Link
          href={`/configurator/product/${slug}`}
          aria-label={`Configure ${name}`}
          title={`Configure ${name}`}
          className="absolute right-2 top-2 z-10 flex h-[30px] w-[30px] items-center justify-center rounded-full bg-[#FAFAFA] text-[#6b7280] transition-[background-color,color,transform] hover:scale-105 hover:bg-[#FB612E] hover:text-white focus-visible:scale-105 focus-visible:bg-[#FB612E] focus-visible:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FB612E]/40 focus-visible:ring-offset-2 lg:right-3 lg:top-3 lg:h-[40px] lg:w-[40px]"
        >
          <FiSliders className="h-4 w-4 lg:h-[18px] lg:w-[18px]" aria-hidden />
        </Link>
      </div>

      <Link href={`/products/${slug}`} className="block">
        <div className="mt-2 lg:hidden">
          <p className="m-0 text-[12px] text-[#374151]">{category || 'Products'}</p>
          <h3 className="m-0 mt-1 text-[14px] font-[600] leading-[1.15] tracking-[-0.02em] text-[#111827]">
            {name}
          </h3>
          <div className="mt-2 flex justify-end">
            <span className="inline-flex min-h-[22px] items-center rounded-[6px] bg-(--color-brand-orange) px-2 text-[12px] font-semibold text-white">
              View
            </span>
          </div>
        </div>

        <div className="hidden lg:block">
          {showBadge ? (
            <span className="mt-5 inline-flex max-h-[33px] items-center rounded-[8px] bg-[#FB612E1A] px-[16px] text-[14px] font-semibold leading-none text-[#FB612E] md:min-h-[33px]">
              {listingBadgeText || 'New'}
            </span>
          ) : null}

          <h3 className="m-0 mt-4 text-[14px] font-semibold leading-[1.12] tracking-[-0.02em] text-[#111827]">
            {name}
          </h3>
          {/* <p className="m-0 mt-4 text-[20px] font-semibold leading-none text-[#FB612E] underline decoration-1 underline-offset-[3px] md:text-[16px]">
            View Details
          </p> */}
        </div>
      </Link>
    </article>
  )
}
