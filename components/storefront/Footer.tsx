"use client";

import { useState } from "react";
import Link from "next/link";
import AurelinLogo from "./AurelinLogo";
import { FOOTER_LINKS, DEFAULT_WHATSAPP_NUMBER } from "@/config/site";
import { ChevronDown } from "lucide-react";

interface Props {
  description?: string;
  newsletterText?: string;
  whatsappNumber?: string;
}

export default function Footer({
  description = "A modern menswear house shaped by timeless silhouettes, natural fabrics and the belief that true elegance is never excessive.",
  newsletterText = "Private access to new collections, stories and seasonal edits.",
  whatsappNumber = DEFAULT_WHATSAPP_NUMBER,
}: Props) {
  const year = new Date().getFullYear();
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});

  const toggleSection = (section: string) => {
    setOpenSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  return (
    <footer style={{ backgroundColor: "#101C32", color: "#D8C8AF" }}>
      {/* Main Footer */}
      <div className="container-luxury py-12 md:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-8">
          {/* Brand Column */}
          <div className="lg:col-span-1 pb-4 md:pb-0 border-b md:border-b-0 border-[#D8C8AF15]">
            <AurelinLogo className="h-10 mb-4" style={{ filter: "brightness(0) invert(1) opacity(0.9)" }} />
            <p
              style={{
                fontFamily: "var(--font-inter)",
                fontSize: "0.8125rem",
                fontWeight: 300,
                lineHeight: 1.8,
                opacity: 0.6,
                color: "#D8C8AF",
              }}
            >
              {description}
            </p>
            {/* Social Links */}
            <div className="flex items-center gap-4 mt-5">
              <a href="#" aria-label="Instagram" className="opacity-50 hover:opacity-100 transition-opacity">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#D8C8AF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
              </a>
              <a href="#" aria-label="Facebook" className="opacity-50 hover:opacity-100 transition-opacity">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#D8C8AF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
              </a>
              <a href="#" aria-label="X / Twitter" className="opacity-50 hover:opacity-100 transition-opacity">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="#D8C8AF"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              </a>
            </div>
          </div>

          {/* Shop Links (Accordion on mobile) */}
          <div className="border-b md:border-b-0 border-[#D8C8AF15] pb-4 md:pb-0">
            <button
              type="button"
              onClick={() => toggleSection("shop")}
              className="w-full flex items-center justify-between py-2 md:py-0 md:mb-5 text-left group"
            >
              <h4
                style={{
                  fontFamily: "var(--font-inter)",
                  fontSize: "0.6875rem",
                  fontWeight: 600,
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                  color: "#F8F6F0",
                }}
              >
                SHOP
              </h4>
              <ChevronDown
                size={14}
                className={`md:hidden text-[#B9A77A] transition-transform duration-300 ${
                  openSections.shop ? "rotate-180" : ""
                }`}
              />
            </button>
            <ul
              className={`space-y-3 pt-2 md:pt-0 transition-all duration-300 ${
                openSections.shop ? "block" : "hidden md:block"
              }`}
            >
              {FOOTER_LINKS.shop.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="transition-opacity hover:opacity-100 opacity-60 text-xs md:text-[0.8125rem] font-light block py-0.5"
                    style={{ fontFamily: "var(--font-inter)" }}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* About Links (Accordion on mobile) */}
          <div className="border-b md:border-b-0 border-[#D8C8AF15] pb-4 md:pb-0">
            <button
              type="button"
              onClick={() => toggleSection("about")}
              className="w-full flex items-center justify-between py-2 md:py-0 md:mb-5 text-left group"
            >
              <h4
                style={{
                  fontFamily: "var(--font-inter)",
                  fontSize: "0.6875rem",
                  fontWeight: 600,
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                  color: "#F8F6F0",
                }}
              >
                ABOUT
              </h4>
              <ChevronDown
                size={14}
                className={`md:hidden text-[#B9A77A] transition-transform duration-300 ${
                  openSections.about ? "rotate-180" : ""
                }`}
              />
            </button>
            <ul
              className={`space-y-3 pt-2 md:pt-0 transition-all duration-300 ${
                openSections.about ? "block" : "hidden md:block"
              }`}
            >
              {FOOTER_LINKS.about.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="transition-opacity hover:opacity-100 opacity-60 text-xs md:text-[0.8125rem] font-light block py-0.5"
                    style={{ fontFamily: "var(--font-inter)" }}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Client Services (Accordion on mobile) */}
          <div className="border-b md:border-b-0 border-[#D8C8AF15] pb-4 md:pb-0">
            <button
              type="button"
              onClick={() => toggleSection("services")}
              className="w-full flex items-center justify-between py-2 md:py-0 md:mb-5 text-left group"
            >
              <h4
                style={{
                  fontFamily: "var(--font-inter)",
                  fontSize: "0.6875rem",
                  fontWeight: 600,
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                  color: "#F8F6F0",
                }}
              >
                CLIENT SERVICES
              </h4>
              <ChevronDown
                size={14}
                className={`md:hidden text-[#B9A77A] transition-transform duration-300 ${
                  openSections.services ? "rotate-180" : ""
                }`}
              />
            </button>
            <ul
              className={`space-y-3 pt-2 md:pt-0 transition-all duration-300 ${
                openSections.services ? "block" : "hidden md:block"
              }`}
            >
              {FOOTER_LINKS.clientServices.map((link) => (
                <li key={link.href}>
                  {link.href === "#whatsapp" && whatsappNumber ? (
                    <a
                      href={`https://wa.me/${whatsappNumber.replace(/\D/g, "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="transition-opacity hover:opacity-100 opacity-60 text-xs md:text-[0.8125rem] font-light block py-0.5"
                      style={{ fontFamily: "var(--font-inter)" }}
                    >
                      {link.label}
                    </a>
                  ) : (
                    <Link
                      href={link.href}
                      className="transition-opacity hover:opacity-100 opacity-60 text-xs md:text-[0.8125rem] font-light block py-0.5"
                      style={{ fontFamily: "var(--font-inter)" }}
                    >
                      {link.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div className="pt-2 md:pt-0">
            <h4
              className="mb-2"
              style={{
                fontFamily: "var(--font-inter)",
                fontSize: "0.6875rem",
                fontWeight: 600,
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                color: "#F8F6F0",
              }}
            >
              THE AURELIN LETTER
            </h4>
            <p
              className="mb-5 opacity-60 text-xs leading-relaxed font-light"
              style={{ fontFamily: "var(--font-inter)" }}
            >
              {newsletterText}
            </p>
            <form
              className="flex items-center"
              onSubmit={(e) => e.preventDefault()}
            >
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 bg-transparent border-b py-2 pr-3 outline-none placeholder-beige/40 text-xs"
                style={{
                  borderColor: "#D8C8AF40",
                  fontFamily: "var(--font-inter)",
                  color: "#D8C8AF",
                  fontWeight: 300,
                }}
              />
              <button
                type="submit"
                className="px-3 py-2 transition-opacity hover:opacity-70 opacity-100 font-bold"
                style={{ color: "#B9A77A" }}
                aria-label="Subscribe"
              >
                →
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div
        className="border-t px-6 py-6"
        style={{ borderColor: "#D8C8AF15" }}
      >
        <div className="container-luxury flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
          {/* Policy Links */}
          <div className="flex items-center gap-4">
            <Link
              href="/privacy-policy"
              className="opacity-50 hover:opacity-100 transition-opacity text-[11px] font-medium tracking-wider uppercase"
              style={{ fontFamily: "var(--font-inter)" }}
            >
              PRIVACY POLICY
            </Link>
            <span className="opacity-20 text-xs">|</span>
            <Link
              href="/terms"
              className="opacity-50 hover:opacity-100 transition-opacity text-[11px] font-medium tracking-wider uppercase"
              style={{ fontFamily: "var(--font-inter)" }}
            >
              TERMS & CONDITIONS
            </Link>
          </div>

          {/* Copyright & Ekodrix Credits */}
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3 text-center sm:text-right">
            <p
              className="opacity-40 text-[11px] tracking-wider uppercase"
              style={{ fontFamily: "var(--font-inter)" }}
            >
              © {year} AURELIN & CO.
            </p>
            <span className="hidden sm:inline opacity-20 text-xs">•</span>
            <p
              className="opacity-60 hover:opacity-100 transition-opacity text-[11px] tracking-wide"
              style={{ fontFamily: "var(--font-inter)" }}
            >
              Crafted By{" "}
              <a
                href="https://ekodrix.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#B9A77A] hover:underline font-semibold"
              >
                Ekodrix (ekodrix.com)
              </a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
