import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "oib2xtib",
  api_key: process.env.CLOUDINARY_API_KEY || "977267632858263",
  api_secret: process.env.CLOUDINARY_API_SECRET || "4UpXnlF3ueEtVr4KFKtaB7JFf78",
  secure: true,
});

export default cloudinary;
