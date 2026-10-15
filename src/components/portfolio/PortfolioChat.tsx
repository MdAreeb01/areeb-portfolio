import { type CSSProperties, useEffect, useRef, useState } from "react";
import {
  ArrowUpRight,
  Bot,
  BrainCircuit,
  FolderOpen,
  Layers,
  LoaderCircle,
  Mail,
  Send,
  Sparkles,
  Users,
  X,
  type LucideIcon,
} from "lucide-react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";

type Message = {
  role: "user" | "assistant";
  content: string;
};

type Status = "idle" | "ok" | "error";

const WELCOME =
  "Hi! I'm Areeb AI. Ask me about Areeb's projects, technical skills, or how to connect with him.";

const SUGGESTIONS: { text: string; icon: LucideIcon }[] = [
  { text: "What projects has Areeb built?", icon: FolderOpen },
  { text: "What are his strongest technical skills?", icon: Layers },
  { text: "Tell me about his AI and ML work.", icon: BrainCircuit },
  { text: "How can I collaborate with Areeb?", icon: Users },
];

/* -------------------------------------------------------------------------- */
/*  Styling tokens                                                            */
/*  Kept as plain string constants so Tailwind can still see every class.     */
/* -------------------------------------------------------------------------- */

// Floating glass panel. `before:` draws the gradient edge (silver top-left,
// cyan bottom-right); `after:` draws the ambient glow *behind* the content.
// Both are pointer-events-none so they never block clicks or text selection.
const PANEL_CLASS = [
  "fixed z-[100] flex flex-col overflow-hidden rounded-[20px] text-[#D7E2EA]",
  // mobile: near full-screen, safe-area aware, height driven by --chat-top / --chat-h
  "max-sm:left-[max(0.75rem,env(safe-area-inset-left))] max-sm:right-[max(0.75rem,env(safe-area-inset-right))] max-sm:top-[var(--chat-top)] max-sm:h-[var(--chat-h)]",
  // desktop: bottom-right floating window
  "sm:bottom-6 sm:right-6 sm:h-[min(660px,calc(100dvh-3rem))] sm:w-[min(460px,calc(100vw-3rem))] sm:rounded-[20px] lg:w-[min(500px,calc(100vw-3rem))]",
  // glass surface
  "bg-[radial-gradient(ellipse_at_0%_0%,rgba(205,225,240,0.08),transparent_48%),radial-gradient(ellipse_at_30%_100%,rgba(70,170,230,0.035),transparent_60%),linear-gradient(160deg,rgba(30,35,40,0.6)_0%,rgba(16,19,22,0.64)_42%,rgba(10,12,14,0.96)_100%)] backdrop-blur-sm",
  "shadow-[0_40px_120px_-20px_rgba(0,0,0,0.75),0_18px_50px_rgba(0,0,0,0.45),0_0_25px_rgba(90,170,225,0.6),inset_0_1px_0_rgba(255,255,255,0.16),inset_0_-1px_0_rgba(0,0,0,0.5)]",
  // gradient edge ring
  "before:pointer-events-none before:absolute before:inset-0 before:z-20 before:rounded-[inherit] before:p-px before:content-['']",
  "before:bg-[linear-gradient(145deg,rgba(236,245,252,0.48)_0%,rgba(255,255,255,0.12)_20%,rgba(255,255,255,0.035)_60%,rgba(96,190,238,0.26)_100%)]",
  "before:[-webkit-mask:linear-gradient(#000_0_0)_content-box,linear-gradient(#000_0_0)] before:[-webkit-mask-composite:xor]",
  "before:[mask:linear-gradient(#000_0_0)_content-box,linear-gradient(#000_0_0)] before:[mask-composite:exclude]",
].join(" ");

const FOCUS_RING =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-200/50";

