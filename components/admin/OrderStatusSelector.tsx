"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";
import { ORDER_STATUSES, PAYMENT_STATUSES } from "@/config/site";
import { Save } from "lucide-react";

interface Props {
  orderId: string;
  initialOrderStatus: string;
  initialPaymentStatus: string;
}

export default function OrderStatusSelector({
  orderId,
  initialOrderStatus,
  initialPaymentStatus,
}: Props) {
  const [orderStatus, setOrderStatus] = useState(initialOrderStatus);
  const [paymentStatus, setPaymentStatus] = useState(initialPaymentStatus);
  const [updating, setUpdating] = useState(false);

  const handleUpdate = async () => {
    setUpdating(true);
    const supabase = createClient();
    const { error } = await supabase
      .from("orders")
      .update({
        order_status: orderStatus,
        payment_status: paymentStatus,
        updated_at: new Date().toISOString(),
      })
      .eq("id", orderId);

    if (error) {
      toast.error("Failed to update status");
    } else {
      toast.success("Order status updated");
    }
    setUpdating(false);
  };

  const labelStyle = {
    fontFamily: "var(--font-inter)",
    fontSize: "0.5625rem",
    letterSpacing: "0.16em",
    textTransform: "uppercase" as const,
    color: "#172744",
    opacity: 0.6,
  };

  return (
    <div className="p-6 bg-ivory border border-beige/40 space-y-5">
      <h2 className="label-uppercase text-navy text-xs font-semibold tracking-wider">
        ORDER STATUS
      </h2>

      <div>
        <label className="block mb-1.5" style={labelStyle}>
          Fulfillment Status
        </label>
        <select
          value={orderStatus}
          onChange={(e) => setOrderStatus(e.target.value)}
          className="w-full px-3 py-2.5 border border-beige outline-none bg-transparent text-sm capitalize"
          style={{ fontFamily: "var(--font-inter)" }}
        >
          {ORDER_STATUSES.map((status) => (
            <option key={status} value={status} className="capitalize">
              {status}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block mb-1.5" style={labelStyle}>
          Payment Status
        </label>
        <select
          value={paymentStatus}
          onChange={(e) => setPaymentStatus(e.target.value)}
          className="w-full px-3 py-2.5 border border-beige outline-none bg-transparent text-sm capitalize"
          style={{ fontFamily: "var(--font-inter)" }}
        >
          {PAYMENT_STATUSES.map((status) => (
            <option key={status} value={status} className="capitalize">
              {status}
            </option>
          ))}
        </select>
      </div>

      <button
        onClick={handleUpdate}
        disabled={updating}
        className="w-full flex items-center justify-center gap-2 py-3 bg-navy text-ivory label-uppercase text-xs tracking-wider transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        <Save size={13} /> {updating ? "UPDATING..." : "UPDATE STATUS"}
      </button>
    </div>
  );
}
