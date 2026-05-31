"use client";

import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function setRevealBase(elements: Element[] | NodeListOf<Element>) {
  if (!elements || elements.length === 0) return;
  gsap.set(elements, { autoAlpha: 0, y: 28 });
}

function revealElements(
  trigger: Element,
  elements: Element[] | NodeListOf<Element>,
  options?: { start?: string; stagger?: number; duration?: number; delay?: number },
) {
  if (!elements || elements.length === 0) return;
  gsap.to(elements, {
    autoAlpha: 1,
    y: 0,
    duration: options?.duration ?? 0.86,
    stagger: options?.stagger ?? 0.1,
    ease: "power3.out",
    delay: options?.delay ?? 0,
    scrollTrigger: {
      trigger,
      start: options?.start ?? "top 80%",
      once: true,
    },
  });
}

export default function BrandPageAnimations() {
  useEffect(() => {
    if (prefersReducedMotion()) return;

    const hasBrandSections =
      document.querySelector(".cms-brand-foundation-section") ||
      document.querySelector(".cms-design-philosophy-section") ||
      document.querySelector(".cms-our-vision-section") ||
      document.querySelector(".cms-our-purpose-section") ||
      document.querySelector(".cms-why-glos-section") ||
      document.querySelector(".cms-core-strengths-section") ||
      document.querySelector(".cms-core-highlights-section");

    if (!hasBrandSections) return;

    const ctx = gsap.context(() => {
      const brandFoundationSections = gsap.utils.toArray<HTMLElement>(
        ".cms-brand-foundation-section",
      );
      brandFoundationSections.forEach((section) => {
        const headings = section.querySelectorAll("h1, h2");
        const paragraphs = section.querySelectorAll("p");
        const figures = section.querySelectorAll("figure");
        const images = section.querySelectorAll("figure img");

        setRevealBase(headings);
        setRevealBase(paragraphs);
        gsap.set(figures, {
          autoAlpha: 0,
          y: 30,
          clipPath: "inset(8% 8% 8% 8% round 10px)",
          scale: 0.96,
        });
        gsap.set(images, { scale: 1.08, transformOrigin: "50% 50%" });

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: section,
            start: "top 78%",
            once: true,
          },
          defaults: { ease: "power3.out" },
        });

        tl.to(headings, { autoAlpha: 1, y: 0, duration: 0.9, stagger: 0.1 }, 0)
          .to(
            figures,
            {
              autoAlpha: 1,
              y: 0,
              scale: 1,
              clipPath: "inset(0% 0% 0% 0% round 10px)",
              duration: 1.1,
              stagger: { amount: 0.36, from: "center" },
              ease: "expo.out",
            },
            0.08,
          )
          .to(images, { scale: 1, duration: 1.25, stagger: 0.06, ease: "expo.out" }, 0.14)
          .to(paragraphs, { autoAlpha: 1, y: 0, duration: 0.8, stagger: 0.08 }, 0.28);
      });

      const designSections = gsap.utils.toArray<HTMLElement>(
        ".cms-design-philosophy-section",
      );
      designSections.forEach((section) => {
        const heading = section.querySelectorAll("h2");
        const paragraphs = section.querySelectorAll("p");
        const figures = section.querySelectorAll("figure");
        const images = section.querySelectorAll("figure img");

        setRevealBase(heading);
        setRevealBase(paragraphs);
        gsap.set(figures, {
          autoAlpha: 0,
          y: 26,
          clipPath: "inset(14% 14% 14% 14% round 10px)",
          scale: 0.94,
        });
        gsap.set(images, { scale: 1.1 });

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: section,
            start: "top 78%",
            once: true,
          },
        });

        tl.to(heading, { autoAlpha: 1, y: 0, duration: 0.9, ease: "power3.out" }, 0)
          .to(
            figures,
            {
              autoAlpha: 1,
              y: 0,
              scale: 1,
              clipPath: "inset(0% 0% 0% 0% round 10px)",
              duration: 1.05,
              stagger: { amount: 0.5, from: "random" },
              ease: "expo.out",
            },
            0.08,
          )
          .to(paragraphs, { autoAlpha: 1, y: 0, duration: 0.8, stagger: 0.08 }, 0.2)
          .to(images, { scale: 1, duration: 1.2, stagger: 0.05, ease: "expo.out" }, 0.18);
      });

      const visionSections = gsap.utils.toArray<HTMLElement>(".cms-our-vision-section");
      visionSections.forEach((section) => {
        const heading = section.querySelectorAll("h2");
        const paragraphs = section.querySelectorAll("p");
        const galleryFrame = section.querySelectorAll('[aria-label$=" gallery"]');
        const tiles = section.querySelectorAll("figure");
        const tileImages = section.querySelectorAll("figure img");

        setRevealBase(heading);
        setRevealBase(paragraphs);
        gsap.set(galleryFrame, { autoAlpha: 0, y: 32, scale: 0.98 });
        gsap.set(tiles, {
          autoAlpha: 0,
          y: 24,
          clipPath: "inset(10% 10% 10% 10% round 10px)",
          scale: 0.95,
        });
        gsap.set(tileImages, { scale: 1.09 });

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: section,
            start: "top 80%",
            once: true,
          },
        });

        tl.to(heading, { autoAlpha: 1, y: 0, duration: 0.85, ease: "power3.out" }, 0)
          .to(paragraphs, { autoAlpha: 1, y: 0, duration: 0.78, stagger: 0.08, ease: "power3.out" }, 0.12)
          .to(galleryFrame, { autoAlpha: 1, y: 0, scale: 1, duration: 0.9, ease: "power3.out" }, 0.14)
          .to(
            tiles,
            {
              autoAlpha: 1,
              y: 0,
              scale: 1,
              clipPath: "inset(0% 0% 0% 0% round 10px)",
              duration: 1.05,
              stagger: { amount: 0.44, from: "center" },
              ease: "expo.out",
            },
            0.2,
          )
          .to(tileImages, { scale: 1, duration: 1.2, stagger: 0.05, ease: "expo.out" }, 0.22);
      });

      const purposeSections = gsap.utils.toArray<HTMLElement>(".cms-our-purpose-section");
      purposeSections.forEach((section) => {
        const heading = section.querySelectorAll("h2");
        const copy = section.querySelectorAll("p");
        const media = section.querySelectorAll("img");

        setRevealBase(heading);
        setRevealBase(copy);
        gsap.set(media, { autoAlpha: 0, y: 32, scale: 1.06 });

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: section,
            start: "top 80%",
            once: true,
          },
        });

        tl.to(media, { autoAlpha: 1, y: 0, scale: 1, duration: 1.05, ease: "expo.out" }, 0)
          .to(heading, { autoAlpha: 1, y: 0, duration: 0.8, ease: "power3.out" }, 0.12)
          .to(copy, { autoAlpha: 1, y: 0, duration: 0.75, ease: "power3.out" }, 0.2);
      });

      const whySections = gsap.utils.toArray<HTMLElement>(".cms-why-glos-section");
      whySections.forEach((section) => {
        const headingAndCopy = section.querySelectorAll("h2, p");
        const cards = section.querySelectorAll("article");
        setRevealBase(headingAndCopy);
        gsap.set(cards, { autoAlpha: 0, y: 22, scale: 0.97 });

        revealElements(section, headingAndCopy, { duration: 0.78, stagger: 0.08, start: "top 80%" });
        revealElements(section, cards, { duration: 0.72, stagger: 0.1, start: "top 76%", delay: 0.08 });
      });

      const strengthsSections = gsap.utils.toArray<HTMLElement>(".cms-core-strengths-section");
      strengthsSections.forEach((section) => {
        const heading = section.querySelectorAll("h2");
        const cards = section.querySelectorAll("article");
        const icons = section.querySelectorAll("article img");

        setRevealBase(heading);
        gsap.set(cards, { autoAlpha: 0, y: 24, scale: 0.96 });
        gsap.set(icons, { autoAlpha: 0, scale: 0.8, transformOrigin: "50% 50%" });

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: section,
            start: "top 80%",
            once: true,
          },
        });

        tl.to(heading, { autoAlpha: 1, y: 0, duration: 0.8, ease: "power3.out" }, 0)
          .to(cards, { autoAlpha: 1, y: 0, scale: 1, duration: 0.8, stagger: 0.1, ease: "power3.out" }, 0.12)
          .to(icons, { autoAlpha: 1, scale: 1, duration: 0.65, stagger: 0.06, ease: "back.out(1.4)" }, 0.26);
      });

      const highlightsSections = gsap.utils.toArray<HTMLElement>(".cms-core-highlights-section");
      highlightsSections.forEach((section) => {
        const heading = section.querySelectorAll("h2");
        const cards = section.querySelectorAll("article");
        setRevealBase(heading);
        gsap.set(cards, {
          autoAlpha: 0,
          y: 24,
          scale: 0.96,
          clipPath: "inset(12% 8% 8% 8% round 10px)",
        });

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: section,
            start: "top 82%",
            once: true,
          },
        });

        tl.to(heading, { autoAlpha: 1, y: 0, duration: 0.82, ease: "power3.out" }, 0).to(
          cards,
          {
            autoAlpha: 1,
            y: 0,
            scale: 1,
            clipPath: "inset(0% 0% 0% 0% round 10px)",
            duration: 0.95,
            stagger: { amount: 0.36, from: "start" },
            ease: "expo.out",
          },
          0.12,
        );
      });
    });

    return () => ctx.revert();
  }, []);

  return null;
}

