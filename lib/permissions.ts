export type PlanType = "free" | "starter" | "professional" | "enterprise";

export interface PlanLimits {
  maxOpportunitiesPerDay: number;
  maxProposalsPerMonth: number;
  aiAssistEnabled: boolean;
  advancedAnalytics: boolean;
  teamMembers: number;
}

export const PLAN_LIMITS: Record<PlanType, PlanLimits> = {
  free: {
    maxOpportunitiesPerDay: 10,
    maxProposalsPerMonth: 3,
    aiAssistEnabled: false,
    advancedAnalytics: false,
    teamMembers: 1,
  },
  starter: {
    maxOpportunitiesPerDay: 50,
    maxProposalsPerMonth: 10,
    aiAssistEnabled: true,
    advancedAnalytics: false,
    teamMembers: 2,
  },
  professional: {
    maxOpportunitiesPerDay: 200,
    maxProposalsPerMonth: 50,
    aiAssistEnabled: true,
    advancedAnalytics: true,
    teamMembers: 5,
  },
  enterprise: {
    maxOpportunitiesPerDay: -1, // unlimited
    maxProposalsPerMonth: -1, // unlimited
    aiAssistEnabled: true,
    advancedAnalytics: true,
    teamMembers: -1, // unlimited
  },
};

export function getPlanLimits(plan: PlanType): PlanLimits {
  return PLAN_LIMITS[plan] || PLAN_LIMITS.free;
}

export function canAccessFeature(
  plan: PlanType,
  feature: keyof PlanLimits
): boolean {
  const limits = getPlanLimits(plan);
  const value = limits[feature];

  if (typeof value === "boolean") {
    return value;
  }

  return value !== 0;
}

export function isWithinLimit(
  plan: PlanType,
  feature: "maxOpportunitiesPerDay" | "maxProposalsPerMonth" | "teamMembers",
  currentUsage: number
): boolean {
  const limits = getPlanLimits(plan);
  const limit = limits[feature];

  if (limit === -1) return true; // unlimited
  return currentUsage < limit;
}
