"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";
import { Save } from "lucide-react";
import type { AnnouncementBarSettings } from "@/types/database";

export default function AdminSettingsPage() {
  const [announcement, setAnnouncement] = useState<AnnouncementBarSettings>({
    text: "COMPLIMENTARY NATIONWIDE SHIPPING & EXCHANGES",
    bg_color: "#172744",
    text_color: "#F8F6F0",
    is_active: true,
  });
  const [footerDesc, setFooterDesc] = useState(
    "A modern menswear house shaped by timeless silhouettes, natural fabrics and the belief that true elegance is never excessive."
  );
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/admin/settings");
        const json = await res.json();
        if (json.success && json.settings) {
          if (json.settings.announcement_bar) {
            setAnnouncement(json.settings.announcement_bar as AnnouncementBarSettings);
          }
          if (json.settings.footer && (json.settings.footer as any).description) {
            setFooterDesc((json.settings.footer as any).description);
          }
        }
      } catch (e) {
        console.error(e);
      }
      setLoading(false);
    };
    load();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await Promise.all([
        fetch("/api/admin/settings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ key: "announcement_bar", value: announcement }),
        }),
        fetch("/api/admin/settings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ key: "footer", value: { description: footerDesc } }),
        }),
      ]);
      toast.success("Settings saved live to storefront!");
    } catch {
      toast.error("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const inputStyle = { fontFamily: "var(--font-inter)", fontSize: "0.9375rem", color: "#242424", borderColor: "#D8C8AF" };
  const labelStyle = { fontFamily: "var(--font-inter)", fontSize: "0.5625rem", letterSpacing: "0.16em", textTransform: "uppercase" as const, color: "#172744", opacity: 0.6 };

  if (loading) return <div className="py-20 text-center opacity-40">Loading settings...</div>;

  return (
    <div className="space-y-8 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 style={{ fontFamily: "var(--font-cormorant)", fontSize: "1.75rem", fontWeight: 400, color: "#172744" }}>
            Site Settings
          </h1>
          <p className="mt-0.5 opacity-50" style={{ fontFamily: "var(--font-inter)", fontSize: "0.8125rem" }}>
            Manage announcement bar, footer text and global configurations.
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 bg-navy text-ivory label-uppercase text-xs tracking-wider hover:opacity-80 disabled:opacity-50"
        >
          <Save size={13} /> {saving ? "SAVING..." : "SAVE SETTINGS"}
        </button>
      </div>

      {/* Announcement Bar */}
      <section className="p-6 bg-ivory border border-beige/40 space-y-4">
        <h2 className="label-uppercase text-navy text-xs font-semibold tracking-wider">
          ANNOUNCEMENT BAR
        </h2>

        <div>
          <label className="block mb-1.5" style={labelStyle}>Announcement Text</label>
          <input
            type="text"
            value={announcement.text}
            onChange={(e) => setAnnouncement((a) => ({ ...a, text: e.target.value }))}
            className="w-full px-4 py-3 border outline-none bg-transparent"
            style={inputStyle}
          />
        </div>


        <label className="flex items-center gap-2 cursor-pointer pt-2">
          <input
            type="checkbox"
            checked={announcement.is_active}
            onChange={(e) => setAnnouncement((a) => ({ ...a, is_active: e.target.checked }))}
            className="w-4 h-4 accent-navy"
          />
          <span style={{ fontFamily: "var(--font-inter)", fontSize: "0.875rem" }}>Enable Announcement Bar</span>
        </label>
      </section>

      {/* Footer Text */}
      <section className="p-6 bg-ivory border border-beige/40 space-y-4">
        <h2 className="label-uppercase text-navy text-xs font-semibold tracking-wider">
          FOOTER BRAND DESCRIPTION
        </h2>
        <div>
          <textarea
            value={footerDesc}
            onChange={(e) => setFooterDesc(e.target.value)}
            rows={3}
            className="w-full px-4 py-3 border outline-none bg-transparent resize-none"
            style={inputStyle}
          />
        </div>
      </section>
    </div>
  );
}
