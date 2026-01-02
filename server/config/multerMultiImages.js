import multer from "multer";

const storage = multer.memoryStorage();

export const uploadMultipleImages = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB per image
  },
  fileFilter(req, file, cb) {
    if (!file.mimetype.startsWith("image/")) {
      cb(new Error("Only image files allowed"));
    }
    cb(null, true);
  },
});