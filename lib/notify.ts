import type { Order } from "./types";

/**
 * Fires an order notification to the shop owner.
 *
 * Two layers, both best-effort (a notification failure should never block
 * an order that already succeeded):
 *   1. EmailJS straight from the browser, if NEXT_PUBLIC_EMAILJS_* are set.
 *   2. POST to /api/notify, which tries SendGrid / Twilio SMS / a generic
 *      webhook server-side, whichever has credentials configured.
 */
export async function notifyOwnerOfOrder(order: Order): Promise<void> {
  const itemLines = order.items
    .map((i) => `${i.title} (${i.size}) x${i.quantity} — ₹${i.price * i.quantity}`)
    .join("\n");

  const summary = {
    order_id: order.id,
    customer_name: order.customer_name,
    mobile_number: order.mobile_number,
    address: `${order.address}, ${order.pincode}`,
    items: itemLines,
    total_amount: `₹${order.total_amount}`,
    payment_status: order.payment_status,
  };

  const serviceId = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID;
  const templateId = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID;
  const publicKey = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY;

  if (serviceId && templateId && publicKey) {
    try {
      const emailjs = (await import("@emailjs/browser")).default;
      await emailjs.send(serviceId, templateId, summary, { publicKey });
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("[notify] EmailJS send failed", err);
    }
  }

  try {
    await fetch("/api/notify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(order),
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("[notify] server notify failed", err);
  }
}
