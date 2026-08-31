import { NextRequest, NextResponse } from "next/server";
import cloudinary from "@/lib/cloudinary";

export async function POST(request: NextRequest) {
  try {
    const { folder = "hero" } = await request.json();
    const timestamp = Math.round(new Date().getTime() / 1000);
    const fullFolder = `aurelin/${folder}`;

    const signature = cloudinary.utils.api_sign_request(
      {
        folder: fullFolder,
        timestamp,
      },
      process.env.CLOUDINARY_API_SECRET || "4UpXnlF3ueEtVr4KFKtaB7JFf78"
    );

    return NextResponse.json({
      success: true,
      signature,
      timestamp,
      folder: fullFolder,
      apiKey: process.env.CLOUDINARY_API_KEY || "977267632858263",
      cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "oib2xtib",
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || "Failed to generate upload signature" },
      { status: 500 }
    );
  }
}
