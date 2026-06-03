import 'server-only'
import {fetchSanity} from '@/lib/sanity'

export type ContactOfficeItem = {
  _id: string
  city: string
  address: string
  phone: string | null
  email: string | null
  sortOrder: number | null
}

const CONTACT_OFFICES_QUERY = `*[_type == "contactOffice"] | order(sortOrder asc, city asc) {
  _id,
  city,
  address,
  phone,
  email,
  sortOrder
}`

type RawContactOffice = {
  _id: string
  city?: string
  address?: string
  phone?: string | null
  email?: string | null
  sortOrder?: number | null
}

export async function getContactOffices() {
  const rows = await fetchSanity<RawContactOffice[]>(CONTACT_OFFICES_QUERY)

  return (rows || [])
    .map((row) => {
      const city = row.city?.trim()
      const address = row.address?.trim()
      if (!row._id || !city || !address) {
        return null
      }
      return {
        _id: row._id,
        city,
        address,
        phone: row.phone?.trim() || null,
        email: row.email?.trim() || null,
        sortOrder: typeof row.sortOrder === 'number' ? row.sortOrder : null,
      } satisfies ContactOfficeItem
    })
    .filter((item): item is ContactOfficeItem => Boolean(item))
}
