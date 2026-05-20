export type CmsInternalLink = {
  _type?: "page" | "product";
  title?: string;
  slug?: string;
};

export type CmsNavigationItem = {
  _key?: string;
  label?: string;
  linkType?: "internal" | "path" | "external";
  internalLink?: CmsInternalLink | null;
  internalPath?: string;
  externalUrl?: string;
  openInNewTab?: boolean;
};

function resolveInternalHref(
  link: CmsInternalLink | null | undefined,
) {
  if (!link?._type || !link.slug) {
    return null;
  }

  if (link._type === "page") {
    return link.slug === "home"
      ? "/"
      : `/${link.slug}`;
  }

  if (link._type === "product") {
    return `/products/${link.slug}`;
  }

  return null;
}

export function resolveNavigationHref(
  item: Pick<
    CmsNavigationItem,
    | "linkType"
    | "internalLink"
    | "internalPath"
    | "externalUrl"
    | "openInNewTab"
  >,
) {
  if (item.linkType === "internal") {
    return {
      href: resolveInternalHref(item.internalLink),
      openInNewTab: false,
      isExternal: false,
    };
  }

  if (item.linkType === "path") {
    return {
      href: item.internalPath || null,
      openInNewTab: false,
      isExternal: false,
    };
  }

  return {
    href: item.externalUrl || null,
    openInNewTab: Boolean(item.openInNewTab),
    isExternal: true,
  };
}