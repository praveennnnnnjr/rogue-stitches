import { NextRequest, NextResponse } from "next/server";
import type { Order } from "@/lib/types";

function formatOrderText(order: Order): string {
  const itemLines = order.items
    .map((i) => `• ${i.title} (${i.size}) x${i.quantity} — ₹${i.price * i.quantity}`)
    .join("\n");

  return [
    `New ROGUESTITCHES order`,
    `Order ID: ${order.id}`,
    `Customer: ${order.customer_name}`,
    `Mobile: ${order.mobile_number}`,
    `Address: ${order.address}, ${order.pincode}`,
    ``,
    `Items:`,
    itemLines,
    ``,
    `Total: ₹${order.total_amount}`,
    `Payment status: ${order.payment_status}`,
  ].join("\n");
}

async function sendViaSendGrid(order: Order, text: string) {
  const apiKey = process.env.SENDGRID_API_KEY;
  const fromEmail = process.env.SENDGRID_FROM_EMAIL;
  const ownerEmail = process.env.OWNER_EMAIL;
  if (!apiKey || !fromEmail || !ownerEmail) return false;

  const res = await fetch("https://api.sendgrid.com/v3/mail/send", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      personalizations: [{ to: [{ email: ownerEmail }] }],
      from: { email: fromEmail, name: "ROGUESTITCHES" },
      subject: `New order #${order.id.slice(0, 8)} — ₹${order.total_amount}`,
      content: [{ type: "text/plain", value: text }],
    }),
  });
  return res.ok;
}

async function sendViaTwilio(order: Order, text: string) {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_FROM_NUMBER;
  const to = process.env.TWILIO_TO_NUMBER;
  if (!sid || !token || !from || !to) return false;

  const body = new URLSearchParams({
    From: from,
    To: to,
    // SMS has a length cap — keep it tight.
    Body: text.length > 1500 ? text.slice(0, 1490) + "…" : text,
  });

  const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
    method: "POST",
    headers: {
      Authorization: "Basic " + Buffer.from(`${sid}:${token}`).toString("base64"),
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  });
  return res.ok;
}

async function sendViaWebhook(order: Order) {
  const url = process.env.NOTIFY_WEBHOOK_URL;
  if (!url) return false;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(order),
  });
  return res.ok;
}

export async function POST(req: NextRequest) {
  try {
    const order = (await req.json()) as Order;
    const text = formatOrderText(order);

    const results = await Promise.allSettled([
      sendViaSendGrid(order, text),
      sendViaTwilio(order, text),
      sendViaWebhook(order),
    ]);

    const sentAny = results.some((r) => r.status === "fulfilled" && r.value === true);

    if (!sentAny) {
      // Not a hard error — the order itself already succeeded. Just log so
      // it's visible in server logs that no channel is configured yet.
      // eslint-disable-next-line no-console
      console.warn(
        "[notify] No notification channel is configured (SendGrid / Twilio / webhook). " +
          "Order was still saved. See .env.local.example."
      );
    }

    return NextResponse.json({ ok: true, sentAny });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("[notify] failed", err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
