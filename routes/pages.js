import express from 'express';
import { checkAuth } from '../middleware/authMiddleware.js';
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
        res.render("blog", { title: "Blog - AI Solutions" });
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

// Add this new route for Reports
router.get("/admin/reports", checkAuth, async (req, res) => {
    try {
        res.render("admin/reports", { 
            title: "Analytics & Reports - AI Solutions",
            activeTab: 'reports'
        });
    } catch (error) {
        console.error("Error rendering reports page:", error);
        res.status(500).send("Internal Server Error");
    }
});

router.get("/admin/logout", (req, res) => {
    res.clearCookie('jwt');
    res.redirect('/admin/login');
});

export default router; 