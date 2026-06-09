/**
 * Cloudflare R2 Storage Service
 *
 * Handles file uploads (images, videos) to Cloudflare R2 storage.
 * Files are organized by type (images/, videos/) with timestamps and UUIDs for uniqueness.
 */

import { Platform } from "react-native";

export interface UploadProgress {
  loaded: number;
  total: number;
  progress: number; // 0-100
}

export interface UploadResult {
  success: boolean;
  url: string;
  key: string;
  size: number;
  mimeType: string;
  error?: string;
}

/**
 * Generate a unique file key for R2
 * @param originalName - Original filename
 * @param fileType - 'image' or 'video'
 * @returns Unique key for R2 storage
 */
function generateFileKey(
  originalName: string,
  fileType: "image" | "video",
): string {
  const timestamp = Date.now();
  const uuid = Math.random().toString(36).substring(2, 15);
  const extension = originalName.split(".").pop() || "bin";
  return `${fileType}s/${timestamp}-${uuid}.${extension}`;
}

/**
 * Get R2 URL from configuration
 * @param key - File key in R2
 * @returns Full URL to the file
 */
function getFileUrl(key: string): string {
  const customDomain = process.env.EXPO_PUBLIC_R2_CUSTOM_DOMAIN;
  const accountId = process.env.EXPO_PUBLIC_R2_ACCOUNT_ID;

  if (customDomain) {
    return `https://${customDomain}/${key}`;
  }

  if (accountId) {
    const bucketName = process.env.EXPO_PUBLIC_R2_BUCKET_NAME || "travel-app";
    return `https://${bucketName}.${accountId}.r2.cloudflarestorage.com/${key}`;
  }

  throw new Error(
    "R2 configuration incomplete: missing custom domain or account ID",
  );
}

/**
 * Upload image to Cloudflare R2
 * @param file - File object with uri, name, and type
 * @param onProgress - Progress callback
 * @returns Upload result with URL
 */
export async function uploadImage(
  file: {
    uri: string;
    name: string;
    type: string;
  },
  onProgress?: (progress: UploadProgress) => void,
): Promise<UploadResult> {
  try {
    const key = generateFileKey(file.name, "image");
    const fileData = await getFileData(file.uri);

    // Upload to R2
    const response = await uploadToR2(
      fileData,
      key,
      file.type || "image/jpeg",
      onProgress,
    );

    if (!response.success) {
      throw new Error(response.error || "Upload failed");
    }

    return {
      success: true,
      url: getFileUrl(key),
      key,
      size: fileData.byteLength,
      mimeType: file.type || "image/jpeg",
    };
  } catch (error) {
    return {
      success: false,
      url: "",
      key: "",
      size: 0,
      mimeType: "",
      error: error instanceof Error ? error.message : "Upload failed",
    };
  }
}

/**
 * Upload video to Cloudflare R2
 * @param file - File object with uri, name, and type
 * @param onProgress - Progress callback
 * @returns Upload result with URL
 */
export async function uploadVideo(
  file: {
    uri: string;
    name: string;
    type: string;
  },
  onProgress?: (progress: UploadProgress) => void,
): Promise<UploadResult> {
  try {
    const key = generateFileKey(file.name, "video");
    const fileData = await getFileData(file.uri);

    // Upload to R2
    const response = await uploadToR2(
      fileData,
      key,
      file.type || "video/mp4",
      onProgress,
    );

    if (!response.success) {
      throw new Error(response.error || "Upload failed");
    }

    return {
      success: true,
      url: getFileUrl(key),
      key,
      size: fileData.byteLength,
      mimeType: file.type || "video/mp4",
    };
  } catch (error) {
    return {
      success: false,
      url: "",
      key: "",
      size: 0,
      mimeType: "",
      error: error instanceof Error ? error.message : "Upload failed",
    };
  }
}

/**
 * Delete file from Cloudflare R2
 * @param key - File key in R2 (e.g., 'images/1234567890-abc123.jpg')
 * @returns Success status
 */
