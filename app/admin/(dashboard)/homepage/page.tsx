"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Save, Upload, Trash2, Loader2, Image as ImageIcon, Check } from "lucide-react";
import { uploadToCloudinary } from "@/lib/upload";
import type { HomepageSection } from "@/types/database";

export default function AdminHomepageCMSPage() {
  const [sections, setSections] = useState<HomepageSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingSection, setUploadingSection] = useState<string | null>(null);

  const load = async () => {
    try {
      const res = await fetch("/api/admin/homepage");
      const json = await res.json();
      if (json.success && json.sections) {
        setSections(json.sections);
      }
    } catch (e) {
      console.error(e);
      toast.error("Failed to load homepage sections");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const updateConfig = (sectionType: string, key: string, value: any) => {
    setSections((prev) =>
      prev.map((s) => {
        if (s.section_type === sectionType) {
          return {
            ...s,
            config: {
              ...(s.config as Record<string, any> || {}),
              [key]: value,
            },
          };
        }
        return s;
      })
    );
  };

  const updateSectionField = (sectionType: string, field: "title" | "is_active", value: any) => {
    setSections((prev) =>
      prev.map((s) => (s.section_type === sectionType ? { ...s, [field]: value } : s))
    );
  };

  const handleImageUpload = async (sectionType: string, file: File) => {
    setUploadingSection(sectionType);
    try {
      const result = await uploadToCloudinary(file, "homepage");
      if (result.success && result.url) {
        updateConfig(sectionType, "image_url", result.url);
        toast.success("Image uploaded to Cloudinary");
      } else {
        toast.error(result.error || "Upload failed");
      }
    } catch {
      toast.error("Upload error");
    } finally {
      setUploadingSection(null);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/homepage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sections),
      });
      const json = await res.json();
      if (json.success) {
        toast.success("Homepage CMS updated live!");
        load();
      } else {
        toast.error(json.error || "Failed to save CMS");
      }
    } catch {
      toast.error("Failed to save changes");
    } finally {
      setSaving(false);
    }
  };

  const fabricSection = sections.find((s) => s.section_type === "fabric_story") || {
    section_type: "fabric_story",
    title: "Fabric Story",
    is_active: true,
    config: {},
  };
  const fabricConfig = (fabricSection.config as Record<string, any>) || {};

  const brandSection = sections.find((s) => s.section_type === "brand_story") || {
    section_type: "brand_story",
    title: "Brand Story",
    is_active: true,
    config: {},
  };
  const brandConfig = (brandSection.config as Record<string, any>) || {};

  const inputClass = "w-full px-4 py-2.5 bg-white border border-[#D8C8AF] focus:border-[#172744] focus:ring-1 focus:ring-[#172744] outline-none text-sm text-[#242424] transition-all rounded-sm";
  const labelClass = "block mb-1.5 text-[11px] font-semibold tracking-wider text-[#172744]/70 uppercase";

  if (loading) {
    return (
      <div className="py-20 text-center text-charcoal/40 text-sm flex items-center justify-center gap-2">
        <Loader2 size={16} className="animate-spin" /> Loading Homepage CMS...
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#D8C8AF40]">
        <div>
          <h1
            style={{
              fontFamily: "var(--font-cormorant)",
              fontSize: "2rem",
              fontWeight: 400,
              color: "#172744",
            }}
          >
            Homepage Content & Story Sections
          </h1>
          <p className="text-xs text-charcoal/60 mt-0.5" style={{ fontFamily: "var(--font-inter)" }}>
            Upload imagery, edit headings and narrative copy for homepage editorial sections.
          </p>
        </div>

        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#172744] text-[#F8F6F0] hover:bg-[#101C32] text-xs font-semibold uppercase tracking-widest rounded-sm shadow-sm disabled:opacity-50"
        >
          {saving ? (
            <>
              <Loader2 size={13} className="animate-spin" /> Saving...
            </>
          ) : (
            <>
              <Save size={13} /> Save CMS Changes
            </>
          )}
        </button>
      </div>

      {/* 1. FABRIC STORY SECTION ("THE LANGUAGE OF LINEN") */}
      <section className="bg-white border border-[#D8C8AF] rounded-sm p-6 md:p-8 shadow-sm space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-[#D8C8AF30]">
          <div>
            <h2 className="text-xs font-semibold tracking-widest text-[#172744] uppercase">
              1. FABRIC STORY SECTION ("THE LANGUAGE OF LINEN")
            </h2>
            <p className="text-[11px] text-charcoal/50 mt-0.5">
              The 2-column banner displaying linen heritage and your fabric atelier image.
            </p>
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={fabricSection.is_active}
              onChange={(e) => updateSectionField("fabric_story", "is_active", e.target.checked)}
              className="w-4 h-4 accent-[#172744] rounded"
            />
            <span className="text-xs font-semibold text-[#172744]">
              {fabricSection.is_active ? "Visible" : "Hidden"}
            </span>
          </label>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          {/* Left Column: Text Content */}
          <div className="space-y-4">
            <div>
              <label className={labelClass}>Eyebrow Tag</label>
              <input
                type="text"
                value={fabricConfig.eyebrow ?? "OUR FABRICS"}
                onChange={(e) => updateConfig("fabric_story", "eyebrow", e.target.value)}
                placeholder="OUR FABRICS"
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>Headline</label>
              <input
                type="text"
                value={fabricConfig.heading ?? "THE LANGUAGE\nOF LINEN"}
                onChange={(e) => updateConfig("fabric_story", "heading", e.target.value)}
                placeholder="THE LANGUAGE OF LINEN"
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>Narrative Story (Body)</label>
              <textarea
                rows={4}
                value={
                  fabricConfig.body ??
                  "Natural texture.\nEffortless movement.\nDesigned for warm days\nand refined moments."
                }
                onChange={(e) => updateConfig("fabric_story", "body", e.target.value)}
                placeholder="Natural texture. Effortless movement..."
                className={`${inputClass} resize-none`}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Button Text</label>
                <input
                  type="text"
                  value={fabricConfig.cta_text ?? "DISCOVER OUR FABRICS →"}
                  onChange={(e) => updateConfig("fabric_story", "cta_text", e.target.value)}
                  placeholder="DISCOVER OUR FABRICS →"
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Button Link</label>
                <input
                  type="text"
                  value={fabricConfig.cta_url ?? "/care-guide"}
                  onChange={(e) => updateConfig("fabric_story", "cta_url", e.target.value)}
                  placeholder="/care-guide"
                  className={inputClass}
                />
              </div>
            </div>
          </div>

          {/* Right Column: Image Upload & Preview */}
          <div className="space-y-2">
            <label className={labelClass}>Fabric Image (Right Panel)</label>
            <div className="relative aspect-[4/3] md:aspect-square bg-[#F8F6F0] border-2 border-dashed border-[#D8C8AF] rounded overflow-hidden flex flex-col items-center justify-center group">
              {fabricConfig.image_url ? (
                <>
                  <img
                    src={fabricConfig.image_url}
                    alt="Fabric preview"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                    <label className="px-3 py-1.5 bg-white text-[#172744] text-xs font-semibold rounded cursor-pointer hover:bg-[#F8F6F0]">
                      Change Photo
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleImageUpload("fabric_story", file);
                        }}
                      />
                    </label>
                    <button
                      type="button"
                      onClick={() => updateConfig("fabric_story", "image_url", null)}
                      className="p-1.5 bg-red-600 text-white rounded hover:bg-red-700"
                      title="Remove image"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </>
              ) : (
                <label className="flex flex-col items-center justify-center p-6 text-center cursor-pointer w-full h-full hover:bg-[#D8C8AF]/20 transition-colors">
                  {uploadingSection === "fabric_story" ? (
                    <div className="space-y-2 text-center">
                      <Loader2 size={24} className="animate-spin text-[#172744] mx-auto" />
                      <span className="text-xs text-charcoal/70">Uploading to Cloudinary...</span>
                    </div>
                  ) : (
                    <>
                      <Upload size={24} className="text-[#172744]/60 mb-2" />
                      <span className="text-xs font-semibold text-[#172744] uppercase tracking-wider">
                        Upload Fabric Photo
                      </span>
                      <span className="text-[10px] text-charcoal/50 mt-1">
                        High-res linen texture (JPG, PNG, WebP)
                      </span>
                    </>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    disabled={uploadingSection === "fabric_story"}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleImageUpload("fabric_story", file);
                    }}
                  />
                </label>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 2. BRAND STORY SECTION ("DRESS WITH CHARACTER") */}
      <section className="bg-white border border-[#D8C8AF] rounded-sm p-6 md:p-8 shadow-sm space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-[#D8C8AF30]">
          <div>
            <h2 className="text-xs font-semibold tracking-widest text-[#172744] uppercase">
              2. BRAND STORY SECTION ("DRESS WITH CHARACTER")
            </h2>
            <p className="text-[11px] text-charcoal/50 mt-0.5">
              Editorial philosophy section highlighting tailoring craftsmanship.
            </p>
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={brandSection.is_active}
              onChange={(e) => updateSectionField("brand_story", "is_active", e.target.checked)}
              className="w-4 h-4 accent-[#172744] rounded"
            />
            <span className="text-xs font-semibold text-[#172744]">
              {brandSection.is_active ? "Visible" : "Hidden"}
            </span>
          </label>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          {/* Left: Text */}
          <div className="space-y-4">
            <div>
              <label className={labelClass}>Headline</label>
              <input
                type="text"
                value={brandConfig.heading ?? "DRESS WITH CHARACTER"}
                onChange={(e) => updateConfig("brand_story", "heading", e.target.value)}
                placeholder="DRESS WITH CHARACTER"
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>Narrative Story (Body)</label>
              <textarea
                rows={4}
                value={
                  brandConfig.body ??
                  "Style is not about being noticed.\nIt is about being remembered."
                }
                onChange={(e) => updateConfig("brand_story", "body", e.target.value)}
                placeholder="Style is not about being noticed..."
                className={`${inputClass} resize-none`}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Button Text</label>
                <input
                  type="text"
                  value={brandConfig.cta_text ?? "EXPLORE AURELIN →"}
                  onChange={(e) => updateConfig("brand_story", "cta_text", e.target.value)}
                  placeholder="EXPLORE AURELIN →"
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Button Link</label>
                <input
                  type="text"
                  value={brandConfig.cta_url ?? "/about"}
                  onChange={(e) => updateConfig("brand_story", "cta_url", e.target.value)}
                  placeholder="/about"
                  className={inputClass}
                />
              </div>
            </div>
          </div>

          {/* Right: Image */}
          <div className="space-y-2">
            <label className={labelClass}>Brand Editorial Image</label>
            <div className="relative aspect-[4/3] md:aspect-square bg-[#F8F6F0] border-2 border-dashed border-[#D8C8AF] rounded overflow-hidden flex flex-col items-center justify-center group">
              {brandConfig.image_url ? (
                <>
                  <img
                    src={brandConfig.image_url}
                    alt="Brand preview"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                    <label className="px-3 py-1.5 bg-white text-[#172744] text-xs font-semibold rounded cursor-pointer hover:bg-[#F8F6F0]">
                      Change Photo
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleImageUpload("brand_story", file);
                        }}
                      />
                    </label>
                    <button
                      type="button"
                      onClick={() => updateConfig("brand_story", "image_url", null)}
                      className="p-1.5 bg-red-600 text-white rounded hover:bg-red-700"
                      title="Remove image"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </>
              ) : (
                <label className="flex flex-col items-center justify-center p-6 text-center cursor-pointer w-full h-full hover:bg-[#D8C8AF]/20 transition-colors">
                  {uploadingSection === "brand_story" ? (
                    <div className="space-y-2 text-center">
                      <Loader2 size={24} className="animate-spin text-[#172744] mx-auto" />
                      <span className="text-xs text-charcoal/70">Uploading to Cloudinary...</span>
                    </div>
                  ) : (
                    <>
                      <Upload size={24} className="text-[#172744]/60 mb-2" />
                      <span className="text-xs font-semibold text-[#172744] uppercase tracking-wider">
                        Upload Brand Photo
                      </span>
                      <span className="text-[10px] text-charcoal/50 mt-1">
                        High-res editorial portrait (JPG, PNG, WebP)
                      </span>
                    </>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    disabled={uploadingSection === "brand_story"}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleImageUpload("brand_story", file);
                    }}
                  />
                </label>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Save Button Bar */}
      <div className="flex items-center justify-end p-6 bg-white border border-[#D8C8AF] rounded-sm shadow-sm">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 px-8 py-3 bg-[#172744] text-[#F8F6F0] hover:bg-[#101C32] text-xs font-semibold uppercase tracking-widest rounded-sm shadow-sm disabled:opacity-50"
        >
          {saving ? (
            <>
              <Loader2 size={14} className="animate-spin" /> Saving Changes...
            </>
          ) : (
            <>
              <Save size={14} /> Save & Publish Homepage CMS
            </>
          )}
        </button>
      </div>
    </div>
  );
}
