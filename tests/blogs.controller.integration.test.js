import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach, vi } from 'vitest';
import mongoose from 'mongoose';
import { connectMongo } from '../config/connectMongo.js';
import Blog from '../models/blogs.model.js';
import User from '../models/users.model.js';
import * as blogController from '../controllers/blogs.controller.js';
import { encode, fMsg, fError } from '../utils/libby.js';
import path from 'path';
import fs from 'fs';

// Mock libby utilities
vi.mock('../utils/libby.js', () => ({
    encode: vi.fn(),
    fMsg: vi.fn((res, msg, data) => {
        res.json({
            con: true,
            msg,
            result: data
        });
    }),
    fError: vi.fn((res, msg, code = 400) => {
        res.status(code).json({
            con: false,
            msg
        });
    })
}));

describe('Blog Controller Integration Tests', () => {
    let testUser;
    let testBlog;
    let testBlogId;
    let uploadDir;

    // Mock request and response objects
    const mockResponse = () => {
        const res = {};
        res.status = vi.fn().mockReturnValue(res);
        res.json = vi.fn().mockReturnValue(res);
        return res;
    };

    beforeAll(async () => {
        // Connect to test database
        await connectMongo();
        
        // Create test upload directory
        uploadDir = path.join(process.cwd(), 'public', 'uploads', 'blogs');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }

        // Create a test user with a valid role
        const hashedPassword = await encode('testpass123');
        testUser = await User.create({
            username: 'testuser',
            password: hashedPassword,
            role: 'Content'
        });
    });

    beforeEach(async () => {
        // Clear all mocks before each test
        vi.clearAllMocks();
        
        // Create a test blog before each test
        testBlog = await Blog.create({
            title: 'Test Blog',
            content: 'Test Content',
            category: 'Technology',
            photo: '/uploads/blogs/test-photo.jpg',
            author: testUser._id
        });
        testBlogId = testBlog._id;
    });

    afterEach(async () => {
        // Clean up test blogs after each test
        await Blog.deleteMany({});
    });

    afterAll(async () => {
        // Clean up and disconnect
        await Blog.deleteMany({});
        await User.deleteMany({});
        await mongoose.connection.close();

        // Clean up test uploads
        if (fs.existsSync(uploadDir)) {
            fs.rmSync(uploadDir, { recursive: true, force: true });
        }
    });

    describe('getBlogs', () => {
        it('should get all blogs with pagination', async () => {
            const req = {
                query: {
                    page: 1,
                    limit: 8
                }
            };
            const res = mockResponse();

            await blogController.getBlogs(req, res);

            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    con: true,
                    msg: 'Blogs fetched successfully',
                    result: expect.objectContaining({
                        items: expect.any(Array),
                        currentPage: 1,
                        totalPages: expect.any(Number),
                        total: expect.any(Number)
                    })
                })
            );
        });

        it('should filter blogs by search query', async () => {
            // Create additional blogs for search testing
            await Blog.create([
                {
                    title: 'Search Test Blog',
                    content: 'Searchable Content',
                    category: 'AI',
                    photo: '/uploads/blogs/test-photo.jpg',
                    author: testUser._id
                },
                {
                    title: 'Another Blog',
                    content: 'Different Content',
                    category: 'Technology',
                    photo: '/uploads/blogs/test-photo.jpg',
                    author: testUser._id
                }
            ]);

            const req = {
                query: {
                    search: 'Search Test'
                }
            };
            const res = mockResponse();

            await blogController.getBlogs(req, res);

            const response = res.json.mock.calls[0][0];
            expect(response.result.items.some(blog => blog.title.includes('Search Test'))).toBe(true);
            expect(response.result.items.every(blog => 
                blog.title.includes('Search Test') || 
                blog.content.includes('Search Test')
            )).toBe(true);
        });

        it('should filter blogs by category', async () => {
            const req = {
                query: {
                    category: 'Technology'
                }
            };
            const res = mockResponse();

            await blogController.getBlogs(req, res);

            const response = res.json.mock.calls[0][0];
            expect(response.result.items.every(blog => blog.category === 'Technology')).toBe(true);
        });
    });

    describe('getBlog', () => {
        it('should get a single blog by id', async () => {
            const req = {
                params: { id: testBlogId }
            };
            const res = mockResponse();

            await blogController.getBlog(req, res);

            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    con: true,
                    msg: 'Blog fetched successfully',
                    result: expect.objectContaining({
                        title: 'Test Blog',
                        content: 'Test Content',
                        category: 'Technology'
                    })
                })
            );
        });

        it('should return error for non-existent blog', async () => {
            const req = {
                params: { id: new mongoose.Types.ObjectId() }
            };
            const res = mockResponse();

            await blogController.getBlog(req, res);

            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    con: false,
                    msg: 'Blog not found'
                })
            );
        });
    });

    describe('createBlog', () => {
        it('should create a new blog successfully', async () => {
            const req = {
                body: {
                    title: 'New Test Blog',
                    content: 'New Test Content',
                    category: 'AI'
                },
                file: {
                    filename: 'test-photo.jpg'
                },
                user: {
                    _id: testUser._id
                }
            };
            const res = mockResponse();

            await blogController.createBlog(req, res);

            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    con: true,
                    msg: 'Blog created successfully',
                    result: expect.objectContaining({
                        title: 'New Test Blog',
                        content: 'New Test Content',
                        category: 'AI'
                    })
                })
            );
        });

        it('should fail when photo is not provided', async () => {
            const req = {
                body: {
                    title: 'New Test Blog',
                    content: 'New Test Content',
                    category: 'AI'
                },
                user: {
                    _id: testUser._id
                }
            };
            const res = mockResponse();

            await blogController.createBlog(req, res);

            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    con: false,
                    msg: 'Blog photo is required'
                })
            );
        });
    });

    describe('updateBlog', () => {
        it('should update blog successfully', async () => {
            const req = {
                params: { id: testBlogId },
                body: {
                    title: 'Updated Blog Title',
                    content: 'Updated Content',
                    category: 'Innovation'
                },
                user: {
                    _id: testUser._id
                }
            };
            const res = mockResponse();

            await blogController.updateBlog(req, res);

            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    con: true,
                    msg: 'Blog updated successfully',
                    result: expect.objectContaining({
                        title: 'Updated Blog Title',
                        content: 'Updated Content',
                        category: 'Innovation'
                    })
                })
            );
        });

        it('should update blog with new photo', async () => {
            const req = {
                params: { id: testBlogId },
                body: {
                    title: 'Updated Blog Title',
                    category: 'Security'
                },
                file: {
                    filename: 'new-test-photo.jpg'
                },
                user: {
                    _id: testUser._id
                }
            };
            const res = mockResponse();

            await blogController.updateBlog(req, res);

            const updatedBlog = await Blog.findById(testBlogId);
            expect(updatedBlog.photo).toBe('/uploads/blogs/new-test-photo.jpg');
        });
    });

    describe('deleteBlog', () => {
        it('should delete blog successfully', async () => {
            const req = {
                params: { id: testBlogId }
            };
            const res = mockResponse();

            await blogController.deleteBlog(req, res);

            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    con: true,
                    msg: 'Blog deleted successfully'
                })
            );

            // Verify blog was actually deleted
            const deletedBlog = await Blog.findById(testBlogId);
            expect(deletedBlog).toBeNull();
        });

        it('should handle deletion of non-existent blog', async () => {
            const req = {
                params: { id: new mongoose.Types.ObjectId() }
            };
            const res = mockResponse();

            await blogController.deleteBlog(req, res);

            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    con: false,
                    msg: 'Blog not found'
                })
            );
        });
    });
}); 