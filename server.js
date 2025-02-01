import express from "express";
import path from "path";
import { fileURLToPath } from 'url';

const app = express();

// Get the equivalent of __dirname for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Set EJS as the template engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Serve static files (CSS, images, etc.)
app.use(express.static("public"));

// Routes with error handling
app.get("/", async (req, res) => {
  try {
    res.render("index", { title: "AI Solutions - Transforming Tomorrow" });
  } catch (error) {
    console.error("Error rendering index page:", error);
    res.status(500).send("Internal Server Error");
  }
});

app.get("/solutions", async (req, res) => {
  try {
    res.render("solutions", { title: "Software Solutions - AI Solutions" });
  } catch (error) {
    console.error("Error rendering solutions page:", error);
    res.status(500).send("Internal Server Error");
  }
});

app.get("/industries", async (req, res) => {
  try {
    res.render("industries", { title: "Industries - AI Solutions" });
  } catch (error) {
    console.error("Error rendering industries page:", error);
    res.status(500).send("Internal Server Error");
  }
});

app.get("/feedback", async (req, res) => {
  try {
    res.render("feedback", { title: "Customer Feedback - AI Solutions" });
  } catch (error) {
    console.error("Error rendering feedback page:", error);
    res.status(500).send("Internal Server Error");
  }
});

app.get("/blog", async (req, res) => {
  try {
    res.render("blog", { title: "Blog - AI Solutions" });
  } catch (error) {
    console.error("Error rendering blog page:", error);
    res.status(500).send("Internal Server Error");
  }
});

app.get("/gallery", async (req, res) => {
  try {
    res.render("gallery", { title: "Gallery - AI Solutions" });
  } catch (error) {
    console.error("Error rendering gallery page:", error);
    res.status(500).send("Internal Server Error");
  }
});

app.get("/about", async (req, res) => {
  try {
    res.render("about", { title: "About Us" });
  } catch (error) {
    console.error("Error rendering about page:", error);
    res.status(500).send("Internal Server Error");
  }
});

app.get("/contact", async (req, res) => {
  try {
    res.render("contact", { title: "Contact" });
  } catch (error) {
    console.error("Error rendering contact page:", error);
    res.status(500).send("Internal Server Error");
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// Start the server
app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
