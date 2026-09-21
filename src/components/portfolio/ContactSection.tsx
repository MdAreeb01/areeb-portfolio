import { useEffect, useState } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  useReducedMotion,
  type Variants,
} from "framer-motion";
import {
  Mail,
  Instagram,
  Linkedin,
  Github,
  ArrowUpRight,
  type LucideIcon,
} from "lucide-react";
import { FadeIn } from "./FadeIn";
import { ContactButton } from "./Buttons";

interface SocialLink {
  icon: LucideIcon;
  label: string;
  href: string;
  handle: string;
}

const socials: SocialLink[] = [
  {
    icon: Mail,
    label: "Email",
    href: "https://mail.google.com/mail/?view=cm&fs=1&to=areebak12323@gmail.com",
    handle: "areebak12323@gmail.com",
  },
  {
    icon: Instagram,
    label: "Instagram",
    href: "https://instagram.com/__areeb_28_",
    handle: "@__areeb_28_",
  },
  {
    icon: Linkedin,
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/mohd-areeb1201",
    handle: "mohd-areeb1201",
  },
  {
    icon: Github,
    label: "GitHub",
    href: "https://github.com/MdAreeb01",
    handle: "MdAreeb01",
  },
];

/** True only on devices with an accurate pointer (mouse / trackpad), never touch. */
function useHasFinePointer() {
  const [hasFinePointer, setHasFinePointer] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(pointer: fine)");
    setHasFinePointer(query.matches);

    const handleChange = (event: MediaQueryListEvent) =>
      setHasFinePointer(event.matches);

    query.addEventListener("change", handleChange);
    return () => query.removeEventListener("change", handleChange);
  }, []);

  return hasFinePointer;
}

const TILT_DEGREES = 3;

