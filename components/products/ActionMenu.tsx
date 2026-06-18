"use client";

import { ResourceAsset } from "@/lib/catalog";
import { useState, useRef, useEffect } from "react";

export default function ActionMenu({
  props = [],
}: {
  props?: any[];
}) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const item = props?.[0];
   
  if (!item) return null;

  const handleDownload = () => {
    if (!item.externalUrl) return;

    const link = document.createElement("a");
    link.href = item.externalUrl;
    link.target = "_blank";
    link.rel = "noopener noreferrer";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setOpen(false);
  };

  return (
    <div ref={menuRef} className="relative inline-block">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-md text-lg font-semibold text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
      >
        <span aria-hidden="true">⋯</span>
      </button>

      {open && (
        <div className="absolute right-0 top-full z-[9999] mt-2 min-w-[220px] overflow-hidden rounded-xl border border-gray-200 bg-white py-1 shadow-lg">
          <button
            type="button"
            onClick={handleDownload}
            className="group flex w-full items-center gap-3 px-4 py-3 text-left text-sm font-medium cursor-pointer text-gray-700 transition-all duration-150 hover:bg-gray-50 hover:text-gray-900"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100 transition-colors group-hover:bg-gray-200">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 4v10m0 0 4-4m-4 4-4-4M4 20h16"
                />
              </svg>
            </div>

            <div className="flex flex-col">
              <span>Download {item.title}</span>
            </div>
          </button>
        </div>
      )}
    </div>
  );
}