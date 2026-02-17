import Link from 'next/link'
import {resolveNavigationHref, type CmsNavigationItem} from '@/lib/cms'

type NavigationLinkProps = {
  item: CmsNavigationItem
  className: string
}

export default function NavigationLink({item, className}: NavigationLinkProps) {
  const resolved = resolveNavigationHref(item)
  const label = item.label || item.internalLink?.title

  if (!resolved.href || !label) {
    return null
  }

  if (resolved.isExternal) {
    return (
      <a
        className={className}
        href={resolved.href}
        target={resolved.openInNewTab ? '_blank' : undefined}
        rel={resolved.openInNewTab ? 'noreferrer noopener' : undefined}
      >
        {label}
      </a>
    )
  }

  return (
    <Link className={className} href={resolved.href}>
      {label}
    </Link>
  )
}
