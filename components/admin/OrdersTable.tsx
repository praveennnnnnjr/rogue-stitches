"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import type { Order, PaymentStatus } from "@/lib/types";

const STATUS_STYLES: Record<PaymentStatus, string> = {
  paid: "border border-green-800 text-green-400",
  pending: "border border-yellow-800 text-yellow-400",
  failed: "border border-oxblood2 text-oxblood2",
};

export default function OrdersTable({
  orders,
  onStatusChange,
}: {
  orders: Order[];
  onStatusChange: (order: Order, status: PaymentStatus) => void;
}) {
  const [expanded, setExpanded] = useState<string | null>(null);

  if (orders.length === 0) {
    return (
      <div className="border border-seam bg-panel p-10 text-center text-sm text-smoke">
        No orders yet. They&apos;ll show up here the moment a customer checks out.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {orders.map((order) => {
        const isOpen = expanded === order.id;
        return (
          <div key={order.id} className="border border-seam bg-panel">
            <button
              onClick={() => setExpanded(isOpen ? null : order.id)}
              className="flex w-full items-center justify-between gap-4 px-4 py-3 text-left"
            >
              <div className="flex flex-1 flex-wrap items-center gap-x-6 gap-y-1 text-sm">
                <span className="text-bone">{order.customer_name}</span>
                <span className="text-smoke">{order.mobile_number}</span>
                <span className="text-smoke">
                  {order.created_at
                    ? new Date(order.created_at).toLocaleString("en-IN")
                    : ""}
                </span>
                <span className="font-display text-base text-bone">
                  ₹{order.total_amount.toLocaleString("en-IN")}
                </span>
                <span className={`px-2 py-0.5 text-[11px] ${STATUS_STYLES[order.payment_status]}`}>
                  {order.payment_status}
                </span>
              </div>
              {isOpen ? <ChevronUp size={16} className="text-smoke" /> : <ChevronDown size={16} className="text-smoke" />}
            </button>

            {isOpen && (
              <div className="border-t border-seam px-4 py-4 text-sm">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <p className="mb-1 text-xs text-smoke">Shipping address</p>
                    <p className="text-bone">
                      {order.address}, {order.pincode}
                    </p>
                  </div>
                  <div>
                    <p className="mb-1 text-xs text-smoke">Payment</p>
                    <p className="text-bone">
                      {order.razorpay_payment_id
                        ? `Razorpay: ${order.razorpay_payment_id}`
                        : "No payment reference (pending / COD-style order)"}
                    </p>
                  </div>
                </div>

                <div className="mt-4">
                  <p className="mb-2 text-xs text-smoke">Items</p>
                  <ul className="flex flex-col gap-1.5">
                    {order.items.map((item, idx) => (
                      <li key={idx} className="flex justify-between text-smoke">
                        <span>
                          {item.title} ({item.size}) x{item.quantity}
                        </span>
                        <span className="text-bone">
                          ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-4 flex items-center gap-2">
                  <span className="text-xs text-smoke">Mark payment as</span>
                  {(["pending", "paid", "failed"] as PaymentStatus[]).map((s) => (
                    <button
                      key={s}
                      onClick={() => onStatusChange(order, s)}
                      disabled={order.payment_status === s}
                      className={`px-2.5 py-1 text-xs ${
                        order.payment_status === s
                          ? "cursor-default border border-seam text-smoke opacity-50"
                          : "border border-seam text-bone hover:border-oxblood2"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
