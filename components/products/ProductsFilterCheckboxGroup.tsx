import Link from 'next/link'

export type ProductsFilterCheckboxOption = {
  id: string
  label: string
  href: string
  active: boolean
}

type ProductsFilterCheckboxGroupProps = {
  options: ProductsFilterCheckboxOption[]
}

export default function ProductsFilterCheckboxGroup({
  options,
}: ProductsFilterCheckboxGroupProps) {
  return (
    <div className="products-filter-checkbox-list filter-check-list" role="group">
      {options.map((option) => (
        <Link
          key={option.id}
          href={option.href}
          className={`products-filter-check-item filter-check-item ${option.active ? 'active' : ''}`}
          aria-pressed={option.active}
        >
          <span className="filter-checkbox" aria-hidden="true" />
          <span className="products-filter-check-label">{option.label}</span>
        </Link>
      ))}
    </div>
  )
}
