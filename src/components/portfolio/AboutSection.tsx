"use client";

import { useEffect, useRef, useState, type MouseEvent as ReactMouseEvent } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  useScroll,
  useVelocity,
  useReducedMotion,
  type MotionValue,
} from "framer-motion";
import { FadeIn } from "./FadeIn";
import { AnimatedText } from "./AnimatedText";
import { ContactButton, ResumeButton } from "./Buttons";

// ---------------------------------------------------------------------------
// Skill object configuration
// ---------------------------------------------------------------------------

type SkillObjectConfig = {
  id: string;
  src: string;
  label: string;
  /**
   * Positioning of the object's wrapper. Below `xl` the object sits in a normal
   * flow "rail" above/below the copy (half of the rail each); from `xl` up it is
   * absolutely positioned around the copy exactly like the original layout.
   */
  wrapperClassName: string;
  /** Fluid image width used while the object lives in a rail (below `xl`). */
  imageClassName: string;
  /** Which rail the object belongs to below `xl`. */
  rail: "top" | "bottom";
  labelPosition: "top" | "bottom";
  entrance: { x: number; y: number; delay: number; duration: number };
  float: { y: number; x: number; rotate: number; duration: number; delay: number };
  parallaxStrength: number;
  /** Depth of the object inside the shared 3D space (px on the Z axis). */
  depth: number;
};

const SKILL_OBJECTS: SkillObjectConfig[] = [
  {
    id: "data-analytics",
    src: "/about/dataanalytics.png",
    label: "Data Analytics",
    wrapperClassName:
      "relative w-1/2 xl:absolute xl:top-[4%] xl:left-[4%] xl:w-[210px]",
    imageClassName: "w-[clamp(96px,24vw,210px)] xl:w-full",
    rail: "top",
    labelPosition: "bottom",
    entrance: { x: -80, y: 0, delay: 0.35, duration: 0.9 },
    float: { y: 9, x: 3, rotate: 1.5, duration: 7.5, delay: 0 },
    parallaxStrength: 8,
    depth: 26,
  },
  {
    id: "python",
    src: "/about/python.png",
    label: "Python",
    wrapperClassName:
      "relative w-1/2 xl:absolute xl:top-[4%] xl:right-[4%] xl:w-[210px]",
    imageClassName: "w-[clamp(96px,24vw,210px)] xl:w-full",
    rail: "top",
    labelPosition: "bottom",
    entrance: { x: 80, y: 0, delay: 0.45, duration: 0.9 },
    float: { y: 7, x: -4, rotate: -1.8, duration: 6.5, delay: 0.8 },
    parallaxStrength: 14,
    depth: 44,
  },
  {
    id: "ai-ml",
    src: "/about/aiml.png",
    label: "AI / Machine Learning",
    wrapperClassName:
      "relative w-1/2 xl:absolute xl:bottom-[8%] xl:left-[10%] xl:w-[180px]",
    imageClassName: "w-[clamp(84px,21vw,180px)] xl:w-full",
    rail: "bottom",
    labelPosition: "top",
    entrance: { x: -80, y: 0, delay: 0.55, duration: 0.9 },
    float: { y: 10, x: 0, rotate: 2, duration: 8.5, delay: 1.4 },
    parallaxStrength: 18,
    depth: 58,
  },
  {
    id: "mysql",
    src: "/about/sql.png",
    label: "MySQL",
    wrapperClassName:
      "relative w-1/2 xl:absolute xl:bottom-[8%] xl:right-[10%] xl:w-[220px]",
    imageClassName: "w-[clamp(104px,27vw,220px)] xl:w-full",
    rail: "bottom",
    labelPosition: "top",
    entrance: { x: 80, y: 0, delay: 0.65, duration: 0.9 },
    float: { y: 8, x: 4, rotate: -1.6, duration: 9, delay: 0.5 },
    parallaxStrength: 11,
    depth: 34,
  },
];

const EXTRA_SKILLS = ["Power BI", "NumPy", "Pandas", "Scikit-learn"];

// ---------------------------------------------------------------------------
// Portrait frame configuration
// ---------------------------------------------------------------------------

