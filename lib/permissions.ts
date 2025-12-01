export type PlanType = "free" | "pro" | "enterprise";

// Plan hierarchy for access control
const PLAN_HIERARCHY: Record<PlanType, number> = {
  free: 0,
  pro: 1,
  enterprise: 2,
};

/**
 * Check if a user has the required plan level.
 * Throws an error if the user's plan is insufficient.
 *
 * @param userId - The ID of the user to check
 * @param requiredPlan - The minimum plan required for access
 * @throws Error if the user doesn't have the required plan
 */
export async function requirePlan(
  userId: string,
  requiredPlan: PlanType
): Promise<void> {
  // In a real implementation, this would fetch the user's plan from a database
  // For now, we simulate fetching the user's plan
  const userPlan = await getUserPlan(userId);

  if (PLAN_HIERARCHY[userPlan] < PLAN_HIERARCHY[requiredPlan]) {
    throw new Error(
      `Plan upgrade required. You need a "${requiredPlan}" plan or higher to access this feature.`
    );
  }
}

/**
 * Get the user's current plan.
 * In a real implementation, this would fetch from a database.
 */
async function getUserPlan(userId: string): Promise<PlanType> {
  // Placeholder: In production, fetch from database
  // For now, return "free" as default
  void userId; // Acknowledge the parameter to avoid unused variable warning
  return "free";
}
