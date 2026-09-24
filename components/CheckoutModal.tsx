"use client";

import { useState } from "react";
import Script from "next/script";
import { CheckCircle2, Loader2, X } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { supabase } from "@/lib/supabaseClient";
import { notifyOwnerOfOrder } from "@/lib/notify";
import type { Order, OrderItemSnapshot } from "@/lib/types";

declare global {
  interface Window {
    Razorpay: any;
  }
}

type Step = "form" | "processing" | "success" | "error";

const initialForm = {
  name: "",
  mobile: "",
  address: "",
  pincode: "",
};

export default function CheckoutModal() {
  const { items, totalPrice, isCheckoutOpen, closeCheckout, clearCart } =
    useCart();
  const [form, setForm] = useState(initialForm);
  const [touched, setTouched] = useState(false);
  const [step, setStep] = useState<Step>("form");
  const [errorMsg, setErrorMsg] = useState("");
  const [scriptReady, setScriptReady] = useState(false);
  const [placedOrderId, setPlacedOrderId] = useState<string | number | null>(null);

  if (!isCheckoutOpen) return null;

  const isValid =
    form.name.trim().length > 1 &&
    /^\d{10}$/.test(form.mobile.trim()) &&
    form.address.trim().length > 5 &&
    /^\d{6}$/.test(form.pincode.trim());

  function reset() {
    setForm(initialForm);
    setTouched(false);
    setStep("form");
    setErrorMsg("");
    setPlacedOrderId(null);
  }

  function handleClose() {
    if (step === "processing") return;
    closeCheckout();
    if (step === "success") reset();
  }

  async function saveOrder(
    paymentStatus: Order["payment_status"],
    razorpayIds?: {
      orderId?: string;
      paymentId?: string;
    }
  ): Promise<Order | null> {
    const orderItems: OrderItemSnapshot[] = items.map((i) => ({
      productId: i.productId,
      title: i.title,
      price: i.price,
      size: i.size,
      quantity: i.quantity,
    }));

    const { data, error } = await supabase
      .from("orders")
      .insert({
        customer_name: form.name.trim(),
        mobile_number: form.mobile.trim(),
        address: form.address.trim(),
        shipping_address: form.address.trim(),
        pincode: form.pincode.trim(),
        items: orderItems,
        total_amount: totalPrice,
        payment_status: paymentStatus,
        razorpay_order_id: razorpayIds?.orderId ?? null,
        razorpay_payment_id: razorpayIds?.paymentId ?? null,
      })
      .select()
      .single();

    if (error) {
      setErrorMsg(error.message);
      return null;
    }
    return data as Order;
  }

  async function handlePlaceOrder() {
    setTouched(true);
    if (!isValid || items.length === 0) return;

    setStep("processing");
    setErrorMsg("");

    const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_TexwiLgheaTkYZ";

    if (!keyId) {
      setErrorMsg("Payment gateway setup incomplete. Please add NEXT_PUBLIC_RAZORPAY_KEY_ID in .env.local");
      setStep("error");
      return;
    }

    try {
      const res = await fetch("/api/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: totalPrice,
          receipt: `rs_${Date.now()}`,
        }),
      });

      if (!res.ok) {
        setErrorMsg("Failed to initialize payment order. Check backend configuration.");
        setStep("error");
        return;
      }

      const razorpayOrder = await res.json();

      if (razorpayOrder && scriptReady && window.Razorpay) {
        const rzp = new window.Razorpay({
          key: keyId,
          amount: Math.round(totalPrice * 100),
          currency: "INR",
          name: "ROGUESTITCHES",
          description: "Order payment",
          order_id: razorpayOrder.id,
          // 1. Mobile number contact-a prefill-la irundhu remove panniyaachu
          // Idhanaala left side-la "+91 81481..." nu profile display aagadhu
          prefill: {
            name: form.name,
          },
          // 2. Readonly contact option -> auto-login display-a block pannum
          readonly: {
            contact: true,
          },
          theme: { color: "#6e0d25" },
          handler: async (response: any) => {
            const verifyRes = await fetch("/api/verify-payment", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(response),
            });
            const verify = await verifyRes.json();

            const savedOrder = await saveOrder(
              verify.valid ? "paid" : "failed",
              {
                orderId: response.razorpay_order_id,
                paymentId: response.razorpay_payment_id,
              }
            );

            if (savedOrder) {
              await notifyOwnerOfOrder(savedOrder);
              setPlacedOrderId(savedOrder.id);
              clearCart();
              setStep("success");
            } else {
              setStep("error");
            }
          },
          modal: {
            ondismiss: () => setStep("form"),
          },
        });

        rzp.on("payment.failed", async () => {
          const savedOrder = await saveOrder("failed");
          if (savedOrder) await notifyOwnerOfOrder(savedOrder);
          setErrorMsg("Payment failed. Please try again.");
          setStep("error");
        });

        rzp.open();
      } else {
        setErrorMsg("Razorpay SDK failed to load. Please refresh and try again.");
        setStep("error");
      }
    } catch (err) {
      setErrorMsg("Something went wrong placing your order. Please try again.");
      setStep("error");
    }
  }

  return (
    <>
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        onReady={() => setScriptReady(true)}
        strategy="lazyOnload"
      />

      <div className="fixed inset-0 z-[90] flex items-end justify-center sm:items-center">
        <div
          onClick={handleClose}
          className="absolute inset-0 bg-void/80 backdrop-blur-sm"
        />

        <div className="relative z-10 max-h-[92vh] w-full max-w-lg overflow-y-auto border border-seam bg-ink shadow-stitch sm:m-4">
          <div className="flex items-center justify-between border-b border-seam px-5 py-4">
            <h2 className="font-display text-xl text-bone">
              {step === "success" ? "Order Placed" : "Checkout"}
            </h2>
            <button
              onClick={handleClose}
              aria-label="Close checkout"
              className="p-1 text-smoke hover:text-bone disabled:opacity-30"
              disabled={step === "processing"}
            >
              <X size={20} />
            </button>
          </div>

          <div className="px-5 py-5">
            {step === "success" ? (
              <div className="flex flex-col items-center gap-3 py-6 text-center">
                <CheckCircle2 className="text-oxblood2" size={40} />
                <p className="text-bone">Your order is in.</p>
                <p className="text-sm text-smoke">
                  Order ID: {placedOrderId ? String(placedOrderId).slice(0, 8) : ""}
                </p>
                <p className="max-w-xs text-sm text-smoke">
                  We&apos;ll reach out on {form.mobile} to confirm delivery.
                </p>
                <button
                  onClick={handleClose}
                  className="mt-3 bg-oxblood2 px-6 py-2.5 text-sm font-medium text-bone hover:bg-oxblood"
                >
                  Continue shopping
                </button>
              </div>
            ) : (
              <>
                <ul className="mb-5 flex flex-col gap-2 border-b border-seam pb-5 text-sm">
                  {items.map((i) => (
                    <li
                      key={`${i.productId}-${i.size}`}
                      className="flex justify-between text-smoke"
                    >
                      <span>
                        {i.title} ({i.size}) x{i.quantity}
                      </span>
                      <span className="text-bone">
                        ₹{(i.price * i.quantity).toLocaleString("en-IN")}
                      </span>
                    </li>
                  ))}
                  <li className="flex justify-between pt-2 text-base">
                    <span className="text-bone">Total</span>
                    <span className="font-display text-lg text-bone">
                      ₹{totalPrice.toLocaleString("en-IN")}
                    </span>
                  </li>
                </ul>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handlePlaceOrder();
                  }}
                  className="flex flex-col gap-4"
                >
                  <Field label="Customer Name">
                    <input
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="Full name"
                      className="input"
                    />
                  </Field>
                  {touched && form.name.trim().length <= 1 && (
                    <FieldError text="Enter your name." />
                  )}

                  <Field label="Mobile Number">
                    <input
                      value={form.mobile}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          mobile: e.target.value.replace(/\D/g, "").slice(0, 10),
                        })
                      }
                      placeholder="10-digit mobile number"
                      inputMode="numeric"
                      className="input"
                    />
                  </Field>
                  {touched && !/^\d{10}$/.test(form.mobile.trim()) && (
                    <FieldError text="Enter a valid 10-digit mobile number." />
                  )}

                  <Field label="Shipping Address">
                    <textarea
                      value={form.address}
                      onChange={(e) => setForm({ ...form, address: e.target.value })}
                      placeholder="House / street / area / city / state"
                      rows={3}
                      className="input resize-none"
                    />
                  </Field>
                  {touched && form.address.trim().length <= 5 && (
                    <FieldError text="Enter your full shipping address." />
                  )}

                  <Field label="Pincode">
                    <input
                      value={form.pincode}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          pincode: e.target.value.replace(/\D/g, "").slice(0, 6),
                        })
                      }
                      placeholder="6-digit pincode"
                      inputMode="numeric"
                      className="input"
                    />
                  </Field>
                  {touched && !/^\d{6}$/.test(form.pincode.trim()) && (
                    <FieldError text="Enter a valid 6-digit pincode." />
                  )}

                  {step === "error" && errorMsg && (
                    <p className="text-sm text-oxblood2">{errorMsg}</p>
                  )}

                  <button
                    type="submit"
                    disabled={step === "processing" || items.length === 0}
                    className="mt-2 flex items-center justify-center gap-2 bg-oxblood2 py-3 text-sm font-medium text-bone transition-colors hover:bg-oxblood disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {step === "processing" && (
                      <Loader2 size={16} className="animate-spin" />
                    )}
                    {step === "processing" ? "Processing…" : "Pay & Place Order"}
                  </button>
                  <p className="text-center text-xs text-smoke">
                    Secured by Razorpay · UPI, cards &amp; netbanking
                  </p>
                </form>
              </>
            )}
          </div>
        </div>
      </div>

      <style jsx global>{`
        .input {
          width: 100%;
          background: #151217;
          border: 1px solid #2a2530;
          padding: 0.65rem 0.75rem;
          font-size: 0.875rem;
          color: #efe9e1;
        }
        .input::placeholder {
          color: #6b6570;
        }
        .input:focus {
          outline: none;
          border-color: #9c1836;
        }
      `}</style>
    </>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs text-smoke">{label}</span>
      {children}
    </label>
  );
}

function FieldError({ text }: { text: string }) {
  return <p className="-mt-3 text-xs text-oxblood2">{text}</p>;
}