import express from 'express';
import { validateToken } from '../utils/validator.js';
import Blog from '../models/blogs.model.js';

const router = express.Router();

// Add this route handler
router.get('/blogs', validateToken, async (req, res) => {
    try {
        const blogs = await Blog.find()
            .populate('author', 'username')  // Add this to get author details
            .sort({ createdAt: -1 });
            
        res.render('admin/blogs', { 
            title: 'Blog Management',
            blogs,
            activeTab: 'blogs'
        });
    } catch (error) {
        console.error('Error fetching blogs:', error);
        res.status(500).send('Error loading blog management page');
    }
});

router.get('/visualization', validateToken, (req, res) => {
    res.render('admin/data-visualization', {
        title: 'Data Visualization'
    });
});

// Make sure this route is registered in your server.js
export default router; 