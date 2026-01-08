import cloudinary from "../config/cloudinary.js";

export async function uploadQrToCloudinary(base64Image, publicId) {
  return await cloudinary.uploader.upload(base64Image, {
    folder: "plato/tables/qr",
    public_id: publicId,
    resource_type: "image",
    overwrite: true,
  });
}
