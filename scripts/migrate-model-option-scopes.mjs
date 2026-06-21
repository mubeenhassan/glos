import {createClient} from '@sanity/client'
import {mkdir, writeFile} from 'node:fs/promises'

const apply = process.argv.includes('--apply')
const requiredEnv = (name) => {
  const value = process.env[name]
  if (!value) throw new Error(`Missing ${name}`)
  return value
}

const client = createClient({
  projectId: requiredEnv('NEXT_PUBLIC_SANITY_PROJECT_ID'),
  dataset: requiredEnv('NEXT_PUBLIC_SANITY_DATASET'),
  apiVersion: '2024-01-01',
  useCdn: false,
  token: apply
    ? requiredEnv('SANITY_API_WRITE_TOKEN')
    : process.env.SANITY_API_READ_TOKEN,
  perspective: 'published',
})

const options = await client.fetch(`
  *[_type == "attributeOption" && definition->key == "model"] | order(label asc) {
    ...,
    "usedByProducts": array::unique(
      *[_type == "productVariant" && references(^._id)].product._ref
    )
  }
`)

const changes = options.map((option) => ({
  id: option._id,
  label: option.label,
  productIds: (option.usedByProducts || []).filter(Boolean).sort(),
}))

console.log(JSON.stringify(changes, null, 2))

if (!apply) {
  console.log('\nDry run only. Re-run with --apply to write these scopes.')
  process.exit(0)
}

const withoutUsage = changes.filter((change) => change.productIds.length === 0)
if (withoutUsage.length > 0) {
  throw new Error(`Refusing to apply: model options without variant usage: ${withoutUsage.map((item) => item.label).join(', ')}`)
}

await mkdir('../backups', {recursive: true})
const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
await writeFile(
  `../backups/model-options-before-scope-${timestamp}.json`,
  JSON.stringify(options, null, 2),
)

let transaction = client.transaction()
for (const change of changes) {
  transaction = transaction.patch(change.id, (patch) =>
    patch
      .set({
        scope: 'product',
        applicableProducts: change.productIds.map((productId) => ({
          _type: 'reference',
          _key: productId.replace(/[^a-zA-Z0-9]/g, '-'),
          _ref: productId,
        })),
      })
      .unset(['applicableFamilies']),
  )
}

const result = await transaction.commit()
console.log(`Scoped ${result.results.length} model options successfully.`)
