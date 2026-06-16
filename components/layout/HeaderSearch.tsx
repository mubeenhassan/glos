"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const searchClassNameBase =
  "top-search hidden md:grid rounded-full p-2  place-items-center transition-[background-color,border-color,color,box-shadow] duration-300";

const searchClassNameHome = `${searchClassNameBase}  !text-white hover:bg-white/20 hover:border-white/30 hover:shadow-[0_0_48px_-8px_rgba(255,255,255,0.2)] focus-visible:bg-white/20 focus-visible:border-white/30 focus-visible:shadow-[0_0_48px_-8px_rgba(255,255,255,0.2)]`;

const searchClassNameInner = `${searchClassNameBase} border-0 bg-[#FAFAFA] !text-[#374151] shadow-none hover:bg-[#FAFAFA] focus-visible:bg-[#FAFAFA]`;

function SearchIcon({ stroke }: { stroke: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke={stroke}
      strokeWidth="1.3"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="relative z-10 h-6.5 w-6.5"
      aria-hidden
    >
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20L16.65 16.65" />
    </svg>
  );
}

type HeaderSearchProps = {
  searchUrl: string;
  isExternal: boolean;
};

export default function HeaderSearch({ searchUrl, isExternal }: HeaderSearchProps) {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const className = isHome ? searchClassNameHome : searchClassNameInner;
  const stroke = isHome ? "white" : "#374151";

  if (isExternal) {
    return (
      <a className={className} href={searchUrl} aria-label="Search">
        <SearchIcon stroke={stroke} />
      </a>
    );
  }

  return (
    <Link className={className} href={searchUrl} aria-label="Search">
      <SearchIcon stroke={stroke} />
    </Link>
  );
}
