import express from 'express';
import { checkAuth } from '../middleware/authMiddleware.js';
import Blog from '../models/blogs.model.js';
const router = express.Router();

// Routes with error handling
router.get("/", async (req, res) => {
    try {
        res.render("index", { title: "AI Solutions - Transforming Tomorrow" });
    } catch (error) {
        console.error("Error rendering index page:", error);
        res.status(500).send("Internal Server Error");
    }
});

router.get("/solutions", async (req, res) => {
    try {
        res.render("solutions", { title: "Software Solutions - AI Solutions" });
    } catch (error) {
        console.error("Error rendering solutions page:", error);
        res.status(500).send("Internal Server Error");
    }
});

router.get("/industries", async (req, res) => {
    try {
        res.render("industries", { title: "Industries - AI Solutions" });
    } catch (error) {
        console.error("Error rendering industries page:", error);
        res.status(500).send("Internal Server Error");
    }
});

router.get("/feedback", async (req, res) => {
    try {
        res.render("feedback", { title: "Customer Feedback - AI Solutions" });
    } catch (error) {
        console.error("Error rendering feedback page:", error);
        res.status(500).send("Internal Server Error");
    }
});

router.get("/blog", async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 6; // Number of blogs per page

        // Get total count for pagination
        const total = await Blog.countDocuments();
        const totalPages = Math.ceil(total / limit);

        // Fetch blogs with pagination
        const blogs = await Blog.find()
            .populate('author', 'name')
            .sort('-createdAt')
            .skip((page - 1) * limit)
            .limit(limit);

        // Get featured blog
        const featuredBlog = await Blog.findOne()
            .populate('author', 'name')
            .sort('-createdAt');

        res.render("blog", {
            title: "Blog - AI Solutions",
            blogs,
            featuredBlog,
            currentPage: page,
            totalPages,
            total
        });
    } catch (error) {
        console.error("Error rendering blog page:", error);
        res.status(500).send("Internal Server Error");
    }
});

router.get("/gallery", async (req, res) => {
    try {
        res.render("gallery", { title: "Gallery - AI Solutions" });
    } catch (error) {
        console.error("Error rendering gallery page:", error);
        res.status(500).send("Internal Server Error");
    }
});

router.get("/about", async (req, res) => {
    try {
        res.render("about", { title: "About Us" });
    } catch (error) {
        console.error("Error rendering about page:", error);
        res.status(500).send("Internal Server Error");
    }
});

router.get("/contact", async (req, res) => {
    try {
        res.render("contact", { title: "Contact" });
    } catch (error) {
        console.error("Error rendering contact page:", error);
        res.status(500).send("Internal Server Error");
    }
});

router.get("/admin/login", checkAuth, async (req, res) => {
    try {
        res.render("admin/login", { 
            title: "Admin Login - AI Solutions",
            error: null 
        });
    } catch (error) {
        console.error("Error rendering admin login page:", error);
        res.status(500).send("Internal Server Error");
    }
});

// Admin Dashboard Routes
router.get("/admin/dashboard", checkAuth, async (req, res) => {
    try {
        res.render("admin/dashboard", { 
            title: "Admin Dashboard - AI Solutions",
            activeTab: 'overview'
        });
    } catch (error) {
        console.error("Error rendering admin dashboard:", error);
        res.status(500).send("Internal Server Error");
    }
});

router.get("/admin/inquiries", checkAuth, async (req, res) => {
    try {
        res.render("admin/inquiries", { 
            title: "Inquiries Management - AI Solutions",
            activeTab: 'inquiries'
        });
    } catch (error) {
        console.error("Error rendering inquiries page:", error);
        res.status(500).send("Internal Server Error");
    }
});

router.get("/admin/inquiry/:id", checkAuth, async (req, res) => {
    try {
        res.render("admin/inquiry-detail", { 
            title: "Inquiry Detail - AI Solutions",
            activeTab: 'inquiries',
            inquiryId: req.params.id
        });
    } catch (error) {
        console.error("Error rendering inquiry detail:", error);
        res.status(500).send("Internal Server Error");
    }
});

// Add this new route for Admin Profile
router.get("/admin/profile", checkAuth, async (req, res) => {
    try {
        res.render("admin/profile", { 
            title: "Admin Profile - AI Solutions",
            activeTab: 'profile'
        });
    } catch (error) {
        console.error("Error rendering profile page:", error);
        res.status(500).send("Internal Server Error");
    }
});

// Add this new route for Admin Settings
router.get("/admin/settings", checkAuth, async (req, res) => {
    try {
        res.render("admin/settings", { 
            title: "Admin Settings - AI Solutions",
            activeTab: 'settings'
        });
    } catch (error) {
        console.error("Error rendering settings page:", error);
        res.status(500).send("Internal Server Error");
    }
});

router.get("/admin/logout", (req, res) => {
    res.clearCookie('jwt');
    res.redirect('/admin/login');
});

// Add this route
router.get("/blog/:id", async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.id).populate('author', 'name');
        if (!blog) {
            return res.status(404).render('404', { title: 'Blog Not Found' });
        }
        res.render("single-blog", { 
            title: blog.title,
            blog
        });
    } catch (error) {
        console.error("Error rendering single blog page:", error);
        res.status(500).send("Internal Server Error");
    }
});

// Add this route for blog management
router.get("/admin/blog-management", checkAuth, async (req, res) => {
    try {
        res.render("admin/blog-management", { 
            title: "Blog Management - AI Solutions",
            activeTab: 'blog-management'
        });
    } catch (error) {
        console.error("Error rendering blog management page:", error);
        res.status(500).send("Internal Server Error");
    }
});

// Add this new route for gallery management
router.get("/admin/gallery-management", checkAuth, async (req, res) => {
    try {
        res.render("admin/gallery-management", { 
            title: "Gallery Management - AI Solutions",
            activeTab: 'gallery-management'
        });
    } catch (error) {
        console.error("Error rendering gallery management page:", error);
        res.status(500).send("Internal Server Error");
    }
});

export default router; 