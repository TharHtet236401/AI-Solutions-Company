import express from "express";
import path from "path";
import { fileURLToPath } from 'url';
import pageRoutes from './routes/pages.js';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import { connectMongo } from './config/connectMongo.js';
import { mkdirSync } from 'fs';
import {backup} from './migration/migrator.js';
dotenv.config();
const app = express();

// Get the equivalent of __dirname for ES Modules
app.use(express.json());
app.use(cookieParser());
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import usersRoutes from './routes/users.route.js';
import inquiriesRoutes from './routes/inquiries.route.js';
import blogsRoutes from './routes/blogs.route.js';
import galleryRoutes from './routes/gallery.route.js';
import chatRoutes from './routes/chat.route.js';
import adminRoutes from './routes/admin.route.js';

// Set EJS as the template engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Serve static files from the public directory - move this BEFORE routes
app.use(express.static(path.join(__dirname, 'public')));
app.use('/css', express.static(path.join(__dirname, 'public/css')));
app.use('/js', express.static(path.join(__dirname, 'public/js')));
app.use('/images', express.static(path.join(__dirname, 'public/images')));

// Ensure upload directories exist
mkdirSync('public/uploads/blogs', { recursive: true });
mkdirSync('public/uploads/gallery', { recursive: true });

// Add this before your routes
// app.use((req, res, next) => {
//     console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
//     next();
// });

// Use page routes
app.use('/', pageRoutes);
app.use('/admin', adminRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/inquiries', inquiriesRoutes);
app.use('/api/blogs', blogsRoutes);
app.use('/api/gallery', galleryRoutes);
app.use('/api/chat', chatRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// Start the server
app.listen(process.env.PORT, () => {
  connectMongo();
  backup();
  console.log(`Server running on http://localhost:${process.env.PORT}`);
});
