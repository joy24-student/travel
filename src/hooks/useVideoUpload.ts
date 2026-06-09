/**
 * useVideoUpload Hook
 *
 * Manages video uploads to Cloudflare R2 and stores metadata in Supabase
 */

import { useState, useCallback } from "react";
import { uploadVideo } from "../services/r2";
import { saveFileMetadata, FileMetadata } from "../repositories/fileRepository";
import { useAuth } from "./useAuth";

export interface UseVideoUploadState {
  loading: boolean;
  progress: number;
  error: string | null;
  url: string | null;
  fileMetadata: FileMetadata | null;
}

export interface UseVideoUploadOptions {
  entityType?: string;
  entityId?: string;
  description?: string;
  thumbnail?: string;
  duration?: number;
  isPublic?: boolean;
  onProgress?: (progress: number) => void;
  onSuccess?: (metadata: FileMetadata) => void;
  onError?: (error: string) => void;
}

export function useVideoUpload(options?: UseVideoUploadOptions) {
  const { user } = useAuth();
  const [state, setState] = useState<UseVideoUploadState>({
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
        // Upload to R2
        const uploadFile = { ...file, type: file.type ?? "video/mp4" };
        const result = await uploadVideo(uploadFile, (progress) => {
          const progressPercent = Math.round(progress.progress);
          setState((prev) => ({ ...prev, progress: progressPercent }));
          options?.onProgress?.(progressPercent);
        });

        if (!result.success) {
          throw new Error(result.error || "Upload failed");
        }

        // Save metadata to Supabase
        const metadata = await saveFileMetadata({
          userId: user.id,
          url: result.url,
          key: result.key,
          fileName: file.name,
          fileType: "video",
          mimeType: result.mimeType,
          size: result.size,
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
