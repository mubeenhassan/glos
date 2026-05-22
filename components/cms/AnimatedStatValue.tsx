"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type ParsedIntegerStat = {
  prefix: string;
  target: number;
  suffix: string;
};

function parseIntegerStat(value: string): ParsedIntegerStat | null {
  const match = value.trim().match(/^([^0-9-]*)(-?\d[\d,]*)([^0-9]*)$/);
  if (!match) {
    return null;
  }

  const target = Number(match[2].replaceAll(",", ""));
  if (!Number.isInteger(target)) {
    return null;
  }

  return {
    prefix: match[1],
    target,
    suffix: match[3],
  };
}

function formatStatValue(parsed: ParsedIntegerStat, value: number) {
  return `${parsed.prefix}${new Intl.NumberFormat("en").format(value)}${parsed.suffix}`;
}

function easeOutCubic(progress: number) {
  return 1 - Math.pow(1 - progress, 3);
}

export default function AnimatedStatValue({ value }: { value: string }) {
  const parsed = useMemo(() => parseIntegerStat(value), [value]);
  const [animation, setAnimation] = useState<{
    sourceValue: string;
    displayValue: string;
  } | null>(null);
  const elementRef = useRef<HTMLSpanElement>(null);
  const displayValue =
    animation?.sourceValue === value ? animation.displayValue : value;

  useEffect(() => {
    if (!parsed || !elementRef.current) {
      return;
    }

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (prefersReducedMotion) {
      return;
    }

    const element = elementRef.current;
    let animationFrame = 0;
    let hasAnimated = false;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || hasAnimated) {
          return;
        }

        hasAnimated = true;
        observer.disconnect();

        const startValue = parsed.target > 0 ? 1 : 0;
        const duration = 1400;
        const startTime = performance.now();
        setAnimation({
          sourceValue: value,
          displayValue: formatStatValue(parsed, startValue),
        });

        const tick = (now: number) => {
          const progress = Math.min((now - startTime) / duration, 1);
          const easedProgress = easeOutCubic(progress);
          const nextValue = Math.round(
            startValue + (parsed.target - startValue) * easedProgress,
          );

          setAnimation({
            sourceValue: value,
            displayValue: formatStatValue(parsed, nextValue),
          });

          if (progress < 1) {
            animationFrame = window.requestAnimationFrame(tick);
          } else {
            setAnimation(null);
          }
        };

        animationFrame = window.requestAnimationFrame(tick);
      },
      { threshold: 0.35 },
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
      window.cancelAnimationFrame(animationFrame);
    };
  }, [parsed, value]);

  return (
    <span ref={elementRef} aria-label={value} aria-live="off">
      {displayValue}
    </span>
  );
}
