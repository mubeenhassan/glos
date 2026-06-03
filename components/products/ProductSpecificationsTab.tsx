import {type AttributeValue} from '@/lib/catalog'
import {
  getSpecDisplayEntries,
  sortSpecAttributes,
  specSwatchColor,
} from '@/lib/productSpecDisplay'

type ProductSpecificationsTabProps = {
  attributes: AttributeValue[]
}

export default function ProductSpecificationsTab({
  attributes,
}: ProductSpecificationsTabProps) {
  const sortedAttributes = sortSpecAttributes(attributes).filter((attribute) => {
    const title = attribute.definition?.title
    const entries = getSpecDisplayEntries(attribute)
    return Boolean(title && entries.length > 0)
  })

  if (sortedAttributes.length === 0) {
    return (
      <p className="m-0 text-[15px] text-[#6b7280]">
        No specifications configured yet.
      </p>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {sortedAttributes.map((attribute) => {
        const title = attribute.definition?.title || 'Specification'
        const entries = getSpecDisplayEntries(attribute)
        const key =
          attribute.definition?.key ||
          attribute.definition?._id ||
          title

        return (
          <article
            key={key}
            className=" rounded-[8px] bg-[#fafafa] px-5 py-5 md:min-h-[160px] md:px-6 md:py-6"
          >
            <h4 className="m-0  font-semibold leading-tight tracking-[-0.01em] text-[#111827] text-[20px]">
              {title}
            </h4>
            <ul className="m-0 mt-4 list-none space-y-2.5 p-0">
              {entries.map((entry, index) => (
                <li
                  key={`${key}-${entry.label}-${index}`}
                  className="flex items-start gap-2.5 text-[14px] leading-[1.35] text-[#6b7280] md:text-[15px]"
                >
                  {entry.showSwatch ? (
                    <span
                      className="mt-0.5 h-4 w-4 shrink-0 rounded-[4px] border border-black/10"
                      style={{backgroundColor: specSwatchColor(entry.label)}}
                      aria-hidden="true"
                    />
                  ) : null}
                  <span className={entry.showSwatch ? '' : 'block'}>
                    {entry.label}
                  </span>
                </li>
              ))}
            </ul>
          </article>
        )
      })}
    </div>
  )
}
