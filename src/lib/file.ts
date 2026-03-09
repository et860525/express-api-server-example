import path from "node:path";
import fs from "node:fs";

// ******************************************
// *              檔案操作
// ******************************************

/**
 * 上傳檔案
 * @param file
 * @param staff_id
 * @returns
 */
export async function uploadFiles(
  files: Express.Multer.File[],
  staff_id: number,
) {
  try {
    // Create a folder for the official doc if it doesn't exist
    const docFolderPath = path.join(
      __dirname,
      "..",
      "..",
      "uploads",
      `staff_${staff_id}`,
    );
    if (!fs.existsSync(docFolderPath)) {
      fs.mkdirSync(docFolderPath, { recursive: true });
    }

    // Process all files asynchronously
    const uploadPromises = files.map((fileRaw) => {
      return new Promise<{ file: string; name: string }>((resolve, reject) => {
        // Need to convert latin1 to utf8 for Chinese characters
        const originalFileName = Buffer.from(
          fileRaw.originalname,
          "latin1",
        ).toString("utf8");
        const file = path.join(docFolderPath, originalFileName);
        fs.rename(fileRaw.path, file, (err) => {
          if (err) reject(err);
          else resolve({ file, name: originalFileName });
        });
      });
    });

    // Wait for all files to be moved
    const uploadedFiles = await Promise.all(uploadPromises);

    return { success: true, files: uploadedFiles };
  } catch (error) {
    console.error("File upload error:", error);
    return { success: false };
  }
}
