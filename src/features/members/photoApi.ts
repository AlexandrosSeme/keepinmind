/**
 * Compresses an image file to reduce size
 * @param file - The image file to compress
 * @param quality - Compression quality (0.1 to 1.0, default 0.8)
 * @param maxWidth - Maximum width in pixels (default 800)
 * @param maxHeight - Maximum height in pixels (default 800)
 * @returns Compressed File object
 */
export async function compressImage(
  file: File,
  quality: number = 0.8,
  maxWidth: number = 800,
  maxHeight: number = 800,
): Promise<File> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = document.createElement("img");
      img.src = e.target?.result as string;

      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;

        // Calculate new dimensions maintaining aspect ratio
        if (width > height) {
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = (width * maxHeight) / height;
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Could not get canvas context"));
          return;
        }

        // Draw image with better quality settings
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to blob with compression
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const compressedFile = new File(
                [blob],
                file.name.replace(/\.[^/.]+$/, ".jpg"), // Change extension to .jpg
                { type: "image/jpeg", lastModified: Date.now() },
              );
              resolve(compressedFile);
            } else {
              reject(new Error("Failed to compress image"));
            }
          },
          "image/jpeg",
          quality,
        );
      };

      img.onerror = () => {
        reject(new Error("Failed to load image"));
      };
    };

    reader.onerror = () => {
      reject(new Error("Failed to read file"));
    };

    reader.readAsDataURL(file);
  });
}

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}

/**
 * Prepares a member photo for storage. The local JSON API has no file storage,
 * so the compressed image is returned as a data URL and saved in `photo_url`.
 * @param _memberId - Kept for API compatibility with a future file-storage backend
 * @param file - The image file to store
 * @returns The data URL of the compressed photo, or null if processing failed
 */
export async function uploadMemberPhoto(
  _memberId: number,
  file: File,
): Promise<string | null> {
  try {
    // Small enough to keep db.json manageable, large enough for the profile view.
    const compressedFile = await compressImage(file, 0.75, 480, 480);
    return await readAsDataUrl(compressedFile);
  } catch (error) {
    console.error("[PhotoService] Error processing photo:", error);
    return null;
  }
}