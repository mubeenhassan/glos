import { createDataAttribute } from "@sanity/visual-editing/create-data-attribute";

export function blockFieldDataAttribute({
  pageId,
  blockKey,
  field,
}: {
  pageId?: string;
  blockKey?: string;
  field: string;
}) {
  if (!pageId || !blockKey) {
    return undefined;
  }

  return createDataAttribute({
    id: pageId,
    type: "page",
    path: `contentBlocks[_key=="${blockKey}"].${field}`,
  }).toString();
}
