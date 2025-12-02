import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { plan } = body;

    if (!plan || (plan !== "pro" && plan !== "enterprise")) {
      return NextResponse.json(
        { error: "Invalid plan specified" },
        { status: 400 }
      );
    }

    // TODO: Implement actual payment gateway integration (e.g., Stripe)
    // For now, return a mock checkout URL for development/testing
    const mockCheckoutUrl = `https://mock-payment.local/${plan}`;

    return NextResponse.json({ url: mockCheckoutUrl }, { status: 200 });
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
