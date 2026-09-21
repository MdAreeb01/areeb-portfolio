import React from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  useReducedMotion,
  type Variants,
  type Transition,
} from "framer-motion";

const smoothTransition: Transition = {
  duration: 0.35,
  ease: [0.22, 1, 0.36, 1],
};

const tactileTapTransition: Transition = {
  duration: 0.12,
  ease: [0.22, 1, 0.36, 1],
};

function useButton3DTilt(shouldReduceMotion: boolean | null) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const springConfig = { damping: 26, stiffness: 280, mass: 0.5 };

  const rotateX = useSpring(
    useTransform(y, [-0.5, 0.5], shouldReduceMotion ? [0, 0] : [5, -5], {
      clamp: true,
    }),
    springConfig
  );
  const rotateY = useSpring(
    useTransform(x, [-0.5, 0.5], shouldReduceMotion ? [0, 0] : [-5, 5], {
      clamp: true,
    }),
    springConfig
  );

  const onPointerMove = (e: React.PointerEvent<HTMLElement>) => {
    if (shouldReduceMotion || e.pointerType === "touch") return;
    const rect = e.currentTarget.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;

    const xPct = (e.clientX - rect.left) / rect.width - 0.5;
    const yPct = (e.clientY - rect.top) / rect.height - 0.5;

    x.set(xPct);
    y.set(yPct);
  };

  const onPointerLeave = () => {
    x.set(0);
    y.set(0);
  };

  return {
    rotateX,
    rotateY,
    onPointerMove,
    onPointerLeave,
  };
}

const contactGlossVariants: Variants = {
  default: {
    x: "-150%",
    opacity: 0,
  },
  hover: {
    x: "250%",
    opacity: [0, 1, 1, 0],
    transition: {
      duration: 0.75,
      ease: [0.22, 1, 0.36, 1],
      times: [0, 0.15, 0.85, 1],
    },
  },
  tap: {
    opacity: 0,
    transition: { duration: 0.08 },
  },
};

const resumeGlossVariants: Variants = {
  default: {
    x: "-150%",
    opacity: 0,
  },
  hover: {
    x: "250%",
    opacity: [0, 1, 1, 0],
    transition: {
      duration: 0.75,
      ease: [0.22, 1, 0.36, 1],
      times: [0, 0.15, 0.85, 1],
    },
  },
  tap: {
    opacity: 0,
    transition: { duration: 0.08 },
  },
};

const liveProjectGlossVariants: Variants = {
  default: {
    x: "-150%",
    opacity: 0,
  },
  hover: {
    x: "250%",
    opacity: [0, 1, 1, 0],
    transition: {
      duration: 0.75,
      ease: [0.22, 1, 0.36, 1],
      times: [0, 0.15, 0.85, 1],
    },
  },
  tap: {
    opacity: 0,
    transition: { duration: 0.08 },
  },
};


export function ContactButton({ className = "" }: { className?: string }) {
  const shouldReduceMotion = useReducedMotion();
  const { rotateX, rotateY, onPointerMove, onPointerLeave } =
    useButton3DTilt(shouldReduceMotion);

  const buttonVariants: Variants = {
    default: {
      y: 0,
      scale: 1,
      boxShadow:
        "0 6px 18px -2px rgba(182, 0, 168, 0.35), 0 2px 6px -1px rgba(0, 0, 0, 0.45), inset 4px 4px 12px #7721B1, inset 0 1px 1px rgba(255, 255, 255, 0.3)",
      transition: smoothTransition,
    },
    hover: {
      y: shouldReduceMotion ? 0 : -4,
      scale: shouldReduceMotion ? 1 : 1.02,
      boxShadow:
        "0 14px 30px -4px rgba(182, 0, 168, 0.5), 0 6px 14px -2px rgba(0, 0, 0, 0.55), inset 4px 4px 14px #8B25D0, inset 0 1px 2px rgba(255, 255, 255, 0.5)",
      transition: smoothTransition,
    },
    tap: {
      y: shouldReduceMotion ? 0 : 2,
      scale: shouldReduceMotion ? 1 : 0.975,
      boxShadow:
        "0 2px 6px -1px rgba(182, 0, 168, 0.25), 0 1px 2px rgba(0, 0, 0, 0.6), inset 2px 2px 8px #5E1690, inset 0 1px 1px rgba(255, 255, 255, 0.2)",
      transition: tactileTapTransition,
    },
  };

  return (
    <motion.a
      href="#contact"
      initial="default"
      animate="default"
      whileHover="hover"
      whileTap="tap"
      variants={buttonVariants}
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
      className={`relative inline-flex items-center justify-center rounded-full font-medium uppercase tracking-wide sm:tracking-widest px-5 py-2.5 sm:px-10 sm:py-3.5 md:px-12 md:py-4 text-[10px] sm:text-sm md:text-base select-none cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#0C0C0C] ${className}`}
      style={{
        background:
          "linear-gradient(123deg, #18011F 7%, #B600A8 37%, #7621B0 72%, #BE4C00 100%)",
        outline: "2px solid #FFFFFF",
        outlineOffset: "-3px",
        color: "#FFFFFF",
        transformPerspective: 800,
        transformStyle: "preserve-3d",
        rotateX,
        rotateY,
      }}
    >
      <span
        className="relative z-10 block"
        style={{
          transform: shouldReduceMotion ? "none" : "translateZ(6px)",
          transformStyle: "preserve-3d",
        }}
      >
        Contact Me
      </span>

      {!shouldReduceMotion && (
        <span
          className="pointer-events-none absolute inset-0 overflow-hidden rounded-full"
          aria-hidden="true"
        >
          <motion.span
            variants={contactGlossVariants}
            className="absolute inset-y-0 -left-1/4 w-[150%] skew-x-[-20deg]"
            style={{
              background:
                "linear-gradient(105deg, transparent 20%, rgba(255, 255, 255, 0.38) 50%, transparent 80%)",
            }}
          />
        </span>
      )}
    </motion.a>
  );
}

