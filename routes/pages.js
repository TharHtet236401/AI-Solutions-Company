import express from 'express';
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

export default router; 