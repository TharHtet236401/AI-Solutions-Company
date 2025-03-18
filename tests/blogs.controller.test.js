import { describe, it, expect, beforeEach, vi } from 'vitest';
import fs from 'fs';
import path from 'path';
import Blog from '../models/blogs.model.js';
import * as blogController from '../controllers/blogs.controller.js';
import { fMsg, fError } from '../utils/libby.js';

// Mock the models and utilities
vi.mock('../models/blogs.model.js');
vi.mock('../utils/libby.js');
vi.mock('fs');
vi.mock('path');

describe('Blog Controller Tests', () => {
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

    describe('getBlogs', () => {
        it('should fetch blogs successfully with default parameters', async () => {
            const mockBlogs = [
                { _id: '1', title: 'Blog 1' },
                { _id: '2', title: 'Blog 2' }
            ];

            Blog.find.mockReturnValue({
                populate: vi.fn().mockReturnThis(),
                sort: vi.fn().mockReturnThis(),
                skip: vi.fn().mockReturnThis(),
                limit: vi.fn().mockResolvedValue(mockBlogs)
            });

            Blog.countDocuments.mockResolvedValue(2);

            await blogController.getBlogs(mockRequest, mockResponse);

            expect(fMsg).toHaveBeenCalledWith(
                mockResponse,
                "Blogs fetched successfully",
                expect.objectContaining({
                    items: mockBlogs,
                    currentPage: 1,
                    totalPages: 1,
                    total: 2
                })
            );
        });

        it('should apply search filter when provided', async () => {
            mockRequest.query.search = 'test';

            const mockBlogs = [{ _id: '1', title: 'Test Blog' }];

            Blog.find.mockReturnValue({
                populate: vi.fn().mockReturnThis(),
                sort: vi.fn().mockReturnThis(),
                skip: vi.fn().mockReturnThis(),
                limit: vi.fn().mockResolvedValue(mockBlogs)
            });

            Blog.countDocuments.mockResolvedValue(1);

            await blogController.getBlogs(mockRequest, mockResponse);

            expect(Blog.find).toHaveBeenCalledWith(expect.objectContaining({
                $or: expect.arrayContaining([
                    { title: expect.any(RegExp) },
                    { content: expect.any(RegExp) },
                    { category: expect.any(RegExp) }
                ])
            }));
        });
    });

    describe('getBlog', () => {
        it('should fetch blog by id successfully', async () => {
            const mockBlog = { _id: 'testId', title: 'Test Blog' };
            mockRequest.params.id = 'testId';

            Blog.findById.mockReturnValue({
                populate: vi.fn().mockResolvedValue(mockBlog)
            });

            await blogController.getBlog(mockRequest, mockResponse);

            expect(fMsg).toHaveBeenCalledWith(
                mockResponse,
                "Blog fetched successfully",
                mockBlog
            );
        });

        it('should return error when blog not found', async () => {
            mockRequest.params.id = 'nonexistentId';
            
            Blog.findById.mockReturnValue({
                populate: vi.fn().mockResolvedValue(null)
            });

            await blogController.getBlog(mockRequest, mockResponse);

            expect(fError).toHaveBeenCalledWith(
                mockResponse,
                "Blog not found",
                404
            );
        });
    });

    describe('createBlog', () => {
        it('should return error when blog photo is missing', async () => {
            mockRequest.body = {
                title: 'Test Blog',
                content: 'Test Content',
                category: 'Test Category'
            };

            await blogController.createBlog(mockRequest, mockResponse);

            expect(fError).toHaveBeenCalledWith(
                mockResponse,
                "Blog photo is required",
                400
            );
        });

        it('should create blog successfully', async () => {
            mockRequest.file = { filename: 'test.jpg' };
            mockRequest.body = {
                title: 'Test Blog',
                content: 'Test Content',
                category: 'Test Category'
            };

            const mockSavedBlog = {
                ...mockRequest.body,
                _id: 'mockId',
                photo: '/uploads/blogs/test.jpg',
                author: 'mockUserId'
            };

            Blog.prototype.save = vi.fn().mockResolvedValue(mockSavedBlog);

            await blogController.createBlog(mockRequest, mockResponse);

            expect(fMsg).toHaveBeenCalledWith(
                mockResponse,
                "Blog created successfully",
                expect.any(Object),
                201
            );
        });
    });

    describe('updateBlog', () => {
        it('should return error when blog not found', async () => {
            mockRequest.params.id = 'nonexistentId';
            mockRequest.body = {
                title: 'Updated Title'
            };

            Blog.findById.mockResolvedValue(null);

            await blogController.updateBlog(mockRequest, mockResponse);

            expect(fError).toHaveBeenCalledWith(
                mockResponse,
                "Blog not found",
                404
            );
        });

        it('should update blog successfully without new photo', async () => {
            mockRequest.params.id = 'testId';
            mockRequest.body = {
                title: 'Updated Title',
                content: 'Updated Content'
            };

            const mockBlog = {
                _id: 'testId',
                title: 'Original Title',
                photo: '/uploads/blogs/test.jpg'
            };

            Blog.findById.mockResolvedValue(mockBlog);
            Blog.findByIdAndUpdate.mockReturnValue({
                populate: vi.fn().mockResolvedValue({
                    ...mockBlog,
                    ...mockRequest.body
                })
            });

            await blogController.updateBlog(mockRequest, mockResponse);

            expect(fMsg).toHaveBeenCalledWith(
                mockResponse,
                "Blog updated successfully",
                expect.any(Object)
            );
        });
    });

    describe('deleteBlog', () => {
        it('should return error when blog not found', async () => {
            mockRequest.params.id = 'nonexistentId';
            Blog.findById.mockResolvedValue(null);

            await blogController.deleteBlog(mockRequest, mockResponse);

            expect(fError).toHaveBeenCalledWith(
                mockResponse,
                "Blog not found",
                404
            );
        });

        it('should delete blog successfully', async () => {
            mockRequest.params.id = 'testId';
            const mockBlog = {
                _id: 'testId',
                photo: '/uploads/blogs/test.jpg'
            };

            Blog.findById.mockResolvedValue(mockBlog);
            Blog.findByIdAndDelete.mockResolvedValue(mockBlog);
            path.join.mockReturnValue('/mock/path/to/image.jpg');
            fs.existsSync.mockReturnValue(true);
            fs.unlink.mockImplementation((path, callback) => callback(null));

            await blogController.deleteBlog(mockRequest, mockResponse);

            expect(fMsg).toHaveBeenCalledWith(
                mockResponse,
                "Blog deleted successfully"
            );
        });
    });

    describe('updateBlogStatus', () => {
        it('should return error for invalid status', async () => {
            mockRequest.params.id = 'testId';
            mockRequest.body = { status: 'invalid-status' };

            await blogController.updateBlogStatus(mockRequest, mockResponse);

            expect(fError).toHaveBeenCalledWith(
                mockResponse,
                "Invalid status value",
                400
            );
        });

        it('should update blog status successfully', async () => {
            mockRequest.params.id = 'testId';
            mockRequest.body = { status: 'published' };

            const mockBlog = {
                _id: 'testId',
                status: 'draft',
                save: vi.fn().mockResolvedValue({
                    _id: 'testId',
                    status: 'published'
                })
            };

            Blog.findById.mockResolvedValue(mockBlog);

            await blogController.updateBlogStatus(mockRequest, mockResponse);

            expect(fMsg).toHaveBeenCalledWith(
                mockResponse,
                "Blog status updated successfully",
                expect.any(Object)
            );
        });
    });
}); 