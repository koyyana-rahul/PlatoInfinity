import cloudinary from "../config/cloudinary.js";
import streamifier from "streamifier";

export default function uploadImageClodinary(buffer, folder = "avatars") {
  return new Promise((resolve, reject) => {
    if (!buffer) {
      return reject(new Error("No buffer provided"));
    }

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: folder,
        resource_type: "image",
        transformation: [
          { width: 400, height: 400, crop: "limit" },
          { quality: "auto" },
        ],
      },
      (error, result) => {
        if (error) {
          return reject(error);
        }
        resolve(result);
      }
    );

    streamifier.createReadStream(buffer).pipe(uploadStream);
  });
}
