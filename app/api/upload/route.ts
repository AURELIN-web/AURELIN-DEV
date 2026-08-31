import { NextRequest, NextResponse } from "next/server";
import cloudinary from "@/lib/cloudinary";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const folder = (formData.get("folder") as string) || "general";

    if (!file) {
      return NextResponse.json({ success: false, error: "No file provided" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadResponse = await new Promise<any>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: `aurelin/${folder}`,
          resource_type: "auto",
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      uploadStream.end(buffer);
    });

    return NextResponse.json({
      success: true,
      url: uploadResponse.secure_url || uploadResponse.url,
      public_id: uploadResponse.public_id,
      format: uploadResponse.format,
      resource_type: uploadResponse.resource_type,
      width: uploadResponse.width,
      height: uploadResponse.height,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Upload to Cloudinary failed" },
      { status: 500 }
    );
  }
}
