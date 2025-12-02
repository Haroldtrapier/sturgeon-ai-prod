import { prisma } from "./db";

export async function requirePlan(userId: string, required: "free" | "pro" | "enterprise") {
  const sub = await prisma.subscription.findFirst({
    where: { userId, active: true },
    orderBy: { currentPeriodEnd: "desc" },
  });

  const order = ["free", "pro", "enterprise"];
  const userPlan = sub?.plan ?? "free";

  if (order.indexOf(userPlan) < order.indexOf(required)) {
    throw new Error(`${required} plan required`);
  }
}
