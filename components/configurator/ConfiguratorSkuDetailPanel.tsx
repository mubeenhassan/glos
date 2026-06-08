"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import ConfiguratorSkuDetailBody from "@/components/configurator/ConfiguratorSkuDetailBody";
import type { SkuDetailPayload } from "@/lib/configuratorSkuDetail";

type ConfiguratorSkuDetailPanelProps = {
  detail: SkuDetailPayload;
  closeHref: string;
};

function getClipRound() {
  return window.matchMedia("(min-width: 768px)").matches ? "0px" : "0px";
}

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export default function ConfiguratorSkuDetailPanel({
  detail,
  closeHref,
}: ConfiguratorSkuDetailPanelProps) {
  const panelRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const animateClose = useCallback((onComplete: () => void) => {
    const panel = panelRef.current;
    const content = contentRef.current;

    if (!panel || !content || prefersReducedMotion()) {
      onComplete();
      return;
    }

    const clipRound = getClipRound();
    const hiddenClip = `inset(0% 0% 100% 0% round ${clipRound})`;

    const tl = gsap.timeline({ onComplete });

    tl.to(content, { opacity: 0, duration: 0.18, ease: "power1.in" }).to(
      panel,
      {
        autoAlpha: 0,
        clipPath: hiddenClip,
        y: -16,
        scale: 0.98,
        duration: 0.4,
        ease: "power3.in",
      },
      "-=0.06",
    );
  }, []);

  const handleClose = useCallback(
    (event?: React.MouseEvent) => {
      event?.preventDefault();
      animateClose(() => router.push(closeHref, { scroll: false }));
    },
    [animateClose, closeHref, router],
  );

  useLayoutEffect(() => {
    const panel = panelRef.current;
    const content = contentRef.current;
    if (!panel || !content) {
      return;
    }

    const anchor = panel.closest(".cfg-sku-rows");
    if (anchor) {
      const top =
        anchor.getBoundingClientRect().top +
        window.scrollY -
        (window.innerWidth < 768 ? 88 : 112);
      window.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
    }

    if (prefersReducedMotion()) {
      gsap.set(panel, { autoAlpha: 1, clearProps: "transform,clipPath" });
      gsap.set(content, { opacity: 1 });
      return;
    }

    const clipRound = getClipRound();
    const hiddenClip = `inset(0% 0% 100% 0% round ${clipRound})`;
    const visibleClip = `inset(0% 0% 0% 0% round ${clipRound})`;

    const ctx = gsap.context(() => {
      gsap.set(panel, {
        autoAlpha: 0,
        clipPath: hiddenClip,
        y: -24,
        scale: 0.97,
        transformOrigin: "50% 0%",
        force3D: true,
      });
      gsap.set(content, { opacity: 0 });

      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      tl.to(panel, {
        autoAlpha: 1,
        clipPath: visibleClip,
        y: 0,
        scale: 1,
        duration: 0.62,
        ease: "back.out(1.24)",
      }).to(
        content,
        {
          opacity: 1,
          duration: 0.32,
          ease: "power1.out",
        },
        "-=0.28",
      );
    }, panel);

    return () => ctx.revert();
  }, [detail.sku]);

  return (
    <article
      ref={panelRef}
      className="cfg-sku-detail-panel pointer-events-auto absolute inset-x-0 top-0 z-30 max-h-[min(85dvh,880px)] w-full overflow-auto bg-white px-4 py-[18px] pb-5 border border-[#0000001A] md:px-6 md:pt-[22px] md:pb-[26px]"
      style={{ boxShadow: "0px 4px 10px 0px #0000001A" }}
      aria-labelledby="cfg-sku-panel-title"
    >
      <div ref={contentRef} className="cfg-sku-panel-content">
        <div className="mb-[22px] grid gap-2.5">
          <Link
            className="whitespace-nowrap text-[14px] !text-[#2563EB]"
            href={closeHref}
            scroll={false}
            onClick={handleClose}
          >
            <span className="mr-1 !text-[#2563EB]" aria-hidden="true">
              ‹
            </span>
            View all SKUs
          </Link>
          <h2
            id="cfg-sku-panel-title"
            className="m-0 text-[14px] font-[700] leading-tight tracking-[-0.02em] text-[#111827]"
          >
            {detail.sku}
          </h2>
        </div>

        <ConfiguratorSkuDetailBody detail={detail} />
      </div>
    </article>
  );
}
