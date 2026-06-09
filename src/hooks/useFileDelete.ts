/**
 * useFileDelete Hook
 *
 * Manages file deletion from both Cloudflare R2 and Supabase
 */

import { useState, useCallback } from "react";
import { deleteFile } from "../services/r2";
import { deleteFileMetadataByKey } from "../repositories/fileRepository";

export interface UseFileDeleteState {
  loading: boolean;
  error: string | null;
  deleted: boolean;
}

export interface UseFileDeleteOptions {
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export function useFileDelete(options?: UseFileDeleteOptions) {
  const [state, setState] = useState<UseFileDeleteState>({
    loading: false,
    error: null,
    deleted: false,
  });

  /**
   * Delete file by key
   * Deletes from both R2 and Supabase
   */
  const deleteByKey = useCallback(
    async (key: string) => {
      setState({ loading: true, error: null, deleted: false });

      try {
        // Delete from R2
        const r2Result = await deleteFile(key);
        if (!r2Result.success) {
          throw new Error(r2Result.error || "Failed to delete from R2");
        }

        // Delete metadata from Supabase
        await deleteFileMetadataByKey(key);

        setState({ loading: false, error: null, deleted: true });
        options?.onSuccess?.();

        return true;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Delete failed";
        setState({ loading: false, error: errorMessage, deleted: false });
        options?.onError?.(errorMessage);
        return false;
      }
    },
    [options],
  );

  /**
   * Delete multiple files by keys
   */
  const deleteMultiple = useCallback(
    async (keys: string[]) => {
      setState({ loading: true, error: null, deleted: false });

      try {
        let successCount = 0;
        const errors = [];

        for (const key of keys) {
          try {
            const r2Result = await deleteFile(key);
            if (!r2Result.success) {
              errors.push(`Failed to delete ${key}: ${r2Result.error}`);
            } else {
              await deleteFileMetadataByKey(key);
              successCount++;
            }
          } catch (error) {
            errors.push(`Error deleting ${key}: ${error}`);
          }
        }

        if (errors.length > 0 && successCount === 0) {
          throw new Error(errors.join("; "));
        }

        setState({ loading: false, error: null, deleted: successCount > 0 });
        if (successCount > 0) {
          options?.onSuccess?.();
        }

        return { successCount, total: keys.length, errors };
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Batch delete failed";
        setState({ loading: false, error: errorMessage, deleted: false });
        options?.onError?.(errorMessage);
        return { successCount: 0, total: keys.length, errors: [errorMessage] };
      }
    },
    [options],
  );

  const reset = useCallback(() => {
    setState({ loading: false, error: null, deleted: false });
  }, []);

  return {
    ...state,
    deleteByKey,
    deleteMultiple,
    reset,
  };
}
