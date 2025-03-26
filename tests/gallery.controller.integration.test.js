import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach, vi } from 'vitest';
import mongoose from 'mongoose';
import { connectMongo } from '../config/connectMongo.js';
import Gallery from '../models/gallery.model.js';
import User from '../models/users.model.js';
import * as galleryController from '../controllers/gallery.controller.js';
import { encode } from '../utils/libby.js';
import path from 'path';
import fs from 'fs';
import multer from 'multer';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Mock fs module
vi.mock('fs', () => ({
    default: {
        existsSync: vi.fn(() => true),
        mkdirSync: vi.fn(),
        unlink: vi.fn(),
        rmSync: vi.fn(),
        writeFileSync: vi.fn(),
        readdirSync: vi.fn(() => [])
    },
    existsSync: vi.fn(() => true),
    mkdirSync: vi.fn(),
    unlink: vi.fn(),
    rmSync: vi.fn(),
    writeFileSync: vi.fn(),
    readdirSync: vi.fn(() => [])
}));

describe('Gallery Controller Integration Tests', () => {
    let testUser;
    let testGallery;
    let testGalleryId;
    let uploadDir;
    let storage;

    beforeAll(async () => {
        // Connect to test database
        await connectMongo();
        
        // Set up test upload directory
        uploadDir = path.join(__dirname, '..', 'public', 'uploads', 'gallery');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }

        // Configure multer for real file uploads
        storage = multer.diskStorage({
            destination: function (req, file, cb) {
                cb(null, uploadDir);
            },
            filename: function (req, file, cb) {
                cb(null, Date.now() + '-' + file.originalname);
            }
        });

        // Create a test user
        const hashedPassword = await encode('testpass123');
        testUser = await User.create({
            username: 'testuser',
            password: hashedPassword,
            role: 'Content'
        });
    });

    beforeEach(async () => {
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
        
        // Clean up uploaded files
        const files = fs.readdirSync(uploadDir);
        for (const file of files) {
            if (file !== '.gitkeep') {
                fs.unlinkSync(path.join(uploadDir, file));
            }
        }
    });

    afterAll(async () => {
        // Clean up and disconnect
        await Gallery.deleteMany({});
        await User.deleteMany({});
        await mongoose.connection.close();

        // Clean up test uploads
        try {
            if (fs.existsSync(uploadDir)) {
                fs.rmSync(uploadDir, { recursive: true, force: true });
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
            const res = {
                status: function(code) {
                    this.statusCode = code;
                    return this;
                },
                json: function(data) {
                    this.body = data;
                }
            };

            await galleryController.getGallery(req, res);

            expect(res.statusCode).toBe(200);
            expect(res.body.con).toBe(true);
            expect(res.body.msg).toBe('Gallery fetched successfully');
            expect(res.body.result.items).toHaveLength(1); // Including the one from beforeEach
            expect(res.body.result.currentPage).toBe(1);
            expect(res.body.result.totalPages).toBe(1);
            expect(res.body.result.total).toBe(1);
        });

        it('should filter gallery by category', async () => {
            // Create gallery items with different categories
            await Gallery.create([
                {
                    title: 'Team Gallery',
                    category: 'team',
                    description: 'Team Description',
                    image: '/uploads/gallery/team.jpg',
                    poster: testUser._id
                },
                {
                    title: 'Product Gallery',
                    category: 'product',
                    description: 'Product Description',
                    image: '/uploads/gallery/product.jpg',
                    poster: testUser._id
                }
            ]);

            const req = {
                query: {
                    category: 'team'
                }
            };
            const res = {
                status: function(code) {
                    this.statusCode = code;
                    return this;
                },
                json: function(data) {
                    this.body = data;
                }
            };

            await galleryController.getGallery(req, res);

            expect(res.statusCode).toBe(200);
            expect(res.body.result.items.every(item => item.category === 'team')).toBe(true);
        });
    });

    describe('getGalleryById', () => {
        it('should get a single gallery item by id', async () => {
            const req = {
                params: { id: testGalleryId }
            };
            const res = {
                status: function(code) {
                    this.statusCode = code;
                    return this;
                },
                json: function(data) {
                    this.body = data;
                }
            };

            await galleryController.getGalleryById(req, res);

            expect(res.statusCode).toBe(200);
            expect(res.body.con).toBe(true);
            expect(res.body.msg).toBe('Gallery fetched successfully');
            expect(res.body.result.title).toBe('Test Gallery');
            expect(res.body.result.category).toBe('team');
        });
    });

    describe('createGallery', () => {
        it('should create a new gallery item with real file upload', async () => {
            const req = {
                body: {
                    title: 'New Gallery',
                    category: 'team',
                    description: 'New Description'
                },
                file: {
                    filename: 'test-image.jpg',
                    path: path.join(uploadDir, 'test-image.jpg'),
                    originalname: 'test-image.jpg',
                    mimetype: 'image/jpeg'
                },
                user: {
                    _id: testUser._id
                }
            };
            const res = {
                status: function(code) {
                    this.statusCode = code;
                    return this;
                },
                json: function(data) {
                    this.body = data;
                }
            };

            await galleryController.createGallery(req, res);

            expect(res.statusCode).toBe(201);
            expect(res.body.con).toBe(true);
            expect(res.body.msg).toBe('Gallery item created successfully');
            expect(res.body.result.title).toBe('New Gallery');
            expect(res.body.result.category).toBe('team');
            expect(res.body.result.description).toBe('New Description');
            expect(res.body.result.image).toContain('/uploads/gallery/');
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
            const res = {
                status: function(code) {
                    this.statusCode = code;
                    return this;
                },
                json: function(data) {
                    this.body = data;
                }
            };

            await galleryController.createGallery(req, res);

            expect(res.statusCode).toBe(400);
            expect(res.body.con).toBe(false);
            expect(res.body.msg).toBe('Image file is required');
        });

        it('should fail when required fields are missing', async () => {
            const req = {
                file: {
                    filename: 'test-image.jpg'
                },
                body: {
                    title: 'New Gallery'
                    // Missing category
                },
                user: {
                    _id: testUser._id
                }
            };
            const res = {
                status: function(code) {
                    this.statusCode = code;
                    return this;
                },
                json: function(data) {
                    this.body = data;
                }
            };

            await galleryController.createGallery(req, res);

            expect(res.statusCode).toBe(400);
            expect(res.body.con).toBe(false);
            expect(res.body.msg).toBe('Title and category are required');
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
            const res = {
                status: function(code) {
                    this.statusCode = code;
                    return this;
                },
                json: function(data) {
                    this.body = data;
                }
            };

            await galleryController.updateGallery(req, res);

            expect(res.statusCode).toBe(200);
            expect(res.body.con).toBe(true);
            expect(res.body.msg).toBe('Gallery item updated successfully');
            expect(res.body.result.title).toBe('Updated Gallery');
            expect(res.body.result.category).toBe('team');
            expect(res.body.result.description).toBe('Updated Description');
        });

        it('should update gallery with new image', async () => {
            const req = {
                params: { id: testGalleryId },
                body: {
                    title: 'Updated Gallery',
                    category: 'team'
                },
                file: {
                    filename: 'new-test-image.jpg'
                },
                user: {
                    _id: testUser._id
                }
            };
            const res = {
                status: function(code) {
                    this.statusCode = code;
                    return this;
                },
                json: function(data) {
                    this.body = data;
                }
            };

            await galleryController.updateGallery(req, res);

            expect(res.statusCode).toBe(200);
            expect(res.body.result.image).toBe('/uploads/gallery/new-test-image.jpg');
        });

        it('should return error for non-existent gallery item', async () => {
            const req = {
                params: { id: new mongoose.Types.ObjectId() },
                body: {
                    title: 'Updated Gallery',
                    category: 'team'
                },
                user: {
                    _id: testUser._id
                }
            };
            const res = {
                status: function(code) {
                    this.statusCode = code;
                    return this;
                },
                json: function(data) {
                    this.body = data;
                }
            };

            await galleryController.updateGallery(req, res);

            expect(res.statusCode).toBe(404);
            expect(res.body.con).toBe(false);
            expect(res.body.msg).toBe('Gallery item not found');
        });
    });

    describe('deleteGallery', () => {
        it('should delete gallery item and associated file', async () => {
            const req = {
                params: { id: testGalleryId }
            };
            const res = {
                status: function(code) {
                    this.statusCode = code;
                    return this;
                },
                json: function(data) {
                    this.body = data;
                }
            };

            await galleryController.deleteGallery(req, res);

            expect(res.statusCode).toBe(200);
            expect(res.body.con).toBe(true);
            expect(res.body.msg).toBe('Gallery item deleted successfully');

            // Verify gallery item was deleted from database
            const deletedGallery = await Gallery.findById(testGalleryId);
            expect(deletedGallery).toBeNull();
        });

        it('should handle deletion of non-existent gallery item', async () => {
            const req = {
                params: { id: new mongoose.Types.ObjectId() }
            };
            const res = {
                status: function(code) {
                    this.statusCode = code;
                    return this;
                },
                json: function(data) {
                    this.body = data;
                }
            };

            await galleryController.deleteGallery(req, res);

            expect(res.statusCode).toBe(404);
            expect(res.body.con).toBe(false);
            expect(res.body.msg).toBe('Gallery item not found');
        });
    });
}); 