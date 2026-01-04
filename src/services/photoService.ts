import { supabase } from "../lib/supabaseClient";

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
  maxHeight: number = 800
): Promise<File> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const img = document.createElement('img');
      img.src = e.target?.result as string;
      
      img.onload = () => {
        const canvas = document.createElement('canvas');
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

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }

        // Draw image with better quality settings
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to blob with compression
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const compressedFile = new File(
                [blob],
                file.name.replace(/\.[^/.]+$/, '.jpg'), // Change extension to .jpg
                { type: 'image/jpeg', lastModified: Date.now() }
              );
              resolve(compressedFile);
            } else {
              reject(new Error('Failed to compress image'));
            }
          },
          'image/jpeg',
          quality
        );
      };

      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };

    reader.readAsDataURL(file);
  });
}

/**
 * Uploads a member photo to Supabase Storage
 * @param memberId - The ID of the member
 * @param file - The image file to upload
 * @returns The public URL of the uploaded photo, or null if upload failed
 */
export async function uploadMemberPhoto(
  memberId: number,
  file: File
): Promise<string | null> {
  if (!supabase) {
    console.error('[PhotoService] Supabase client not available');
    return null;
  }

  try {
    // Compress image before upload
    const compressedFile = await compressImage(file, 0.8, 800, 800);
    
    const fileExt = 'jpg'; // Always use jpg after compression
    const fileName = `${memberId}_${Date.now()}.${fileExt}`;
    // File path should not include bucket name - just the file name or subfolder
    const filePath = fileName;

    // Upload to Supabase Storage
    const { error } = await supabase.storage
      .from('member-photos')
      .upload(filePath, compressedFile, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('[PhotoService] Error uploading photo:', error);
      if (error.message?.includes('Bucket not found') || error.message?.includes('not found')) {
        console.error('[PhotoService] The storage bucket "member-photos" does not exist. Please create it in Supabase Dashboard > Storage.');
      }
      return null;
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('member-photos')
      .getPublicUrl(filePath);

    return publicUrl;
  } catch (error) {
    console.error('[PhotoService] Exception during photo upload:', error);
    return null;
  }
}

/**
 * Deletes a member photo from Supabase Storage
 * @param photoUrl - The public URL of the photo to delete
 * @returns true if deletion was successful, false otherwise
 */
export async function deleteMemberPhoto(photoUrl: string): Promise<boolean> {
  if (!supabase) {
    console.error('[PhotoService] Supabase client not available');
    return false;
  }

  try {
    // Extract file path from URL
    const urlParts = photoUrl.split('/');
    const fileName = urlParts[urlParts.length - 1];
    // File path should not include bucket name - just the file name
    const filePath = fileName;

    const { error } = await supabase.storage
      .from('member-photos')
      .remove([filePath]);

    if (error) {
      console.error('[PhotoService] Error deleting photo:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('[PhotoService] Exception during photo deletion:', error);
    return false;
  }
}

