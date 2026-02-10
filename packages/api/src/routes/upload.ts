import { Router, Request, Response } from "express";
import { authenticate } from "../middleware/auth";
import multer from "multer";
import sharp from "sharp";
import { BlobServiceClient } from "@azure/storage-blob";
import { AZURE_BLOB_CONTAINER, IMAGE_MAX_SIZE_MB, IMAGE_ALLOWED_TYPES } from "@homeal/shared";
import crypto from "crypto";

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: IMAGE_MAX_SIZE_MB * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (IMAGE_ALLOWED_TYPES.includes(file.mimetype)) cb(null, true);
    else cb(new Error("Only JPEG, PNG, and WebP images are allowed"));
  },
});

function getBlobClient() {
  const connStr = process.env.AZURE_STORAGE_CONNECTION_STRING;
  if (!connStr) throw new Error("AZURE_STORAGE_CONNECTION_STRING not configured");
  return BlobServiceClient.fromConnectionString(connStr);
}

// POST /api/v1/upload — upload image file to Azure Blob Storage
router.post("/", authenticate, upload.single("image"), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      res.status(400).json({ success: false, error: "No image file provided" });
      return;
    }

    const processed = await sharp(req.file.buffer)
      .resize(1200, 1200, { fit: "inside", withoutEnlargement: true })
      .webp({ quality: 80 })
      .toBuffer();

    const hash = crypto.randomBytes(8).toString("hex");
    const blobName = `${Date.now()}-${hash}.webp`;

    const blobService = getBlobClient();
    const container = blobService.getContainerClient(AZURE_BLOB_CONTAINER);
    const blockBlob = container.getBlockBlobClient(blobName);
    await blockBlob.upload(processed, processed.length, {
      blobHTTPHeaders: { blobContentType: "image/webp" },
    });

    res.json({ success: true, data: { url: blockBlob.url, blobName } });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Upload failed";
    res.status(500).json({ success: false, error: message });
  }
});

// POST /api/v1/upload/url — validate external image URL
router.post("/url", authenticate, async (req: Request, res: Response) => {
  try {
    const { imageUrl } = req.body;
    if (!imageUrl || typeof imageUrl !== "string") {
      res.status(400).json({ success: false, error: "imageUrl is required" });
      return;
    }
    try { new URL(imageUrl); } catch {
      res.status(400).json({ success: false, error: "Invalid URL format" });
      return;
    }
    res.json({ success: true, data: { url: imageUrl } });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "URL validation failed";
    res.status(500).json({ success: false, error: message });
  }
});

export default router;
