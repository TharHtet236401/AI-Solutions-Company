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
    res.render("index", { title: "Home" });
  } catch (error) {
    console.error("Error rendering index page:", error);
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
