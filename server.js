import express from "express";
import path from "path";
import { fileURLToPath } from 'url';
import pageRoutes from './routes/pages.js';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import { connectMongo } from './config/connectMongo.js';
dotenv.config();
const app = express();

// Get the equivalent of __dirname for ES Modules
app.use(express.json());
app.use(cookieParser());
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import usersRoutes from './routes/users.route.js';
import inquiriesRoutes from './routes/inquiries.route.js';
// Set EJS as the template engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// Use page routes
app.use('/', pageRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/inquiries', inquiriesRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// Start the server
app.listen(process.env.PORT, () => {
  connectMongo();
  console.log(`Server running on http://localhost:${process.env.PORT}`);
});
