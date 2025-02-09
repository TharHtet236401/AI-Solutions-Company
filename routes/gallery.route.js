import express from "express";
import { upload } from "../utils/upload.js";
import { validateToken } from "../utils/validator.js";
import {
    getGallery,
    createGallery,
    getGalleryById,
    deleteGallery
} from "../controllers/gallery.controller.js";

const router = express.Router();

// Public routes - no authentication required
router.get("/", getGallery);
router.post("/", validateToken, upload.single('image'), createGallery);
router.get("/:id", getGalleryById);
router.delete("/:id", validateToken, deleteGallery);

export default router; 