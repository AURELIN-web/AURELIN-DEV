export async function uploadToCloudinary(
  file: File,
  folder: string = "general",
  onProgress?: (percent: number) => void
): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    // 1. Get signed upload signature from our backend
    const signRes = await fetch("/api/upload/sign", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ folder }),
    });

    const signData = await signRes.json();

    if (!signRes.ok || !signData.success) {
      throw new Error(signData.error || "Failed to obtain upload authorization");
    }

    const { signature, timestamp, folder: fullFolder, apiKey, cloudName } = signData;

    // 2. Upload directly to Cloudinary API (supports 100MB+ without Next.js server body limit)
    const formData = new FormData();
    formData.append("file", file);
    formData.append("api_key", apiKey);
    formData.append("timestamp", timestamp.toString());
    formData.append("signature", signature);
    formData.append("folder", fullFolder);

    const isVideo = file.type.startsWith("video/");
    const resourceType = isVideo ? "video" : "auto";

    const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`;

    return new Promise((resolve) => {
      const xhr = new XMLHttpRequest();
      xhr.open("POST", uploadUrl);

      if (onProgress && xhr.upload) {
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) {
            const percent = Math.round((e.loaded / e.total) * 100);
            onProgress(percent);
          }
        };
      }

      xhr.onload = () => {
        try {
          const res = JSON.parse(xhr.responseText);
          if (xhr.status >= 200 && xhr.status < 300 && res.secure_url) {
            resolve({ success: true, url: res.secure_url });
          } else {
            resolve({ success: false, error: res?.error?.message || "Upload failed" });
          }
        } catch {
          resolve({ success: false, error: "Invalid response from Cloudinary" });
        }
      };

      xhr.onerror = () => {
        resolve({ success: false, error: "Network error during upload" });
      };

      xhr.send(formData);
    });
  } catch (err: any) {
    return { success: false, error: err?.message || "Upload failed" };
  }
}