export async function deleteFile(
  key: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!key) {
      throw new Error("File key is required");
    }

    const response = await deleteFromR2(key);

    if (!response.success) {
      throw new Error(response.error || "Delete failed");
    }

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Delete failed",
    };
  }
}

/**
 * Internal: Get file data from URI
 */
async function getFileData(uri: string): Promise<ArrayBuffer> {
  if (Platform.OS === "web") {
    const response = await fetch(uri);
    return response.arrayBuffer();
  }

  // React Native - use Expo FileSystem
  try {
    const module = require("expo-file-system");
    const base64 = await module.readAsStringAsync(uri, {
      encoding: module.EncodingType.Base64,
    });
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
  } catch (error) {
    throw new Error(`Failed to read file: ${error}`);
  }
}

/**
 * Internal: Upload file to R2 using pre-signed URL approach
 *
 * For production, you should:
 * 1. Create pre-signed URLs on your backend
 * 2. Use those URLs to upload from the client
 * 3. This prevents exposing credentials on the client
 */
async function uploadToR2(
  fileData: ArrayBuffer,
  key: string,
  mimeType: string,
  onProgress?: (progress: UploadProgress) => void,
): Promise<{ success: boolean; error?: string }> {
  try {
    // In production, get pre-signed URL from your backend
    const presignedUrl = await getPresignedUploadUrl(key, mimeType);

    // Upload using the pre-signed URL
    const xhr = new XMLHttpRequest();

    // Track upload progress
    xhr.upload.addEventListener("progress", (event) => {
      if (event.lengthComputable && onProgress) {
        const progress = (event.loaded / event.total) * 100;
        onProgress({
          loaded: event.loaded,
          total: event.total,
          progress,
        });
      }
    });

    // Upload file
    await new Promise<void>((resolve, reject) => {
      xhr.addEventListener("load", () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve();
        } else {
          reject(new Error(`Upload failed with status ${xhr.status}`));
        }
      });

      xhr.addEventListener("error", () => reject(new Error("Upload error")));
      xhr.addEventListener("abort", () => reject(new Error("Upload aborted")));

      xhr.open("PUT", presignedUrl, true);
      xhr.setRequestHeader("Content-Type", mimeType);
      xhr.send(fileData);
    });

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Upload failed",
    };
  }
}

/**
 * Internal: Get pre-signed URL for upload
 *
 * IMPORTANT: In production, this should call your backend API
 * Your backend will sign the request with your R2 secret key
 */
async function getPresignedUploadUrl(
  key: string,
  mimeType: string,
): Promise<string> {
  try {
    // Option 1: Call your backend API (RECOMMENDED)
    // const response = await fetch('https://your-api.com/api/r2/presigned-url', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ key, mimeType }),
    // });
    // const data = await response.json();
    // return data.presignedUrl;

    // Option 2: Use S3-compatible API directly (for development only)
    // This is simplified - use AWS SDK for production
    const bucketName = process.env.EXPO_PUBLIC_R2_BUCKET_NAME || "travel-app";
    const accountId = process.env.EXPO_PUBLIC_R2_ACCOUNT_ID;

    if (!accountId) {
      throw new Error("R2 Account ID not configured");
    }

    // For now, return a placeholder that your app can handle
    // In production, implement proper pre-signed URL generation on your backend
    return `https://${bucketName}.${accountId}.r2.cloudflarestorage.com/${key}`;
  } catch (error) {
    throw new Error(`Failed to get presigned URL: ${error}`);
  }
}

/**
 * Internal: Delete file from R2
 */
async function deleteFromR2(
  key: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    // In production, call your backend API to delete the file
    // Example:
    // const response = await fetch('https://your-api.com/api/r2/delete', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ key }),
    // });
    // const data = await response.json();
    // return { success: data.success };

    // Placeholder for development
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Delete failed",
    };
  }
}

export const r2Service = {
  uploadImage,
  uploadVideo,
  deleteFile,
};
