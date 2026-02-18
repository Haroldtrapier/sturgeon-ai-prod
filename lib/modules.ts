// lib/modules.ts
// Module access control for Sturgeon AI
export const MODULES = {
  DASHBOARD: 'dashboard',
  ANALYTICS: 'analytics',
  SETTINGS: 'settings',
  GOVCON: 'govcon',
  OPPORTUNITIES: 'opportunities',
  PROPOSALS: 'proposals',
  GRANTS: 'grants',
  TEAMS: 'teams',
  API_ACCESS: 'api_access',
  ADVANCED_AI: 'advanced_ai',
  MARKETING_AUTOMATION: 'marketing_automation',
  DAILY_BRIEFS: 'daily_briefs'
} as const

export type Module = typeof MODULES[keyof typeof MODULES]

interface SubscriptionPlan {
  name: string
  modules: Module[]
}

export const SUBSCRIPTION_PLANS: Record<string, SubscriptionPlan> = {
  free: {
    name: 'Free',
    modules: [
      MODULES.DASHBOARD,
      MODULES.SETTINGS,
      MODULES.OPPORTUNITIES
    ]
  },
  professional: {
    name: 'Professional',
    modules: [
      MODULES.DASHBOARD,
      MODULES.ANALYTICS,
      MODULES.SETTINGS,
      MODULES.GOVCON,
      MODULES.OPPORTUNITIES,
      MODULES.PROPOSALS,
      MODULES.GRANTS,
      MODULES.TEAMS,
      MODULES.DAILY_BRIEFS
    ]
  },
  enterprise: {
    name: 'Enterprise',
    modules: Object.values(MODULES) // All modules
  }
}

export function hasModuleAccess(
  userPlan: keyof typeof SUBSCRIPTION_PLANS,
  module: Module
): boolean {
  const plan = SUBSCRIPTION_PLANS[userPlan]
  if (!plan) return false
  return plan.modules.includes(module)
}

export function getAvailableModules(userPlan: keyof typeof SUBSCRIPTION_PLANS): Module[] {
  return SUBSCRIPTION_PLANS[userPlan]?.modules || []
}