const LINK_CLASS = [
  "mx-0.5 my-0.5 inline-flex max-w-full items-center gap-1.5 rounded-xl border border-cyan-100/20 border-t-white/30",
  "bg-gradient-to-b from-white/[0.12] to-white/[0.04] px-2.5 py-1 align-middle text-[13px] font-medium leading-snug text-[#E6F1F8] no-underline",
  "shadow-[inset_0_1px_0_rgba(255,255,255,0.1)] transition-[border-color,box-shadow,background-color] duration-200",
  "hover:border-cyan-200/45 hover:bg-white/[0.14] hover:text-white hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.14),0_0_16px_rgba(100,190,235,0.22)]",
  FOCUS_RING,
].join(" ");

const CHIP_CLASS = [
  "flex w-full min-w-0 items-center gap-2 rounded-2xl border border-white/[0.12] border-t-white/[0.2]",
  "bg-gradient-to-b from-white/[0.09] to-white/[0.02] px-3.5 py-2.5 text-left text-xs leading-snug text-white/75",
  "shadow-[inset_0_1px_0_rgba(255,255,255,0.07),0_6px_16px_rgba(0,0,0,0.2)] transition duration-200",
  "hover:-translate-y-0.5 hover:border-cyan-200/35 hover:text-white hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_8px_22px_rgba(0,0,0,0.3),0_0_18px_rgba(100,190,235,0.16)]",
  "active:translate-y-0 disabled:pointer-events-none disabled:opacity-40 motion-reduce:transition-none motion-reduce:hover:translate-y-0",
  FOCUS_RING,
].join(" ");

const STATUS_DOT: Record<Status | "loading", string> = {
  idle: "bg-white/40",
  ok: "bg-cyan-200 shadow-[0_0_8px_rgba(165,243,252,0.6)]",
  error: "bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.55)]",
  loading:
    "bg-cyan-300 shadow-[0_0_8px_rgba(103,232,249,0.7)] animate-pulse motion-reduce:animate-none",
};

/* -------------------------------------------------------------------------- */
/*  Helpers                                                                   */
/* -------------------------------------------------------------------------- */

const SAFE_PROTOCOLS = new Set(["http:", "https:", "mailto:", "tel:"]);

// Only allow http(s), mailto, tel, in-page and relative links.
// `new URL` normalises tricks like "java\tscript:", so they are rejected too.
function getSafeHref(href?: string): string | null {
  if (!href) return null;
  const value = href.trim();
  if (value.startsWith("#")) return value;

  try {
    const url = new URL(value, "https://base.invalid");
    return SAFE_PROTOCOLS.has(url.protocol) ? value : null;
  } catch {
    return null;
  }
}

const TOP_GAP = "max(0.75rem, env(safe-area-inset-top))";
const BOTTOM_GAP = "max(0.75rem, env(safe-area-inset-bottom))";

// On phones the panel is sized from the *visual* viewport, so it shrinks when
// the on-screen keyboard opens and the composer is never covered.
// The CSS variables are only read by the `max-sm:` classes in PANEL_CLASS.
function useChatViewportVars(active: boolean): CSSProperties {
  const [viewport, setViewport] = useState<{
    top: number;
    height: number;
  } | null>(null);

  useEffect(() => {
    if (!active) return;
    const vv = window.visualViewport;
    if (!vv) return;

    const update = () => {
      const next = { top: Math.round(vv.offsetTop), height: Math.round(vv.height) };
      setViewport((prev) =>
        prev && prev.top === next.top && prev.height === next.height
          ? prev
          : next,
      );
    };

    update();
    vv.addEventListener("resize", update);
    vv.addEventListener("scroll", update);
    return () => {
      vv.removeEventListener("resize", update);
      vv.removeEventListener("scroll", update);
    };
  }, [active]);

  return {
    "--chat-top": viewport ? `calc(${viewport.top}px + ${TOP_GAP})` : TOP_GAP,
    "--chat-h": `calc(${viewport ? `${viewport.height}px` : "100dvh"} - ${TOP_GAP} - ${BOTTOM_GAP})`,
  } as CSSProperties;
}

