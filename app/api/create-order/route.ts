import { NextRequest, NextResponse } from "next/server";

// Creates a Razorpay order server-side so the key SECRET never reaches the
// browser. The client then opens Razorpay Checkout with the returned
// order_id. See README "Payments (Razorpay)" for setup.
export async function POST(req: NextRequest) {
  try {
    const { amount, receipt } = (await req.json()) as {
      amount: number; // in rupees
      receipt: string;
    };

    const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
      return NextResponse.json(
        { error: "Razorpay is not configured on the server yet." },
        { status: 500 }
      );
    }

    const auth = Buffer.from(`${keyId}:${keySecret}`).toString("base64");

    const res = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: Math.round(amount * 100), // paise
        currency: "INR",
        receipt,
        payment_capture: 1,
      }),
    });

    if (!res.ok) {
      const errBody = await res.text();
      return NextResponse.json({ error: errBody }, { status: 502 });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json({ error: "Failed to create Razorpay order" }, { status: 500 });
  }
}
