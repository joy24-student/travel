// ─── Shared ──────────────────────────────────────────────────────────────────

export type AIProvider = "openai" | "gemini";

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface AIResponse<T = string> {
  data: T;
  raw: string;
  provider: AIProvider;
  tokensUsed?: number;
}

// ─── Trip Planner ─────────────────────────────────────────────────────────────

export interface TripPlanRequest {
  destination: string;
  origin: string;
  startDate: string; // ISO date
  endDate: string;
  travelers: number;
  interests: string[]; // e.g. ['culture', 'food', 'adventure']
  budget?: number;
  currency?: string;
}

export interface TripDay {
  day: number;
  date: string;
  theme: string;
  activities: Array<{
    time: string;
    activity: string;
    location: string;
    notes?: string;
  }>;
  meals: Array<{ type: "breakfast" | "lunch" | "dinner"; suggestion: string }>;
  accommodation?: string;
}

export interface TripPlan {
  title: string;
  summary: string;
  days: TripDay[];
  tips: string[];
  estimatedCost: string;
}

// ─── Budget Planner ───────────────────────────────────────────────────────────

export interface BudgetPlanRequest {
  destination: string;
  durationDays: number;
  travelers: number;
  totalBudget: number;
  currency: string;
  travelStyle: "budget" | "mid-range" | "luxury";
  includeFlights?: boolean;
}

export interface BudgetCategory {
  category: string;
  estimated: number;
  percentage: number;
  tips: string;
}

export interface BudgetPlan {
  totalBudget: number;
  currency: string;
  perPersonPerDay: number;
  breakdown: BudgetCategory[];
  savingTips: string[];
  warnings: string[];
}

// ─── Concierge ────────────────────────────────────────────────────────────────

export interface ConciergeRequest {
  context: {
    destination?: string;
    checkIn?: string;
    checkOut?: string;
    bookingReference?: string;
  };
  question: string;
  conversationHistory?: ChatMessage[];
}

export interface ConciergeResponse {
  answer: string;
  suggestions?: string[];
  actionable?: Array<{ label: string; action: string }>;
}

// ─── Route Planner ────────────────────────────────────────────────────────────

export interface RoutePlanRequest {
  origin: string;
  destination: string;
  waypoints?: string[];
  travelMode: "flight" | "train" | "bus" | "car" | "mixed";
  preferenceNotes?: string;
}

export interface RouteSegment {
  from: string;
  to: string;
  mode: string;
  duration: string;
  estimatedCost: string;
  notes: string;
}

export interface RoutePlan {
  totalDistance: string;
  totalDuration: string;
  totalCost: string;
  segments: RouteSegment[];
  alternatives: string[];
  bestTimeToTravel: string;
}

// ─── Travel Assistant ─────────────────────────────────────────────────────────

export interface AssistantMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

export interface AssistantSession {
  sessionId: string;
  userId: string;
  context: Record<string, unknown>;
  messages: AssistantMessage[];
}
