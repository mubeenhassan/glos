export type OverviewFeatureImageView = {
  key: string
  url: string | null
  alt: string
}

type Props = {
  heading: string
  description: string
  images: OverviewFeatureImageView[]
}

function FeatureImages({images}: {images: OverviewFeatureImageView[]}) {
  const count = Math.min(images.length, 4)
  if (!count) return null

  if (count === 1) {
    const image = images[0]
    return (
      <div className="relative aspect-[4/3] overflow-hidden rounded-[8px] bg-[#eceef2]">
        {image.url ? <Image src={image.url} alt={image.alt} fill sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" /> : null}
      </div>
    )
  }

  if (count === 2) {
    return (
      <div className="grid grid-cols-2 items-start gap-3 md:gap-4">
        <div className="relative aspect-[3/4] overflow-hidden rounded-[8px] bg-[#eceef2]">
          {images[0].url ? <Image src={images[0].url} alt={images[0].alt} fill sizes="(min-width: 1024px) 25vw, 50vw" className="object-cover" /> : null}
        </div>
        <div className="relative aspect-square overflow-hidden rounded-[8px] bg-[#eceef2]">
          {images[1].url ? <Image src={images[1].url} alt={images[1].alt} fill sizes="(min-width: 1024px) 25vw, 50vw" className="object-cover" /> : null}
        </div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 gap-3 md:gap-4">
      {images.slice(0, 4).map((image, index) => (
        <div
          key={image.key}
          className={`relative overflow-hidden rounded-[8px] bg-[#eceef2] ${count === 3 && index === 0 ? 'row-span-2 aspect-[3/4]' : 'aspect-square'}`}
        >
          {image.url ? <Image src={image.url} alt={image.alt} fill sizes="(min-width: 1024px) 25vw, 50vw" className="object-cover" /> : null}
        </div>
      ))}
    </div>
  )
}

export default function ProductOverviewSplitFeature({heading, description, images}: Props) {
  if (!images.length || !heading) return null

  return (
    <section className="mt-16 grid items-center gap-10 md:mt-24 lg:grid-cols-2 lg:gap-20">
      <div>
        <FeatureImages images={images} />
      </div>
      <div>
        <h3 className="m-0 text-[28px] font-[600] leading-tight tracking-[-0.02em] text-[#111827] md:text-[36px]">
          {heading}
        </h3>
        <p className="m-0 mt-5 max-w-[620px] text-[17px] leading-7 text-[#313743] md:text-[20px] md:leading-8">
          {description}
        </p>
      </div>
    </section>
  )
}
import Image from 'next/image'
