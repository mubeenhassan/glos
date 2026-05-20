"use client";

import { useEffect, useRef, useState } from "react";

export default function HeaderWrapper({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const [hideHeader, setHideHeader] = useState(false);

  const lastScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY;

      // Hide when scrolling down
      if (
        currentY > lastScrollY.current &&
        currentY > 100
      ) {
        setHideHeader(true);
      } else {
        // Show when scrolling up
        setHideHeader(false);
      }

      lastScrollY.current = currentY;
    };

    const handleMouseMove = (e: MouseEvent) => {
      // Reveal when mouse near top
      if (e.clientY <= 80) {
        setHideHeader(false);
      }
    };

    window.addEventListener("scroll", handleScroll, {
      passive: true,
    });

    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  return (
    <header
      className={`
        ${className}
        transition-transform transition-opacity duration-500 ease-in-out
        ${
          hideHeader
            ? "-translate-y-[140%] opacity-0 pointer-events-none"
            : "translate-y-0 opacity-100 pointer-events-auto"
        }
      `}
    >
      {children}
    </header>
  );
}