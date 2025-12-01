import type { NextApiRequest, NextApiResponse } from "next";

type Plan = "pro" | "enterprise";

interface CheckoutRequest {
  plan: Plan;
}

interface CheckoutResponse {
  url?: string;
  error?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<CheckoutResponse>
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { plan } = req.body as CheckoutRequest;

    // Validate plan
    if (!plan || (plan !== "pro" && plan !== "enterprise")) {
      return res.status(400).json({ error: "Invalid plan" });
    }

    // In a real implementation, this would create a Stripe checkout session
    // For now, we'll return a mock URL
    const mockCheckoutUrl = `https://checkout.stripe.com/pay/${plan}`;

    return res.status(200).json({ url: mockCheckoutUrl });
  } catch (error) {
    console.error("Checkout error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
