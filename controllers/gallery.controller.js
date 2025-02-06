import Gallery from "../models/gallery.model.js";
import { fMsg, fError } from "../utils/libby.js";

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
      image: `/uploads/gallery/${req.file.filename}`
    });
    
    fMsg(res, "Gallery item created successfully", gallery);
  } catch (error) {
    console.error("Error creating gallery item:", error);
    fError(res, "Error creating gallery item", 500);
  }
};
