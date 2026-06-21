export type OverviewHighlightView = {
  key: string
  title: string
  description: string
  iconUrl: string | null
}

export default function ProductOverviewHighlights({items}: {items: OverviewHighlightView[]}) {
  if (!items.length) return null

  return (
    <section aria-label="Product benefits" className="mt-16 rounded-[8px] bg-[#f7f7f7] px-5 py-12 md:mt-24 md:px-10 md:py-16 lg:px-16">
      <div className="grid gap-x-10 gap-y-12 md:grid-cols-2 lg:grid-cols-3 lg:gap-x-16">
        {items.map((item) => (
          <article key={item.key} className="flex min-w-0 flex-col items-center text-center">
            <div className="relative grid h-20 w-24 place-items-center md:h-24 md:w-28">
              {item.iconUrl ? (
                <Image src={item.iconUrl} alt="" fill sizes="112px" className="object-contain" />
              ) : null}
            </div>
            <h3 className="m-0 mt-6 text-[20px] font-[600] leading-tight text-[#111827] md:text-[24px]">
              {item.title}
            </h3>
            <p className="m-0 mt-4 max-w-[360px] text-[15px] leading-6 text-[#777d87] md:text-[17px] md:leading-7">
              {item.description}
            </p>
          </article>
        ))}
      </div>
    </section>
  )
}
import Image from 'next/image'
