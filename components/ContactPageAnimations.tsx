"use client";

import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function compact(elements: Array<HTMLElement | null | undefined>) {
  return elements.filter((element): element is HTMLElement => Boolean(element));
}

export default function ContactPageAnimations() {
  useEffect(() => {
    if (prefersReducedMotion()) return;

    const contactSections = gsap.utils.toArray<HTMLElement>(".cms-contact-section");
    const mapSections = gsap.utils.toArray<HTMLElement>(".cms-find-us-map-section");

    if (contactSections.length === 0 && mapSections.length === 0) {
      return;
    }

    const ctx = gsap.context(() => {
      contactSections.forEach((section) => {
        const headings = gsap.utils.toArray<HTMLElement>("h2, h3", section);
        const formLabels = gsap.utils.toArray<HTMLElement>("form label", section);
        const formInputs = gsap.utils.toArray<HTMLElement>(
          "form input, form textarea, form button, form [role='status']",
          section,
        );
        const officeCards = gsap.utils.toArray<HTMLElement>("article", section);
        const officeRows = gsap.utils.toArray<HTMLElement>("article > div > div", section);
        const hoursCard = section.querySelector<HTMLElement>("dl")?.parentElement as
          | HTMLElement
          | null;
        const hoursRows = gsap.utils.toArray<HTMLElement>("dl > div", section);

        gsap.set(headings, { autoAlpha: 0, y: 22 });
        gsap.set(formLabels, { autoAlpha: 0, y: 10 });
        gsap.set(formInputs, { autoAlpha: 0, y: 12 });
        gsap.set(officeCards, {
          autoAlpha: 0,
          y: 22,
          scale: 0.98,
          clipPath: "inset(8% 8% 8% 8% round 10px)",
        });
        gsap.set(officeRows, { autoAlpha: 0, x: -10 });
        gsap.set(compact([hoursCard]), { autoAlpha: 0, y: 20, scale: 0.98 });
        gsap.set(hoursRows, { autoAlpha: 0, y: 10 });

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: section,
            start: "top 80%",
            once: true,
          },
          defaults: { ease: "power3.out" },
        });

        tl.to(headings, { autoAlpha: 1, y: 0, duration: 0.8, stagger: 0.08 }, 0)
          .to(formLabels, { autoAlpha: 1, y: 0, duration: 0.5, stagger: 0.03 }, 0.08)
          .to(formInputs, { autoAlpha: 1, y: 0, duration: 0.62, stagger: 0.045 }, 0.12)
          .to(
            officeCards,
            {
              autoAlpha: 1,
              y: 0,
              scale: 1,
              clipPath: "inset(0% 0% 0% 0% round 10px)",
              duration: 0.92,
              stagger: 0.12,
              ease: "expo.out",
            },
            0.18,
          )
          .to(officeRows, { autoAlpha: 1, x: 0, duration: 0.5, stagger: 0.02 }, 0.32)
          .to(compact([hoursCard]), { autoAlpha: 1, y: 0, scale: 1, duration: 0.75 }, 0.34)
          .to(hoursRows, { autoAlpha: 1, y: 0, duration: 0.52, stagger: 0.05 }, 0.42);
      });

      mapSections.forEach((section) => {
        const heading = section.querySelector<HTMLElement>("h2");
        const frameWrap = section.querySelector<HTMLElement>("div");
        const iframe = section.querySelector<HTMLElement>("iframe");

        gsap.set(compact([heading]), { autoAlpha: 0, y: 24 });
        gsap.set(compact([frameWrap]), {
          autoAlpha: 0,
          y: 30,
          scale: 0.985,
          clipPath: "inset(8% 8% 8% 8% round 14px)",
        });
        gsap.set(compact([iframe]), { scale: 1.08, transformOrigin: "50% 50%" });

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: section,
            start: "top 82%",
            once: true,
          },
          defaults: { ease: "power3.out" },
        });

        tl.to(compact([heading]), { autoAlpha: 1, y: 0, duration: 0.8 }, 0)
          .to(
            compact([frameWrap]),
            {
              autoAlpha: 1,
              y: 0,
              scale: 1,
              clipPath: "inset(0% 0% 0% 0% round 14px)",
              duration: 1,
              ease: "expo.out",
            },
            0.08,
          )
          .to(compact([iframe]), { scale: 1, duration: 1.2, ease: "expo.out" }, 0.12);
      });
    });

    return () => ctx.revert();
  }, []);

  return null;
}

