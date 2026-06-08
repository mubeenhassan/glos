"use client";

import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";

const CLOSE_MOBILE_MENU_EVENT = "glos:close-mobile-menu";

type ConfiguratorMobileFiltersSheetProps = {
  children: ReactNode;
  clearFiltersHref: string;
};

export default function ConfiguratorMobileFiltersSheet({
  children,
  clearFiltersHref,
}: ConfiguratorMobileFiltersSheetProps) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    document.addEventListener("keydown", handleEscape);
    return () => {
      document.body.style.overflow = originalOverflow;
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen]);

  return (
    <>
      <button
        type="button"
        onClick={() => {
          document.dispatchEvent(new Event(CLOSE_MOBILE_MENU_EVENT));
          setIsOpen(true);
        }}
        className="flex min-h-10 w-full items-center justify-center gap-2 rounded-[8px] border border-[#D1D5DC] bg-white text-sm font-semibold text-[#111827]"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <g clipPath="url(#clip0_2452_3284)">
            <path
              d="M6.6668 13.3286C6.66674 13.4524 6.70119 13.5738 6.76628 13.6792C6.83137 13.7845 6.92453 13.8696 7.03531 13.925L8.36808 14.5914C8.46971 14.6422 8.58262 14.6661 8.69611 14.661C8.8096 14.6559 8.91988 14.6218 9.0165 14.562C9.11312 14.5023 9.19285 14.4188 9.24813 14.3196C9.30341 14.2203 9.3324 14.1086 9.33235 13.995V9.33026C9.3325 8.99999 9.45527 8.68154 9.67687 8.43664L14.4902 3.11287C14.5765 3.01728 14.6332 2.89875 14.6535 2.7716C14.6738 2.64445 14.6569 2.51414 14.6047 2.39642C14.5526 2.2787 14.4674 2.17861 14.3596 2.10826C14.2517 2.0379 14.1258 2.0003 13.9971 2H2.00208C1.87321 2.00005 1.74711 2.03746 1.63907 2.10771C1.53103 2.17796 1.44567 2.27804 1.39334 2.39581C1.34101 2.51358 1.32396 2.644 1.34424 2.77127C1.36453 2.89854 1.42128 3.0172 1.50763 3.11287L6.32227 8.43664C6.54387 8.68154 6.66665 8.99999 6.6668 9.33026V13.3286Z"
              stroke="#101828"
              strokeWidth="1.33277"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </g>
          <defs>
            <clipPath id="clip0_2452_3284">
              <rect width="15.9933" height="15.9933" fill="white" />
            </clipPath>
          </defs>
        </svg>
        Filters
      </button>

      {isOpen ? (
        <div
          className="fixed inset-0 min-[1261px]:hidden"
          style={{ zIndex: 1000001 }}
        >
          <button
            type="button"
            aria-label="Close filters"
            className="absolute inset-0 bg-black/40"
            onClick={() => setIsOpen(false)}
          />

          <div className="absolute inset-x-0 bottom-0 top-0 flex max-h-dvh flex-col bg-white">
            <div className="flex items-center justify-between border-b border-[#eceef2] px-4 py-4">
              <h3 className="m-0 text-base font-bold text-[#111827]">
                Filters
              </h3>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="inline-flex size-8 items-center justify-center rounded-full text-[#374151]"
                aria-label="Close filters panel"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  aria-hidden="true"
                >
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
              <div className="products-filter-sidebar flex flex-col gap-4 !bg-transparent !p-0">
                {children}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 border-t border-[#eceef2] px-4 py-4">
              <Link
                href={clearFiltersHref}
                scroll={false}
                onClick={() => setIsOpen(false)}
                className="inline-flex min-h-11 items-center justify-center rounded-lg border border-[#e5e7eb] bg-white text-sm font-semibold text-[#111827]"
              >
                Clear all
              </Link>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="inline-flex min-h-11 items-center justify-center rounded-lg bg-[#FB612E] text-sm font-semibold text-white"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
