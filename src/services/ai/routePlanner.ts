import { chat, parseJSON } from "./llm";
import type { AIResponse, RoutePlanRequest, RoutePlan } from "./types";

const SYSTEM = `You are an expert travel route optimizer.
Respond ONLY with a valid JSON object matching this schema:
{
  "totalDistance": string,
  "totalDuration": string,
  "totalCost": string,
  "segments": [{
    "from": string, "to": string, "mode": string,
    "duration": string, "estimatedCost": string, "notes": string
  }],
  "alternatives": string[],
  "bestTimeToTravel": string
}`;

export const routePlannerService = {
  async plan(request: RoutePlanRequest): Promise<AIResponse<RoutePlan>> {
    const waypoints = request.waypoints?.length
      ? `Via waypoints: ${request.waypoints.join(" → ")}\n`
      : "";

    const prompt = `Plan the optimal travel route:
- Origin: ${request.origin}
- Destination: ${request.destination}
${waypoints}- Travel mode: ${request.travelMode}
${request.preferenceNotes ? `- Preferences: ${request.preferenceNotes}` : ""}
Include segment-by-segment breakdown, costs, alternatives, and best travel times.`;

    const result = await chat([
      { role: "system", content: SYSTEM },
      { role: "user", content: prompt },
    ]);

    const data = parseJSON<RoutePlan>(result.raw);
    return { ...result, data };
  },

  async compareRoutes(origin: string, destination: string): Promise<string> {
    const result = await chat([
      {
        role: "system",
        content: "You are a transport expert. Be concise and practical.",
      },
      {
        role: "user",
        content: `Compare the best ways to travel from ${origin} to ${destination}: flight, train, bus, car. 
Include cost range, duration, and comfort in 2-3 sentences each.`,
      },
    ]);
    return result.raw.trim();
  },
};
