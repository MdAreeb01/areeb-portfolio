import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FadeIn } from "./FadeIn";

const services = [
  {
    n: "01",
    name: "PYTHON & DATA ANALYSIS",
    d: "Turning raw data into meaningful insights through Data Cleaning, Exploration, Visualization, and Statistical Analysis using Python, Pandas, NumPy, Matplotlib, and Seaborn.",
    tools: ["Python", "Pandas", "NumPy", "Matplotlib", "Seaborn"],
  },
  {
    n: "02",
    name: "MACHINE LEARNING",
    d: "Building and evaluating Machine Learning solutions using Supervised and Unsupervised Learning techniques to solve real-world problems and uncover patterns in data.",
    tools: ["Python", "Supervised Learning", "Unsupervised Learning"],
  },
  {
    n: "03",
    name: "POWER BI & DATA VISUALIZATION",
    d: "Creating clear, interactive dashboards and compelling visualization with Power BI and Python to transform complex data into actionable insights.",
    tools: ["Power BI", "Python", "Data Visualization"],
  },
  {
    n: "04",
    name: "AI APPLICATIONS",
    d: "Building practical AI-powered applications by integrating Machine Learning, LLM APIs, and tools like Streamlit to turn ideas into usable solutions.",
    tools: ["Machine Learning", "LLM APIs", "Streamlit"],
  },
  {
    n: "05",
    name: "SQL & DATABASES",
    d: "Working with MySQL to query, manage, and analyze structured data, with a focus on writing efficient SQL queries and extracting useful information.",
    tools: ["MySQL", "SQL"],
  },
];

// Shared spring/easing feel for micro-interactions
const MICRO_TRANSITION = { duration: 0.35, ease: [0.22, 1, 0.36, 1] as const };

const numberVariants = {
  rest: { opacity: 0.9, scale: 1 },
  hover: { opacity: 1, scale: 1.06 },
  open: { opacity: 1, scale: 1.06 },
};

const titleVariants = {
  rest: { x: 0 },
  hover: { x: 10 },
  open: { x: 10 },
};

// Indicator variants handling hover opacity and open rotation smoothly
const indicatorVariants = {
  rest: { rotate: 0, opacity: 0.55 },
  hover: { opacity: 1 },
  open: { rotate: 45, opacity: 1 },
};

const rowSurfaceVariants = {
  rest: { backgroundColor: "rgba(12, 12, 12, 0)", borderBottomColor: "rgba(12, 12, 12, 0.15)" },
  hover: { backgroundColor: "rgba(12, 12, 12, 0.035)", borderBottomColor: "rgba(12, 12, 12, 0.32)" },
  open: { backgroundColor: "rgba(12, 12, 12, 0.035)", borderBottomColor: "rgba(12, 12, 12, 0.32)" },
};

export function ServicesSection() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const toggle = (i: number) => {
    setActiveIndex((prev) => (prev === i ? null : i));
  };

  return (
    <section
      id="expertise"
      className="rounded-t-[40px] sm:rounded-t-[50px] md:rounded-t-[60px] px-5 sm:px-8 md:px-10 py-20 sm:py-24 md:py-32"
      style={{ backgroundColor: "#FFFFFF" }}
    >
      <FadeIn delay={0} y={40}>
        <h2
          className="font-black uppercase text-center leading-none mb-16 sm:mb-20 md:mb-28"
          style={{ color: "#0C0C0C", fontSize: "clamp(3rem, 12vw, 160px)" }}
        >
          Expertise
        </h2>
      </FadeIn>

      <div className="max-w-5xl mx-auto">
        {services.map((s, i) => {
          const isOpen = activeIndex === i;
          const triggerId = `expertise-trigger-${s.n}`;
          const panelId = `expertise-panel-${s.n}`;

          return (
            <FadeIn key={s.n} delay={i * 0.1}>
              <motion.div
                initial="rest"
                animate={isOpen ? "open" : "rest"}
                whileHover="hover"
                variants={rowSurfaceVariants}
                transition={MICRO_TRANSITION}
                style={{
                  borderTopWidth: i === 0 ? 1 : 0,
                  borderTopStyle: "solid",
                  borderTopColor: "rgba(12, 12, 12, 0.15)",
                  borderBottomWidth: 1,
                  borderBottomStyle: "solid",
                }}
              >
                <button
                  type="button"
                  onClick={() => toggle(i)}
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                  id={triggerId}
                  className="w-full flex items-center justify-between gap-4 sm:gap-6 md:gap-10 py-8 sm:py-10 md:py-12 text-left bg-transparent border-none cursor-pointer touch-manipulation [-webkit-tap-highlight-color:transparent] focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-4 focus-visible:ring-[#0C0C0C]/40 rounded-sm"
                >
                  <div className="flex items-center gap-5 sm:gap-8 md:gap-12 min-w-0">
                    <motion.span
                      variants={numberVariants}
                      transition={MICRO_TRANSITION}
                      className="font-black leading-none shrink-0 max-md:w-[1.25em]"
                      style={{ color: "#0C0C0C", fontSize: "clamp(3rem, 10vw, 140px)" }}
                    >
                      {s.n}
                    </motion.span>
                    <motion.h3
                      variants={titleVariants}
                      transition={MICRO_TRANSITION}
                      className="min-w-0 font-medium uppercase leading-none"
                      style={{ color: "#0C0C0C", fontSize: "clamp(1rem, 2.2vw, 2.1rem)" }}
                    >
                      {s.name}
                    </motion.h3>
                  </div>

                  <motion.span
                    variants={indicatorVariants}
                    animate={isOpen ? "open" : "rest"}
                    transition={MICRO_TRANSITION}
                    aria-hidden="true"
                    className="font-light leading-none shrink-0 select-none inline-block"
                    style={{ color: "#0C0C0C", fontSize: "clamp(1.5rem, 3vw, 2.5rem)" }}
                  >
                    +
                  </motion.span>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      id={panelId}
                      role="region"
                      aria-labelledby={triggerId}
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{
                        height: { duration: 0.45, ease: [0.16, 1, 0.3, 1] },
                        opacity: { duration: 0.3, ease: "easeOut" },
                      }}
                      style={{ overflow: "hidden" }}
                    >
                      <motion.div
                        initial={{ y: -8, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: -8, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                        className="pb-8 sm:pb-10 md:pb-12 pl-[calc(1.25*clamp(3rem,10vw,140px)_+_1.25rem)] sm:pl-[calc(1.25*clamp(3rem,10vw,140px)_+_2rem)] md:pl-36 pr-2 md:pr-10"
                      >
                        <p
                          className="font-light leading-relaxed max-w-2xl"
                          style={{
                            color: "#0C0C0C",
                            opacity: 0.6,
                            fontSize: "clamp(0.9375rem, 1.6vw, 1.25rem)",
                          }}
                        >
                          {s.d}
                        </p>

                        {s.tools.length > 0 && (
                          <div className="mt-5 sm:mt-6">
                            <span
                              className="uppercase font-medium"
                              style={{
                                color: "#0C0C0C",
                                opacity: 0.4,
                                fontSize: "0.7rem",
                                letterSpacing: "0.2em",
                              }}
                            >
                              Tools
                            </span>
                            <p
                              className="mt-2 font-light"
                              style={{
                                color: "#0C0C0C",
                                opacity: 0.75,
                                fontSize: "clamp(0.9rem, 1.4vw, 1.1rem)",
                              }}
                            >
                              {s.tools.join(" · ")}
                            </p>
                          </div>
                        )}
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </FadeIn>
          );
        })}
      </div>
    </section>
  );
}