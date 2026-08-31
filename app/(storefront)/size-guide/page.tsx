import { Metadata } from "next";

export const metadata: Metadata = { title: "Size Guide", description: "AURELIN & CO. size guide for shirts and garments." };

export default function SizeGuidePage() {
  return (
    <div className="container-luxury py-16 md:py-24">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <p className="mb-3" style={{ fontFamily: "var(--font-inter)", fontSize: "0.625rem", letterSpacing: "0.22em", textTransform: "uppercase", color: "#B9A77A" }}>MEASUREMENTS</p>
          <h1 style={{ fontFamily: "var(--font-cormorant)", fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: 400, color: "#172744" }}>Size Guide</h1>
        </div>
        <div className="w-8 h-px mb-10 mx-auto" style={{ backgroundColor: "#B9A77A" }} />
        <p className="mb-10 text-center opacity-60" style={{ fontFamily: "var(--font-inter)", fontSize: "0.9375rem", lineHeight: 1.8 }}>
          All measurements are in centimetres. For the best fit, we recommend measuring yourself and comparing against the chart below.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr style={{ borderBottom: "1px solid #D8C8AF40" }}>
                {["Size", "Chest", "Shoulder", "Sleeve", "Length"].map((h) => (
                  <th key={h} className="py-3 px-4 text-left" style={{ fontFamily: "var(--font-inter)", fontSize: "0.5625rem", letterSpacing: "0.16em", textTransform: "uppercase", color: "#172744", opacity: 0.5 }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                ["XS", "86–89", "41–42", "60–61", "71"],
                ["S", "90–93", "42–43", "61–62", "72"],
                ["M", "94–97", "44–45", "62–63", "73"],
                ["L", "98–101", "46–47", "63–64", "74"],
                ["XL", "102–105", "48–49", "64–65", "75"],
                ["XXL", "106–111", "50–52", "65–66", "76"],
              ].map((row) => (
                <tr key={row[0]} className="border-b" style={{ borderColor: "#D8C8AF20" }}>
                  {row.map((cell, i) => (
                    <td key={i} className="py-4 px-4" style={{ fontFamily: "var(--font-inter)", fontSize: "0.875rem", color: i === 0 ? "#172744" : "#242424", fontWeight: i === 0 ? 600 : 300, opacity: i === 0 ? 1 : 0.7 }}>
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-8 opacity-50 text-center" style={{ fontFamily: "var(--font-inter)", fontSize: "0.8125rem" }}>
          Between sizes? We recommend sizing up. Contact our WhatsApp concierge for personal guidance.
        </p>
      </div>
    </div>
  );
}