/* -------------------------------------------------------------------------- */
/*  Markdown                                                                  */
/* -------------------------------------------------------------------------- */

// Defined once at module level so the renderers keep a stable identity.
const markdownComponents: Components = {
  h1: ({ children }) => (
    <h1 className="mb-2 mt-1 text-lg font-semibold tracking-tight text-white first:mt-0">
      {children}
    </h1>
  ),
  h2: ({ children }) => (
    <h2 className="mb-2 mt-1 text-base font-semibold tracking-tight text-white first:mt-0">
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="mb-1 mt-1 text-sm font-semibold text-white first:mt-0">
      {children}
    </h3>
  ),
  // pre-line keeps single line breaks inside a paragraph without adding
  // phantom blank lines between list items (which pre-wrap on the bubble did).
  p: ({ children }) => (
    <p className="mb-2 whitespace-pre-line last:mb-0">{children}</p>
  ),
  ul: ({ children }) => (
    <ul className="mb-2 list-disc space-y-1 pl-5 marker:text-white/40 last:mb-0">
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol className="mb-2 list-decimal space-y-1 pl-5 marker:text-white/50 last:mb-0">
      {children}
    </ol>
  ),
  strong: ({ children }) => (
    <strong className="font-semibold text-white">{children}</strong>
  ),
  blockquote: ({ children }) => (
    <blockquote className="mb-2 border-l-2 border-cyan-200/30 pl-3 text-white/70 last:mb-0">
      {children}
    </blockquote>
  ),
  hr: () => <hr className="my-3 border-white/10" />,
  a: ({ href, children }) => {
    const safeHref = getSafeHref(href);
    if (!safeHref) return <span>{children}</span>;

    const isMail = safeHref.toLowerCase().startsWith("mailto:");
    const isExternal = /^(https?:)?\/\//i.test(safeHref);
    const Icon = isMail ? Mail : ArrowUpRight;

    return (
      <a
        href={safeHref}
        target={isExternal ? "_blank" : undefined}
        rel={isExternal ? "noopener noreferrer" : undefined}
        className={LINK_CLASS}
      >
        <span className="min-w-0 [overflow-wrap:anywhere]">{children}</span>
        <Icon size={13} aria-hidden="true" className="shrink-0 opacity-70" />
      </a>
    );
  },
  // Block code is <pre><code>; the [&_code] resets strip the inline-code chrome.
  pre: ({ children }) => (
    <pre className="my-2 overflow-x-auto rounded-xl border border-white/10 bg-black/45 p-3 text-xs leading-relaxed text-[#CFE0EC] shadow-[inset_0_2px_8px_rgba(0,0,0,0.4)] last:mb-0 [&_code]:border-0 [&_code]:bg-transparent [&_code]:p-0">
      {children}
    </pre>
  ),
  code: ({ children, className }) => (
    <code
      className={`rounded-md border border-white/10 bg-black/40 px-1.5 py-0.5 font-mono text-[0.85em] text-[#CFE0EC] ${className ?? ""}`}
    >
      {children}
    </code>
  ),
  table: ({ children }) => (
    <div className="my-2 overflow-x-auto rounded-xl border border-white/10">
      <table className="w-full border-collapse text-left text-xs">
        {children}
      </table>
    </div>
  ),
  th: ({ children }) => (
    <th className="border-b border-white/10 bg-white/[0.05] px-3 py-2 font-semibold text-white">
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td className="border-b border-white/[0.06] px-3 py-2 last:border-b-0">
      {children}
    </td>
  ),
};

/* -------------------------------------------------------------------------- */
/*  Component                                                                 */
/* -------------------------------------------------------------------------- */

