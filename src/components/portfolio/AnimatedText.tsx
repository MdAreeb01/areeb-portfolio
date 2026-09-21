import { useRef } from "react";
import { motion, useScroll, useTransform, type MotionValue } from "framer-motion";

function Char({
  char,
  progress,
  range,
}: {
  char: string;
  progress: MotionValue<number>;
  range: [number, number];
}) {
  const opacity = useTransform(progress, range, [0.12, 1]);
  return (
    <span className="relative inline-block">
      <span className="opacity-0">{char}</span>
      <motion.span style={{ opacity }} className="absolute left-0 top-0">
        {char}
      </motion.span>
    </span>
  );
}

export function AnimatedText({
  text,
  className,
  style,
}: {
  text: string;
  className?: string;
  style?: React.CSSProperties;
}) {
  const ref = useRef<HTMLParagraphElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 0.95", "end 0.15"],
  });

  const words = text.split(" ");
  let charIndex = 0;
  const total = text.length;

  return (
    <p ref={ref} className={className} style={style}>
      {words.map((word, wi) => {
        const chars = (word + (wi < words.length - 1 ? " " : "")).split("");
        return (
          <span key={wi} className="inline-block whitespace-pre">
            {chars.map((c, ci) => {
              const start = charIndex / total;
              const end = (charIndex + 1) / total;
              charIndex++;
              return (
                <Char
                  key={ci}
                  char={c}
                  progress={scrollYProgress}
                  range={[start, end]}
                />
              );
            })}
          </span>
        );
      })}
    </p>
  );
}
