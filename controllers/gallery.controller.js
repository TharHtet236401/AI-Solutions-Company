import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Gallery from "../models/gallery.model.js";
import { fMsg, fError } from "../utils/libby.js";

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

export const getGallery = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;
    const category = req.query.category;
    const sort = req.query.sort || '-createdAt';

    // Build query based on category
    let query = {};
    if (category && category !== 'all') {
      query.category = category;
    }

    // Get total count for pagination with category filter
    const total = await Gallery.countDocuments(query);
    
    // Get paginated items with category filter and sorting
    const gallery = await Gallery.find(query)
      .sort(sort)
      .skip(skip)
      .limit(limit);

    fMsg(res, "Gallery fetched successfully", {
      items: gallery,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      total,
      hasMore: page * limit < total
    });
  } catch (error) {
    console.error("Error fetching gallery:", error);
    fError(res, error.message, 500);
  }
};

export const getGalleryById = async (req, res) => {
  try {
    console.log("Fetching gallery by ID...");
    const { id } = req.params;
    const gallery = await Gallery.findById(id);
    fMsg(res, "Gallery fetched successfully", gallery);
  } catch (error) {
    fError(res, error.message, 500);
  }
};

export const createGallery = async (req, res) => {
  try {
    if (!req.file) {
      return fError(res, "Image file is required", 400);
    }

    const { title, category, description } = req.body;
    
    // Validate required fields
    if (!title || !category) {
      return fError(res, "Title and category are required", 400);
    }
    
    // Create gallery item with file path
    const gallery = await Gallery.create({
      title,
      category,
      description,
      image: `/uploads/gallery/${req.file.filename}`,
      poster: req.user._id
    });
    
    fMsg(res, "Gallery item created successfully", gallery);
  } catch (error) {
    console.error("Error creating gallery item:", error);
    fError(res, "Error creating gallery item", 500);
  }
};

export const deleteGallery = async (req, res) => {
    try {
        const { id } = req.params;
        
        const gallery = await Gallery.findById(id);
        if (!gallery) {
            return fError(res, "Gallery item not found", 404);
        }

        // Delete the image file if it exists
        if (gallery.image) {
            deleteFile(gallery.image);
        }

        await Gallery.findByIdAndDelete(id);
        fMsg(res, "Gallery item deleted successfully");
    } catch (error) {
        console.error('Error deleting gallery item:', error);
        fError(res, "Error deleting gallery item", 500);
    }
};


export const updateGallery = async (req, res) => {
  try {
      const { id } = req.params;
      const { title, category, description } = req.body;
      
      // Find the gallery item
      const gallery = await Gallery.findById(id);
      if (!gallery) {
          return fError(res, "Gallery item not found", 404);
      }
      console.log(gallery);

      // Update fields
      const updateData = {
          title,
          category,
          description,
          updatedAt: new Date()
      };

      // If new image is uploaded
      if (req.file) {
          // Delete old image
          if (gallery.image) {
              deleteFile(gallery.image);
          }
          // Add new image path
          updateData.image = `/uploads/gallery/${req.file.filename}`;
      }

      // Update gallery item
      const updatedGallery = await Gallery.findByIdAndUpdate(
          id,
          updateData,
          { new: true }
      );

      fMsg(res, "Gallery item updated successfully", updatedGallery);
  } catch (error) {
      console.error('Error updating gallery item:', error);
      fError(res, "Error updating gallery item", 500);
  }
};
