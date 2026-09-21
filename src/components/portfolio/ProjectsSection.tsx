import { useEffect, useRef, useState } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useReducedMotion,
} from "framer-motion";
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
      className={`relative overflow-hidden ${RADIUS} ${wrapperClassName}`}
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
  interactive,
  reduceMotion,
}: {
  project: (typeof projects)[number];
  index: number;
  total: number;
  progress: ReturnType<typeof useScroll>["scrollYProgress"];
  interactive: boolean;
  reduceMotion: boolean;
}) {
  const targetScale = 1 - (total - 1 - index) * 0.03;

  const scale = useTransform(
    progress,
    [index / total, 1],
    [1, targetScale],
  );

  return (
    <div className="relative flex items-start justify-center h-auto md:h-[78vh] md:sticky md:top-12">
      <motion.div
        initial="rest"
        whileHover={interactive ? "hover" : "rest"}
        variants={cardHoverVariants}
        transition={HOVER_TRANSITION}
        style={{
          scale,
          top: `${index * 22}px`,
          backgroundColor: "#0C0C0C",
          zIndex: index + 1,
        }}
        className={`project-card relative w-full max-w-6xl ${RADIUS} border-2 border-[#D7E2EA] p-4 sm:p-5 md:p-6`}
      >
        {/* HEADER */}
        <div className="flex flex-wrap items-center justify-between gap-3 sm:gap-4">
          <div className="flex items-center gap-3 sm:gap-5">
            <motion.span
              variants={numberHoverVariants}
              transition={HOVER_TRANSITION}
              className="hero-heading font-black leading-none"
              style={{
                fontSize: "clamp(2.8rem, 8vw, 110px)",
              }}
            >
              {project.n}
            </motion.span>

            <div className="flex flex-col gap-1">
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
  const reduceMotion = useReducedMotion() ?? false;
  const interactive = canHover && !reduceMotion;

  return (
    <section
      id="projects"
      ref={ref}
      className="relative z-10 -mt-10 sm:-mt-12 md:-mt-14 rounded-t-[40px] sm:rounded-t-[50px] md:rounded-t-[60px] px-5 sm:px-8 md:px-10 pt-12 sm:pt-16 md:pt-20 pb-16 sm:pb-20 md:pb-48"
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
            interactive={interactive}
            reduceMotion={reduceMotion}
          />
        ))}
      </div>
    </section>
  );
}