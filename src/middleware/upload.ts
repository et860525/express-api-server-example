import multer from "multer";
import path from "node:path";
import fs from "node:fs";

// Set upload directory
const uploadDir = "uploads/";

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true }); // Create directory if not exist
}

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Store files in 'uploads' directory
  },
  filename: (req, file, cb) => {
    // cb(null, Date.now() + path.extname(file.originalname)); // Rename file
    const safeFilename = Buffer.from(file.originalname, "latin1").toString(
      "utf8",
    );
    cb(null, safeFilename);
  },
});

// Set upload limits & file filter (optional)
const upload = multer({
  storage,
  limits: { fileSize: 500 * 1024 * 1024 }, // 500MB
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();

    // 只接受這些圖片副檔名
    const allowedExts = [".jpg", ".jpeg", ".png", ".gif", ".webp"];

    // 對應可能的 mimetype
    const allowedMimes = ["image/jpeg", "image/png", "image/gif", "image/webp"];

    const extOK = allowedExts.includes(ext);
    const mimeOK = allowedMimes.includes(file.mimetype);

    if (extOK && mimeOK) {
      return cb(null, true);
    }

    // 錯誤訊息給 controller 使用
    (req as any).fileValidationError =
      "只接受 jpg、jpeg、png、gif、webp 圖片檔";

    cb(null, false);
  },
});

export default upload;
