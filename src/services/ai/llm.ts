import type { AIProvider, AIResponse, ChatMessage } from "./types";

const OPENAI_API_KEY = process.env.EXPO_PUBLIC_OPENAI_API_KEY ?? "";
const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY ?? "";
const AI_PROVIDER = (process.env.EXPO_PUBLIC_AI_PROVIDER ??
  "openai") as AIProvider;

const OPENAI_MODEL = "gpt-4o-mini";
const GEMINI_MODEL = "gemini-1.5-flash";

async function callOpenAI(
  messages: ChatMessage[],
  temperature = 0.7,
): Promise<AIResponse> {
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({ model: OPENAI_MODEL, messages, temperature }),
  });

  if (!res.ok)
    throw new Error(`OpenAI error: ${res.status} ${await res.text()}`);

  const json = await res.json();
  const raw: string = json.choices?.[0]?.message?.content ?? "";
  return {
    data: raw,
    raw,
    provider: "openai",
    tokensUsed: json.usage?.total_tokens,
  };
}

async function callGemini(
  messages: ChatMessage[],
  temperature = 0.7,
): Promise<AIResponse> {
  // Convert ChatMessage[] → Gemini contents format
  const contents = messages
    .filter((m) => m.role !== "system")
    .map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));

  const systemInstruction = messages.find((m) => m.role === "system")?.content;

  const body: Record<string, unknown> = {
    contents,
    generationConfig: { temperature, maxOutputTokens: 2048 },
  };
  if (systemInstruction)
    body.systemInstruction = { parts: [{ text: systemInstruction }] };

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok)
    throw new Error(`Gemini error: ${res.status} ${await res.text()}`);

  const json = await res.json();
  const raw: string = json.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
  return { data: raw, raw, provider: "gemini" };
}

export async function chat(
  messages: ChatMessage[],
  temperature = 0.7,
): Promise<AIResponse> {
  return AI_PROVIDER === "gemini"
    ? callGemini(messages, temperature)
    : callOpenAI(messages, temperature);
}

/** Parse JSON from an LLM response — strips markdown fences if present */
export function parseJSON<T>(raw: string): T {
  const cleaned = raw
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/```\s*$/, "")
    .trim();
  return JSON.parse(cleaned) as T;
}
