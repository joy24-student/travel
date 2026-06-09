import { chat, parseJSON } from "./llm";
import type { AIResponse, TripPlanRequest, TripPlan } from "./types";

const SYSTEM = `You are an expert travel planner. 
Respond ONLY with a valid JSON object matching this schema exactly:
{
  "title": string,
  "summary": string,
  "days": [{ "day": number, "date": string, "theme": string,
    "activities": [{ "time": string, "activity": string, "location": string, "notes": string }],
    "meals": [{ "type": "breakfast"|"lunch"|"dinner", "suggestion": string }],
    "accommodation": string }],
  "tips": string[],
  "estimatedCost": string
}`;

export const tripPlannerService = {
  async plan(request: TripPlanRequest): Promise<AIResponse<TripPlan>> {
    const duration =
      Math.ceil(
        (new Date(request.endDate).getTime() -
          new Date(request.startDate).getTime()) /
          86_400_000,
      ) || 1;

    const prompt = `Plan a ${duration}-day trip:
- Origin: ${request.origin}
- Destination: ${request.destination}
- Dates: ${request.startDate} to ${request.endDate}
- Travelers: ${request.travelers}
- Interests: ${request.interests.join(", ")}
${request.budget ? `- Budget: ${request.budget} ${request.currency ?? "USD"}` : ""}
Create a detailed day-by-day itinerary.`;

    const result = await chat([
      { role: "system", content: SYSTEM },
      { role: "user", content: prompt },
    ]);

    const data = parseJSON<TripPlan>(result.raw);
    return { ...result, data };
  },

  async suggest(destination: string, days: number): Promise<string[]> {
    const result = await chat([
      {
        role: "system",
        content:
          "You are a travel expert. Reply with a JSON array of strings only.",
      },
      {
        role: "user",
        content: `Give 8 must-do activities in ${destination} for a ${days}-day trip.`,
      },
    ]);
    return parseJSON<string[]>(result.raw);
  },
};
