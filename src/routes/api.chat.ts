
import { createFileRoute } from "@tanstack/react-router";
import process from "node:process";

const SYSTEM_PROMPT = `
You are Areeb AI, the friendly, conversational portfolio assistant for Mohd Areeb Ansari.

Answer questions about Areeb using only the profile below. Be helpful,
professional, natural, and concise. Never invent qualifications,
employment, achievements, metrics, or experience. If information is
missing, say that it is not listed in the portfolio.

PROFILE
- Focus: Data Science, Data Analytics, AI and Machine Learning.
- Technical skills include Python, SQL, MySQL, Power BI, Excel,
  NumPy, Pandas, Scikit-learn, Streamlit, and AI APIs.
- Web technologies used in the portfolio include React, TypeScript,
  TanStack Start, Vite, Tailwind CSS, Framer Motion, and Three.js.

LINKS AND ACTIONS
- When recommending a project or contact method, provide the relevant
  link using Markdown format: [View RetainAI](https://retainai-churn-intelligence.streamlit.app/)
- Prefer one to three relevant links instead of dumping every URL.
- Give each link a short, descriptive action label, such as
  [View GitHub Projects](https://github.com/MdAreeb01)
  or [Connect on LinkedIn](https://www.linkedin.com/in/mohd-areeb1201).
- Never invent URLs. Use only verified links from the profile.

PROJECTS
1. RetainAI — Churn Intelligence:
   https://retainai-churn-intelligence.streamlit.app/
2. Travel Management Analysis Dashboard:
   https://github.com/MdAreeb01/Travel-Management-Analysis-
3. Human Resource Analysis Dashboard:
   https://github.com/MdAreeb01/Human-Resource-Analysis

LINKS
- Portfolio: https://its-areebarchives.vercel.app/
- GitHub: https://github.com/MdAreeb01
- LinkedIn: https://www.linkedin.com/in/mohd-areeb1201
- Instagram: https://www.instagram.com/__areeb_28_/

Help visitors learn about Areeb's projects, skills, and ways to connect.
For unrelated questions, you may answer briefly, then guide the visitor
back to Areeb's portfolio. Do not claim to be Areeb himself.
`;

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const apiKey = process.env["NVIDIA_API_KEY"];

        if (!apiKey) {
          return Response.json(
            { error: "The AI assistant is not configured yet." },
            { status: 503 },
          );
        }

        let body: { messages?: unknown };

        try {
          body = await request.json();
        } catch {
          return Response.json(
            { error: "Invalid request body." },
            { status: 400 },
          );
        }

        if (!Array.isArray(body.messages)) {
          return Response.json(
            { error: "Please send a valid chat message." },
            { status: 400 },
          );
        }

        const messages = body.messages as ChatMessage[];

        if (
          messages.length === 0 ||
          messages.length > 10 ||
          messages.some(
            (message) =>
              !message ||
              !["user", "assistant"].includes(message.role) ||
              typeof message.content !== "string" ||
              message.content.length > 2000,
          )
        ) {
          return Response.json(
            { error: "The conversation is invalid or too long." },
            { status: 400 },
          );
        }

        try {
          const upstream = await fetch(
            "https://integrate.api.nvidia.com/v1/chat/completions",
            {
              method: "POST",
              headers: {
                Authorization: `Bearer ${apiKey}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                model: "nvidia/nemotron-3-ultra-550b-a55b",
                messages: [
                  { role: "system", content: SYSTEM_PROMPT },
                  ...messages,
                ],
                temperature: 0.4,
                max_tokens: 700,
              }),
              signal: AbortSignal.timeout(45000),
            },
          );

          if (!upstream.ok) {
            if (upstream.status === 429) {
              return Response.json(
                { error: "The AI is busy. Please try again shortly." },
                { status: 429 },
              );
            }

            if (upstream.status === 503) {
              return Response.json(
                { 
                  error: 
                    "The AI service is temporarily overloaded. Please try again in a moment.",
                  retryable: true,
                },
                { status: 503 },
              );
            }

            console.error("NVIDIA chat request failed:", upstream.status);

            return Response.json(
              { error: "The AI could not respond right now. Please try again." },
              { status: 502 },
            );
          }

          const data = (await upstream.json()) as {
            choices?: Array<{ message?: { content?: string } }>;
          };

          const reply = data.choices?.[0]?.message?.content;

          if (typeof reply !== "string" || !reply.trim()) {
            return Response.json(
              { error: "The AI returned an empty response. Please try again." },
              { status: 502 },
            );
          }

          return Response.json({ reply });
        } catch {
          return Response.json(
            { error: "Connection timed out. Please try again." },
            { status: 504 },
          );
        }
      },
    },
  },
});
