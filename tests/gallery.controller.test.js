import { describe, it, expect, beforeEach, vi } from 'vitest';
import fs from 'fs';
import path from 'path';
import Gallery from '../models/gallery.model.js';
import * as galleryController from '../controllers/gallery.controller.js';
import { fMsg, fError } from '../utils/libby.js';

// Mock the models and utilities
vi.mock('../models/gallery.model.js');
vi.mock('../utils/libby.js');
vi.mock('fs');
vi.mock('path');

describe('Gallery Controller Tests', () => {
    let mockRequest;
    let mockResponse;

    beforeEach(() => {
        mockRequest = {
            query: {},
            body: {},
            params: {},
            user: {
                _id: 'mockUserId'
            },
            file: null
        };

        mockResponse = {
            status: vi.fn().mockReturnThis(),
            json: vi.fn(),
            send: vi.fn()
        };

        // Clear all mocks before each test
        vi.clearAllMocks();
    });

    describe('getGallery', () => {
        it('should fetch gallery items successfully with default parameters', async () => {
            const mockGalleryItems = [
                { _id: '1', title: 'Test 1' },
                { _id: '2', title: 'Test 2' }
            ];

            Gallery.find.mockReturnValue({
                sort: vi.fn().mockReturnThis(),
                skip: vi.fn().mockReturnThis(),
                limit: vi.fn().mockResolvedValue(mockGalleryItems)
            });

            Gallery.countDocuments.mockResolvedValue(2);

            await galleryController.getGallery(mockRequest, mockResponse);

            expect(fMsg).toHaveBeenCalledWith(
                mockResponse,
                "Gallery fetched successfully",
                expect.objectContaining({
                    items: mockGalleryItems,
                    currentPage: 1,
                    totalPages: 1,
                    total: 2,
                    hasMore: false
                })
            );
        });

        it('should apply category filter when provided', async () => {
            mockRequest.query.category = 'test-category';

            const mockGalleryItems = [{ _id: '1', title: 'Test 1', category: 'test-category' }];

            Gallery.find.mockReturnValue({
                sort: vi.fn().mockReturnThis(),
                skip: vi.fn().mockReturnThis(),
                limit: vi.fn().mockResolvedValue(mockGalleryItems)
            });

            Gallery.countDocuments.mockResolvedValue(1);

            await galleryController.getGallery(mockRequest, mockResponse);

            expect(Gallery.find).toHaveBeenCalledWith({ category: 'test-category' });
        });
    });

    describe('getGalleryById', () => {
        it('should fetch gallery item by id successfully', async () => {
            const mockGalleryItem = { _id: 'testId', title: 'Test Item' };
            mockRequest.params.id = 'testId';

            Gallery.findById.mockResolvedValue(mockGalleryItem);

            await galleryController.getGalleryById(mockRequest, mockResponse);

            expect(fMsg).toHaveBeenCalledWith(
                mockResponse,
                "Gallery fetched successfully",
                mockGalleryItem
            );
        });
    });

    describe('createGallery', () => {
        it('should return error when image file is missing', async () => {
            mockRequest.body = {
                title: 'Test Gallery',
                category: 'test-category'
            };

            await galleryController.createGallery(mockRequest, mockResponse);

            expect(fError).toHaveBeenCalledWith(
                mockResponse,
                "Image file is required",
                400
            );
        });

        it('should return error when required fields are missing', async () => {
            mockRequest.file = { filename: 'test.jpg' };
            mockRequest.body = {
                title: 'Test Gallery'
                // Missing category
            };

            await galleryController.createGallery(mockRequest, mockResponse);

            expect(fError).toHaveBeenCalledWith(
                mockResponse,
                "Title and category are required",
                400
            );
        });
    });

    describe('deleteGallery', () => {
        it('should return error when gallery item not found', async () => {
            mockRequest.params.id = 'nonexistentId';
            Gallery.findById.mockResolvedValue(null);

            await galleryController.deleteGallery(mockRequest, mockResponse);

            expect(fError).toHaveBeenCalledWith(
                mockResponse,
                "Gallery item not found",
                404
            );
        });

        it('should delete gallery item successfully', async () => {
            mockRequest.params.id = 'testId';
            const mockGalleryItem = {
                _id: 'testId',
                image: '/uploads/gallery/test.jpg'
            };

            Gallery.findById.mockResolvedValue(mockGalleryItem);
            Gallery.findByIdAndDelete.mockResolvedValue(mockGalleryItem);
            path.join.mockReturnValue('/mock/path/to/image.jpg');
            fs.existsSync.mockReturnValue(true);
            fs.unlink.mockImplementation((path, callback) => callback(null));

            await galleryController.deleteGallery(mockRequest, mockResponse);

            expect(fMsg).toHaveBeenCalledWith(
                mockResponse,
                "Gallery item deleted successfully"
            );
        });
    });

    describe('updateGallery', () => {
        it('should return error when gallery item not found', async () => {
            mockRequest.params.id = 'nonexistentId';
            mockRequest.body = {
                title: 'Updated Title',
                category: 'updated-category'
            };

            Gallery.findById.mockResolvedValue(null);

            await galleryController.updateGallery(mockRequest, mockResponse);

            expect(fError).toHaveBeenCalledWith(
                mockResponse,
                "Gallery item not found",
                404
            );
        });

        it('should update gallery item successfully without new image', async () => {
            mockRequest.params.id = 'testId';
            mockRequest.body = {
                title: 'Updated Title',
                category: 'updated-category',
                description: 'Updated description'
            };

            const mockGalleryItem = {
                _id: 'testId',
                title: 'Original Title',
                category: 'original-category',
                image: '/uploads/gallery/test.jpg'
            };

            Gallery.findById.mockResolvedValue(mockGalleryItem);
            Gallery.findByIdAndUpdate.mockResolvedValue({
                ...mockGalleryItem,
                ...mockRequest.body
            });

            await galleryController.updateGallery(mockRequest, mockResponse);

            expect(fMsg).toHaveBeenCalledWith(
                mockResponse,
                "Gallery item updated successfully",
                expect.any(Object)
            );
        });
    });
}); 