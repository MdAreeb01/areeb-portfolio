import { useEffect, useRef, useState } from "react";
import {
  motion,
  useMotionValue,
  useScroll,
  useTransform,
  useReducedMotion,
} from "framer-motion";
import type { MotionValue } from "framer-motion";
import type { MotionStyle, Transition } from "framer-motion";
import { FadeIn } from "./FadeIn";
import { LiveProjectButton } from "./Buttons";

const projects = [
  {
    n: "01",
    name: "RetainAI · Churn Intelligence",
    category: "Personal",
    link: "https://retainai-churn-intelligence.streamlit.app/",
    col1: [
      "/projects/01_prediction_page.png",
      "/projects/01_ai_retention.png",
    ],
    col2: "/projects/01_home_page.png",
  },
  {
    n: "02",
    name: "Travel Management Analysis Dashboard",
    category: "Personal",
    link: "https://github.com/MdAreeb01/Travel-Management-Analysis-",
    col1: [
      "/projects/02_dashboard.png",
      "/projects/02_dashboard1.png",
    ],
    col2: "/projects/02_main.png",
  },
  {
    n: "03",
    name: "Human Resource Analysis Dashboard",
    category: "Personal",
    link: "https://github.com/MdAreeb01/Human-Resource-Analysis",
    col1: [
      "/projects/03_dashboard.png",
      "/projects/03_dashboard1.png",
    ],
    col2: "/projects/03_main.png",
  },
] satisfies ReadonlyArray<{
  n: string;
  name: string;
  category: string;
  link: string;
  col1: readonly [string, string];
  col2: string;
}>;

const RADIUS = "rounded-[40px] sm:rounded-[50px] md:rounded-[60px]";

// Thumbnails are far smaller than the card on phones, so their corner radius
// follows the viewport instead of using the card's radius (which would turn a
// 70px-tall thumbnail into a pill). Reaches the original 60px from ~1000px up.
const IMAGE_RADIUS = "rounded-[clamp(16px,6vw,60px)]";

// The sticky "deck of cards" effect only makes sense once there is room for it.
// Below this width cards simply follow normal document flow.
const STACK_QUERY = "(min-width: 768px)";
// Vertical step between stacked cards, in px (applied only when stacked).
const STACK_OFFSET = 22;

const HOVER_TRANSITION: Transition = {
  duration: 0.35,
  ease: [0.22, 1, 0.36, 1],
};

const IMAGE_TRANSITION: Transition = {
  duration: 0.45,
  ease: [0.22, 1, 0.36, 1],
};

const cardHoverVariants = {
  rest: {
    y: 0,
    boxShadow: "0px 0px 0px rgba(0,0,0,0)",
  },
  hover: {
    y: -3,
    boxShadow:
      "0px 20px 45px rgba(0,0,0,0.35), 0 0 0 1px rgba(215,226,234,0.35)",
  },
};

const numberHoverVariants = {
  rest: { x: 0, scale: 1 },
  hover: { x: 6, scale: 1.03 },
};

const titleHoverVariants = {
  rest: { x: 0, opacity: 0.92 },
  hover: { x: 4, opacity: 1 },
};

const imageHoverVariants = {
  rest: {
    scale: 1,
    filter: "brightness(1) contrast(1)",
  },
  hover: {
    scale: 1.035,
    filter: "brightness(1.04) contrast(1.02)",
  },
};

const imageOverlayVariants = {
  rest: { opacity: 0 },
  hover: { opacity: 0.05 },
};

function useCanHover() {
  const [canHover, setCanHover] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(hover: hover) and (pointer: fine)");
    const update = () => setCanHover(mq.matches);

    update();

    mq.addEventListener("change", update);

    return () => mq.removeEventListener("change", update);
  }, []);

  return canHover;
}

/**
 * 1 while the stacked/sticky layout is active (>= md), otherwise 0.
 * A MotionValue (not React state) so toggling never re-renders the cards and
 * the server/first-client render are identical.
 */
function useStackEnabled(): MotionValue<number> {
  const enabled = useMotionValue(1);

  useEffect(() => {
    const mq = window.matchMedia(STACK_QUERY);
    const update = () => enabled.set(mq.matches ? 1 : 0);

    update();
    mq.addEventListener("change", update);

    return () => mq.removeEventListener("change", update);
  }, [enabled]);

  return enabled;
}

function ParallaxImage({
  src,
  alt,
  wrapperClassName,
  wrapperStyle,
  amplitude = 6,
  interactive,
  reduceMotion,
}: {
  src: string;
  alt: string;
  wrapperClassName: string;
  wrapperStyle?: MotionStyle;
  amplitude?: number;
  interactive: boolean;
  reduceMotion: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const parallaxY = useTransform(
    scrollYProgress,
    [0, 1],
    reduceMotion ? [0, 0] : [-amplitude, amplitude],
  );

  return (
    <motion.div
      ref={ref}
      initial="rest"
      whileHover={interactive ? "hover" : "rest"}
      className={`relative overflow-hidden ${IMAGE_RADIUS} ${wrapperClassName}`}
      style={wrapperStyle ?? {}}
    >
      <motion.img
        src={src}
        alt={alt}
        loading="lazy"
        variants={imageHoverVariants}
        transition={IMAGE_TRANSITION}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          y: parallaxY,
        }}
      />

      <motion.div
        aria-hidden="true"
        variants={imageOverlayVariants}
        transition={{ duration: 0.3 }}
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundColor: "#000000",
        }}
      />
    </motion.div>
  );
}

