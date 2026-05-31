import 'server-only'
import {fetchSanity} from '@/lib/sanity'

export type FaqEntryItem = {
  _id: string
  question: string
  answer: string
  sortOrder: number | null
}

const FAQ_ENTRIES_QUERY = `*[_type == "faqEntry"] | order(sortOrder asc, question asc) {
  _id,
  question,
  answer,
  sortOrder
}`

type RawFaqEntry = {
  _id: string
  question?: string
  answer?: string
  sortOrder?: number | null
}

export async function getFaqEntries(selectedIds?: string[]) {
  const rows = await fetchSanity<RawFaqEntry[]>(FAQ_ENTRIES_QUERY)
  const selectedIdSet = new Set((selectedIds || []).filter(Boolean))

  return (rows || [])
    .map((row) => {
      const question = row.question?.trim()
      const answer = row.answer?.trim()
      if (!row._id || !question || !answer) {
        return null
      }
      return {
        _id: row._id,
        question,
        answer,
        sortOrder: typeof row.sortOrder === 'number' ? row.sortOrder : null,
      } satisfies FaqEntryItem
    })
    .filter((item) => (selectedIdSet.size > 0 ? selectedIdSet.has(item?._id || '') : true))
    .filter((item): item is FaqEntryItem => Boolean(item))
}
