"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import Link from "next/link";
import { FiArrowLeft, FiArrowRight } from "react-icons/fi";

export type FeaturedProjectSlide = {
  key: string;
  title: string;
  description?: string;
  meta?: string;
  imageUrl: string | null;
  imageAlt: string;
  href?: string;
};

type FeaturedProjectsSliderProps = {
  projects: FeaturedProjectSlide[];
  arrowHref: string;
};

const sliderStageClassName =
  "relative [--featured-card-gap:14px] [--featured-card-width:min(86vw,360px)] md:[--featured-card-gap:18px] md:[--featured-card-width:calc((100%_-_var(--featured-card-gap))_/_2)] lg:[--featured-card-gap:32px] lg:[--featured-card-width:calc((100%_-_(var(--featured-card-gap)_*_2))_/_3)]";

const viewportClassName =
  "overflow-x-auto overflow-y-hidden overscroll-x-contain rounded-lg scroll-smooth snap-x snap-mandatory touch-pan-x [scrollbar-width:none] [&::-webkit-scrollbar]:hidden";

const trackClassName =
  "flex gap-[var(--featured-card-gap)]";

const slideClassName =
  "js-featured-slide w-[var(--featured-card-width)] min-w-[var(--featured-card-width)] shrink-0 snap-start";

const cardClassName =
  "group relative block h-full min-h-[400px] min-w-0 overflow-hidden rounded-lg bg-[#eceef2] md:min-h-[520px] lg:min-h-[clamp(440px,45vw,600px)]";

const cardImageClassName =
  "js-featured-image h-full max-h-[400px] lg:max-h-[600px] w-full object-cover transition-transform duration-500 group-hover:scale-105";

const projectPlaceholderClassName =
  "grid h-full min-h-[inherit] w-full place-items-center bg-gradient-to-br from-[#f8f9fb] to-[#e8ebf2] p-7 text-center text-[#626a78]";

const projectInfoClassName =
  "absolute inset-x-0 bottom-0 grid gap-2 bg-gradient-to-t from-black/75 to-transparent p-5 text-white opacity-100 transition duration-300 md:translate-y-4 md:opacity-0 md:group-hover:translate-y-0 md:group-hover:opacity-100 md:group-focus-within:translate-y-0 md:group-focus-within:opacity-100 lg:p-7";

const projectMetaClassName =
  "m-0 text-xs font-bold uppercase tracking-[0.08em] text-white/75";

const projectTitleClassName =
  "m-0 font-[var(--font-display)] text-2xl leading-tight md:text-3xl";

const projectDescriptionClassName =
  "m-0 text-sm leading-6 text-white/85 md:text-base";

const navButtonBaseClassName =
  "js-featured-control absolute w-12 h-12 top-1/2 z-10 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full bg-[#111827] text-xl text-[#FFFFFF] shadow-[0_14px_34px_rgba(16,24,40,0.16)] transition hover:-translate-y-[calc(50%+1px)] hover:text-[var(--color-brand-orange)] disabled:pointer-events-none disabled:bg-black/70 disabled:cursor-default cursor-pointer md:h-14 md:w-14";

type SliderMetrics = {
  step: number;
  maxIndex: number;
  maxTranslate: number;
};

const emptyMetrics: SliderMetrics = {
  step: 0,
  maxIndex: 0,
  maxTranslate: 0,
};

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function ProjectCard({ project }: { project: FeaturedProjectSlide }) {
  const content = (
    <>
      {project.imageUrl ? (
        <img
          className={cardImageClassName}
          src={project.imageUrl}
          alt={project.imageAlt}
          draggable={false}
        />
      ) : (
        <div className={projectPlaceholderClassName}>
          <span className="max-w-64 text-lg font-extrabold">
            {project.title}
          </span>
        </div>
      )}
      <div className={projectInfoClassName}>
        {project.meta ? (
          <p className={projectMetaClassName}>{project.meta}</p>
        ) : null}
        <h3 className={projectTitleClassName}>{project.title}</h3>
        {project.description ? (
          <p className={projectDescriptionClassName}>{project.description}</p>
        ) : null}
      </div>
    </>
  );

  if (project.href) {
    return (
      <Link
        href={project.href}
        className={cardClassName}
        draggable={false}
      >
        {content}
      </Link>
    );
  }

  return <article className={cardClassName}>{content}</article>;
}

