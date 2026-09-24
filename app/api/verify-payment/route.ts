import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

// Verifies the HMAC signature Razorpay returns after a successful checkout.
// Never trust "payment succeeded" from the client alone — always verify here.
export async function POST(req: NextRequest) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      await req.json();

    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keySecret) {
      return NextResponse.json({ error: "Razorpay not configured" }, { status: 500 });
    }

    const expected = crypto
      .createHmac("sha256", keySecret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    const valid = expected === razorpay_signature;
    return NextResponse.json({ valid });
  } catch (err) {
    return NextResponse.json({ valid: false }, { status: 500 });
  }
}
