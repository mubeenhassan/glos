"use client";

import { usePathname } from "next/navigation";
import NavigationLink from "@/components/layout/NavigationLink";
import type { SiteSettings } from "@/lib/cms";

const navClassNameBase =
  "top-nav col-span-2 row-start-2 hidden min-h-11 w-full flex-nowrap items-center justify-start gap-4 rounded-full px-4 transition-[background-color,border-color,color,box-shadow] duration-300 [scrollbar-width:thin] md:col-span-1 md:col-start-2 md:row-start-1 md:flex md:min-h-12 md:w-auto md:flex-wrap md:justify-center md:gap-5 md:justify-self-center md:px-6 lg:gap-7 relative";

const navClassNameHome = `${navClassNameBase} overflow-hidden  text-[#FFFFFF] bg-white/[0.08] shadow-[0_0_48px_-12px_rgba(255,255,255,0.15)] backdrop-blur-[15px] before:pointer-events-none before:absolute before:inset-0 before:rounded-full before:shadow-[inset_1.22px_1.13px_4.62px_rgba(255,255,255,0.126)]`;

const navClassNameInner = `${navClassNameBase} border-0 bg-[#FAFAFA] text-[#374151] shadow-none`;

const navLinkClassName =
  "top-nav-link relative whitespace-nowrap py-1.5 text-[16px] font-[400] text-current transition-opacity duration-200 after:absolute after:inset-x-0 after:bottom-0.5 after:h-px after:origin-left after:scale-x-0 after:rounded-full after:bg-current after:transition-transform after:duration-200 hover:opacity-75 hover:after:scale-x-100 focus-visible:opacity-75 focus-visible:after:scale-x-100 md:text-[0.92rem]";

type HeaderNavProps = {
  headerLinks: NonNullable<SiteSettings["headerNavigation"]>;
};

export default function HeaderNav({ headerLinks }: HeaderNavProps) {
  const pathname = usePathname();
  const isHome = pathname === "/";

  return (
    <nav className={isHome ? navClassNameHome : navClassNameInner}>
      {headerLinks.map((item, index) => (
        <NavigationLink
          key={item._key || `${item.label || "header-link"}-${index}`}
          item={item}
          className={navLinkClassName}
        />
      ))}
    </nav>
  );
}
