import express from 'express';
import { validateToken } from '../utils/validator.js';
import Blog from '../models/blogs.model.js';
import User from '../models/users.model.js';

const router = express.Router();

// Blog management route
router.get('/blog-management', validateToken, async (req, res) => {
    try {
        const blogs = await Blog.find()
            .populate('author', 'username')  // Add this to get author details
            .sort({ createdAt: -1 });
            
        res.render('admin/blogs', { 
            title: 'Blog Management',
            blogs,
            activeTab: 'blog-management'
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

// User Management Route
router.get('/user-management', validateToken, async (req, res) => {
    try {
        const users = await User.find().select('-password');
        res.render('admin/users', {
            title: 'User Management',
            users,
            activeTab: 'users'
        });
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).send('Error loading user management page');
    }
});


export default router; 