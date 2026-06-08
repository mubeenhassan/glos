import Link from 'next/link'

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
      <Link href={`/products/${slug}`} className="block">
        <div className="relative overflow-hidden rounded-[8px] border border-[#0000001A] bg-[#ffffff] p-2.5 lg:p-3.5">
          <button
            type="button"
            aria-label="Save product"
            className="absolute z-99 right-2 top-2 flex h-[30px] w-[30px] items-center justify-center rounded-full bg-[#FAFAFA] text-[#e85534] transition-colors group-hover:bg-[#ededee] lg:right-3 lg:top-3 lg:h-[40px] lg:w-[40px]"
          >
            <svg
              width="17"
              height="16"
              viewBox="0 0 17 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 translate-y-px lg:h-auto lg:w-auto"
              aria-hidden="true"
            >
              <path
                d="M8.33265 1.26608C8.97709 0.688302 9.71598 0.307747 10.5493 0.124413C11.3826 -0.0589199 12.2049 -0.0394754 13.016 0.182747C13.8604 0.41608 14.591 0.84108 15.2076 1.45775C15.8243 2.07441 16.2493 2.80497 16.4826 3.64941C16.7049 4.46052 16.7243 5.27997 16.541 6.10775C16.3576 6.93552 15.9771 7.67719 15.3993 8.33275L8.33265 15.3994L1.26598 8.33275C0.688204 7.67719 0.307648 6.93552 0.124315 6.10775C-0.0590183 5.27997 -0.0395738 4.46052 0.182648 3.64941C0.415982 2.80497 0.84376 2.07441 1.46598 1.45775C2.0882 0.84108 2.81598 0.41608 3.64932 0.182747C4.46043 -0.0394754 5.28265 -0.0589199 6.11598 0.124413C6.94932 0.307747 7.6882 0.688302 8.33265 1.26608ZM14.016 2.63275C13.6049 2.22164 13.1271 1.94108 12.5826 1.79108C12.0382 1.64108 11.4882 1.62719 10.9326 1.74941C10.3771 1.87164 9.88265 2.12719 9.44932 2.51608L8.33265 3.51608L7.21598 2.51608C6.79376 2.12719 6.30209 1.87164 5.74098 1.74941C5.17987 1.62719 4.62709 1.64108 4.08265 1.79108C3.5382 1.94108 3.06043 2.22164 2.64932 2.63275C2.2382 3.04386 1.95487 3.52164 1.79932 4.06608C1.64376 4.61052 1.62432 5.15775 1.74098 5.70775C1.85765 6.25775 2.10487 6.74941 2.48265 7.18275L8.33265 13.0494L14.1826 7.18275C14.5604 6.74941 14.8076 6.25775 14.9243 5.70775C15.041 5.15775 15.0215 4.61052 14.866 4.06608C14.7104 3.52164 14.4271 3.04386 14.016 2.63275Z"
                fill="#E44641"
              />
            </svg>
          </button>
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
        </div>

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

          <h3 className="m-0 mt-4 text-[30px] font-semibold leading-[1.12] tracking-[-0.02em] text-[#111827] md:text-[24px]">
            {name}
          </h3>
          <p className="m-0 mt-4 text-[20px] font-semibold leading-none text-[#FB612E] underline decoration-1 underline-offset-[3px] md:text-[16px]">
            View Details
          </p>
        </div>
      </Link>
    </article>
  )
}
