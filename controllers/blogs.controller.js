import Blog from "../models/blogs.model.js";
import { fMsg, fError } from "../utils/libby.js";
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper function to delete file
const deleteFile = (filePath) => {
    // Remove the leading slash and convert to absolute path
    const absolutePath = path.join(__dirname, '..', 'public', filePath);
    if (fs.existsSync(absolutePath)) {
        fs.unlink(absolutePath, (err) => {
            if (err) console.error('Error deleting file:', err);
        });
    }
};

// Get all blogs with filtering and pagination
export const getBlogs = async (req, res) => {
    try {
        let query = {};
        let limit = parseInt(req.query.limit) || 8;
        let page = parseInt(req.query.page) || 1;
        let sort = req.query.sort || '-createdAt';

        // Add search functionality
        if (req.query.search) {
            const searchRegex = new RegExp(req.query.search, 'i');
            query.$or = [
                { title: searchRegex },
                { content: searchRegex },
                { category: searchRegex }
            ];
        }

        // Filter by status
        if (req.query.status) {
            query.status = req.query.status;
        }

        // Filter by category
        if (req.query.category) {
            query.category = req.query.category;
        }

        const total = await Blog.countDocuments(query);
        const blogs = await Blog.find(query)
            .populate('author', 'username')
            .sort(sort)
            .skip((page - 1) * limit)
            .limit(limit);

        fMsg(res, "Blogs fetched successfully", {
            items: blogs,
            currentPage: page,
            totalPages: Math.ceil(total / limit),
            total
        });
    } catch (error) {
        console.error('Error fetching blogs:', error);
        fError(res, "Error fetching blogs", 500);
    }
};

// Get single blog
export const getBlog = async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.id)
            .populate('author', 'name email');
        
        if (!blog) {
            return fError(res, "Blog not found", 404);
        }
        
        fMsg(res, "Blog fetched successfully", blog);
    } catch (error) {
        console.error('Error fetching blog:', error);
        fError(res, "Error fetching blog", 500);
    }
};

// Create new blog
export const createBlog = async (req, res) => {
    try {
        const { title, content, category } = req.body;
        
        if (!req.file) {
            return fError(res, "Blog photo is required", 400);
        }

        const photo = `/uploads/blogs/${req.file.filename}`;
        
        const blog = new Blog({
            title,
            content,
            photo,
            category,
            author: req.user._id
        });


        await blog.save();
        fMsg(res, "Blog created successfully", blog, 201);
    } catch (error) {
        console.error('Error creating blog:', error);
        fError(res, "Error creating blog", 500);
    }
};

// Update blog
export const updateBlog = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = { 
            ...req.body, 
            updatedAt: Date.now() 
        };

        const blog = await Blog.findById(id);
        if (!blog) {
            return fError(res, "Blog not found", 404);
        }

        // If a new photo was uploaded
        if (req.file) {
            // Store the new photo path
            updateData.photo = `/uploads/blogs/${req.file.filename}`;
            
            // Delete the old photo if it exists and isn't the default
            if (blog.photo) {
                deleteFile(blog.photo);
            }
        }
        
        const updatedBlog = await Blog.findByIdAndUpdate(
            id,
            updateData,
            { new: true }
        ).populate('author', 'username');

        fMsg(res, "Blog updated successfully", updatedBlog);
    } catch (error) {
        console.error('Error updating blog:', error);
        fError(res, "Error updating blog", 500);
    }
};

// Delete blog
export const deleteBlog = async (req, res) => {
    try {
        const { id } = req.params;
        
        const blog = await Blog.findById(id);
        if (!blog) {
            return fError(res, "Blog not found", 404);
        }

        // Delete the photo file if it exists and isn't the default
        if (blog.photo && !blog.photo.includes('placeholder')) {
            deleteFile(blog.photo);
        }

        await Blog.findByIdAndDelete(id);
        fMsg(res, "Blog deleted successfully");
    } catch (error) {
        console.error('Error deleting blog:', error);
        fError(res, "Error deleting blog", 500);
    }
};

// Update blog status
export const updateBlogStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!['draft', 'published'].includes(status)) {
            return fError(res, "Invalid status value", 400);
        }

        const blog = await Blog.findById(id);
        if (!blog) {
            return fError(res, "Blog not found", 404);
        }

        blog.status = status;
        blog.updatedAt = Date.now();
        await blog.save();

        fMsg(res, "Blog status updated successfully", blog);
    } catch (error) {
        console.error('Error updating blog status:', error);
        fError(res, "Error updating blog status", 500);
    }
};
