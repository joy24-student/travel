/**
 * File Repository
 *
 * Manages file metadata storage in Supabase
 * Stores URLs, file types, sizes, and ownership information
 */

import { supabase } from "../utils/supabase";

export interface FileMetadata {
  id?: string;
  userId: string;
  url: string;
  key: string;
  fileName: string;
  fileType: "image" | "video" | "document";
  mimeType: string;
  size: number;
  altText?: string;
  description?: string;
  entityType?: string; // 'hotel', 'post', 'profile', 'review', etc.
  entityId?: string; // ID of the entity this file belongs to
  isPublic: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface FileQueryParams {
  userId?: string;
  fileType?: "image" | "video" | "document";
  entityType?: string;
  entityId?: string;
  limit?: number;
  offset?: number;
}

/**
 * Create or update file metadata in Supabase
 */
export async function saveFileMetadata(
  metadata: FileMetadata,
): Promise<FileMetadata> {
  try {
    const { data, error } = await supabase
      .from("files")
      .upsert(
        {
          user_id: metadata.userId,
          url: metadata.url,
          key: metadata.key,
          file_name: metadata.fileName,
          file_type: metadata.fileType,
          mime_type: metadata.mimeType,
          size: metadata.size,
          alt_text: metadata.altText,
          description: metadata.description,
          entity_type: metadata.entityType,
          entity_id: metadata.entityId,
          is_public: metadata.isPublic,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "key",
        },
      )
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      userId: data.user_id,
      url: data.url,
      key: data.key,
      fileName: data.file_name,
      fileType: data.file_type,
      mimeType: data.mime_type,
      size: data.size,
      altText: data.alt_text,
      description: data.description,
      entityType: data.entity_type,
      entityId: data.entity_id,
      isPublic: data.is_public,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  } catch (error) {
    throw new Error(`Failed to save file metadata: ${error}`);
  }
}

/**
 * Get file metadata by ID
 */
export async function getFileMetadata(
  fileId: string,
): Promise<FileMetadata | null> {
  try {
    const { data, error } = await supabase
      .from("files")
      .select("*")
      .eq("id", fileId)
      .single();

    if (error && error.code !== "PGRST116") throw error;

    return data ? mapFileData(data) : null;
  } catch (error) {
    throw new Error(`Failed to get file metadata: ${error}`);
  }
}

/**
 * Get file by R2 key
 */
export async function getFileByKey(key: string): Promise<FileMetadata | null> {
  try {
    const { data, error } = await supabase
      .from("files")
      .select("*")
      .eq("key", key)
      .single();

    if (error && error.code !== "PGRST116") throw error;

    return data ? mapFileData(data) : null;
  } catch (error) {
    throw new Error(`Failed to get file by key: ${error}`);
  }
}

/**
 * List files with optional filters
 */
export async function listFiles(
  params?: FileQueryParams,
): Promise<FileMetadata[]> {
  try {
    let query = supabase.from("files").select("*");

    if (params?.userId) query = query.eq("user_id", params.userId);
    if (params?.fileType) query = query.eq("file_type", params.fileType);
    if (params?.entityType) query = query.eq("entity_type", params.entityType);
    if (params?.entityId) query = query.eq("entity_id", params.entityId);

    // Add pagination
    if (params?.offset)
      query = query.range(
        params.offset,
        params.offset + (params.limit || 20) - 1,
      );
    else if (params?.limit) query = query.limit(params.limit);

    // Sort by newest first
    query = query.order("created_at", { ascending: false });

    const { data, error } = await query;

    if (error) throw error;

    return (data || []).map(mapFileData);
  } catch (error) {
    throw new Error(`Failed to list files: ${error}`);
  }
}

/**
 * Get user's files by type
 */
export async function getUserFiles(
  userId: string,
  fileType?: "image" | "video" | "document",
  limit: number = 50,
): Promise<FileMetadata[]> {
  return listFiles({
    userId,
    fileType,
    limit,
  });
}

/**
 * Get files for a specific entity (e.g., hotel photos, post images)
 */
export async function getEntityFiles(
  entityType: string,
  entityId: string,
): Promise<FileMetadata[]> {
  return listFiles({
    entityType,
    entityId,
  });
}

/**
 * Delete file metadata (doesn't delete from R2 - do that separately)
 */
export async function deleteFileMetadata(fileId: string): Promise<boolean> {
  try {
    const { error } = await supabase.from("files").delete().eq("id", fileId);

    if (error) throw error;

    return true;
  } catch (error) {
    throw new Error(`Failed to delete file metadata: ${error}`);
  }
}

/**
 * Delete file metadata by key
 */
export async function deleteFileMetadataByKey(key: string): Promise<boolean> {
  try {
    const { error } = await supabase.from("files").delete().eq("key", key);

    if (error) throw error;

    return true;
  } catch (error) {
    throw new Error(`Failed to delete file metadata: ${error}`);
  }
}

/**
 * Update file metadata
 */
export async function updateFileMetadata(
  fileId: string,
  updates: Partial<FileMetadata>,
): Promise<FileMetadata> {
  try {
    const updateData: any = {};

    if (updates.altText !== undefined) updateData.alt_text = updates.altText;
    if (updates.description !== undefined)
      updateData.description = updates.description;
    if (updates.isPublic !== undefined) updateData.is_public = updates.isPublic;
    if (updates.entityType !== undefined)
      updateData.entity_type = updates.entityType;
    if (updates.entityId !== undefined) updateData.entity_id = updates.entityId;

    updateData.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from("files")
      .update(updateData)
      .eq("id", fileId)
      .select()
      .single();

    if (error) throw error;

    return mapFileData(data);
  } catch (error) {
    throw new Error(`Failed to update file metadata: ${error}`);
  }
}

/**
 * Helper function to map database fields to TypeScript interface
 */
function mapFileData(data: any): FileMetadata {
  return {
    id: data.id,
    userId: data.user_id,
    url: data.url,
    key: data.key,
    fileName: data.file_name,
    fileType: data.file_type,
    mimeType: data.mime_type,
    size: data.size,
    altText: data.alt_text,
    description: data.description,
    entityType: data.entity_type,
    entityId: data.entity_id,
    isPublic: data.is_public,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
}

export const fileRepository = {
  saveFileMetadata,
  getFileMetadata,
  getFileByKey,
  listFiles,
  getUserFiles,
  getEntityFiles,
  deleteFileMetadata,
  deleteFileMetadataByKey,
  updateFileMetadata,
};
