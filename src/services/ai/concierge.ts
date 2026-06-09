import { chat, parseJSON } from "./llm";
import type { AIResponse, ConciergeRequest, ConciergeResponse } from "./types";

const SYSTEM = `You are a luxury travel concierge assistant for a travel booking app.
You help travelers with hotel recommendations, local tips, booking questions, and travel advice.
Respond ONLY with a valid JSON object:
{
  "answer": string,
  "suggestions": string[],
  "actionable": [{ "label": string, "action": string }]
}
Keep answers warm, professional, and concise.`;

export const conciergeService = {
  async ask(request: ConciergeRequest): Promise<AIResponse<ConciergeResponse>> {
    const contextBlock = Object.entries(request.context)
      .filter(([, v]) => v)
      .map(([k, v]) => `${k}: ${v}`)
      .join("\n");

    const history = request.conversationHistory ?? [];

    const result = await chat([
      { role: "system", content: SYSTEM },
      ...(contextBlock
        ? [
            {
              role: "system" as const,
              content: `Current booking context:\n${contextBlock}`,
            },
          ]
        : []),
      ...history,
      { role: "user", content: request.question },
    ]);

    const data = parseJSON<ConciergeResponse>(result.raw);
    return { ...result, data };
  },

  async getLocalTips(
    destination: string,
    category: "food" | "culture" | "safety" | "transport",
  ): Promise<string[]> {
    const result = await chat([
      {
        role: "system",
        content:
          "You are a local travel expert. Reply with a JSON array of strings only.",
      },
      {
        role: "user",
        content: `Give 6 essential ${category} tips for travelers visiting ${destination}.`,
      },
    ]);
    return parseJSON<string[]>(result.raw);
  },
};
