export { authService } from "./auth";
export * from "./repositories";

// Payment
export { paymentService } from "./paymentService";
export type {
  PaymentMethod,
  PaymentStatus,
  PaymentRequest,
  PaymentResult,
  RefundRequest,
  IPaymentProvider,
} from "./payment/types";
export { ShopnoWalletProvider } from "./payment/shopnoWallet";

// AI — core
export {
  tripPlannerService,
  budgetPlannerService,
  conciergeService,
  routePlannerService,
  travelAssistantService,
} from "./ai";

// AI — extensions
export {
  destinationFinderService,
  packageRecommendationService,
  weatherAssistantService,
  scamDetectionService,
  reviewAnalyzerService,
  groupMatcherService,
} from "./ai/aiExtensions";

export type {
  TripPlanRequest,
  TripPlan,
  TripDay,
  BudgetPlanRequest,
  BudgetPlan,
  BudgetCategory,
  ConciergeRequest,
  ConciergeResponse,
  RoutePlanRequest,
  RoutePlan,
  RouteSegment,
  AssistantMessage,
  AssistantSession,
  DestinationFinderRequest,
  DestinationSuggestion,
  PackageRecommendationRequest,
  PackageRecommendation,
  WeatherQuery,
  WeatherForecast,
  ScamDetectionRequest,
  ScamAnalysis,
  ReviewAnalysisRequest,
  ReviewAnalysis,
  GroupMatchRequest,
  GroupMatch,
} from "./ai/aiExtensions";
