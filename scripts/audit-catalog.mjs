import {createClient} from '@sanity/client'

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
  token: process.env.SANITY_API_READ_TOKEN,
  perspective: 'published',
})

const report = await client.fetch(`{
  "counts": {
    "products": count(*[_type == "product"]),
    "variants": count(*[_type == "productVariant"]),
    "definitions": count(*[_type == "attributeDefinition"]),
    "options": count(*[_type == "attributeOption"])
  },
  "duplicateSkus": *[
    _type == "productVariant" &&
    count(*[_type == "productVariant" && lower(sku) == lower(^.sku)]) > 1
  ]{_id, sku},
  "duplicateDefinitionKeys": *[
    _type == "attributeDefinition" &&
    count(*[_type == "attributeDefinition" && key == ^.key]) > 1
  ]{_id, key},
  "familyMismatches": *[
    _type == "productVariant" && family._ref != product->family._ref
  ]{sku, "product": product->name, "variantFamily": family->title, "productFamily": product->family->title},
  "categoryMismatches": *[
    _type == "product" && category._ref != family->category._ref
  ]{name, "category": category->title, "familyCategory": family->category->title},
  "optionDefinitionMismatches": *[
    _type == "productVariant" && (
      count(configSelections[defined(singleOptionValue) && singleOptionValue->definition._ref != definition._ref]) > 0 ||
      count(specAttributes[defined(singleOptionValue) && singleOptionValue->definition._ref != definition._ref]) > 0
    )
  ]{sku},
  "unusedOptions": *[
    _type == "attributeOption" && count(*[_type == "productVariant" && references(^._id)]) == 0
  ]{_id, label, "definition": definition->title},
  "unscopedModelOptions": *[
    _type == "attributeOption" && definition->key == "model" && coalesce(scope, "global") == "global"
  ]{_id, label}
}`)

console.log(JSON.stringify(report, null, 2))

const blockingKeys = [
  'duplicateSkus',
  'duplicateDefinitionKeys',
  'familyMismatches',
  'categoryMismatches',
  'optionDefinitionMismatches',
]

if (blockingKeys.some((key) => report[key]?.length > 0)) {
  process.exitCode = 1
}
