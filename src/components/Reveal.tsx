"use client";

import React, { CSSProperties, useEffect, useRef, useState } from "react";

interface RevealProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  y?: number;
  once?: boolean;
  amount?: number;
}

type RevealStyle = CSSProperties & {
  "--reveal-delay"?: string;
  "--reveal-duration"?: string;
  "--reveal-y"?: string;
};

export const Reveal: React.FC<RevealProps> = ({
  children,
  className = "",
  delay = 0,
  duration = 650,
  y = 24,
  once = true,
  amount = 0.18,
}) => {
  const ref = useRef<HTMLDivElement | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion || !("IntersectionObserver" in window)) {
      const frame = window.requestAnimationFrame(() => setIsVisible(true));
      return () => window.cancelAnimationFrame(frame);
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (once) observer.unobserve(entry.target);
          return;
        }

        if (!once) {
          setIsVisible(false);
        }
      },
      {
        threshold: amount,
        rootMargin: "0px 0px -8% 0px",
      },
    );

    observer.observe(node);

    return () => {
      observer.disconnect();
    };
  }, [amount, once]);

  const style: RevealStyle = {
    "--reveal-delay": `${Math.max(delay, 0)}ms`,
    "--reveal-duration": `${Math.max(duration, 0)}ms`,
    "--reveal-y": `${Math.max(y, 0)}px`,
  };

  return (
    <div
      ref={ref}
      className={`reveal ${className}`.trim()}
      data-visible={isVisible}
      style={style}
    >
      {children}
    </div>
  );
};
