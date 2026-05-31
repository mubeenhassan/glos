import { SearchIcon } from "@sanity/icons";
import Link from "next/link";
import { mediaImageUrl } from "@/lib/sanity";
import type { SiteSettings } from "@/lib/cms";
import { resolveNavigationHref } from "@/lib/navigation";
import MobileMenuClient, {
  type MobileLink,
} from "@/components/layout/MobileMenuClient";
import NavigationLink from "./NavigationLink";
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

// hidden on mobile, flex on desktop — keeps desktop layout identical
const navClassName =
  "top-nav col-span-2 row-start-2 hidden min-h-11 w-full flex-nowrap items-center justify-start gap-4  rounded-full  text-[#FFFFFF] px-4  transition-[background-color,border-color,color,box-shadow] duration-300 [scrollbar-width:thin] md:col-span-1 md:col-start-2 md:row-start-1 md:flex md:min-h-12 md:w-auto md:flex-wrap md:justify-center md:gap-5 md:justify-self-center md:px-6 lg:gap-7 relative border border-white/20 bg-white/[0.08] backdrop-blur-[15px] shadow-[0_0_48px_-12px_rgba(255,255,255,0.15)] relative overflow-hidden before:absolute before:inset-0 before:rounded-full before:shadow-[inset_1.22px_1.13px_4.62px_rgba(255,255,255,0.126)]  before:pointer-events-none";

const navLinkClassName =
  "top-nav-link relative whitespace-nowrap py-1.5 text-[16px] font-[400] text-current transition-opacity duration-200 after:absolute after:inset-x-0 after:bottom-0.5 after:h-px after:origin-left after:scale-x-0 after:rounded-full after:bg-current after:transition-transform after:duration-200 hover:opacity-75 hover:after:scale-x-100 focus-visible:opacity-75 focus-visible:after:scale-x-100 md:text-[0.92rem]";

// hidden on mobile, visible on desktop — keeps desktop identical
const searchClassName =
  "top-search hidden md:grid text-[30px]  rounded-full  p-2  place-items-center !text-white transition-[background-color,border-color,color,box-shadow] duration-300 hover:bg-white/20 hover:border-white/30 hover:shadow-[0_0_48px_-8px_rgba(255,255,255,0.2)] focus-visible:bg-white/20 focus-visible:border-white/30 focus-visible:shadow-[0_0_48px_-8px_rgba(255,255,255,0.2)]";

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

        {/* NAVBAR */}
        <nav className={navClassName}>
          {headerLinks.map((item, index) => (
            <NavigationLink
              key={item._key || `${item.label || "header-link"}-${index}`}
              item={item}
              className={navLinkClassName}
            />
          ))}
        </nav>

        {/* Desktop search — hidden on mobile, identical on desktop */}
        {showSearch ? (
          isExternalSearchUrl ? (
            <a className={searchClassName} href={searchUrl} aria-label="Search">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="1.3"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-6.5 h-6.5 relative z-10"
              >
                <circle cx="11" cy="11" r="7" />
                <path d="M20 20L16.65 16.65" />
              </svg>
            </a>
          ) : (
            <Link
              className={searchClassName}
              href={searchUrl as string}
              aria-label="Search"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="1.3"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-6.5 h-6.5 relative z-10"
              >
                <circle cx="11" cy="11" r="7" />
                <path d="M20 20L16.65 16.65" />
              </svg>
            </Link>
          )
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
