import { Metadata } from "next";
import ContactFormClient from "@/components/storefront/ContactFormClient";
import { SITE_URL } from "@/config/site";

export const metadata: Metadata = {
  title: "Contact Us — WhatsApp Concierge & Support",
  description: "Get in touch with AURELIN & CO. via WhatsApp concierge, email, or phone. Our luxury styling team is available to assist with sizing, orders, and bespoke requests.",
  keywords: ["contact AURELIN & CO.", "luxury menswear customer support", "WhatsApp styling concierge", "AURELIN phone number"],
  alternates: { canonical: `${SITE_URL}/contact` },
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    url: `${SITE_URL}/contact`,
    title: "Contact Us | AURELIN & CO.",
    description: "Reach our WhatsApp concierge or styling team for any assistance.",
    siteName: "AURELIN & CO.",
    locale: "en_IN",
  },
};

export default function ContactPage() {
  return (
    <div className="container-luxury py-16 md:py-24">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-14">
          <p
            className="mb-4"
            style={{ fontFamily: "var(--font-inter)", fontSize: "0.625rem", letterSpacing: "0.22em", textTransform: "uppercase", color: "#B9A77A" }}
          >
            GET IN TOUCH
          </p>
          <h1
            style={{ fontFamily: "var(--font-cormorant)", fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: 400, color: "#172744" }}
          >
            Contact Us
          </h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-14">
          {[
            { label: "EMAIL", value: "hello@aurelinco.com", href: "mailto:hello@aurelinco.com" },
            { label: "WHATSAPP CONCIERGE", value: "+91 96450 32855", href: "https://wa.me/919645032855" },
          ].map((c) => (
            <div key={c.label} className="text-center">
              <p
                className="mb-2"
                style={{ fontFamily: "var(--font-inter)", fontSize: "0.5625rem", letterSpacing: "0.22em", textTransform: "uppercase", color: "#172744", opacity: 0.5 }}
              >
                {c.label}
              </p>
              <a
                href={c.href}
                className="hover:opacity-70 transition-opacity"
                style={{ fontFamily: "var(--font-cormorant)", fontSize: "1.125rem", color: "#172744" }}
              >
                {c.value}
              </a>
            </div>
          ))}
        </div>

        {/* Contact Form */}
        <ContactFormClient />
      </div>
    </div>
  );
}