function Card({
  project,
  index,
  total,
  progress,
  stackEnabled,
  interactive,
  reduceMotion,
}: {
  project: (typeof projects)[number];
  index: number;
  total: number;
  progress: ReturnType<typeof useScroll>["scrollYProgress"];
  stackEnabled: MotionValue<number>;
  interactive: boolean;
  reduceMotion: boolean;
}) {
  const targetScale = 1 - (total - 1 - index) * 0.03;

  const stackScale = useTransform(
    progress,
    [index / total, 1],
    [1, targetScale],
  );

  // Cards only shrink as the deck builds up; in normal flow (phones) they stay 1.
  const scale = useTransform(
    [stackScale, stackEnabled],
    ([s, enabled]: number[]) => (enabled ? s : 1),
  );

  return (
    // Normal flow with a gap on phones. From md up each wrapper is as tall as its
    // card (no reserved viewport height), sticks under the top edge, and the next
    // one overlaps it slightly so the following card peeks over the one before.
    <div className="relative flex items-start justify-center mb-5 sm:mb-6 last:mb-0 md:mb-0 md:sticky md:top-12 md:not-last:-mb-[clamp(2.5rem,9svh,5rem)]">
      <motion.div
        initial="rest"
        whileHover={interactive ? "hover" : "rest"}
        variants={cardHoverVariants}
        transition={HOVER_TRANSITION}
        style={{
          scale,
          backgroundColor: "#0C0C0C",
          zIndex: index + 1,
          // Consumed by `md:top-[var(--stack-offset)]` below, so the offset is only
          // applied when the deck is stacked (never on phones).
          ...({ "--stack-offset": `${index * STACK_OFFSET}px` } as MotionStyle),
        }}
        // On short viewports the card is narrowed (it is ~1.5:1) so a pinned card
        // never ends up taller than the screen; on ordinary screens this is 72rem.
        className={`relative w-full max-w-6xl md:max-w-[min(85rem,calc((100svh-6rem)*1.80))] ${
          index === 2
            ? "md:top-[calc(var(--stack-offset)+64px)]"
            : "md:top-[var(--stack-offset)]"
        } ${RADIUS} border-2 border-[#D7E2EA] p-4 sm:p-5 md:p-6`}
      >
        {/* HEADER */}
        <div className="flex flex-wrap items-center justify-between gap-3 sm:gap-4">
          <div className="flex min-w-0 items-center gap-3 sm:gap-5">
            <motion.span
              variants={numberHoverVariants}
              transition={HOVER_TRANSITION}
              className="hero-heading font-black leading-none shrink-0"
              style={{
                fontSize: "clamp(2.8rem, 8vw, 110px)",
              }}
            >
              {project.n}
            </motion.span>

            <div className="flex min-w-0 flex-col gap-1">
              <span className="text-[#D7E2EA]/60 uppercase tracking-widest text-[10px] sm:text-xs font-light">
                {project.category}
              </span>

              <motion.h3
                variants={titleHoverVariants}
                transition={HOVER_TRANSITION}
                className="text-[#D7E2EA] font-medium uppercase leading-none"
                style={{
                  fontSize: "clamp(0.9rem, 1.8vw, 1.8rem)",
                }}
              >
                {project.name}
              </motion.h3>
            </div>
          </div>

          <a
            href={project.link}
            target="_blank"
            rel="noopener noreferrer"
            className="cursor-pointer"
          >
            <LiveProjectButton />
          </a>
        </div>

        {/* PROJECT IMAGES */}
        <div className="mt-3 sm:mt-4 flex gap-2 sm:gap-3">
          {/* LEFT COLUMN */}
          <div className="w-[40%] flex flex-col gap-2 sm:gap-3">
            <ParallaxImage
              src={project.col1[0]}
              alt={`${project.name} preview 1`}
              wrapperClassName="w-full aspect-[16/9]"
              interactive={interactive}
              reduceMotion={reduceMotion}
            />

            <ParallaxImage
              src={project.col1[1]}
              alt={`${project.name} preview 2`}
              wrapperClassName="w-full aspect-[4/3]"
              interactive={interactive}
              reduceMotion={reduceMotion}
            />
          </div>

          {/* RIGHT COLUMN */}
          <div className="w-[60%]">
            <ParallaxImage
              src={project.col2}
              alt={`${project.name} preview 3`}
              wrapperClassName="w-full h-full"
              interactive={interactive}
              reduceMotion={reduceMotion}
            />
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export function ProjectsSection() {
  const ref = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });

  const canHover = useCanHover();
  const stackEnabled = useStackEnabled();
  const reduceMotion = useReducedMotion() ?? false;
  const interactive = canHover && !reduceMotion;

  return (
    <section
      id="projects"
      ref={ref}
      className="relative z-10 -mt-10 sm:-mt-12 md:-mt-14 rounded-t-[40px] sm:rounded-t-[50px] md:rounded-t-[60px] px-5 sm:px-8 md:px-10 pt-12 sm:pt-16 md:pt-20 pb-12 sm:pb-16 md:pb-20"
      style={{
        backgroundColor: "#0C0C0C",
      }}
    >
      <FadeIn delay={0} y={40}>
        <h2
          className="hero-heading font-black uppercase leading-none tracking-tight text-center mb-12 sm:mb-16"
          style={{
            fontSize: "clamp(3rem, 12vw, 160px)",
          }}
        >
          Projects
        </h2>
      </FadeIn>

      <div className="max-w-6xl mx-auto">
        {projects.map((p, i) => (
          <Card
            key={p.n}
            project={p}
            index={i}
            total={projects.length}
            progress={scrollYProgress}
            stackEnabled={stackEnabled}
            interactive={interactive}
            reduceMotion={reduceMotion}
          />
        ))}
      </div>
    </section>
  );
}