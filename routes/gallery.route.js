import express from "express";
import { upload } from "../utils/upload.js";
import { validateToken } from "../utils/validator.js";
import {
    getGallery,
    createGallery,
    getGalleryById,
} from "../controllers/gallery.controller.js";



const router = express.Router();

// Public routes - no authentication required
router.get("/", getGallery);
router.post("/", upload.single('image'), createGallery);
router.get("/:id", getGalleryById);



export default router; 