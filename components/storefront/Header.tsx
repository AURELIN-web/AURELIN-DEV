"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Search, User, ShoppingBag, Menu, X, ChevronDown, MessageCircle } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { NAV_LINKS } from "@/config/site";
import CartDrawer from "./CartDrawer";
import SearchDialog from "./SearchDialog";
import AurelinLogo from "./AurelinLogo";

const navItems = [
  { label: "SHOP", href: "/shop", children: NAV_LINKS.shop },
  { label: "COLLECTIONS", href: "/collections", children: NAV_LINKS.collections },
  { label: "ABOUT", href: "/about", children: NAV_LINKS.about },
];

export default function Header({ whatsappNumber }: { whatsappNumber?: string }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { itemCount, openCart } = useCart();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setActiveDropdown(null);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Lock body scroll when mobile menu open
  useEffect(() => {
    if (isMobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isMobileOpen]);

  return (
    <>
      <header
        className={`sticky top-0 z-50 transition-all duration-300 ${
          isScrolled
            ? "bg-ivory shadow-sm"
            : "bg-ivory"
        }`}
        style={{ backgroundColor: "#F8F6F0" }}
      >
        {/* Desktop Header */}
        <div className="hidden md:flex items-center justify-between px-8 lg:px-12 h-[72px] max-w-[1440px] mx-auto">
          {/* Left Nav */}
          <nav className="flex items-center gap-8" ref={dropdownRef}>
            {navItems.map((item) => (
              <div
                key={item.label}
                className="relative"
                onMouseEnter={() => setActiveDropdown(item.label)}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                <Link
                  href={item.href}
                  className="label-uppercase text-charcoal hover:text-navy transition-colors duration-200 flex items-center gap-1"
                  style={{ fontSize: "0.6875rem", letterSpacing: "0.16em" }}
                >
                  {item.label}
                  {item.children && (
                    <ChevronDown
                      size={10}
                      className={`transition-transform duration-200 ${activeDropdown === item.label ? "rotate-180" : ""
                        }`}
                    />
                  )}
                </Link>

                {/* Dropdown */}
                {item.children && activeDropdown === item.label && (
                  <div className="absolute top-full left-0 pt-2 w-52 z-50">
                    <div className="bg-ivory border border-beige/40 shadow-lg py-3">
                      {item.children.map((child) => (
                        <Link
                          key={child.href}
                          href={child.href}
                          className="block px-5 py-2 label-uppercase text-charcoal hover:text-navy hover:bg-beige/10 transition-colors"
                          style={{ fontSize: "0.625rem", letterSpacing: "0.14em" }}
                          onClick={() => setActiveDropdown(null)}
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </nav>

          {/* Center Logo */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <Link href="/" aria-label="AURELIN & CO. — Home">
              <AurelinLogo className="h-16" />
            </Link>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-6">
            <button
              onClick={() => setIsSearchOpen(true)}
              className="label-uppercase text-charcoal hover:text-navy transition-colors duration-200 flex items-center gap-1.5"
              style={{ fontSize: "0.6875rem", letterSpacing: "0.16em" }}
              aria-label="Search"
            >
              <Search size={14} />
              SEARCH
            </button>

            <button
              onClick={openCart}
              className="label-uppercase text-charcoal hover:text-navy transition-colors duration-200 flex items-center gap-1.5 relative"
              style={{ fontSize: "0.6875rem", letterSpacing: "0.16em" }}
              aria-label={`Shopping bag, ${itemCount} items`}
            >
              <ShoppingBag size={14} />
              BAG
              {itemCount > 0 && (
                <span
                  className="absolute -top-1.5 -right-2 flex items-center justify-center rounded-full text-ivory"
                  style={{
                    width: "14px",
                    height: "14px",
                    fontSize: "0.5rem",
                    backgroundColor: "#172744",
                    letterSpacing: "0",
                  }}
                >
                  {itemCount > 9 ? "9+" : itemCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Header */}
        <div className="flex md:hidden items-center justify-between px-5 h-[60px]">
          <button
            onClick={() => setIsMobileOpen(true)}
            aria-label="Open menu"
            className="text-charcoal"
          >
            <Menu size={22} />
          </button>

          <Link href="/" className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <AurelinLogo className="h-9" />
          </Link>

          <div className="flex items-center gap-4">
            <button onClick={() => setIsSearchOpen(true)} aria-label="Search" className="text-charcoal">
              <Search size={20} />
            </button>
            <button
              onClick={openCart}
              aria-label={`Shopping bag, ${itemCount} items`}
              className="text-charcoal relative"
            >
              <ShoppingBag size={20} />
              {itemCount > 0 && (
                <span
                  className="absolute -top-1 -right-1.5 flex items-center justify-center rounded-full text-ivory"
                  style={{
                    width: "14px",
                    height: "14px",
                    fontSize: "0.5rem",
                    backgroundColor: "#172744",
                    letterSpacing: "0",
                  }}
                >
                  {itemCount > 9 ? "9+" : itemCount}
                </span>
              )}
            </button>
          </div>
        </div>

    
      </header>

      {/* Mobile Menu Overlay */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-[60] flex">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-charcoal/30 backdrop-blur-sm"
            onClick={() => setIsMobileOpen(false)}
          />

          {/* Drawer */}
          <div
            className="relative z-10 flex flex-col w-80 max-w-[85vw] h-full overflow-y-auto"
            style={{ backgroundColor: "#F8F6F0" }}
          >
            <div className="flex items-center justify-between px-6 py-5 border-b border-beige/30">
              <AurelinLogo className="h-8" />
              <button
                onClick={() => setIsMobileOpen(false)}
                aria-label="Close menu"
                className="text-charcoal"
              >
                <X size={20} />
              </button>
            </div>

            <nav className="flex-1 px-6 py-6 space-y-1">
              {navItems.map((item) => (
                <div key={item.label}>
                  <p
                    className="label-uppercase text-navy mb-3 mt-4"
                    style={{ fontSize: "0.625rem", letterSpacing: "0.2em" }}
                  >
                    {item.label}
                  </p>
                  {item.children?.map((child) => (
                    <Link
                      key={child.href}
                      href={child.href}
                      className="block py-2 text-charcoal hover:text-navy transition-colors"
                      style={{ fontSize: "0.875rem", fontFamily: "var(--font-inter)" }}
                      onClick={() => setIsMobileOpen(false)}
                    >
                      {child.label}
                    </Link>
                  ))}
                </div>
              ))}
            </nav>

            {/* Mobile footer links */}
            <div className="px-6 pb-8 border-t border-beige/30 pt-6 space-y-3">
              <Link
                href="/account"
                className="flex items-center gap-2 text-charcoal label-uppercase"
                style={{ fontSize: "0.6875rem", letterSpacing: "0.16em" }}
                onClick={() => setIsMobileOpen(false)}
              >
                <User size={14} /> ACCOUNT
              </Link>
              <Link
                href="/wishlist"
                className="flex items-center gap-2 text-charcoal label-uppercase"
                style={{ fontSize: "0.6875rem", letterSpacing: "0.16em" }}
                onClick={() => setIsMobileOpen(false)}
              >
                WISHLIST
              </Link>
              {whatsappNumber && (
                <a
                  href={`https://wa.me/${whatsappNumber.replace(/\D/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-charcoal label-uppercase"
                  style={{ fontSize: "0.6875rem", letterSpacing: "0.16em" }}
                >
                  <MessageCircle size={14} /> WHATSAPP CONCIERGE
                </a>
              )}
            </div>
          </div>
        </div>
      )}



      <CartDrawer />
      <SearchDialog isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
}