export function PortfolioChat() {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<Status>("idle");
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: WELCOME },
  ]);

  const reduceMotion = useReducedMotion();
  const viewportVars = useChatViewportVars(open);

  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: reduceMotion ? "auto" : "smooth",
    });
  }, [messages, loading, open, reduceMotion]);

  useEffect(() => {
    // Skip auto-focus on phones: it would pop the keyboard open immediately
    // and cover the suggested questions.
    if (open && window.matchMedia("(min-width: 640px)").matches) {
      inputRef.current?.focus();
    }
  }, [open]);

  // Escape closes the dialog (expected behaviour for aria-modal).
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  // Grow the composer with its content (up to max-h-28) and reset after send.
  useEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 112)}px`;
  }, [draft, open]);

  async function send(text = draft) {
    const content = text.trim();

    if (!content || loading) return;

    const userMessage: Message = { role: "user", content };

    const history = [
      ...messages.filter(
        (message) =>
          !(message.role === "assistant" && message.content === WELCOME),
      ),
      userMessage,
    ].slice(-10);

    setMessages((previous) => [...previous, userMessage]);
    setDraft("");
    setLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history }),
      });

      const data = (await response.json()) as {
        reply?: string;
        error?: string;
      };

      if (!response.ok || !data.reply) {
        throw new Error(data.error || "Something went wrong.");
      }

      setStatus("ok");
      setMessages((previous) => [
        ...previous,
        { role: "assistant", content: data.reply! },
      ]);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Please try again in a moment.";

      setStatus("error");
      setMessages((previous) => [
        ...previous,
        {
          role: "assistant",
          content: `${message} You can send your question again.`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  // Restrained spring + a little perspective; opacity-only for reduced motion.
  const panelMotion = reduceMotion
    ? {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
        transition: { duration: 0.15 },
      }
    : {
        initial: { opacity: 0, y: 24, scale: 0.96, rotateX: 4 },
        animate: { opacity: 1, y: 0, scale: 1, rotateX: 0 },
        exit: { opacity: 0, y: 12, scale: 0.98, rotateX: -2 },
        transition: {
          type: "spring" as const,
          stiffness: 260,
          damping: 26,
          mass: 0.8,
          opacity: { duration: 0.2 },
        },
      };

  const statusKey = loading ? "loading" : status;

  return (
    <>
      <AnimatePresence>
        {!open && (
          <motion.button
            type="button"
            onClick={() => setOpen(true)}
            initial={{ opacity: 0, y: reduceMotion ? 0 : 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: reduceMotion ? 0 : 12 }}
                  {...(reduceMotion
                    ? {}
                    : { whileHover: { y: -3, scale: 1.02 }, whileTap: { scale: 0.97 } })}
                  className={`fixed bottom-[max(1.25rem,env(safe-area-inset-bottom))] right-[max(1.25rem,env(safe-area-inset-right))] z-[80] inline-flex items-center gap-2.5 rounded-full border border-white/[0.16] border-t-white/[0.3] bg-[linear-gradient(145deg,rgba(46,52,58,0.94),rgba(16,18,21,0.96))] py-2.5 pl-2.5 pr-5 text-sm font-medium tracking-tight text-[#E3ECF3] shadow-[0_14px_38px_rgba(0,0,0,0.5),0_0_28px_rgba(190,215,235,0.1),inset_0_1px_0_rgba(255,255,255,0.16)] backdrop-blur-sm transition-[border-color,box-shadow] duration-300 hover:border-white/30 hover:shadow-[0_18px_44px_rgba(0,0,0,0.55),0_0_34px_rgba(120,200,240,0.2),inset_0_1px_0_rgba(255,255,255,0.2)] sm:bottom-7 sm:right-7 ${FOCUS_RING}`}
                  aria-label="Open Areeb AI chat"
                >
            <span
              aria-hidden="true"
              className="grid size-8 place-items-center rounded-full border border-white/[0.14] bg-gradient-to-br from-white/[0.18] to-white/[0.03] text-cyan-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.18)]"
            >
              <Sparkles size={16} />
            </span>
            Ask Areeb AI
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop: light dim only, so the globe and hero stay visible. */}
            <motion.button
              type="button"
              tabIndex={-1}
              aria-label="Close chat backdrop"
              className="fixed inset-0 z-[90] cursor-default bg-black/25 sm:bg-black/10"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
            />

            <motion.section
              role="dialog"
              aria-modal="true"
              aria-labelledby="areeb-chat-title"
              initial={panelMotion.initial}
              animate={panelMotion.animate}
              exit={panelMotion.exit}
              transition={panelMotion.transition}
              style={{
                              ...Object.fromEntries(
                                Object.entries(viewportVars).filter(([, v]) => v !== undefined),
                              ),
                              transformPerspective: 1200,
                              transformOrigin: "100% 100%",
                            }}
              className={PANEL_CLASS}
            >
              <header className="relative flex items-center justify-between gap-3 border-b border-white/[0.07] bg-gradient-to-b from-white/[0.045] to-transparent px-5 py-3.5 sm:py-4">              <div className="flex min-w-0 items-center gap-3.5">
                  <div className="relative grid size-12 shrink-0 place-items-center rounded-2xl border border-white/[0.16] border-t-white/[0.3] bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.22),rgba(255,255,255,0.05)_55%,rgba(0,0,0,0.3))] text-[#E6EFF5] shadow-[0_6px_20px_rgba(0,0,0,0.35),0_0_22px_rgba(120,190,235,0.16),inset_0_1px_0_rgba(255,255,255,0.2),inset_0_-6px_12px_rgba(0,0,0,0.25)]">
                    <Bot size={22} strokeWidth={1.75} />
                  </div>
                  <div className="min-w-0">
                    <h2
                      id="areeb-chat-title"
                      className="text-[17px] font-semibold leading-tight tracking-tight text-white"
                    >
                      Areeb AI
                    </h2>
                    <p className="mt-1 flex items-center gap-2 text-xs text-white/50">
                      <span
                        aria-hidden="true"
                        className={`size-1.5 shrink-0 rounded-full transition-colors ${STATUS_DOT[statusKey]}`}
                      />
                      <span className="truncate">
                        Portfolio assistant
                      </span>
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label="Close chat"
                  className={`grid size-10 shrink-0 place-items-center rounded-full border border-white/[0.14] bg-white/[0.05] text-white/70 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)] transition duration-200 hover:border-white/30 hover:bg-white/[0.1] hover:text-white hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.14),0_0_16px_rgba(190,215,235,0.12)] active:scale-95 ${FOCUS_RING}`}
                >
                  <X size={18} />
                </button>
              </header>

              <div
                className="min-h-0 flex-1 space-y-3.5 overflow-y-auto overscroll-contain px-4 py-5 [scrollbar-color:rgba(190,205,218,0.22)_transparent] [scrollbar-width:thin] sm:space-y-4 sm:px-5"
                aria-live="polite"
                aria-relevant="additions"
              >
                {messages.map((message, index) => (
                  <motion.div
                    key={`${index}-${message.role}`}
                    initial={reduceMotion ? false : { opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25, ease: "easeOut" }}
                    className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`min-w-0 max-w-[88%] break-words [overflow-wrap:anywhere] rounded-[14px] border border-t-white/[0.2] px-4 py-3 text-sm leading-relaxed ${
                        message.role === "user"
                          ? "rounded-br-md border-white/[0.18] bg-gradient-to-br from-[#8b97a2]/[0.38] to-[#3b434b]/[0.5] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.14),0_10px_24px_rgba(0,0,0,0.28)]"
                          : "rounded-bl-md border-white/[0.1] bg-gradient-to-br from-[#252a2f]/95 to-[#14171a]/95 text-[#DCE6EE] shadow-[inset_0_1px_0_rgba(255,255,255,0.07),0_10px_26px_rgba(0,0,0,0.3)]"
                      }`}
                    >
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={markdownComponents}
                      >
                        {message.content}
                      </ReactMarkdown>
                    </div>
                  </motion.div>
                ))}

                {messages.length === 1 && (
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {SUGGESTIONS.map(({ text, icon: Icon }) => (
                      <button
                        type="button"
                        key={text}
                        disabled={loading}
                        onClick={() => void send(text)}
                        className={CHIP_CLASS}
                      >
                        <Icon
                          size={14}
                          aria-hidden="true"
                          className="shrink-0 text-cyan-100/70"
                        />
                        {text}
                      </button>
                    ))}
                  </div>
                )}

                {loading && (
                  <div
                    role="status"
                    className="inline-flex items-center gap-2 rounded-full border border-white/[0.1] bg-white/[0.04] px-3 py-1.5 text-xs text-white/60"
                  >
                    <LoaderCircle
                      size={15}
                      className="animate-spin text-cyan-200/80"
                    />
                    Thinking...
                  </div>
                )}

                <div ref={bottomRef} />
              </div>

              <form
               className="border-t border-white/[0.07] bg-gradient-to-t from-black/50 to-black/20 p-3 sm:p-4"
                onSubmit={(event) => {
                  event.preventDefault();
                  void send();
                }}
              >
                <div className="flex items-end gap-2 rounded-[14px] border border-white/[0.14] border-b-white/[0.2] bg-gradient-to-b from-black/45 to-black/25 p-2 shadow-[inset_0_2px_10px_rgba(0,0,0,0.55),0_1px_0_rgba(255,255,255,0.05)] transition-[border-color,box-shadow] duration-200 focus-within:border-cyan-200/35 focus-within:shadow-[inset_0_2px_10px_rgba(0,0,0,0.55),0_0_0_2px_rgba(120,190,235,0.05),0_0_14px_rgba(90,175,225,0.07)]">
                  <textarea
                    ref={inputRef}
                    value={draft}
                    onChange={(event) => setDraft(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" && !event.shiftKey) {
                        event.preventDefault();
                        void send();
                      }
                    }}
                    placeholder="Ask me about Areeb..."
                    aria-label="Your message"
                    rows={1}
                    maxLength={2000}
                    className="max-h-28 min-h-10 flex-1 resize-none overflow-y-auto bg-transparent px-2.5 py-2.5 text-base text-white outline-none placeholder:text-white/40 sm:text-sm"
                  />

                  <button
                    type="submit"
                    disabled={loading || !draft.trim()}
                    aria-label="Send message"
                    className={`grid size-11 shrink-0 place-items-center rounded-2xl border border-cyan-100/25 border-t-white/[0.35] bg-[linear-gradient(145deg,rgba(210,230,245,0.3),rgba(90,150,190,0.2)_55%,rgba(40,70,95,0.32))] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.3),0_6px_16px_rgba(0,0,0,0.35),0_0_14px_rgba(90,180,235,0.14)] transition duration-200 hover:-translate-y-0.5 hover:border-cyan-100/45 hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.35),0_8px_20px_rgba(0,0,0,0.4),0_0_26px_rgba(100,195,240,0.32)] active:translate-y-0 active:scale-95 disabled:cursor-not-allowed disabled:opacity-35 disabled:shadow-none disabled:hover:translate-y-0 motion-reduce:transition-none motion-reduce:hover:translate-y-0 ${FOCUS_RING}`}
                  >
                    {loading ? (
                      <LoaderCircle size={18} className="animate-spin" />
                    ) : (
                      <Send size={18} />
                    )}
                  </button>
                </div>

                <p className="px-1 pt-2 text-center text-[11px] text-white/45">
                  AI responses can be inaccurate. Verify important details.
                </p>
              </form>
            </motion.section>
          </>
        )}
      </AnimatePresence>
    </>
  );
}