/** Drop your photo at this path (e.g. public/about/portrait.jpg). */
const PORTRAIT_SRC = "/about/My_PFP.jpg";
const PORTRAIT_LABEL = "Mohd Areeb Ansari";

type PortraitConfig = {
  wrapperClassName: string;
  entrance: { x: number; y: number; delay: number; duration: number };
  float: { y: number; x: number; rotate: number; duration: number; delay: number };
  parallaxStrength: number;
  tiltStrength: number;
  /** Depth of the object inside the shared 3D space (px on the Z axis). */
  depth: number;
};

// Absolutely positioned beside the copy — only shown once there's room (xl+).
const PORTRAIT_DESKTOP: PortraitConfig = {
  wrapperClassName:
    "hidden xl:block absolute top-[45%] right-[12%] 2xl:right-[14%] -translate-y-[40%] w-[200px] 2xl:w-[220px]",
  entrance: { x: 70, y: 0, delay: 0.5, duration: 1 },
  float: { y: 10, x: 4, rotate: 0, duration: 8, delay: 0.3 },
  parallaxStrength: 10,
  tiltStrength: 1,
  depth: 30,
};

// In-flow, centred below the bio content — guarantees no overlap below xl.
const PORTRAIT_MOBILE: PortraitConfig = {
  wrapperClassName: "block xl:hidden relative w-[170px] sm:w-[200px] mx-auto",
  entrance: { x: 0, y: 30, delay: 0.3, duration: 0.9 },
  float: { y: 6, x: 0, rotate: 0.6, duration: 7, delay: 0 },
  parallaxStrength: 0,
  tiltStrength: 0,
  depth: 0,
};

// ---------------------------------------------------------------------------
// Deterministic pseudo-random helper
// (module-level, so ray geometry is stable across renders and SSR-safe)
// ---------------------------------------------------------------------------

