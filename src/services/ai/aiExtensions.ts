import { chat, parseJSON } from "./llm";
import type { AIResponse } from "./types";

// ─── Destination Finder ───────────────────────────────────────────────────────
export interface DestinationFinderRequest {
  budget: number;
  currency: string;
  durationDays: number;
  interests: string[];
  departureCity: string;
  travelStyle: "budget" | "mid-range" | "luxury";
  season?: string;
}

export interface DestinationSuggestion {
  destination: string;
  country: string;
  matchScore: number;
  estimatedCost: string;
  bestFor: string[];
  highlights: string[];
  bestSeason: string;
  safetyRating: number;
}

export const destinationFinderService = {
  async find(
    req: DestinationFinderRequest,
  ): Promise<AIResponse<DestinationSuggestion[]>> {
    const result = await chat([
      {
        role: "system",
        content:
          "You are a travel destination expert. Respond ONLY with a JSON array of 5 destination objects: [{destination,country,matchScore,estimatedCost,bestFor,highlights,bestSeason,safetyRating}]",
      },
      {
        role: "user",
        content: `Find best destinations for: budget ${req.budget} ${req.currency}, ${req.durationDays} days, interests: ${req.interests.join(", ")}, from ${req.departureCity}, style: ${req.travelStyle}${req.season ? `, season: ${req.season}` : ""}`,
      },
    ]);
    return { ...result, data: parseJSON<DestinationSuggestion[]>(result.raw) };
  },
};

// ─── Package Recommendation ───────────────────────────────────────────────────
export interface PackageRecommendationRequest {
  userId?: string;
  destination?: string;
  budget: number;
  currency: string;
  travelers: number;
  travelStyle: string;
  interests: string[];
  previousDestinations?: string[];
}

export interface PackageRecommendation {
  name: string;
  destination: string;
  duration: string;
  price: string;
  includes: string[];
  highlights: string[];
  rating: number;
  matchReason: string;
}

export const packageRecommendationService = {
  async recommend(
    req: PackageRecommendationRequest,
  ): Promise<AIResponse<PackageRecommendation[]>> {
    const result = await chat([
      {
        role: "system",
        content:
          "You are a travel package specialist. Respond ONLY with a JSON array of 4 package objects: [{name,destination,duration,price,includes,highlights,rating,matchReason}]",
      },
      {
        role: "user",
        content: `Recommend travel packages: budget ${req.budget} ${req.currency}, ${req.travelers} travelers, style: ${req.travelStyle}, interests: ${req.interests.join(", ")}${req.destination ? `, destination: ${req.destination}` : ""}${req.previousDestinations?.length ? `, avoid repeating: ${req.previousDestinations.join(", ")}` : ""}`,
      },
    ]);
    return { ...result, data: parseJSON<PackageRecommendation[]>(result.raw) };
  },
};

// ─── Weather Assistant ────────────────────────────────────────────────────────
export interface WeatherQuery {
  destination: string;
  travelDate: string;
  durationDays: number;
}

export interface WeatherForecast {
  destination: string;
  period: string;
  avgTemperature: string;
  conditions: string;
  packingTips: string[];
  bestActivities: string[];
  weatherWarnings: string[];
  overallRating: "excellent" | "good" | "fair" | "poor";
}

export const weatherAssistantService = {
  async forecast(req: WeatherQuery): Promise<AIResponse<WeatherForecast>> {
    const result = await chat(
      [
        {
          role: "system",
          content:
            "You are a travel weather expert. Respond ONLY with a JSON object: {destination,period,avgTemperature,conditions,packingTips,bestActivities,weatherWarnings,overallRating}",
        },
        {
          role: "user",
          content: `Weather forecast for ${req.destination} around ${req.travelDate} for ${req.durationDays} days. Include packing tips, best activities, and any weather warnings.`,
        },
      ],
      0.5,
    );
    return { ...result, data: parseJSON<WeatherForecast>(result.raw) };
  },
};

// ─── Scam Detection ───────────────────────────────────────────────────────────
export interface ScamDetectionRequest {
  destination: string;
  scenario: string;
}

