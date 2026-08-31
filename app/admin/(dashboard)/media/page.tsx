"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";
import { Upload, Trash2, Copy, Check } from "lucide-react";
import { STORAGE_BUCKETS } from "@/config/site";
import { uploadToCloudinary } from "@/lib/upload";

export default function AdminMediaPage() {
  const [selectedBucket, setSelectedBucket] = useState<string>("products");
  const [files, setFiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

  const loadFiles = async () => {
    setLoading(true);
    const supabase = createClient();
    const { data, error } = await supabase.storage.from(selectedBucket).list("", {
      limit: 100,
      offset: 0,
      sortBy: { column: "created_at", order: "desc" },
    });

    if (!error && data) {
      const fileUrls = data
        .filter((f) => f.name !== ".emptyFolderPlaceholder")
        .map((f) => {
          const { data: urlData } = supabase.storage.from(selectedBucket).getPublicUrl(f.name);
          return {
            name: f.name,
            url: urlData.publicUrl,
            metadata: f.metadata,
          };
        });
      setFiles(fileUrls);
    } else {
      setFiles([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadFiles();
  }, [selectedBucket]);

  const handleUpload = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    setUploading(true);

    for (const file of Array.from(fileList)) {
      const result = await uploadToCloudinary(file, selectedBucket);
      if (result.success && result.url) {
        setFiles((prev) => [{ name: file.name, url: result.url }, ...prev]);
      } else {
        toast.error(result.error || "Upload failed");
      }
    }

    toast.success("Uploaded to Cloudinary successfully");
    setUploading(false);
  };

  const handleDelete = async (name: string) => {
    if (!confirm("Delete this asset?")) return;
    const supabase = createClient();
    const { error } = await supabase.storage.from(selectedBucket).remove([name]);
    if (!error) {
      toast.success("Asset deleted");
      loadFiles();
    } else {
      toast.error("Failed to delete asset");
    }
  };

  const handleCopy = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedUrl(url);
    toast.success("URL copied to clipboard");
    setTimeout(() => setCopiedUrl(null), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 style={{ fontFamily: "var(--font-cormorant)", fontSize: "1.75rem", fontWeight: 400, color: "#172744" }}>
            Media Library
          </h1>
          <p className="mt-0.5 opacity-50" style={{ fontFamily: "var(--font-inter)", fontSize: "0.8125rem" }}>
            Manage images and video assets across Supabase storage buckets.
          </p>
        </div>

        <label className="flex items-center gap-2 px-5 py-2.5 bg-navy text-ivory label-uppercase text-xs tracking-wider cursor-pointer hover:opacity-90">
          <Upload size={13} /> {uploading ? "UPLOADING..." : "UPLOAD ASSET"}
          <input
            type="file"
            multiple
            accept="image/*,video/*"
            className="hidden"
            disabled={uploading}
            onChange={(e) => handleUpload(e.target.files)}
          />
        </label>
      </div>

      {/* Bucket Selector Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-beige/40 pb-3">
        {Object.entries(STORAGE_BUCKETS).map(([key, bucket]) => (
          <button
            key={key}
            onClick={() => setSelectedBucket(bucket)}
            className={`px-4 py-1.5 label-uppercase text-xs tracking-wider transition-all ${
              selectedBucket === bucket
                ? "bg-navy text-ivory font-medium"
                : "text-navy opacity-60 hover:opacity-100"
            }`}
          >
            {bucket}
          </button>
        ))}
      </div>

      {/* Grid */}
      {loading ? (
        <div className="py-20 text-center opacity-40">Loading assets...</div>
      ) : files.length === 0 ? (
        <div className="py-20 text-center opacity-40 text-sm bg-ivory border border-beige/30">
          No assets in the <strong className="capitalize">{selectedBucket}</strong> bucket yet.
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {files.map((file) => (
            <div key={file.name} className="group relative aspect-square border border-beige/40 bg-ivory overflow-hidden">
              <img src={file.url} alt={file.name} className="w-full h-full object-cover" />

              <div className="absolute inset-0 bg-navy/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <button
                  onClick={() => handleCopy(file.url)}
                  title="Copy URL"
                  className="p-2 bg-ivory text-navy hover:scale-110 transition-transform"
                >
                  {copiedUrl === file.url ? <Check size={14} className="text-green-700" /> : <Copy size={14} />}
                </button>
                <button
                  onClick={() => handleDelete(file.name)}
                  title="Delete"
                  className="p-2 bg-ivory text-red-600 hover:scale-110 transition-transform"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
