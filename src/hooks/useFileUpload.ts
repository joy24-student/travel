/**
 * useFileUpload Hook
 *
 * Generic hook for uploading any file type to Cloudflare R2
 * Supports images, videos, and documents
 */

import { useState, useCallback } from "react";
import { uploadImage, uploadVideo } from "../services/r2";
import { saveFileMetadata, FileMetadata } from "../repositories/fileRepository";
import { useAuth } from "./useAuth";

export interface UseFileUploadState {
  loading: boolean;
  progress: number;
  error: string | null;
  url: string | null;
  fileMetadata: FileMetadata | null;
}

export interface UseFileUploadOptions {
  fileType: "image" | "video" | "document";
  entityType?: string;
  entityId?: string;
  altText?: string;
  description?: string;
  isPublic?: boolean;
  onProgress?: (progress: number) => void;
  onSuccess?: (metadata: FileMetadata) => void;
  onError?: (error: string) => void;
}

export function useFileUpload(options: UseFileUploadOptions) {
  const { user } = useAuth();
  const [state, setState] = useState<UseFileUploadState>({
    loading: false,
    progress: 0,
    error: null,
    url: null,
    fileMetadata: null,
  });

  const upload = useCallback(
    async (file: { uri: string; name: string; type?: string }) => {
      if (!user?.id) {
        const error = "User not authenticated";
        setState((prev) => ({ ...prev, error }));
        options?.onError?.(error);
        return null;
      }

      setState({
        loading: true,
        progress: 0,
        error: null,
        url: null,
        fileMetadata: null,
      });

      try {
        let result;
        const uploadFile = {
          ...file,
          type: file.type ?? "application/octet-stream",
        };

        // Upload based on file type
        if (options.fileType === "image") {
          result = await uploadImage(uploadFile, (progress) => {
            const progressPercent = Math.round(progress.progress);
            setState((prev) => ({ ...prev, progress: progressPercent }));
            options?.onProgress?.(progressPercent);
          });
        } else if (options.fileType === "video") {
          result = await uploadVideo(uploadFile, (progress) => {
            const progressPercent = Math.round(progress.progress);
            setState((prev) => ({ ...prev, progress: progressPercent }));
            options?.onProgress?.(progressPercent);
          });
        } else {
          // For documents, treat as generic file
          result = await uploadImage(uploadFile, (progress) => {
            const progressPercent = Math.round(progress.progress);
            setState((prev) => ({ ...prev, progress: progressPercent }));
            options?.onProgress?.(progressPercent);
          });
        }

        if (!result.success) {
          throw new Error(result.error || "Upload failed");
        }

        // Save metadata to Supabase
        const metadata = await saveFileMetadata({
          userId: user.id,
          url: result.url,
          key: result.key,
          fileName: file.name,
          fileType: options.fileType,
          mimeType: result.mimeType,
          size: result.size,
          altText: options?.altText,
          description: options?.description,
          entityType: options?.entityType,
          entityId: options?.entityId,
          isPublic: options?.isPublic ?? true,
        });

        setState({
          loading: false,
          progress: 100,
          error: null,
          url: metadata.url,
          fileMetadata: metadata,
        });

        options?.onSuccess?.(metadata);

        return metadata;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Upload failed";
        setState((prev) => ({
          ...prev,
          loading: false,
          error: errorMessage,
        }));
        options?.onError?.(errorMessage);
        return null;
      }
    },
    [user?.id, options],
  );

  const reset = useCallback(() => {
    setState({
      loading: false,
      progress: 0,
      error: null,
      url: null,
      fileMetadata: null,
    });
  }, []);

  return {
    ...state,
    upload,
    reset,
  };
}
