import express from "express";
import {
    getBlogs,
    getBlog,
    createBlog,
    updateBlog,
    deleteBlog,
    updateBlogStatus
} from "../controllers/blogs.controller.js";
import { validateToken } from "../utils/validator.js";
import { upload } from "../utils/upload.js";

const router = express.Router();

// Public routes
router.get("/", getBlogs);
router.get("/:id", getBlog);


// Protected routes (require authentication)
router.post("/", validateToken, upload.single('photo'), createBlog);
router.put("/:id", validateToken, upload.single('photo'), updateBlog);
router.delete("/:id", validateToken, deleteBlog);
router.patch("/status/:id", validateToken, updateBlogStatus);


export default router; 