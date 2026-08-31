"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";
import type { HeroSettings } from "@/types/database";
import { Upload, Save, Film, Image as ImageIcon, Eye, Sparkles, Loader2 } from "lucide-react";
import { uploadToCloudinary } from "@/lib/upload";

export default function AdminHeroPage() {
  const [hero, setHero] = useState<HeroSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [uploadingDesktop, setUploadingDesktop] = useState(false);
  const [desktopProgress, setDesktopProgress] = useState<number | null>(null);

  const [uploadingMobile, setUploadingMobile] = useState(false);
  const [mobileProgress, setMobileProgress] = useState<number | null>(null);

  const [uploadingPoster, setUploadingPoster] = useState(false);
  const [posterProgress, setPosterProgress] = useState<number | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/admin/hero");
        const json = await res.json();
        if (json.success && json.data) {
          setHero(json.data as HeroSettings);
        }
      } catch (e) {
        console.error("Failed to load hero settings:", e);
      }
      setLoading(false);
    };
    load();
  }, []);

  const update = (key: keyof HeroSettings, value: string | boolean | number) => {
    setHero((prev) => (prev ? { ...prev, [key]: value } : prev));
  };

  const uploadVideo = async (file: File, field: "desktop_video_url" | "mobile_video_url") => {
    const isDesktop = field === "desktop_video_url";
    const setter = isDesktop ? setUploadingDesktop : setUploadingMobile;
    const setProgress = isDesktop ? setDesktopProgress : setMobileProgress;

    setter(true);
    setProgress(0);

    const result = await uploadToCloudinary(file, "hero", (percent) => {
      setProgress(percent);
    });

    if (result.success && result.url) {
      update(field, result.url);
      
      // Auto-persist immediately to Supabase through elevated API route
      const updatedPayload = { ...hero, [field]: result.url };
      await fetch("/api/admin/hero", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedPayload),
      });

      toast.success("Video uploaded & saved live to storefront!");
    } else {
      toast.error(result.error || "Video upload failed");
    }

    setter(false);
    setProgress(null);
  };

  const uploadPoster = async (file: File) => {
    setUploadingPoster(true);
    setPosterProgress(0);

    const result = await uploadToCloudinary(file, "hero", (percent) => {
      setPosterProgress(percent);
    });

    if (result.success && result.url) {
      update("poster_image_url", result.url);

      // Auto-persist immediately to Supabase through elevated API route
      const updatedPayload = { ...hero, poster_image_url: result.url };
      await fetch("/api/admin/hero", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedPayload),
      });

      toast.success("Poster image uploaded & saved live to storefront!");
    } else {
      toast.error(result.error || "Poster upload failed");
    }

    setUploadingPoster(false);
    setPosterProgress(null);
  };

  const handleSave = async () => {
    if (!hero) return;
    setSaving(true);

    try {
      const res = await fetch("/api/admin/hero", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(hero),
      });
      const json = await res.json();
      if (json.success) {
        setHero(json.data);
        toast.success("Hero settings saved & live on storefront!");
      } else {
        toast.error(json.error || "Failed to save changes");
      }
    } catch {
      toast.error("Failed to save changes");
    }
    setSaving(false);
  };

  const inputClass = "w-full px-4 py-2.5 bg-white border border-[#D8C8AF] focus:border-[#172744] focus:ring-1 focus:ring-[#172744] outline-none text-sm text-[#242424] transition-all rounded-sm";
  const labelClass = "block mb-1.5 text-[11px] font-semibold tracking-wider text-[#172744]/70 uppercase";

  if (loading) {
    return (
      <div className="py-20 text-center opacity-40" style={{ fontFamily: "var(--font-inter)" }}>
        Loading hero settings...
      </div>
    );
  }

  if (!hero) {
    return (
      <div className="p-8 bg-white border border-[#D8C8AF] rounded text-center">
        <p className="text-sm opacity-60">No hero settings record found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl pb-16">
      {/* Header with Save Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#D8C8AF40]">
        <div>
          <h1
            style={{
              fontFamily: "var(--font-cormorant)",
              fontSize: "2rem",
              fontWeight: 400,
              color: "#172744",
              letterSpacing: "-0.01em",
            }}
          >
            Hero Banner & Video
          </h1>
          <p className="text-xs text-charcoal/60 mt-0.5" style={{ fontFamily: "var(--font-inter)" }}>
            Customize full-screen video (supports up to 100MB+ via direct Cloudinary stream), headlines and CTAs.
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#172744] text-[#F8F6F0] hover:bg-[#101C32] transition-all text-xs font-medium tracking-widest uppercase rounded-sm shadow-sm disabled:opacity-50 flex-shrink-0"
          style={{ fontFamily: "var(--font-inter)" }}
        >
          <Save size={14} /> {saving ? "SAVING..." : "SAVE CHANGES"}
        </button>
      </div>

      {/* 1. Media & Video Upload Section */}
      <section className="bg-white border border-[#D8C8AF] rounded-sm p-6 md:p-8 shadow-sm">
        <div className="flex items-center gap-2 mb-6 pb-3 border-b border-[#D8C8AF30]">
          <Film size={16} className="text-[#B9A77A]" />
          <h2 className="text-xs font-semibold tracking-widest text-[#172744] uppercase" style={{ fontFamily: "var(--font-inter)" }}>
            VIDEO & VISUAL MEDIA (DIRECT CLOUDINARY UPLOAD)
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Desktop Video Card */}
          <div className="flex flex-col p-4 bg-[#F8F6F0] border border-[#D8C8AF]/60 rounded-sm">
            <span className={labelClass}>Desktop Video (MP4 / WebM)</span>
            {hero.desktop_video_url ? (
              <div className="relative aspect-video w-full bg-black/10 mb-3 overflow-hidden rounded border border-[#D8C8AF]">
                <video src={hero.desktop_video_url} className="w-full h-full object-cover" controls muted />
              </div>
            ) : (
              <div className="aspect-video w-full bg-[#101C32]/5 mb-3 flex flex-col items-center justify-center text-charcoal/40 rounded border border-dashed border-[#D8C8AF]">
                <Film size={24} className="mb-1 opacity-40" />
                <span className="text-[10px] uppercase tracking-wider">No Video Uploaded</span>
              </div>
            )}

            <label className="flex items-center justify-center gap-2 px-3 py-2.5 bg-white border border-[#172744] hover:bg-[#172744] hover:text-white transition-colors cursor-pointer text-xs font-medium uppercase tracking-wider text-[#172744] rounded-sm mb-3">
              {uploadingDesktop ? (
                <>
                  <Loader2 size={13} className="animate-spin" />
                  <span>Uploading {desktopProgress !== null ? `${desktopProgress}%` : "..."}</span>
                </>
              ) : (
                <>
                  <Upload size={13} /> <span>Upload Video (Any Size)</span>
                </>
              )}
              <input
                type="file"
                accept="video/*"
                className="hidden"
                disabled={uploadingDesktop}
                onChange={(e) => e.target.files?.[0] && uploadVideo(e.target.files[0], "desktop_video_url")}
              />
            </label>

            {desktopProgress !== null && (
              <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden mb-3">
                <div className="bg-[#172744] h-full transition-all duration-300" style={{ width: `${desktopProgress}%` }} />
              </div>
            )}

            <input
              type="text"
              value={hero.desktop_video_url || ""}
              onChange={(e) => update("desktop_video_url", e.target.value)}
              placeholder="Or paste video URL..."
              className={inputClass}
            />
          </div>

          {/* Mobile Video Card */}
          <div className="flex flex-col p-4 bg-[#F8F6F0] border border-[#D8C8AF]/60 rounded-sm">
            <span className={labelClass}>Mobile Video (Portrait / MP4)</span>
            {hero.mobile_video_url ? (
              <div className="relative aspect-video w-full bg-black/10 mb-3 overflow-hidden rounded border border-[#D8C8AF]">
                <video src={hero.mobile_video_url} className="w-full h-full object-cover" controls muted />
              </div>
            ) : (
              <div className="aspect-video w-full bg-[#101C32]/5 mb-3 flex flex-col items-center justify-center text-charcoal/40 rounded border border-dashed border-[#D8C8AF]">
                <Film size={24} className="mb-1 opacity-40" />
                <span className="text-[10px] uppercase tracking-wider">Default: Desktop Video</span>
              </div>
            )}

            <label className="flex items-center justify-center gap-2 px-3 py-2.5 bg-white border border-[#172744] hover:bg-[#172744] hover:text-white transition-colors cursor-pointer text-xs font-medium uppercase tracking-wider text-[#172744] rounded-sm mb-3">
              {uploadingMobile ? (
                <>
                  <Loader2 size={13} className="animate-spin" />
                  <span>Uploading {mobileProgress !== null ? `${mobileProgress}%` : "..."}</span>
                </>
              ) : (
                <>
                  <Upload size={13} /> <span>Upload Mobile Video</span>
                </>
              )}
              <input
                type="file"
                accept="video/*"
                className="hidden"
                disabled={uploadingMobile}
                onChange={(e) => e.target.files?.[0] && uploadVideo(e.target.files[0], "mobile_video_url")}
              />
            </label>

            {mobileProgress !== null && (
              <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden mb-3">
                <div className="bg-[#172744] h-full transition-all duration-300" style={{ width: `${mobileProgress}%` }} />
              </div>
            )}

            <input
              type="text"
              value={hero.mobile_video_url || ""}
              onChange={(e) => update("mobile_video_url", e.target.value)}
              placeholder="Or paste video URL..."
              className={inputClass}
            />
          </div>

          {/* Poster Fallback Image Card */}
          <div className="flex flex-col p-4 bg-[#F8F6F0] border border-[#D8C8AF]/60 rounded-sm">
            <span className={labelClass}>Poster / Fallback Image</span>
            {hero.poster_image_url ? (
              <div className="relative aspect-video w-full bg-black/10 mb-3 overflow-hidden rounded border border-[#D8C8AF]">
                <img src={hero.poster_image_url} alt="Poster" className="w-full h-full object-cover" />
              </div>
            ) : (
              <div className="aspect-video w-full bg-[#101C32]/5 mb-3 flex flex-col items-center justify-center text-charcoal/40 rounded border border-dashed border-[#D8C8AF]">
                <ImageIcon size={24} className="mb-1 opacity-40" />
                <span className="text-[10px] uppercase tracking-wider">No Poster Set</span>
              </div>
            )}

            <label className="flex items-center justify-center gap-2 px-3 py-2.5 bg-white border border-[#172744] hover:bg-[#172744] hover:text-white transition-colors cursor-pointer text-xs font-medium uppercase tracking-wider text-[#172744] rounded-sm mb-3">
              {uploadingPoster ? (
                <>
                  <Loader2 size={13} className="animate-spin" />
                  <span>Uploading {posterProgress !== null ? `${posterProgress}%` : "..."}</span>
                </>
              ) : (
                <>
                  <Upload size={13} /> <span>Upload Poster Image</span>
                </>
              )}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                disabled={uploadingPoster}
                onChange={(e) => e.target.files?.[0] && uploadPoster(e.target.files[0])}
              />
            </label>

            {posterProgress !== null && (
              <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden mb-3">
                <div className="bg-[#172744] h-full transition-all duration-300" style={{ width: `${posterProgress}%` }} />
              </div>
            )}

            <input
              type="text"
              value={hero.poster_image_url || ""}
              onChange={(e) => update("poster_image_url", e.target.value)}
              placeholder="Or paste image URL..."
              className={inputClass}
            />
          </div>
        </div>

        {/* Video Playback & Overlay Settings */}
        <div className="mt-8 pt-6 border-t border-[#D8C8AF40] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 items-center">
          {[
            { key: "autoplay" as const, label: "Autoplay Video" },
            { key: "loop" as const, label: "Infinite Loop" },
            { key: "is_muted" as const, label: "Muted on Start" },
            { key: "is_active" as const, label: "Section Active" },
          ].map(({ key, label }) => (
            <label key={key} className="flex items-center gap-2.5 p-2 rounded cursor-pointer hover:bg-[#F8F6F0] transition-colors">
              <input
                type="checkbox"
                checked={hero[key] as boolean}
                onChange={(e) => update(key, e.target.checked)}
                className="w-4 h-4 accent-[#172744] rounded"
              />
              <span className="text-xs font-medium text-[#242424]">{label}</span>
            </label>
          ))}

          {/* Overlay slider */}
          <div className="flex items-center gap-3">
            <span className="text-xs font-medium text-[#172744] whitespace-nowrap">
              Dark Overlay: {Math.round(hero.overlay_strength * 100)}%
            </span>
            <input
              type="range"
              min="0"
              max="0.8"
              step="0.05"
              value={hero.overlay_strength}
              onChange={(e) => update("overlay_strength", parseFloat(e.target.value))}
              className="w-24 accent-[#172744]"
            />
          </div>
        </div>
      </section>

      {/* 2. Editorial Typography */}
      <section className="bg-white border border-[#D8C8AF] rounded-sm p-6 md:p-8 shadow-sm space-y-6">
        <div className="flex items-center gap-2 mb-2 pb-3 border-b border-[#D8C8AF30]">
          <Sparkles size={16} className="text-[#B9A77A]" />
          <h2 className="text-xs font-semibold tracking-widest text-[#172744] uppercase" style={{ fontFamily: "var(--font-inter)" }}>
            EDITORIAL HEADINGS & COPY
          </h2>
        </div>

        <div className="space-y-4">
          <div>
            <label className={labelClass}>Eyebrow Subtitle (e.g. SPRING / SUMMER 2026)</label>
            <input
              type="text"
              value={hero.eyebrow}
              onChange={(e) => update("eyebrow", e.target.value)}
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>Main Hero Title</label>
            <input
              type="text"
              value={hero.heading}
              onChange={(e) => update("heading", e.target.value)}
              className={`${inputClass} text-base font-serif`}
            />
          </div>

          <div>
            <label className={labelClass}>Subheading / Philosophy Text</label>
            <textarea
              rows={2}
              value={hero.subheading}
              onChange={(e) => update("subheading", e.target.value)}
              className={`${inputClass} resize-none`}
            />
          </div>
        </div>
      </section>

      {/* 3. Call to Action Buttons */}
      <section className="bg-white border border-[#D8C8AF] rounded-sm p-6 md:p-8 shadow-sm">
        <div className="flex items-center gap-2 mb-6 pb-3 border-b border-[#D8C8AF30]">
          <Eye size={16} className="text-[#B9A77A]" />
          <h2 className="text-xs font-semibold tracking-widest text-[#172744] uppercase" style={{ fontFamily: "var(--font-inter)" }}>
            CALL TO ACTION BUTTONS
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Primary CTA */}
          <div className="p-5 bg-[#F8F6F0] border border-[#D8C8AF]/60 rounded space-y-4">
            <span className="text-xs font-bold text-[#172744] uppercase tracking-wider block">Primary Button</span>
            <div>
              <label className={labelClass}>Button Label</label>
              <input
                type="text"
                value={hero.primary_cta_text}
                onChange={(e) => update("primary_cta_text", e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Target Link</label>
              <input
                type="text"
                value={hero.primary_cta_url}
                onChange={(e) => update("primary_cta_url", e.target.value)}
                className={inputClass}
              />
            </div>
          </div>

          {/* Secondary CTA */}
          <div className="p-5 bg-[#F8F6F0] border border-[#D8C8AF]/60 rounded space-y-4">
            <span className="text-xs font-bold text-[#172744] uppercase tracking-wider block">Secondary Button</span>
            <div>
              <label className={labelClass}>Button Label</label>
              <input
                type="text"
                value={hero.secondary_cta_text}
                onChange={(e) => update("secondary_cta_text", e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Target Link</label>
              <input
                type="text"
                value={hero.secondary_cta_url}
                onChange={(e) => update("secondary_cta_url", e.target.value)}
                className={inputClass}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Floating Save Bar */}
      <div className="sticky bottom-4 z-20 flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 px-8 py-4 bg-[#172744] text-[#F8F6F0] hover:bg-[#101C32] transition-all text-xs font-semibold tracking-widest uppercase rounded shadow-lg disabled:opacity-50"
          style={{ fontFamily: "var(--font-inter)" }}
        >
          <Save size={15} /> {saving ? "SAVING CHANGES..." : "SAVE HERO SETTINGS"}
        </button>
      </div>
    </div>
  );
}
