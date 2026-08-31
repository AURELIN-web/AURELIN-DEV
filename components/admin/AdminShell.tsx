"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard, Package, FolderOpen, Grid3X3, ShoppingCart, Users,
  Image, Home, Film, Megaphone, BookOpen, MessageCircle,
  Tag, Settings, LogOut, ExternalLink, Menu, X
} from "lucide-react";

const navGroups = [
  {
    label: "OVERVIEW",
    items: [
      { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
    ],
  },
  {
    label: "CATALOGUE",
    items: [
      { href: "/admin/products", label: "Products", icon: Package },
      { href: "/admin/categories", label: "Categories", icon: FolderOpen },
      { href: "/admin/collections", label: "Collections", icon: Grid3X3 },
    ],
  },
  {
    label: "SALES & CLIENTS",
    items: [
      { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
      { href: "/admin/customers", label: "Customers", icon: Users },
      { href: "/admin/discounts", label: "Discounts", icon: Tag },
    ],
  },
  {
    label: "STOREFRONT & CMS",
    items: [
      { href: "/admin/homepage", label: "Homepage CMS", icon: Home },
      { href: "/admin/hero", label: "Hero Video & Banners", icon: Film },
      { href: "/admin/journal", label: "Journal Stories", icon: BookOpen },
    ],
  },
  {
    label: "SYSTEM & MEDIA",
    items: [
      { href: "/admin/media", label: "Media Library (Cloudinary)", icon: Image },
      { href: "/admin/whatsapp", label: "WhatsApp Concierge", icon: MessageCircle },
      { href: "/admin/settings", label: "Site Settings", icon: Settings },
    ],
  },
];

export default function AdminShell({
  children,
  adminName,
}: {
  children: React.ReactNode;
  adminName: string;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const handleSignOut = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  };

  const getPageTitle = () => {
    for (const group of navGroups) {
      for (const item of group.items) {
        if (pathname === item.href || (item.href !== "/admin/dashboard" && pathname.startsWith(item.href + "/"))) {
          return item.label;
        }
      }
    }
    return "Admin Portal";
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-[#101C32] text-[#F8F6F0] select-none border-r border-[#172744]">
      {/* Brand Header */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-white/10 flex-shrink-0 bg-[#0C1626]">
        <div>
          <p
            style={{
              fontFamily: "var(--font-cormorant)",
              fontSize: "1.375rem",
              fontWeight: 500,
              color: "#F8F6F0",
              letterSpacing: "0.08em",
              lineHeight: 1,
            }}
          >
            AURELIN & CO.
          </p>
          <p
            className="text-[#B9A77A] uppercase mt-1 tracking-widest font-medium"
            style={{ fontFamily: "var(--font-inter)", fontSize: "0.5625rem" }}
          >
            MAISON ATELIER ADMIN
          </p>
        </div>

        <button
          onClick={() => setMobileOpen(false)}
          className="md:hidden p-1.5 text-beige/60 hover:text-ivory"
        >
          <X size={18} />
        </button>
      </div>

      {/* Nav List */}
      <nav className="flex-1 overflow-y-auto py-5 px-3 space-y-6 custom-scrollbar">
        {navGroups.map((group) => (
          <div key={group.label}>
            <p
              className="px-3 mb-2 text-[#B9A77A] font-semibold uppercase tracking-widest opacity-80"
              style={{ fontFamily: "var(--font-inter)", fontSize: "0.5625rem" }}
            >
              {group.label}
            </p>
            <div className="space-y-1">
              {group.items.map((item) => {
                const Icon = item.icon;
                const active = pathname === item.href || (item.href !== "/admin/dashboard" && pathname.startsWith(item.href + "/"));

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-sm transition-all duration-150 ${
                      active
                        ? "bg-white/10 text-[#F8F6F0] font-semibold border-l-2 border-[#B9A77A]"
                        : "text-[#D8C8AF]/70 hover:text-[#F8F6F0] hover:bg-white/5"
                    }`}
                  >
                    <Icon size={16} className={`flex-shrink-0 ${active ? "text-[#B9A77A]" : "text-[#D8C8AF]/60"}`} />
                    <span style={{ fontFamily: "var(--font-inter)", fontSize: "0.8125rem" }}>
                      {item.label}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer Actions */}
      <div className="border-t border-white/10 p-3 space-y-1.5 flex-shrink-0 bg-[#0C1626]">
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 px-3 py-2 rounded-sm text-[#D8C8AF]/70 hover:text-[#F8F6F0] hover:bg-white/5 transition-colors text-xs"
          style={{ fontFamily: "var(--font-inter)" }}
        >
          <ExternalLink size={14} className="flex-shrink-0 text-[#B9A77A]" />
          <span>Live Storefront ↗</span>
        </a>

        <button
          onClick={handleSignOut}
          className="flex items-center gap-3 px-3 py-2 rounded-sm text-[#D8C8AF]/70 hover:text-red-400 hover:bg-red-500/10 transition-colors w-full text-xs text-left"
          style={{ fontFamily: "var(--font-inter)" }}
        >
          <LogOut size={14} className="flex-shrink-0" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden" style={{ backgroundColor: "#F8F6F0" }}>
      {/* Desktop Sidebar (Permanent, Always Visible with Full Labels) */}
      <aside className="hidden md:flex flex-col flex-shrink-0 w-64 shadow-xl z-20">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Backdrop & Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-[#101C32]/70 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileOpen(false)}
          />
          <div className="relative w-4/5 max-w-xs h-full z-10 shadow-2xl">
            {sidebarContent}
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Modern Clean Top Header */}
        <header
          className="flex items-center justify-between px-6 md:px-8 py-4 border-b flex-shrink-0 z-10"
          style={{ backgroundColor: "#FFFFFF", borderColor: "#D8C8AF40" }}
        >
          <div className="flex items-center gap-3">
            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileOpen(true)}
              className="md:hidden p-2 text-[#172744] hover:bg-[#F8F6F0] rounded"
              aria-label="Open navigation menu"
            >
              <Menu size={22} />
            </button>

            <div>
              <h1
                style={{
                  fontFamily: "var(--font-cormorant)",
                  fontSize: "1.5rem",
                  fontWeight: 500,
                  color: "#172744",
                  lineHeight: 1.1,
                }}
              >
                {getPageTitle()}
              </h1>
              <p className="text-xs text-charcoal/40 hidden sm:block mt-0.5" style={{ fontFamily: "var(--font-inter)" }}>
                AURELIN & CO. Management Portal
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Live Store Pill */}
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[#D8C8AF] text-[#172744] hover:border-[#172744] hover:bg-[#F8F6F0] text-xs font-medium transition-all"
              style={{ fontFamily: "var(--font-inter)", fontSize: "0.6875rem" }}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Store Active ↗
            </a>

            {/* Admin Profile Pill */}
            <div className="flex items-center gap-2.5 pl-3 border-l border-[#D8C8AF]/60">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-[#F8F6F0] font-semibold shadow-xs"
                style={{
                  backgroundColor: "#172744",
                  fontFamily: "var(--font-inter)",
                  fontSize: "0.75rem",
                }}
              >
                {adminName.charAt(0).toUpperCase()}
              </div>
              <div className="hidden lg:block text-left">
                <p className="text-xs font-semibold text-[#172744] leading-none" style={{ fontFamily: "var(--font-inter)" }}>
                  {adminName}
                </p>
                <p className="text-[10px] text-charcoal/50 uppercase tracking-wider mt-0.5" style={{ fontFamily: "var(--font-inter)" }}>
                  Store Owner
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content Viewport */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
