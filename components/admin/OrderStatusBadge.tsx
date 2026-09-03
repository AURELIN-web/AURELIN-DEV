interface Props {
  status: string;
  type: "order" | "payment";
}

const ORDER_COLORS: Record<string, { bg: string; color: string }> = {
  pending:    { bg: "#D8C8AF30", color: "#242424" },
  confirmed:  { bg: "#17274415", color: "#172744" },
  processing: { bg: "#17274420", color: "#172744" },
  packed:     { bg: "#B9A77A20", color: "#172744" },
  shipped:    { bg: "#B9A77A30", color: "#172744" },
  delivered:  { bg: "#10B98120", color: "#047857" },
  completed:  { bg: "#10B98120", color: "#047857" },
  cancelled:  { bg: "#24242415", color: "#242424" },
  returned:   { bg: "#24242415", color: "#242424" },
};

const PAYMENT_COLORS: Record<string, { bg: string; color: string }> = {
  pending:  { bg: "#D8C8AF30", color: "#242424" },
  paid:     { bg: "#17274420", color: "#172744" },
  failed:   { bg: "#24242415", color: "#242424" },
  refunded: { bg: "#B9A77A20", color: "#172744" },
};

export default function OrderStatusBadge({ status, type }: Props) {
  const colors = type === "order" ? ORDER_COLORS[status] : PAYMENT_COLORS[status];
  const style = colors || { bg: "#D8C8AF30", color: "#242424" };

  return (
    <span
      className="inline-block px-2.5 py-1 rounded-full"
      style={{
        fontFamily: "var(--font-inter)",
        fontSize: "0.5625rem",
        letterSpacing: "0.12em",
        textTransform: "uppercase",
        backgroundColor: style.bg,
        color: style.color,
        fontWeight: 600,
      }}
    >
      {status}
    </span>
  );
}
