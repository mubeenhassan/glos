"use client";

import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export default function ProductsCatalogAnimations() {
  useEffect(() => {
    const page = document.querySelector<HTMLElement>(".products-catalog-page");
    if (!page || prefersReducedMotion()) {
      return;
    }

    const ctx = gsap.context(() => {
      const heroTitle = page.querySelector<HTMLElement>(".js-products-hero-title");
      const heroSub = page.querySelector<HTMLElement>(".js-products-hero-sub");
      const toolbars = gsap.utils.toArray<HTMLElement>(".js-products-toolbar", page);
      const sidebar = page.querySelector<HTMLElement>(".js-products-sidebar");
      const tabs = page.querySelector<HTMLElement>(".js-products-tabs");
      const grid = page.querySelector<HTMLElement>(".js-products-grid");
      const cards = gsap.utils.toArray<HTMLElement>(".js-products-card", page);
      const pagination = page.querySelector<HTMLElement>(".js-products-pagination");

      if (heroTitle) {
        gsap.set(heroTitle, {
          autoAlpha: 0,
          y: 48,
          clipPath: "inset(100% 0% 0% 0%)",
          transformOrigin: "0% 100%",
        });
      }

      if (heroSub) {
        gsap.set(heroSub, { autoAlpha: 0, x: 32, filter: "blur(6px)" });
      }

      gsap.set(toolbars, { autoAlpha: 0, y: 22 });
      if (sidebar) gsap.set(sidebar, { autoAlpha: 0, x: -32 });
      if (tabs) gsap.set(tabs, { autoAlpha: 0, y: 18, scale: 0.98 });

      const intro = gsap.timeline({ defaults: { ease: "power3.out" } });

      if (heroTitle) {
        intro.to(
          heroTitle,
          {
            autoAlpha: 1,
            y: 0,
            clipPath: "inset(0% 0% 0% 0%)",
            duration: 0.95,
            ease: "expo.out",
          },
          0,
        );
      }

      if (heroSub) {
        intro.to(
          heroSub,
          {
            autoAlpha: 1,
            x: 0,
            filter: "blur(0px)",
            duration: 0.75,
          },
          0.22,
        );
      }

      intro
        .to(toolbars, { autoAlpha: 1, y: 0, duration: 0.58, stagger: 0.07 }, 0.34)
        .to(sidebar, { autoAlpha: 1, x: 0, duration: 0.68, ease: "power2.out" }, 0.42)
        .to(tabs, { autoAlpha: 1, y: 0, scale: 1, duration: 0.55 }, 0.48);

      if (cards.length > 0 && grid) {
        gsap.set(cards, {
          autoAlpha: 0,
          y: 40,
          scale: 0.92,
          rotateX: 6,
          transformOrigin: "50% 100%",
          transformPerspective: 900,
        });

        gsap.to(cards, {
          scrollTrigger: {
            trigger: grid,
            start: "top 86%",
            once: true,
          },
          autoAlpha: 1,
          y: 0,
          scale: 1,
          rotateX: 0,
          duration: 0.78,
          stagger: {
            amount: 0.5,
            from: "start",
            grid: [2, 4],
          },
          ease: "power3.out",
        });
      }

      if (pagination) {
        gsap.set(pagination, { autoAlpha: 0, y: 18 });
        gsap.to(pagination, {
          scrollTrigger: {
            trigger: pagination,
            start: "top 94%",
            once: true,
          },
          autoAlpha: 1,
          y: 0,
          duration: 0.55,
          ease: "power2.out",
        });
      }
    }, page);

    return () => ctx.revert();
  }, []);

  return null;
}