function createRandom(seed: number) {
  let state = seed;
  return () => {
    state |= 0;
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ---------------------------------------------------------------------------
// ---------------------------------------------------------------------------
// Depth rays — cinematic volumetric streaks in a radial depth field
//
// Depth is simulated with 2D scale about a central vanishing point rather than
// translateZ. Scaling a radial field outward from its centre is exactly the
// "travelling through space" read, it survives masks/filters (which flatten a
// 3D context), and it is far cheaper to composite.
//
// Each ray is a short streak held at a distance from the centre, so there is a
// visible leading edge that sweeps outward as the field scales.
// ---------------------------------------------------------------------------

type Ray = {
  id: string;
  angle: number;
  /** Gap between the vanishing point and the base of the streak (vmin). */
  offset: number;
  /** Length of the streak itself (vmin). */
  length: number;
  width: number;
  opacity: number;
  warm: boolean;
  /** 0 = always visible, 1 = sm and up, 2 = md and up */
  tier: 0 | 1 | 2;
};

type RayLayerConfig = {
  id: string;
  count: number;
  seed: number;
  /** Field scale at the start and end of the scroll range. */
  scaleRange: [number, number];
  /** Extra expansion at full scroll speed. */
  energyScale: number;
  restOpacity: number;
  activeOpacity: number;
  blur: number;
  widthRange: [number, number];
  lengthRange: [number, number];
  offsetRange: [number, number];
  /** Share of rays that carry the champagne tint. */
  warmRatio: number;
};

const RAY_LAYERS: RayLayerConfig[] = [
  {
    id: "far",
    count: 20,
    seed: 11,
    scaleRange: [0.70, 1.75],
    energyScale: 0.15,
    restOpacity: 0.58,
    activeOpacity: 0.72,
    blur: 0,
    widthRange: [0.8, 1.4],
    lengthRange: [7, 15],
    offsetRange: [13, 30],
    warmRatio: 0.22,
  },
  {
    id: "mid",
    count: 14,
    seed: 29,
    scaleRange: [0.50, 2.50],
    energyScale: 0.27,
    restOpacity: 0.64,
    activeOpacity: 0.88,
    blur: 0.25,
    widthRange: [1.2, 2.2],
    lengthRange: [12, 24],
    offsetRange: [9, 24],
    warmRatio: 0.38,
  },
  {
    id: "near",
    count: 9,
    seed: 47,
    scaleRange: [0.35, 3.80],
    energyScale: 0.40,
    restOpacity: 0.58,
    activeOpacity: 1,
    blur: 0.55,
    widthRange: [2, 3.4],
    lengthRange: [18, 34],
    offsetRange: [6, 19],
    warmRatio: 0.52,
  },
];

function buildRays(layer: RayLayerConfig): Ray[] {
  const random = createRandom(layer.seed);
  const step = 360 / layer.count;

  return Array.from({ length: layer.count }, (_, i) => {
    // Even distribution, then nudged off-grid so the field looks organic.
    const angle = i * step + (random() - 0.5) * step * 0.75;
    const span = (range: [number, number]) =>
      range[0] + random() * (range[1] - range[0]);

    return {
      id: `${layer.id}-${i}`,
      angle,
      width: span(layer.widthRange),
      length: span(layer.lengthRange),
      offset: span(layer.offsetRange),
      opacity: 0.55 + random() * 0.45,
      warm: random() < layer.warmRatio,
      tier: (i % 3 === 0 ? 0 : i % 3 === 1 ? 1 : 2) as 0 | 1 | 2,
    };
  });
}

const RAY_FIELD = RAY_LAYERS.map((layer) => ({ layer, rays: buildRays(layer) }));

const TIER_CLASS: Record<0 | 1 | 2, string> = {
  0: "",
  1: "hidden sm:block",
  2: "hidden md:block",
};

function rayGradient(warm: boolean) {
  return warm
    ? "linear-gradient(to top, rgba(255,190,90,0) 0%, rgba(255,196,104,0.55) 18%, rgba(255,210,135,1) 52%, rgba(255,220,165,0.55) 78%, rgba(255,214,150,0) 100%)"
    : "linear-gradient(to top, rgba(215,226,234,0) 0%, rgba(215,226,234,0.48) 18%, rgba(235,244,252,1) 52%, rgba(215,226,234,0.48) 78%, rgba(215,226,234,0) 100%)";
}

function RayLayer({
  layer,
  rays,
  progress,
  energy,
  reduceMotion,
}: {
  layer: RayLayerConfig;
  rays: Ray[];
  progress: MotionValue<number>;
  energy: MotionValue<number>;
  reduceMotion: boolean;
}) {
  // Scroll position controls the actual depth travel.
  // Scroll velocity controls how energetic / bright the rays become.
  const scale = useTransform(
    [progress, energy] as const,
    ([p = 0, e = 0]: number[]) => {
      if (reduceMotion) {
        return 1;
      }

      const travelled =
        layer.scaleRange[0] +
        p * (layer.scaleRange[1] - layer.scaleRange[0]);

      // Slight additional expansion while actively scrolling.
      return travelled * (1 + e * layer.energyScale);
    },
  );

  // Resting opacity -> high-energy opacity.
  const opacity = useTransform(
    energy,
    [0, 0.15, 0.45, 1],
    reduceMotion
      ? [
          layer.restOpacity,
          layer.restOpacity,
          layer.restOpacity,
          layer.restOpacity,
        ]
      : [
          layer.restOpacity,
          layer.restOpacity * 1.08,
          layer.activeOpacity * 0.82,
          layer.activeOpacity,
        ],
  );

  // Scrolling creates a subtle bloom.
  const bloomBlur = useTransform(
    energy,
    [0, 0.25, 0.6, 1],
    reduceMotion
      ? [layer.blur, layer.blur, layer.blur, layer.blur]
      : [
          layer.blur,
          layer.blur + 0.15,
          layer.blur + 0.7,
          layer.blur + 1.2,
        ],
  );

  return (
    <motion.div
      className="absolute left-1/2 top-[45%] h-0 w-0"
      style={{
        scale,
        opacity,
        filter: useTransform(bloomBlur, (value) => `blur(${value}px)`),
        willChange: "transform, opacity, filter",
      }}
    >
      {rays.map((ray) => (
        <div
          key={ray.id}
          className={`absolute bottom-0 left-0 ${TIER_CLASS[ray.tier]}`}
          style={{
            width: `${ray.width}px`,
            height: `${ray.length}vmin`,
            opacity: ray.opacity,

            transform: `
              rotate(${ray.angle}deg)
              translate(-50%, -${ray.offset}vmin)
            `,

            transformOrigin: "50% 100%",

            background: rayGradient(ray.warm),

            // Premium volumetric bloom.
            boxShadow: ray.warm
              ? `
                0 0 ${ray.width * 2}px rgba(255, 196, 104, 0.22),
                0 0 ${ray.width * 5}px rgba(255, 185, 80, 0.10)
              `
              : `
                0 0 ${ray.width * 2}px rgba(215, 226, 234, 0.18),
                0 0 ${ray.width * 5}px rgba(215, 226, 234, 0.07)
              `,

            borderRadius: "999px",
          }}
        >
          {/* Bright inner core */}
          <div
            className="absolute inset-x-0 top-[12%] bottom-[12%] rounded-full"
            style={{
              background: ray.warm
                ? "linear-gradient(to bottom, transparent, rgba(255,225,170,0.95), rgba(255,205,125,0.65), transparent)"
                : "linear-gradient(to bottom, transparent, rgba(240,247,255,0.9), rgba(215,226,234,0.55), transparent)",
              boxShadow: ray.warm
                ? "0 0 8px rgba(255,210,140,0.85)"
                : "0 0 8px rgba(215,226,234,0.65)",
            }}
          />
        </div>
      ))}
    </motion.div>
  );
}

function DepthRays({
  progress,
  energy,
  reduceMotion,
}: {
  progress: MotionValue<number>;
  energy: MotionValue<number>;
  reduceMotion: boolean;
}) {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
      style={{
        // Keeps the middle of the frame quiet and pushes the light to the edges.
        maskImage:
          "radial-gradient(ellipse 66% 58% at 50% 45%, transparent 0%, transparent 18%, rgba(0,0,0,0.55) 40%, #000 72%)",
        WebkitMaskImage:
          "radial-gradient(ellipse 66% 58% at 50% 45%, transparent 0%, transparent 18%, rgba(0,0,0,0.55) 40%, #000 72%)",
      }}
    >
      {RAY_FIELD.map(({ layer, rays }) => (
        <RayLayer
          key={layer.id}
          layer={layer}
          rays={rays}
          progress={progress}
          energy={energy}
          reduceMotion={reduceMotion}
        />
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Depth particles — sparse data points suspended in the same space
// ---------------------------------------------------------------------------

type Particle = {
  id: string;
  angle: number;
  distance: number;
  size: number;
  opacity: number;
  warm: boolean;
  tier: 0 | 1 | 2;
};

const PARTICLES: Particle[] = (() => {
  const random = createRandom(97);

  return Array.from({ length: 24 }, (_, i) => ({
    id: `p-${i}`,
    angle: random() * 360,
    // Held away from the centre so they never sit behind the copy.
    distance: 16 + random() * 34,
    size: 1.4 + random() * 1.8,
    opacity: 0.22 + random() * 0.34,
    warm: random() < 0.28,
    tier: (i % 3 === 0 ? 0 : i % 3 === 1 ? 1 : 2) as 0 | 1 | 2,
  }));
})();

function DepthParticles({
  progress,
  reduceMotion,
}: {
  progress: MotionValue<number>;
  reduceMotion: boolean;
}) {
  // Drifts outward more slowly than the rays — nearer-field parallax.
  const scale = useTransform(progress, [0, 1], reduceMotion ? [1, 1] : [0.82, 1.42]);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
    >
      <motion.div
        className="absolute left-1/2 top-[45%] h-0 w-0"
        style={{ scale, willChange: "transform" }}
      >
        {PARTICLES.map((particle) => (
          <div
            key={particle.id}
            className={`absolute rounded-full ${TIER_CLASS[particle.tier]}`}
            style={{
              left: 0,
              top: 0,
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              opacity: particle.opacity,
              transform: `rotate(${particle.angle}deg) translateY(-${particle.distance}vmin)`,
              transformOrigin: "50% 50%",
              backgroundColor: particle.warm
                ? "rgba(255,200,120,0.9)"
                : "rgba(215,226,234,0.9)",
            }}
          />
        ))}
      </motion.div>
    </div>
  );
}


// ---------------------------------------------------------------------------
// Skill objects
// ---------------------------------------------------------------------------

function SkillLabel({ text }: { text: string }) {
  return (
    <span className="select-none whitespace-nowrap rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[9px] sm:text-[10px] uppercase tracking-[0.14em] sm:tracking-[0.18em] text-[#D7E2EA]/60 backdrop-blur-sm transition-colors duration-500 group-hover:border-white/20 group-hover:text-[#D7E2EA]/95">
      {text}
    </span>
  );
}

function FloatingSkillObject({
  config,
  canHover,
  reduceMotion,
  springX,
  springY,
  progress,
}: {
  config: SkillObjectConfig;
  canHover: boolean;
  reduceMotion: boolean;
  springX: MotionValue<number>;
  springY: MotionValue<number>;
  progress: MotionValue<number>;
}) {
  const parallaxX = useTransform(
    springX,
    [-0.5, 0.5],
    [-config.parallaxStrength, config.parallaxStrength],
  );
  const parallaxY = useTransform(
    springY,
    [-0.5, 0.5],
    [-config.parallaxStrength, config.parallaxStrength],
  );

  // Ties the objects to the same scroll-driven depth field as the rays.
  const depthShift = useTransform(
    progress,
    [0, 1],
    reduceMotion ? [0, 0] : [-config.depth, config.depth],
  );

  return (
    <FadeIn
      delay={config.entrance.delay}
      x={config.entrance.x}
      y={config.entrance.y}
      duration={config.entrance.duration}
      className={`${config.wrapperClassName} z-[5] ${
        canHover ? "pointer-events-auto" : "pointer-events-none"
      }`}
    >
      {/* Scroll depth layer */}
      <motion.div style={{ y: depthShift }}>
        {/* Float layer: continuous, organic suspension in space */}
        <motion.div
          {...(!reduceMotion && {
            animate: {
              y: [0, -config.float.y, 0],
              x: [0, config.float.x, 0],
              rotate: [0, config.float.rotate, 0],
            },
            transition: {
              duration: config.float.duration,
              delay: config.float.delay,
              repeat: Infinity,
              ease: "easeInOut",
            },
          })}
        >
          {/* Parallax + hover layer */}
          <motion.div
            className="group flex flex-col items-center gap-2"
            {...(canHover && {
              style: { x: parallaxX, y: parallaxY },
              whileHover: { scale: 1.06 },
            })}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
          >
            {config.labelPosition === "top" && <SkillLabel text={config.label} />}
            <img
              src={config.src}
              alt=""
              className={`h-auto ${config.imageClassName} transition duration-500 ease-out group-hover:brightness-110 group-hover:drop-shadow-[0_0_22px_rgba(215,226,234,0.22)]`}
            />
            {config.labelPosition === "bottom" && <SkillLabel text={config.label} />}
          </motion.div>
        </motion.div>
      </motion.div>
    </FadeIn>
  );
}

// ---------------------------------------------------------------------------
// Portrait frame — a premium floating glass/metal frame, suspended in the
// same depth field as the skill objects above.
// ---------------------------------------------------------------------------

function PortraitFrame({
  config,
  canHover,
  reduceMotion,
  springX,
  springY,
  progress,
}: {
  config: PortraitConfig;
  canHover: boolean;
  reduceMotion: boolean;
  springX: MotionValue<number>;
  springY: MotionValue<number>;
  progress: MotionValue<number>;
}) {
  const parallaxX = useTransform(
    springX,
    [-0.5, 0.5],
    [-config.parallaxStrength, config.parallaxStrength],
  );
  const parallaxY = useTransform(
    springY,
    [-0.5, 0.5],
    [-config.parallaxStrength, config.parallaxStrength],
  );
  // Tiny 3D tilt — the frame reads as an object with a front and a back,
  // not a flat image, as the pointer moves across the section.
  const tiltX = useTransform(springY, [-0.5, 0.5], [config.tiltStrength, -config.tiltStrength]);
  const tiltY = useTransform(springX, [-0.5, 0.5], [-config.tiltStrength, config.tiltStrength]);

  // Ties the frame to the same scroll-driven depth field as the rays/icons.
  const depthShift = useTransform(
    progress,
    [0, 1],
    reduceMotion ? [0, 0] : [-config.depth, config.depth],
  );

  return (
    <FadeIn
      delay={config.entrance.delay}
      x={config.entrance.x}
      y={config.entrance.y}
      duration={config.entrance.duration}
      className={`${config.wrapperClassName} z-[6] ${
        canHover ? "pointer-events-auto" : "pointer-events-none"
      }`}
    >
      {/* Scroll depth layer */}
      <motion.div style={{ y: depthShift }}>
        {/* Float layer: slow, continuous, expensive-feeling suspension */}
        <motion.div
          {...(!reduceMotion && {
            animate: {
              y: [0, -config.float.y, 0],
              x: [0, config.float.x, 0],
              rotate: [0, config.float.rotate, 0],
            },
            transition: {
              duration: config.float.duration,
              delay: config.float.delay,
              repeat: Infinity,
              ease: "easeInOut",
            },
          })}
        >
          {/* Perspective context for the tilt below */}
          <div style={{ perspective: 1200 }}>
            {/* Parallax + tilt + hover layer */}
            <motion.div
              className="group flex flex-col items-center gap-3"
              {...(canHover && {
                style: {
                  x: parallaxX,
                  y: parallaxY,
                  rotateX: tiltX,
                  rotateY: tiltY,
                  transformStyle: "preserve-3d",
                  willChange: "transform",
                },
                whileHover: { scale: 1.045 },
              })}
              transition={{ type: "spring", stiffness: 220, damping: 20 }}
            >
              <div className="relative">
                {/* Outer bloom — soft silver/champagne glow behind the shell */}
                <div
                  aria-hidden="true"
                  className="absolute -inset-5 rounded-[30px] bg-gradient-to-br from-[#D7E2EA]/15 via-transparent to-[#E8C892]/15 opacity-60 blur-2xl transition-opacity duration-700 ease-out group-hover:opacity-100"
                />

                {/* Outer shell — dark metallic/glass, thin champagne-silver border */}
                <div className="relative rounded-[18px] bg-gradient-to-br from-[#E8C892]/60 via-[#E8C892]/70 to-[#7C8894]/80 p-[2px] shadow-[0_25px_55px_-15px_rgba(0,0,0,0.8)] transition-shadow duration-700 ease-out group-hover:shadow-[0_30px_65px_-12px_rgba(232,200,146,0.28)]">
                  {/* Matting — near-black metal, separates border from glass */}
                  <div className="relative overflow-hidden rounded-[16px] bg-[#0a0a0a]/95 p-[6px]">
                    {/* Glass + portrait layer */}
                    <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[18px] border border-white/10">
                      <img
                        src={PORTRAIT_SRC}
                        alt="Portrait"
                        loading="lazy"
                        decoding="async"
                        draggable={false}
                        className="h-full w-full select-none object-cover [object-position:50%_22%] saturate-[1] contrast-[1.1] brightness-[1.01] transition duration-700 ease-out group-hover:brightness-[1.08] group-hover:saturate-[1]"
                      />

                      {/* Cool/silver cast */}
                      <div
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-0 bg-[#8FB2CE] mix-blend-overlay opacity-[0.07]"
                      />
                      {/* Cinematic vignette */}
                      <div
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_40%,transparent_50%,rgba(0,0,0,0.4)_100%)]"
                      />
                      <div
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/15 via-transparent to-black/45"
                      />

                      {/* Glass reflection sweep — brightens and sweeps across on hover */}
                      <div
                        aria-hidden="true"
                        className="pointer-events-none absolute -inset-y-12 -left-1/2 w-1/3 rotate-[18deg] bg-gradient-to-r from-transparent via-white/[0.12] to-transparent opacity-0 transition-all duration-700 ease-out group-hover:translate-x-[240%] group-hover:opacity-100"
                      />

                      {/* Inner highlight border */}
                      <div
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-0 rounded-[19px] ring-1 ring-white/10 transition-colors duration-700 group-hover:ring-white/20"
                      />
                    </div>
                  </div>
                </div>

                {/* Tiny glowing corner accents */}
                <span className="absolute -top-1 -left-1 h-3 w-3 rounded-tl-[6px] border-t border-l border-[#E8C892]/70" />
                <span className="absolute -top-1 -right-1 h-3 w-3 rounded-tr-[6px] border-t border-r border-[#E8C892]/70" />
                <span className="absolute -bottom-1 -left-1 h-3 w-3 rounded-bl-[6px] border-b border-l border-[#E8C892]/70" />
                <span className="absolute -bottom-1 -right-1 h-3 w-3 rounded-br-[6px] border-b border-r border-[#E8C892]/70" />
              </div>

              <SkillLabel text={PORTRAIT_LABEL} />
            </motion.div>
          </div>
        </motion.div>
      </motion.div>
    </FadeIn>
  );
}

// ---------------------------------------------------------------------------
// Main section
// ---------------------------------------------------------------------------

export function AboutSection() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const reduceMotion = !!useReducedMotion();
  const [canHover, setCanHover] = useState(false);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { stiffness: 60, damping: 16, mass: 0.6 });
  const springY = useSpring(mouseY, { stiffness: 60, damping: 16, mass: 0.6 });

  // Position through the section: drives travel direction, reverses naturally
  // when the scroll direction reverses and holds still when scrolling stops.
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });
  const progress = useSpring(scrollYProgress, {
    stiffness: 140,
    damping: 22,
    mass: 0.5,
  });

  // Scroll speed: decays to zero on its own, so the field settles when idle.
  const scrollVelocity = useVelocity(scrollYProgress);
  const energyTarget = useTransform(scrollVelocity, (velocity) =>
    Math.min(Math.abs(velocity) / 0.35, 1),
  );
  const energy = useSpring(energyTarget, {
    stiffness: 90,
    damping: 30,
    mass: 0.6,
  });

  const atmosphereOpacity = useTransform(
    energy,
    [0, 0.35, 0.7, 1],
    [0.35, 0.42, 0.55, 0.68],
  );

  useEffect(() => {
    const query = window.matchMedia("(hover: hover) and (pointer: fine)");
    const updatePreference = () => setCanHover(query.matches);
    updatePreference();
    query.addEventListener("change", updatePreference);
    return () => query.removeEventListener("change", updatePreference);
  }, []);

  const handlePointerMove = (event: ReactMouseEvent<HTMLElement>) => {
    if (!canHover || !sectionRef.current) return;
    const rect = sectionRef.current.getBoundingClientRect();
    mouseX.set((event.clientX - rect.left) / rect.width - 0.5);
    mouseY.set((event.clientY - rect.top) / rect.height - 0.5);
  };

  const handlePointerLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  return (
    <section
      id="about"
      ref={sectionRef}
      onMouseMove={handlePointerMove}
      onMouseLeave={handlePointerLeave}
      className="relative min-h-[100svh] flex flex-col items-center justify-center px-5 sm:px-8 md:px-10 py-14 sm:py-16 xl:py-20 overflow-hidden"
      style={{ backgroundColor: "#0C0C0C" }}
    >
      {/* Cinematic depth field */}
      <DepthRays progress={progress} energy={energy} reduceMotion={reduceMotion} />
      <DepthParticles progress={progress} reduceMotion={reduceMotion} />

      {/* Central glow around the vanishing point — silver with a champagne trace */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-[1]"
      >
        <motion.div
          className="absolute inset-0"
          style={{
            opacity: atmosphereOpacity,
            background:
              "radial-gradient(ellipse 48% 42% at 50% 45%, rgba(215,226,234,0.10) 0%, rgba(255,210,140,0.045) 30%, transparent 72%)",
          }}
        />
      </div>

      {/* Vignette that keeps the copy area dark and legible */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-[2]"
        style={{
          background:
            "radial-gradient(ellipse 48% 42% at 50% 45%, rgba(215,226,234,0.075) 0%, rgba(225,190,90,0.035) 28%, rgba(255,190,90,0.018) 45%,transparent 72%)",
        }}
      />

      {/*
        Skill objects. Below xl they sit in two in-flow rails (above the heading /
        below the buttons) so they can never collide with the copy or the portrait.
        From xl up the rail wrappers disappear (display: contents) and each object
        is positioned absolutely around the copy, as in the original layout.
      */}
      <div className="relative z-[5] mb-6 sm:mb-8 flex w-full justify-between xl:contents">
        {SKILL_OBJECTS.filter((config) => config.rail === "top").map((config) => (
          <FloatingSkillObject
            key={config.id}
            config={config}
            canHover={canHover}
            reduceMotion={reduceMotion}
            springX={springX}
            springY={springY}
            progress={progress}
          />
        ))}
      </div>

      {/* Portrait — desktop/laptop: floats beside the copy, right of centre */}
      <PortraitFrame
        config={PORTRAIT_DESKTOP}
        canHover={canHover}
        reduceMotion={reduceMotion}
        springX={springX}
        springY={springY}
        progress={progress}
      />

      <div className="relative z-10 flex flex-col items-center gap-16 sm:gap-20 md:gap-24">
        <div className="flex flex-col items-center gap-10 sm:gap-14 md:gap-16">
          <FadeIn delay={0} y={40}>
            <h2
              className="hero-heading font-black uppercase leading-none tracking-tight text-center"
              style={{ fontSize: "clamp(3rem, 12vw, 160px)" }}
            >
              About me
            </h2>
          </FadeIn>
          <AnimatedText
            text="I'm passionate about Data Science, Machine Learning, and AI, focused on turning data into meaningful insights and ideas into intelligent solutions. I enjoy exploring data, building Machine Learning models, and creating practical AI applications using Python, SQL, Power BI, and modern AI tools that solve real-world problems. Always learning, always building, and always looking for the next problem to solve. Let's turn ideas into something impactful together."
            className="text-[#D7E2EA] font-medium text-center leading-relaxed max-w-[560px]"
            style={{ fontSize: "clamp(1rem, 2vw, 1.35rem)" }}
          />
          <FadeIn delay={0.2} y={16}>
            <div className="flex flex-wrap items-center justify-center gap-2 max-w-[420px]">
              {EXTRA_SKILLS.map((skill) => (
                <span
                  key={skill}
                  className="select-none rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-[9px] sm:text-[10px] uppercase tracking-[0.18em] text-[#D7E2EA]/50 backdrop-blur-sm"
                >
                  {skill}
                </span>
              ))}
            </div>
          </FadeIn>

          {/* Portrait — tablet/mobile: in-flow below the bio, never overlapping text */}
          <PortraitFrame
            config={PORTRAIT_MOBILE}
            canHover={canHover}
            reduceMotion={reduceMotion}
            springX={springX}
            springY={springY}
            progress={progress}
          />
        </div>
        <div className="flex flex-col items-center gap-5 sm:gap-6">
          <FadeIn delay={0.18} y={16}>
            <ContactButton />
          </FadeIn>
          
          <FadeIn delay={0.1} y={16}>
            <ResumeButton />
          </FadeIn>
        </div>
      </div>

      <div className="relative z-[5] mt-8 sm:mt-10 flex w-full justify-between xl:contents">
        {SKILL_OBJECTS.filter((config) => config.rail === "bottom").map((config) => (
          <FloatingSkillObject
            key={config.id}
            config={config}
            canHover={canHover}
            reduceMotion={reduceMotion}
            springX={springX}
            springY={springY}
            progress={progress}
          />
        ))}
      </div>
    </section>
  );
}