function ContactCard({ social }: { social: SocialLink }) {
  const hasFinePointer = useHasFinePointer();
  const prefersReducedMotion = useReducedMotion();
  const tiltEnabled = hasFinePointer && !prefersReducedMotion;

  // Motion values only — updating these never triggers a React re-render.
  const pointerX = useMotionValue(0.5);
  const pointerY = useMotionValue(0.5);

  const springConfig = { stiffness: 220, damping: 22, mass: 0.4 };
  const rotateX = useSpring(
    useTransform(pointerY, [0, 1], [TILT_DEGREES, -TILT_DEGREES]),
    springConfig
  );
  const rotateY = useSpring(
    useTransform(pointerX, [0, 1], [-TILT_DEGREES, TILT_DEGREES]),
    springConfig
  );

  const handlePointerMove = (event: React.PointerEvent<HTMLAnchorElement>) => {
    if (!tiltEnabled || event.pointerType !== "mouse") return;
    const bounds = event.currentTarget.getBoundingClientRect();
    pointerX.set((event.clientX - bounds.left) / bounds.width);
    pointerY.set((event.clientY - bounds.top) / bounds.height);
  };

  const resetPointer = () => {
    pointerX.set(0.5);
    pointerY.set(0.5);
  };

  const cardVariants: Variants = prefersReducedMotion
    ? { rest: {}, hover: {}, tap: {} }
    : {
        rest: { y: 0, scale: 1 },
        hover: {
          y: -5,
          scale: 1.02,
          transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] },
        },
        tap: {
          scale: 0.98,
          y: 1,
          transition: { duration: 0.15, ease: "easeOut" },
        },
      };

  const iconVariants: Variants = prefersReducedMotion
    ? { rest: {}, hover: {} }
    : {
        rest: { x: 0, y: 0, opacity: 0.8 },
        hover: { x: 1, y: -1, opacity: 1, transition: { duration: 0.35 } },
      };

  const arrowVariants: Variants = prefersReducedMotion
    ? { rest: {}, hover: {} }
    : {
        rest: { x: 0, y: 0, opacity: 0.4 },
        hover: { x: 4, y: -4, opacity: 1, transition: { duration: 0.35 } },
      };

  return (
    <motion.a
      href={social.href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`${social.label} — ${social.handle} (opens in a new tab)`}
      initial="rest"
      whileHover="hover"
      whileFocus="hover"
      whileTap="tap"
      variants={cardVariants}
      onPointerMove={handlePointerMove}
      onPointerLeave={resetPointer}
      style={{
        rotateX: tiltEnabled ? rotateX : 0,
        rotateY: tiltEnabled ? rotateY : 0,
        transformPerspective: 900,
      }}
      className="group relative flex h-full flex-col justify-between overflow-hidden rounded-2xl border border-[#D7E2EA]/15 bg-[#D7E2EA]/5 px-5 py-6 backdrop-blur-md transition-[border-color,background-color,box-shadow] duration-300 ease-out hover:border-[#D7E2EA]/30 hover:bg-[#D7E2EA]/10 hover:shadow-[0_18px_40px_-20px_rgba(0,0,0,0.75)] focus-visible:border-[#D7E2EA]/40 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#D7E2EA]/40 sm:px-6"
    >
      {/* inner top edge highlight — purely decorative */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-[#D7E2EA]/25 to-transparent"
      />

      {/* diagonal glass shine sweep, css-driven so it also fires on keyboard focus */}
      {!prefersReducedMotion && (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 left-[-40%] w-1/3 -skew-x-12 bg-linear-to-r from-transparent via-[#D7E2EA]/10 to-transparent opacity-0 blur-sm transition-[transform,opacity] duration-700 ease-out group-hover:translate-x-[260%] group-hover:opacity-100 group-focus-visible:translate-x-[260%] group-focus-visible:opacity-100"
        />
      )}

      <div className="relative flex items-start justify-between">
        <motion.span variants={iconVariants} className="text-[#D7E2EA]/80">
          <social.icon aria-hidden="true" size={22} strokeWidth={1.5} />
        </motion.span>
        <motion.span variants={arrowVariants} className="text-[#D7E2EA]">
          <ArrowUpRight aria-hidden="true" size={18} strokeWidth={1.5} />
        </motion.span>
      </div>

      <div className="relative mt-8 flex flex-col gap-1.5">
        <span className="text-[0.65rem] font-light uppercase tracking-[0.2em] text-[#D7E2EA]/50">
          {social.label}
        </span>
        <span className="break-all text-sm font-medium text-[#D7E2EA] transition-colors duration-300 group-hover:text-white sm:text-base">
          {social.handle}
        </span>
      </div>
    </motion.a>
  );
}

export function ContactSection() {
  return (
    <section
      id="contact"
      className="relative scroll-mt-0 overflow-hidden rounded-t-[40px] px-5 pb-20 pt-52 sm:rounded-t-[50px] sm:px-8 sm:pb-24 sm:pt-56 md:rounded-t-[60px] md:px-10 md:pb-32 md:pt-64"
      style={{ backgroundColor: "#0C0C0C" }}
    >
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-12 sm:gap-16 md:gap-20">
        <FadeIn delay={0} y={40}>
          <h2
            className="hero-heading bg-linear-to-b from-[#F4F7F9] via-[#D7E2EA] to-[#D7E2EA]/75 bg-clip-text text-center font-black uppercase leading-none tracking-tight text-transparent"
            style={{ fontSize: "clamp(3rem, 12vw, 160px)" }}
          >
            Contact
          </h2>
        </FadeIn>

        <FadeIn delay={0.1} y={40}>
          <p
            className="max-w-[620px] text-center font-medium leading-relaxed text-[#D7E2EA]/80"
            style={{ fontSize: "clamp(1rem, 2vw, 1.35rem)" }}
          >
            Have a project in mind? Let's create something extraordinary together.
            Reach out and let's bring your vision to life.
          </p>
        </FadeIn>

        <FadeIn delay={0.2} y={30} className="w-full">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
            {socials.map((social) => (
              <ContactCard key={social.label} social={social} />
            ))}
          </div>
        </FadeIn>

        <FadeIn delay={0.25} y={20} className="w-full">
          <div className="flex flex-col items-center justify-between gap-4 border-t border-[#D7E2EA]/15 pt-8 sm:flex-row">
            <span className="text-xs font-light text-[#D7E2EA]/40 sm:text-sm">
              © 2026 Areeb — Data Analyst & AI/ML Enthusiast
            </span>
            <span className="text-xs font-light uppercase tracking-widest text-[#D7E2EA]/40 sm:text-sm">
              Designed & built with passion
            </span>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}