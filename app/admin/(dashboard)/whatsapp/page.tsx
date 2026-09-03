"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Save, MessageCircle } from "lucide-react";
import type { WhatsAppSettings } from "@/types/database";

export default function AdminWhatsAppPage() {
  const [settings, setSettings] = useState<WhatsAppSettings>({
    number: "",
    country_code: "91",
    message_template: "Hello AURELIN & CO.,\n\nI would like to enquire about:",
    enabled: true,
  });
  const [enquiries, setEnquiries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      // Load settings via admin API (bypasses RLS)
      const [settingsRes, supabase] = await Promise.all([
        fetch("/api/admin/settings").then((r) => r.json()),
        import("@/utils/supabase/client").then((m) => m.createClient()),
      ]);
      if (settingsRes.settings?.whatsapp) {
        setSettings(settingsRes.settings.whatsapp as WhatsAppSettings);
      }
      const { data: enquiryData } = await supabase
        .from("whatsapp_enquiries")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(20);
      setEnquiries(enquiryData || []);
      setLoading(false);
    };
    load();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: "whatsapp", value: settings }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || "Failed to save");
      toast.success("WhatsApp settings saved");
    } catch (err: any) {
      console.error("[WhatsApp save error]", err);
      toast.error(err.message || "Failed to save");
    }
    setSaving(false);
  };

  const inputStyle = { fontFamily: "var(--font-inter)", fontSize: "0.9375rem", color: "#242424", borderColor: "#D8C8AF" };
  const labelStyle = { fontFamily: "var(--font-inter)", fontSize: "0.5625rem", letterSpacing: "0.16em", textTransform: "uppercase" as const, color: "#172744", opacity: 0.6 };

  if (loading) return <div className="py-20 opacity-40 text-center" style={{ fontFamily: "var(--font-inter)" }}>Loading...</div>;

  return (
    <div className="space-y-8 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 style={{ fontFamily: "var(--font-cormorant)", fontSize: "1.75rem", fontWeight: 400, color: "#172744" }}>WhatsApp Settings</h1>
          <p className="mt-0.5 opacity-50" style={{ fontFamily: "var(--font-inter)", fontSize: "0.8125rem" }}>Configure the WhatsApp concierge feature for your store.</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 transition-opacity hover:opacity-80 disabled:opacity-50"
          style={{ backgroundColor: "#172744", color: "#F8F6F0", fontFamily: "var(--font-inter)", fontSize: "0.6875rem", letterSpacing: "0.14em", textTransform: "uppercase" }}
        >
          <Save size={13} /> {saving ? "SAVING..." : "SAVE"}
        </button>
      </div>

      <section style={{ backgroundColor: "#F8F6F0", border: "1px solid #D8C8AF40", padding: "1.5rem" }}>
        <h2 className="mb-5" style={{ fontFamily: "var(--font-inter)", fontSize: "0.6875rem", letterSpacing: "0.16em", textTransform: "uppercase", color: "#172744", fontWeight: 600 }}>
          CONFIGURATION
        </h2>
        <div className="space-y-5">
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.enabled}
                onChange={(e) => setSettings((s) => ({ ...s, enabled: e.target.checked }))}
                className="w-4 h-4"
              />
              <span style={{ fontFamily: "var(--font-inter)", fontSize: "0.875rem" }}>Enable WhatsApp Concierge</span>
            </label>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block mb-1.5" style={labelStyle}>Country Code</label>
              <input
                type="text"
                value={settings.country_code}
                onChange={(e) => setSettings((s) => ({ ...s, country_code: e.target.value }))}
                placeholder="91"
                className="w-full px-4 py-3 border outline-none bg-transparent"
                style={inputStyle}
              />
            </div>
            <div className="col-span-2">
              <label className="block mb-1.5" style={labelStyle}>WhatsApp Number (without country code)</label>
              <input
                type="text"
                value={settings.number}
                onChange={(e) => setSettings((s) => ({ ...s, number: e.target.value }))}
                placeholder="9876543210"
                className="w-full px-4 py-3 border outline-none bg-transparent"
                style={inputStyle}
              />
            </div>
          </div>

          {settings.number && (
            <div
              className="flex items-center gap-3 p-3 rounded"
              style={{ backgroundColor: "#17274410" }}
            >
              <MessageCircle size={14} style={{ color: "#172744" }} />
              <p style={{ fontFamily: "var(--font-inter)", fontSize: "0.8125rem", color: "#172744" }}>
                Full number: +{settings.country_code}{settings.number.replace(/\D/g, "")}
              </p>
            </div>
          )}

          <div>
            <label className="block mb-1.5" style={labelStyle}>Default Message Template</label>
            <textarea
              value={settings.message_template}
              onChange={(e) => setSettings((s) => ({ ...s, message_template: e.target.value }))}
              rows={4}
              className="w-full px-4 py-3 border outline-none bg-transparent resize-none"
              style={inputStyle}
            />
          </div>
        </div>
      </section>

      {/* Enquiries Log */}
      <section style={{ backgroundColor: "#F8F6F0", border: "1px solid #D8C8AF40", padding: "1.5rem" }}>
        <h2 className="mb-5" style={{ fontFamily: "var(--font-inter)", fontSize: "0.6875rem", letterSpacing: "0.16em", textTransform: "uppercase", color: "#172744", fontWeight: 600 }}>
          RECENT WHATSAPP ENQUIRIES ({enquiries.length})
        </h2>
        {enquiries.length === 0 ? (
          <p className="opacity-40" style={{ fontFamily: "var(--font-inter)", fontSize: "0.875rem" }}>No enquiries yet.</p>
        ) : (
          <div className="space-y-2">
            {enquiries.map((e) => (
              <div
                key={e.id}
                className="flex items-center justify-between py-3 border-b"
                style={{ borderColor: "#D8C8AF30" }}
              >
                <div>
                  <p style={{ fontFamily: "var(--font-inter)", fontSize: "0.875rem", color: "#172744" }}>
                    {e.product_name || "Unknown product"}
                  </p>
                  {e.variant_info && (
                    <p className="opacity-50" style={{ fontFamily: "var(--font-inter)", fontSize: "0.75rem" }}>
                      {Object.entries(e.variant_info as Record<string, string>)
                        .filter(([, v]) => v)
                        .map(([k, v]) => `${k}: ${v}`)
                        .join(" / ")}
                    </p>
                  )}
                </div>
                <span className="opacity-40" style={{ fontFamily: "var(--font-inter)", fontSize: "0.75rem" }}>
                  {new Date(e.created_at).toLocaleDateString("en-IN")}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