export interface ScamAnalysis {
  riskLevel: "low" | "medium" | "high" | "critical";
  isLikelyScam: boolean;
  scamType?: string;
  explanation: string;
  redFlags: string[];
  recommendations: string[];
  safeAlternatives: string[];
}

export const scamDetectionService = {
  async analyze(req: ScamDetectionRequest): Promise<AIResponse<ScamAnalysis>> {
    const result = await chat(
      [
        {
          role: "system",
          content:
            "You are a travel safety expert specializing in scam detection. Respond ONLY with JSON: {riskLevel,isLikelyScam,scamType,explanation,redFlags,recommendations,safeAlternatives}",
        },
        {
          role: "user",
          content: `Analyze this situation in ${req.destination} for potential scams: "${req.scenario}"`,
        },
      ],
      0.3,
    );
    return { ...result, data: parseJSON<ScamAnalysis>(result.raw) };
  },

  async getCommonScams(destination: string): Promise<string[]> {
    const result = await chat([
      { role: "system", content: "Reply ONLY with a JSON array of strings." },
      {
        role: "user",
        content: `List 6 most common tourist scams in ${destination} in one sentence each.`,
      },
    ]);
    return parseJSON<string[]>(result.raw);
  },
};

// ─── Review Analyzer ──────────────────────────────────────────────────────────
export interface ReviewAnalysisRequest {
  entityName: string;
  entityType: "hotel" | "tour" | "restaurant" | "destination" | "package";
  reviews: string[];
}

export interface ReviewAnalysis {
  overallSentiment:
    | "very_positive"
    | "positive"
    | "neutral"
    | "negative"
    | "very_negative";
  score: number;
  topPraises: string[];
  topComplaints: string[];
  keyThemes: string[];
  trustworthiness: number;
  summary: string;
  recommendation: string;
}

export const reviewAnalyzerService = {
  async analyze(
    req: ReviewAnalysisRequest,
  ): Promise<AIResponse<ReviewAnalysis>> {
    const reviewsText = req.reviews
      .slice(0, 10)
      .map((r, i) => `${i + 1}. "${r}"`)
      .join("\n");
    const result = await chat(
      [
        {
          role: "system",
          content:
            "You are a travel review analyst. Respond ONLY with JSON: {overallSentiment,score,topPraises,topComplaints,keyThemes,trustworthiness,summary,recommendation}",
        },
        {
          role: "user",
          content: `Analyze these ${req.entityType} reviews for "${req.entityName}":\n${reviewsText}`,
        },
      ],
      0.4,
    );
    return { ...result, data: parseJSON<ReviewAnalysis>(result.raw) };
  },
};

// ─── Group Matcher ────────────────────────────────────────────────────────────
export interface GroupMatchRequest {
  userId: string;
  destination: string;
  travelDates: string;
  interests: string[];
  travelStyle: string;
  groupSize: number;
  existingGroups: Array<{
    id: string;
    name: string;
    members: number;
    interests: string[];
    destination: string;
  }>;
}

export interface GroupMatch {
  groupId: string;
  groupName: string;
  matchScore: number;
  commonInterests: string[];
  matchReason: string;
  suggestedActivities: string[];
}

export const groupMatcherService = {
  async findMatches(req: GroupMatchRequest): Promise<AIResponse<GroupMatch[]>> {
    const groupsSummary = req.existingGroups
      .map(
        (g) =>
          `ID:${g.id} Name:"${g.name}" Members:${g.members} Dest:${g.destination} Interests:${g.interests.join(",")}`,
      )
      .join("\n");

    const result = await chat([
      {
        role: "system",
        content:
          "You are a travel group matching expert. Respond ONLY with a JSON array: [{groupId,groupName,matchScore,commonInterests,matchReason,suggestedActivities}]",
      },
      {
        role: "user",
        content: `Match traveler (destination:${req.destination}, dates:${req.travelDates}, interests:${req.interests.join(",")}, style:${req.travelStyle}) to best groups:\n${groupsSummary || "No existing groups"}`,
      },
    ]);
    return { ...result, data: parseJSON<GroupMatch[]>(result.raw) };
  },
};