export function ResumeButton({ className = "" }: { className?: string }) {
  const shouldReduceMotion = useReducedMotion();
  const { rotateX, rotateY, onPointerMove, onPointerLeave } =
    useButton3DTilt(shouldReduceMotion);

  const resumeVariants: Variants = {
    default: {
      y: 0,
      scale: 1,
      borderColor: "rgba(215, 226, 234, 0.28)",
      backgroundColor: "rgba(215, 226, 234, 0.045)",
      boxShadow:
        "0 6px 20px rgba(0,0,0,0.35), inset 0 1px 1px rgba(255,255,255,0.16), inset 0 -1px 8px rgba(215,226,234,0.04)",
      transition: smoothTransition,
    },

    hover: {
      y: shouldReduceMotion ? 0 : -4,
      scale: shouldReduceMotion ? 1 : 1.035,
      borderColor: "rgba(235, 245, 255, 0.85)",
      backgroundColor: "rgba(215, 226, 234, 0.12)",
      boxShadow:
        "0 16px 35px rgba(0,0,0,0.48), 0 0 28px rgba(215,226,234,0.25), inset 0 1px 2px rgba(255,255,255,0.7), inset 0 -8px 20px rgba(215,226,234,0.1)",
      transition: smoothTransition,
    },

    tap: {
      y: shouldReduceMotion ? 0 : 2,
      scale: shouldReduceMotion ? 1 : 0.96,
      borderColor: "rgba(255,255,255,0.9)",
      backgroundColor: "rgba(215,226,234,0.16)",
      boxShadow:
        "0 3px 8px rgba(0,0,0,0.55), inset 0 2px 10px rgba(255,255,255,0.16)",
      transition: tactileTapTransition,
    },
  };

  return (
    <motion.a
      href="/Areeb_Resume.pdf"
      download
      initial="default"
      animate="default"
      whileHover="hover"
      whileTap="tap"
      variants={resumeVariants}
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
      className={`group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-full border-2
        px-4 py-1.5
        sm:px-5 sm:py-2
        md:px-6 md:py-2.5
        text-[9px] sm:text-[10px] md:text-xs
        font-semibold uppercase tracking-widest
        select-none cursor-pointer text-[#EAF2F7] ${className}`}
      style={{
        transformPerspective: 800,
        transformStyle: "preserve-3d",
        rotateX,
        rotateY,
        backdropFilter: "blur(10px) saturate(125%)",
        WebkitBackdropFilter: "blur(10px) saturate(125%)",
        textShadow: "0 1px 10px rgba(215,226,234,0.22)",
      }}
    >
      {/* Glass surface */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-[1px] rounded-full"
        style={{
          background:
            "linear-gradient(135deg, rgba(255,255,255,0.13) 0%, rgba(255,255,255,0.025) 42%, rgba(215,226,234,0.06) 100%)",
        }}
      />

      {/* Top glass highlight */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-[12%] top-[2px] h-px rounded-full"
        style={{
          background:
            "linear-gradient(to right, transparent, rgba(255,255,255,0.8), transparent)",
        }}
      />

      {/* Full glass hover illumination */}
      {!shouldReduceMotion && (
        <motion.span
          className="pointer-events-none absolute inset-0 rounded-full"
          aria-hidden="true"
          initial={{ opacity: 0 }}
          whileHover={{ opacity: 1 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          style={{
            background:
              "linear-gradient(110deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.04) 35%, rgba(255,255,255,0.16) 50%, rgba(255,255,255,0.04) 65%, rgba(255,255,255,0.12) 100%)",
            boxShadow:
              "inset 0 1px 2px rgba(255,255,255,0.65), inset 0 -1px 4px rgba(215,226,234,0.15)",
          }}
        />
      )}

      {/* Moving glass reflection */}
      {!shouldReduceMotion && (
        <span
          className="pointer-events-none absolute inset-0 overflow-hidden rounded-full"
          aria-hidden="true"
        >
          <motion.span
            variants={resumeGlossVariants}
            className="absolute inset-y-0 -left-1/3 w-[60%] skew-x-[-25deg]"
            style={{
              background:
                "linear-gradient(to right, transparent 0%, rgba(255,255,255,0.2) 20%, rgba(255,255,255,0.95) 50%, rgba(215,226,234,0.5) 80%, transparent 100%)",
              filter: "blur(1px)",
            }}
          />
        </span>
      )}

      {/* Download icon */}
      <span
        className="relative z-10 flex items-center justify-center"
        style={{
          transform: shouldReduceMotion ? "none" : "translateZ(7px)",
        }}
      >
        <svg
          width="17"
          height="17"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M12 3v12" />
          <path d="m7 10 5 5 5-5" />
          <path d="M5 21h14" />
        </svg>
      </span>

      <span
        className="relative z-10"
        style={{
          transform: shouldReduceMotion ? "none" : "translateZ(7px)",
        }}
      >
        Download Resume
      </span>
    </motion.a>
  );
}

export function LiveProjectButton({ className = "" }: { className?: string } = {}) {
  const shouldReduceMotion = useReducedMotion();
  const { rotateX, rotateY, onPointerMove, onPointerLeave } =
    useButton3DTilt(shouldReduceMotion);

  const buttonVariants: Variants = {
    default: {
      y: 0,
      scale: 1,
      borderColor: "rgba(120, 107, 104, 0.4)",
      backgroundColor: "rgba(34, 197, 94, 0.02)",
      boxShadow:
        "0 4px 14px -2px rgba(0, 0, 0, 0.45), inset 0 1px 1px rgba(34, 197, 94, 0.2)",
      transition: smoothTransition,
    },
    hover: {
      y: shouldReduceMotion ? 0 : -3.5,
      scale: shouldReduceMotion ? 1 : 1.04,
      borderColor: "#4ADE80",
      backgroundColor: "rgba(22, 163, 74, 0.25)",
      boxShadow:
        "0 12px 24px -3px rgba(22, 163, 74, 0.4), 0 2px 12px rgba(74, 222, 128, 0.25), inset 0 1px 2px rgba(255, 255, 255, 0.4)",
      transition: smoothTransition,
    },
    tap: {
      y: shouldReduceMotion ? 0 : 2,
      scale: shouldReduceMotion ? 1 : 0.975,
      borderColor: "rgba(34, 197, 94, 0.8)",
      backgroundColor: "rgba(21, 128, 61, 0.4)",
      boxShadow:
        "0 2px 6px rgba(0, 0, 0, 0.6), inset 0 1px 2px rgba(0, 0, 0, 0.4)",
      transition: tactileTapTransition,
    },
  };

  return (
    <motion.button
      type="button"
      initial="default"
      animate="default"
      whileHover="hover"
      whileTap="tap"
      variants={buttonVariants}
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
      className={`relative inline-flex items-center justify-center rounded-full border-2 font-semibold uppercase tracking-widest px-8 py-3 sm:px-10 sm:py-3.5 text-sm sm:text-base text-[#E2FBE9] hover:text-[#FFFFFF] transition-colors duration-200 select-none cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4ADE80] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0C0C0C] ${className}`}
      style={{
        transformPerspective: 800,
        transformStyle: "preserve-3d",
        rotateX,
        rotateY,
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        textShadow: "0 2px 8px rgba(74, 222, 128, 0.3)",
      }}
    >
      <span
        className="relative z-10 block"
        style={{
          transform: shouldReduceMotion ? "none" : "translateZ(5px)",
          transformStyle: "preserve-3d",
        }}
      >
        Live Project
      </span>

      {!shouldReduceMotion && (
        <span
          className="pointer-events-none absolute inset-0 overflow-hidden rounded-full"
          aria-hidden="true"
        >
          <motion.span
            variants={liveProjectGlossVariants}
            className="absolute inset-y-0 -left-1/4 w-[150%] skew-x-[-20deg]"
            style={{
              background:
                "linear-gradient(105deg, transparent 20%, rgba(74, 222, 128, 0.6) 45%, rgba(255, 255, 255, 0.8) 50%, rgba(74, 222, 128, 0.6) 55%, transparent 80%)",
            }}
          />
        </span>
      )}
    </motion.button>
  );
}