import { Router, Request, Response } from "express";
import { authenticate } from "../middleware/auth";

const router = Router();

// POST /api/v1/upload - upload image to Azure Blob Storage
router.post("/", authenticate, async (_req: Request, res: Response) => {
  // TODO: Implement Azure Blob Storage upload with @azure/storage-blob
  // - Accept multipart/form-data via multer
  // - Resize with sharp
  // - Upload to Azure Blob Storage container "homeal-images"
  // - Return CDN URL
  res.status(501).json({
    success: false,
    error: "Upload endpoint not yet implemented. Configure Azure Blob Storage credentials.",
  });
});

export default router;
