import Link from "next/link";
import { mediaImageUrl } from "@/lib/sanity";
import type { SiteSettings } from "@/lib/cms";
import { resolveNavigationHref } from "@/lib/navigation";
import MobileMenuClient, {
  type MobileLink,
} from "@/components/layout/MobileMenuClient";
import HeaderNav from "@/components/layout/HeaderNav";
import HeaderSearch from "@/components/layout/HeaderSearch";
import HeaderWrapper from "./HeaderWapper";
type SiteHeaderProps = {
  siteSettings: SiteSettings | null;
};

const headerClassName =
  "topbar fixed left-0 right-0 top-0 z-[9999] pt-0 md:pt-4";

// Mobile: 1fr (brand fills space, pushes hamburger right) + auto (hamburger).
// Desktop unchanged: auto (brand) + 1fr (nav) + auto (search).
const headerInnerClassName =
  "cms-section-width grid grid-cols-[1fr_auto] items-center gap-x-3 gap-y-2 pt-5 md:grid-cols-[auto_1fr_auto] md:gap-4 lg:gap-6 lg:pt-7";

const brandClassName =
  "brand row-start-1 font-[var(--font-display)] text-2xl font-bold tracking-[-0.02em] text-[#111111] transition-colors duration-300 md:text-[clamp(1.55rem,1.7vw,2.1rem)]";

const logoClassName = "brand-logo h-[32px] w-auto lg:h-[44px]";

const brandPlaceholderClassName =
  "h-11 w-11 md:h-[52px] md:w-[52px] lg:h-[clamp(36px,4.2vw,62px)] lg:w-[clamp(36px,4.2vw,62px)]";

const searchPlaceholderClassName =
  "top-search-placeholder hidden md:block row-start-1 h-10 w-10 justify-self-end";

function BrandText({ title }: { title: string }) {
  const match = title.match(/^([\s\S]*?)([^a-zA-Z0-9]+)$/);
  if (match) {
    return (
      <>
        {match[1]}
        <span className="text-[var(--color-brand-orange)]">{match[2]}</span>
      </>
    );
  }
  return <>{title}</>;
}

export default function SiteHeader({ siteSettings }: SiteHeaderProps) {
  const headerLinks = siteSettings?.headerNavigation ?? [];
  const logoUrl = mediaImageUrl({ image: siteSettings?.logo }, 280);
  const siteTitle = siteSettings?.title?.trim();
  const searchUrl = siteSettings?.headerSearchUrl?.trim();
  const showSearch = Boolean(siteSettings?.showHeaderSearch && searchUrl);
  const isExternalSearchUrl = Boolean(
    searchUrl && /^https?:\/\//.test(searchUrl)
  );
  const showHeader = Boolean(
    logoUrl || siteTitle || headerLinks.length > 0 || showSearch
  );

  if (!showHeader) {
    return null;
  }

  // Pre-resolve nav links on the server so we can pass plain objects to the client component
  const mobileLinks: MobileLink[] = headerLinks.flatMap((item) => {
    const resolved = resolveNavigationHref(item);
    const label = item.label || item.internalLink?.title;
    if (!resolved.href || !label) return [];
    return [
      {
        label,
        href: resolved.href,
        isExternal: resolved.isExternal,
        openInNewTab: resolved.openInNewTab,
      },
    ];
  });

  return (
    <HeaderWrapper className={headerClassName}>
      <div className={headerInnerClassName}>
        {/* Brand */}
        {logoUrl || siteTitle ? (
          <Link href="/" className={brandClassName}>
            {logoUrl ? (
              <img
                className={logoClassName}
                src={logoUrl}
                alt={siteSettings?.logo?.alt || siteTitle || ""}
              />
            ) : siteTitle ? (
              <BrandText title={siteTitle} />
            ) : null}
          </Link>
        ) : (
          <span className={brandPlaceholderClassName} aria-hidden />
        )}

        {/* Desktop nav — hidden on mobile, identical on desktop */}

        <HeaderNav headerLinks={headerLinks} />

        {showSearch && searchUrl ? (
          <HeaderSearch searchUrl={searchUrl} isExternal={isExternalSearchUrl} />
        ) : (
          <span className={searchPlaceholderClassName} aria-hidden />
        )}

        {/* Mobile hamburger + overlay — rendered last → lands in col 2 on mobile */}
        <MobileMenuClient
          links={mobileLinks}
          siteName={siteTitle}
          logoUrl={logoUrl ?? undefined}
        />
      </div>
    </HeaderWrapper>
  );
}
