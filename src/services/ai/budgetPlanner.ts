import { chat, parseJSON } from "./llm";
import type { AIResponse, BudgetPlanRequest, BudgetPlan } from "./types";

const SYSTEM = `You are an expert travel budget analyst.
Respond ONLY with a valid JSON object matching this schema exactly:
{
  "totalBudget": number,
  "currency": string,
  "perPersonPerDay": number,
  "breakdown": [{ "category": string, "estimated": number, "percentage": number, "tips": string }],
  "savingTips": string[],
  "warnings": string[]
}`;

export const budgetPlannerService = {
  async plan(request: BudgetPlanRequest): Promise<AIResponse<BudgetPlan>> {
    const prompt = `Create a travel budget breakdown:
- Destination: ${request.destination}
- Duration: ${request.durationDays} days
- Travelers: ${request.travelers}
- Total budget: ${request.totalBudget} ${request.currency}
- Travel style: ${request.travelStyle}
- Include flights: ${request.includeFlights ?? false}
Allocate across: accommodation, food, transport, activities, shopping, emergency fund.
Provide realistic estimates and money-saving tips.`;

    const result = await chat([
      { role: "system", content: SYSTEM },
      { role: "user", content: prompt },
    ]);

    const data = parseJSON<BudgetPlan>(result.raw);
    return { ...result, data };
  },

  async estimateCost(
    destination: string,
    days: number,
    style: "budget" | "mid-range" | "luxury",
  ): Promise<string> {
    const result = await chat([
      {
        role: "system",
        content:
          "You are a travel cost expert. Reply with a single concise sentence.",
      },
      {
        role: "user",
        content: `Estimate total cost for a solo ${style} traveler in ${destination} for ${days} days in USD.`,
      },
    ]);
    return result.raw.trim();
  },
};
