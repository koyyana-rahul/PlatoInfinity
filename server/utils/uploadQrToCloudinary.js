import cloudinary from "../config/cloudinary.js";

export async function uploadQrToCloudinary(base64Image, publicId) {
  return await cloudinary.uploader.upload(base64Image, {
    folder: "tables/qr",
    public_id: publicId,
    overwrite: true,
  });
}
