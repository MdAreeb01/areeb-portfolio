import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import type { ReactNode, CSSProperties } from "react";
import type { MotionStyle } from "framer-motion";

type Tag = "div" | "nav" | "section" | "span";

interface FadeInProps {
  children: ReactNode;
  as?: Tag;
  className?: string;
  style?: CSSProperties;
  delay?: number;
  duration?: number;
  x?: number;
  y?: number;
}

export function FadeIn({
  children,
  as = "div",
  className,
  style,
  delay = 0,
  duration = 0.7,
  x = 0,
  y = 30,
}: FadeInProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) {
      setInView(true);
      return;
    }

    let done = false;
    const reveal = () => {
      if (done) return;
      done = true;
      setInView(true);
    };

    const check = () => {
      const r = el.getBoundingClientRect();
      if (r.top < window.innerHeight + 50 && r.bottom > -50) reveal();
    };

    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) reveal();
      },
      { rootMargin: "50px", threshold: 0 },
    );
    io.observe(el);

    const raf = requestAnimationFrame(check);
    window.addEventListener("scroll", check, { passive: true });
    window.addEventListener("resize", check, { passive: true });

    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", check);
      window.removeEventListener("resize", check);
    };
  }, []);

  const Comp =
    as === "nav"
      ? motion.nav
      : as === "section"
        ? motion.section
        : as === "span"
          ? motion.span
          : motion.div;

  return (
    <Comp
      ref={ref as never}
      className={className}
      {...(style ? { style: style as MotionStyle } : {})}
      initial={{ opacity: 0, x, y }}
      animate={inView ? { opacity: 1, x: 0, y: 0 } : { opacity: 0, x, y }}
      transition={{ delay, duration, ease: [0.25, 0.1, 0.25, 1] }}
    >
      {children}
    </Comp>
  );
}