export default function FeaturedProjectsSlider({
  projects,
}: FeaturedProjectsSliderProps) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  const [activeIndex, setActiveIndex] = useState(0);
  const [metrics, setMetrics] = useState<SliderMetrics>(emptyMetrics);
  const canSlide = metrics.maxIndex > 0;

  const updateMetrics = useCallback(() => {
    const viewport = viewportRef.current;
    const track = trackRef.current;
    const firstSlide = track?.querySelector<HTMLElement>(".js-featured-slide");

    if (!viewport || !track || !firstSlide) {
      setMetrics(emptyMetrics);
      return;
    }

    const trackStyles = window.getComputedStyle(track);
    const gap =
      Number.parseFloat(trackStyles.columnGap || trackStyles.gap || "0") || 0;
    const step = firstSlide.getBoundingClientRect().width + gap;
    const maxTranslate = Math.max(track.scrollWidth - viewport.clientWidth, 0);
    const maxIndex = step > 0 ? Math.ceil(Math.max(maxTranslate / step - 0.04, 0)) : 0;

    setMetrics((current) => {
      if (
        Math.abs(current.step - step) < 0.5 &&
        Math.abs(current.maxTranslate - maxTranslate) < 0.5 &&
        current.maxIndex === maxIndex
      ) {
        return current;
      }

      return { step, maxIndex, maxTranslate };
    });
    setActiveIndex((current) => {
      const nextIndex = Math.min(current, maxIndex);
      if (viewport.scrollLeft >= maxTranslate - 2) {
        return maxIndex;
      }

      return nextIndex;
    });
  }, []);

  useEffect(() => {
    const viewport = viewportRef.current;
    const track = trackRef.current;
    const measureFrame = window.requestAnimationFrame(updateMetrics);
    const resizeObserver = new ResizeObserver(updateMetrics);

    if (viewport) {
      resizeObserver.observe(viewport);
    }

    if (track) {
      resizeObserver.observe(track);
    }

    return () => {
      window.cancelAnimationFrame(measureFrame);
      resizeObserver.disconnect();
    };
  }, [projects.length, updateMetrics]);

  const scrollToIndex = useCallback(
    (index: number) => {
      const viewport = viewportRef.current;
      if (!viewport || metrics.step === 0) {
        return;
      }

      const nextIndex = clamp(index, 0, metrics.maxIndex);
      viewport.scrollTo({
        left: Math.min(nextIndex * metrics.step, metrics.maxTranslate),
        behavior: "smooth",
      });
      setActiveIndex(nextIndex);
    },
    [metrics.maxIndex, metrics.maxTranslate, metrics.step],
  );

  function goPrevious() {
    scrollToIndex(activeIndex - 1);
  }

  function goNext() {
    scrollToIndex(activeIndex + 1);
  }

  function handleScroll() {
    const viewport = viewportRef.current;
    if (!viewport || metrics.step === 0) {
      return;
    }

    const nextIndex =
      viewport.scrollLeft >= metrics.maxTranslate - 2
        ? metrics.maxIndex
        : clamp(Math.round(viewport.scrollLeft / metrics.step), 0, metrics.maxIndex);
    setActiveIndex(nextIndex);
  }

  return (
    <div className={sliderStageClassName}>
      <div
        className={viewportClassName}
        ref={viewportRef}
        onScroll={handleScroll}
      >
        <div
          className={trackClassName}
          ref={trackRef}
        >
          {projects.map((project, index) => (
            <div className={slideClassName} key={`${project.key}-${index}`}>
              <ProjectCard project={project} />
            </div>
          ))}
        </div>
      </div>

      {canSlide ? (
        <>
          <button
            className={`${navButtonBaseClassName} -left-3 md:-left-7`}
            type="button"
            aria-label="Previous project"
            disabled={activeIndex === 0}
            onClick={goPrevious}
          >
            <FiArrowLeft aria-hidden />
          </button>
          <button
            className={`${navButtonBaseClassName} -right-3 md:-right-7`}
            type="button"
            aria-label="Next project"
            disabled={activeIndex === metrics.maxIndex}
            onClick={goNext}
          >
            <FiArrowRight aria-hidden />
          </button>
        </>
      ) : null}
    </div>
  );
}
