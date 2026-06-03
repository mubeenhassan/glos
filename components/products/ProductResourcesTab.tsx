import {type ResourceAsset} from '@/lib/catalog'
import {toDownloadResourceCardItem} from '@/lib/productResources'
import DownloadResourceCard, {
  downloadResourcesGridClassName,
} from '@/components/resources/DownloadResourceCard'

type ProductResourcesTabProps = {
  resources: ResourceAsset[]
}

export default function ProductResourcesTab({resources}: ProductResourcesTabProps) {
  const cards = resources
    .map((resource) => ({
      id: resource._id,
      item: toDownloadResourceCardItem(resource),
    }))
    .filter((entry): entry is {id: string; item: NonNullable<typeof entry.item>} =>
      Boolean(entry.item),
    )

  if (cards.length === 0) {
    return (
      <p className="m-0 text-[15px] text-[#6b7280]">
        No resources published yet.
      </p>
    )
  }

  return (
    <div className={downloadResourcesGridClassName}>
      {cards.map(({id, item}) => (
        <DownloadResourceCard key={id} item={item} />
      ))}
    </div>
  )
}
