import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach, vi } from 'vitest';
import mongoose from 'mongoose';
import { connectMongo } from '../config/connectMongo.js';
import Gallery from '../models/gallery.model.js';
import User from '../models/users.model.js';
import * as galleryController from '../controllers/gallery.controller.js';
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

// Mock fs module
vi.mock('fs', () => ({
    default: {
        existsSync: vi.fn(() => true),
        unlink: vi.fn((path, callback) => callback(null)),
        mkdirSync: vi.fn(),
        rmdirSync: vi.fn(),
        rmSync: vi.fn()
    },
    existsSync: vi.fn(() => true),
    unlink: vi.fn((path, callback) => callback(null)),
    mkdirSync: vi.fn(),
    rmdirSync: vi.fn(),
    rmSync: vi.fn()
}));

describe('Gallery Controller Integration Tests', () => {
    let testUser;
    let testGallery;
    let testGalleryId;
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
        uploadDir = path.join(process.cwd(), 'public', 'uploads', 'gallery');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }

        // Create a test user
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
        
        // Create a test gallery item before each test
        testGallery = await Gallery.create({
            title: 'Test Gallery',
            category: 'team',
            description: 'Test Description',
            image: '/uploads/gallery/test-image.jpg',
            poster: testUser._id
        });
        testGalleryId = testGallery._id;
    });

    afterEach(async () => {
        // Clean up test gallery items after each test
        await Gallery.deleteMany({});
    });

    afterAll(async () => {
        // Clean up and disconnect
        await Gallery.deleteMany({});
        await User.deleteMany({});
        await mongoose.connection.close();

        // Clean up test uploads - using a try-catch for safer cleanup
        try {
            if (fs.existsSync(uploadDir)) {
                fs.rmdirSync(uploadDir, { recursive: true });
            }
        } catch (error) {
            console.warn('Warning: Could not clean up test upload directory:', error.message);
        }
    });

    describe('getGallery', () => {
        it('should get all gallery items with pagination', async () => {
            const req = {
                query: {
                    page: 1,
                    limit: 12
                }
            };
            const res = mockResponse();

            await galleryController.getGallery(req, res);

            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    con: true,
                    msg: 'Gallery fetched successfully',
                    result: expect.objectContaining({
                        items: expect.any(Array),
                        currentPage: 1,
                        totalPages: expect.any(Number),
                        total: expect.any(Number),
                        hasMore: expect.any(Boolean)
                    })
                })
            );
        });

        it('should filter gallery by category', async () => {
            await Gallery.create([
                {
                    title: 'AI Gallery 1',
                    category: 'team',
                    description: 'AI Description',
                    image: '/uploads/gallery/ai-1.jpg',
                    poster: testUser._id
                },
                {
                    title: 'Tech Gallery 1',
                    category: 'team',
                    description: 'Tech Description',
                    image: '/uploads/gallery/tech-1.jpg',
                    poster: testUser._id
                }
            ]);

            const req = {
                query: {
                    category: 'team'
                }
            };
            const res = mockResponse();

            await galleryController.getGallery(req, res);

            const response = res.json.mock.calls[0][0];
            expect(response.result.items.every(item => item.category === 'team')).toBe(true);
        });
    });

    describe('getGalleryById', () => {
        it('should get a single gallery item by id', async () => {
            const req = {
                params: { id: testGalleryId }
            };
            const res = mockResponse();

            await galleryController.getGalleryById(req, res);

            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    con: true,
                    msg: 'Gallery fetched successfully',
                    result: expect.objectContaining({
                        title: 'Test Gallery',
                        category: 'team'
                    })
                })
            );
        });
    });

    describe('createGallery', () => {
        it('should create a new gallery item successfully', async () => {
            const req = {
                body: {
                    title: 'New Gallery',
                    category: 'team',
                    description: 'New Description'
                },
                file: {
                    filename: 'new-image.jpg'
                },
                user: {
                    _id: testUser._id
                }
            };
            const res = mockResponse();

            await galleryController.createGallery(req, res);

            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    con: true,
                    msg: 'Gallery item created successfully',
                    result: expect.objectContaining({
                        title: 'New Gallery',
                        category: 'team',
                        description: 'New Description'
                    })
                })
            );
        });

        it('should fail when image is not provided', async () => {
            const req = {
                body: {
                    title: 'New Gallery',
                    category: 'team',
                    description: 'New Description'
                },
                user: {
                    _id: testUser._id
                }
            };
            const res = mockResponse();

            await galleryController.createGallery(req, res);

            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    con: false,
                    msg: 'Image file is required'
                })
            );
        });

        it('should fail when required fields are missing', async () => {
            const req = {
                body: {
                    description: 'New Description'
                },
                file: {
                    filename: 'new-image.jpg'
                },
                user: {
                    _id: testUser._id
                }
            };
            const res = mockResponse();

            await galleryController.createGallery(req, res);

            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    con: false,
                    msg: 'Title and category are required'
                })
            );
        });
    });

    describe('updateGallery', () => {
        it('should update gallery item successfully', async () => {
            const req = {
                params: { id: testGalleryId },
                body: {
                    title: 'Updated Gallery',
                    category: 'team',
                    description: 'Updated Description'
                },
                user: {
                    _id: testUser._id
                }
            };
            const res = mockResponse();

            await galleryController.updateGallery(req, res);

            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    con: true,
                    msg: 'Gallery item updated successfully',
                    result: expect.objectContaining({
                        title: 'Updated Gallery',
                        category: 'team',
                        description: 'Updated Description'
                    })
                })
            );
        });

        it('should update gallery with new image', async () => {
            const req = {
                params: { id: testGalleryId },
                body: {
                    title: 'Updated Gallery'
                },
                file: {
                    filename: 'updated-image.jpg'
                },
                user: {
                    _id: testUser._id
                }
            };
            const res = mockResponse();

            await galleryController.updateGallery(req, res);

            const updatedGallery = await Gallery.findById(testGalleryId);
            expect(updatedGallery.image).toBe('/uploads/gallery/updated-image.jpg');
        });

        it('should return error for non-existent gallery item', async () => {
            const req = {
                params: { id: new mongoose.Types.ObjectId() },
                body: {
                    title: 'Updated Gallery'
                }
            };
            const res = mockResponse();

            await galleryController.updateGallery(req, res);

            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    con: false,
                    msg: 'Gallery item not found'
                })
            );
        });
    });

    describe('deleteGallery', () => {
        it('should delete gallery item successfully', async () => {
            const req = {
                params: { id: testGalleryId }
            };
            const res = mockResponse();

            await galleryController.deleteGallery(req, res);

            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    con: true,
                    msg: 'Gallery item deleted successfully'
                })
            );

            // Verify gallery item was actually deleted
            const deletedGallery = await Gallery.findById(testGalleryId);
            expect(deletedGallery).toBeNull();
        });

        it('should handle deletion of non-existent gallery item', async () => {
            const req = {
                params: { id: new mongoose.Types.ObjectId() }
            };
            const res = mockResponse();

            await galleryController.deleteGallery(req, res);

            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    con: false,
                    msg: 'Gallery item not found'
                })
            );
        });
    });
}); 