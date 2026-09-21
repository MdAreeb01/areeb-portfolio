import { useEffect, useRef, useState } from "react";
import type { MouseEvent } from "react";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import type { MotionValue, Transition } from "framer-motion";

type Expertise = {
  n: string;
  label: string;
  webm: string;
  mp4: string;
};

// Same 8 video paths as before, in their original order — now paired with
// the expertise number/label they represent.
const items: Expertise[] = [
  { n: "01", label: "DATA ANALYTICS", webm: "/videos/webmformat/data-analytics5.webm", mp4: "/videos/data-analytics5.mp4" },
  { n: "02", label: "PYTHON", webm: "/videos/webmformat/python1.webm", mp4: "/videos/python1.mp4" },
  { n: "03", label: "NEURAL NETWORK", webm: "/videos/webmformat/neural-network.webm", mp4: "/videos/neural-network.mp4" },
  { n: "04", label: "AI / ML", webm: "/videos/webmformat/data-analytics1-compressed.webm", mp4: "/videos/data-analytics1-compressed.mp4" },
  { n: "05", label: "AI + DATA", webm: "/videos/webmformat/ai.webm", mp4: "/videos/ai.mp4" },
  { n: "06", label: "MACHINE LEARNING", webm: "/videos/webmformat/ml.webm", mp4: "/videos/ml.mp4" },
  { n: "07", label: "SQL / DATABASE", webm: "/videos/webmformat/sql.webm", mp4: "/videos/sql.mp4" },
  { n: "08", label: "DATA VISUALIZATION", webm: "/videos/webmformat/dataanalytics2.webm", mp4: "/videos/dataanalytics2.mp4" },
];

const reversedItems = [...items].reverse();

const TILE_RADIUS = "rounded-[28px] sm:rounded-[32px]";
const TILE_TRANSITION: Transition = { duration: 0.4, ease: [0.22, 1, 0.36, 1] };

// Row 1 is a touch bigger/faster, row 2 a touch smaller/slower — enough to
// read as two distinct layers of depth without feeling like two unrelated
// components.
const ROW1_SPEED = 0.55;
const ROW2_SPEED = 0.35;
const ROW1_PARALLAX = 6;
const ROW2_PARALLAX = 5;
const ROW1_TILE_SIZES = "w-[270px] sm:w-[330px] md:w-[400px] lg:w-[430px]";
const ROW2_TILE_SIZES = "w-[260px] sm:w-[300px] md:w-[360px] lg:w-[390px]";

const tileHoverVariants = {
  rest: { scale: 1, boxShadow: "0px 0px 0px rgba(0,0,0,0)" },
  hover: {
    scale: 1.035,
    boxShadow: "0px 18px 40px rgba(0,0,0,0.4), 0 0 0 1px rgba(215,226,234,0.4)",
  },
};

const videoHoverVariants = {
  rest: { filter: "brightness(1)" },
  hover: { filter: "brightness(1.06)" },
};

// True only on devices with a real mouse-like pointer — touch devices never
// get hover-triggered zoom, glow, or mouse-follow parallax.
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

// Measures the pixel width of one full (unduplicated) set of tiles so the
// row can wrap seamlessly at any breakpoint without hardcoding widths.
function useSetWidth() {
  const ref = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const measure = () => setWidth(el.scrollWidth);
    measure();

    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return { ref, width };
}

// Wraps a value into (-width, 0], guaranteeing the translated row can never
// run out of duplicated content and reveal a gap, no matter how far the
// page scrolls.
function wrap(value: number, width: number) {
  if (!width) return 0;
  const wrapped = ((value % width) + width) % width;
  return -wrapped;
}

