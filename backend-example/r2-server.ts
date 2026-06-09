/**
 * Cloudflare R2 Pre-signed URL Backend
 *
 * This is an example Node.js/Express backend for generating pre-signed URLs
 * This approach keeps R2 credentials secure on the server
 *
 * Installation:
 * npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner express cors
 */

import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import express from "express";
import cors from "cors";

// Initialize S3 client for R2
const s3Client = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

const app = express();
app.use(cors());
app.use(express.json());

// Middleware to verify JWT token
async function verifyAuth(req, res, next) {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Verify token with your auth provider (Firebase, Supabase, etc.)
    // const user = await verifyToken(token);
    // if (!user) return res.status(401).json({ error: 'Invalid token' });

    // req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ error: "Unauthorized" });
  }
}

/**
 * POST /api/r2/presigned-url
 *
 * Generate a pre-signed URL for uploading a file to R2
 *
 * Request body:
 * {
 *   "fileName": "photo.jpg",
 *   "mimeType": "image/jpeg",
 *   "size": 1024000,
 *   "entityType": "hotel",
 *   "entityId": "hotel-123"
 * }
 *
 * Response:
 * {
 *   "presignedUrl": "https://...",
 *   "key": "images/1717410000000-abc123.jpg",
 *   "expiresIn": 3600
 * }
 */
app.post("/api/r2/presigned-url", verifyAuth, async (req, res) => {
  try {
    const { fileName, mimeType, size, entityType, entityId } = req.body;

    // Validation
    if (!fileName || !mimeType) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // File size limits
    const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB
    const MAX_VIDEO_SIZE = 500 * 1024 * 1024; // 500MB

    if (size > MAX_IMAGE_SIZE && mimeType.startsWith("image/")) {
      return res.status(400).json({ error: "Image too large" });
    }
    if (size > MAX_VIDEO_SIZE && mimeType.startsWith("video/")) {
      return res.status(400).json({ error: "Video too large" });
    }

    // MIME type whitelist
    const ALLOWED_TYPES = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/gif",
      "video/mp4",
      "video/quicktime",
      "video/x-msvideo",
      "application/pdf",
    ];

    if (!ALLOWED_TYPES.includes(mimeType)) {
      return res.status(400).json({ error: "Invalid file type" });
    }

    // Generate unique key
    const timestamp = Date.now();
    const uuid = Math.random().toString(36).substring(2, 15);
    const extension = fileName.split(".").pop() || "bin";

    // Determine folder based on MIME type
    let folder = "files";
    if (mimeType.startsWith("image/")) folder = "images";
    else if (mimeType.startsWith("video/")) folder = "videos";

    const key = `${folder}/${timestamp}-${uuid}.${extension}`;

    // Generate pre-signed URL (valid for 1 hour)
    const presignedUrl = await getSignedUrl(
      s3Client,
      new PutObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME,
        Key: key,
        ContentType: mimeType,
        Metadata: {
          "user-id": req.user?.id || "anonymous",
          "entity-type": entityType,
          "entity-id": entityId,
        },
      }),
      { expiresIn: 3600 }, // 1 hour
    );

    res.json({
      presignedUrl,
      key,
      expiresIn: 3600,
      url: `https://${process.env.R2_CUSTOM_DOMAIN}/${key}`,
    });
  } catch (error) {
    console.error("Error generating presigned URL:", error);
    res.status(500).json({ error: "Failed to generate presigned URL" });
  }
});

/**
 * POST /api/r2/delete
 *
 * Delete a file from R2
 *
 * Request body:
 * {
 *   "key": "images/1717410000000-abc123.jpg"
 * }
 */
app.post("/api/r2/delete", verifyAuth, async (req, res) => {
  try {
    const { key } = req.body;

    if (!key) {
      return res.status(400).json({ error: "Missing key" });
    }

    // In production, verify user owns this file
    // const file = await getFileMetadata(key);
    // if (file.user_id !== req.user.id) {
    //   return res.status(403).json({ error: 'Forbidden' });
    // }

    // Delete from R2
    const { DeleteObjectCommand } = await import("@aws-sdk/client-s3");
    await s3Client.send(
      new DeleteObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME,
        Key: key,
      }),
    );

    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting file:", error);
    res.status(500).json({ error: "Failed to delete file" });
  }
});

/**
 * GET /api/r2/files
 *
 * List files for current user
 */
app.get("/api/r2/files", verifyAuth, async (req, res) => {
  try {
    const { entityType, entityId, limit = 50 } = req.query;

    // Query files from your database
    // const files = await getFiles({
    //   userId: req.user.id,
    //   entityType,
    //   entityId,
    //   limit: parseInt(limit),
    // });

    res.json({
      files: [],
      count: 0,
    });
  } catch (error) {
    console.error("Error listing files:", error);
    res.status(500).json({ error: "Failed to list files" });
  }
});

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`R2 API server running on port ${PORT}`);
});

export { s3Client, app };
