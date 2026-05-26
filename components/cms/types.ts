import type { CmsContentBlock } from "@/lib/cms";

export type CmsPageSearchParams = Record<string, string | string[] | undefined>;

export type CmsBlockProps<TType extends CmsContentBlock["_type"]> = {
  block: Extract<CmsContentBlock, { _type: TType }>;
  pageId?: string;
};