function Tile({
  item,
  interactive,
  sizeClassName,
}: {
  item: Expertise;
  interactive: boolean;
  sizeClassName: string;
}) {
  const mvX = useMotionValue(0);
  const mvY = useMotionValue(0);
  const springX = useSpring(mvX, { stiffness: 300, damping: 28, mass: 0.4 });
  const springY = useSpring(mvY, { stiffness: 300, damping: 28, mass: 0.4 });

  const handleMouseMove = (event: MouseEvent<HTMLDivElement>) => {
    if (!interactive) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const relX = (event.clientX - rect.left) / rect.width - 0.5;
    const relY = (event.clientY - rect.top) / rect.height - 0.5;
    mvX.set(relX * 8);
    mvY.set(relY * 8);
  };

  const handleMouseLeave = () => {
    mvX.set(0);
    mvY.set(0);
  };

  return (
    <motion.div
      initial="rest"
      whileHover={interactive ? "hover" : "rest"}
      variants={tileHoverVariants}
      transition={TILE_TRANSITION}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`relative shrink-0 overflow-hidden border border-[#D7E2EA]/15 ${TILE_RADIUS} ${sizeClassName}`}
      style={{ aspectRatio: "14 / 9" }}
    >
      <motion.div style={{ x: springX, y: springY }} className="absolute inset-0">
        <motion.video
          autoPlay
          loop
          muted
          playsInline
          preload="metadata"
          variants={videoHoverVariants}
          transition={TILE_TRANSITION}
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src={item.webm} type="video/webm" />
          <source src={item.mp4} type="video/mp4" />
        </motion.video>

        <div
          className="absolute inset-x-0 bottom-0 px-3 sm:px-4 pb-2.5 sm:pb-3 pt-8 flex items-end justify-between pointer-events-none"
          style={{
            background:
              "linear-gradient(to top, rgba(12,12,12,0.72) 0%, rgba(12,12,12,0) 70%)",
          }}
        >
          <span
            className="uppercase tracking-[0.15em] text-[9px] sm:text-[10px] md:text-xs font-light"
            style={{ color: "#D7E2EA" }}
          >
            {item.label}
          </span>

          <span
            className="text-[9px] sm:text-[10px] md:text-xs font-light tracking-widest"
            style={{ color: "#D7E2EA", opacity: 0.55 }}
          >
            {item.n}
          </span>
        </div>
      </motion.div>
    </motion.div>
  );
}

function MarqueeRow({
  rowItems,
  speed,
  direction,
  parallaxAmplitude,
  scroll,
  interactive,
  reduceMotion,
  tileSizeClassName,
}: {
  rowItems: Expertise[];
  speed: number;
  direction: 1 | -1;
  parallaxAmplitude: number;
  scroll: MotionValue<number>;
  interactive: boolean;
  reduceMotion: boolean;
  tileSizeClassName: string;
}) {
  const { ref: setRef, width: setWidth } = useSetWidth();

  const x = useTransform(scroll, (v) => {
    if (reduceMotion) return 0;
    return wrap(v * speed * direction, setWidth);
  });

  const y = useTransform(scroll, (v) => {
    if (reduceMotion) return 0;
    return Math.sin(v / 420) * parallaxAmplitude * direction;
  });

  return (
    <motion.div className="flex gap-3 sm:gap-4" style={{ x, y }}>
      <div ref={setRef} className="flex gap-3 sm:gap-4 shrink-0">
        {rowItems.map((item, i) => (
          <Tile
            key={`s1-${i}`}
            item={item}
            interactive={interactive}
            sizeClassName={tileSizeClassName}
          />
        ))}
      </div>

      <div className="flex gap-3 sm:gap-4 shrink-0" aria-hidden="true">
        {rowItems.map((item, i) => (
          <Tile
            key={`s2-${i}`}
            item={item}
            interactive={interactive}
            sizeClassName={tileSizeClassName}
          />
        ))}
      </div>
    </motion.div>
  );
}

export function MarqueeSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollY } = useScroll();
  const smoothScrollY = useSpring(scrollY, {
    stiffness: 90,
    damping: 22,
    mass: 0.6,
  });

  const canHover = useCanHover();
  const prefersReducedMotion = useReducedMotion() ?? false;
  const interactive = canHover && !prefersReducedMotion;

  return (
    <section
      ref={sectionRef}
      className="relative pt-14 sm:pt-18 md:pt-20 pb-16 sm:pb-18 overflow-hidden"
      style={{ backgroundColor: "#0C0C0C" }}
    >

      <div
        className="flex flex-col gap-4 sm:gap-5 py-3 sm:py-4"
        style={{
          WebkitMaskImage:
            "linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)",
          maskImage:
            "linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)",
        }}
      >
        <MarqueeRow
          rowItems={items}
          speed={ROW1_SPEED}
          direction={-1}
          parallaxAmplitude={ROW1_PARALLAX}
          scroll={smoothScrollY}
          interactive={interactive}
          reduceMotion={prefersReducedMotion}
          tileSizeClassName={ROW1_TILE_SIZES}
        />

        <MarqueeRow
          rowItems={reversedItems}
          speed={ROW2_SPEED}
          direction={1}
          parallaxAmplitude={ROW2_PARALLAX}
          scroll={smoothScrollY}
          interactive={interactive}
          reduceMotion={prefersReducedMotion}
          tileSizeClassName={ROW2_TILE_SIZES}
        />
      </div>
    </section>
  );
}