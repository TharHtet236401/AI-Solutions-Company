import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach, vi } from 'vitest';
import mongoose from 'mongoose';
import { connectMongo } from '../config/connectMongo.js';
import Inquiry from '../models/inquiries.model.js';
import User from '../models/users.model.js';
import * as inquiryController from '../controllers/inquiries.controller.js';
import { encode, fMsg, fError } from '../utils/libby.js';

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

// Mock email functions
vi.mock('../email/mailtrap/email.js', () => ({
    sendVerficationCodeEmail: vi.fn(),
    sendThankYouEmail: vi.fn(),
    sendInquiryReplyEmail: vi.fn()
}));

describe('Inquiry Controller Integration Tests', () => {
    let testUser;
    let testInquiry;
    let testInquiryId;

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

        // Create a test user
        const hashedPassword = await encode('testpass123');
        testUser = await User.create({
            username: 'testuser',
            password: hashedPassword,
            role: 'Customer Support'
        });
    });

    beforeEach(async () => {
        // Clear all mocks before each test
        vi.clearAllMocks();
        
        // Create a test inquiry before each test
        testInquiry = await Inquiry.create({
            name: 'Test User',
            email: 'test@example.com',
            phoneNumber: '+1234567890',
            companyName: 'Test Company',
            country: 'Test Country',
            jobTitle: 'Test Job',
            jobDetails: 'Test Job Details',
            status: 'pending',
            statusResponsedBy: testUser._id
        });
        testInquiryId = testInquiry._id;
    });

    afterEach(async () => {
        // Clean up test inquiries after each test
        await Inquiry.deleteMany({});
    });

    afterAll(async () => {
        // Clean up and disconnect
        await Inquiry.deleteMany({});
        await User.deleteMany({});
        await mongoose.connection.close();
    });

    describe('getInquiries', () => {
        it('should get all inquiries with pagination', async () => {
            const req = {
                query: {
                    page: 1,
                    limit: 10
                }
            };
            const res = mockResponse();

            await inquiryController.getInquiries(req, res);

            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    con: true,
                    msg: 'Inquiries fetched successfully',
                    result: expect.objectContaining({
                        inquiries: expect.any(Array),
                        totalPages: expect.any(Number),
                        total: expect.any(Number)
                    })
                })
            );
        });

        it('should filter inquiries by search query', async () => {
            await Inquiry.create([
                {
                    name: 'Search Test User',
                    email: 'search@test.com',
                    phoneNumber: '+1234567890',
                    companyName: 'Search Company',
                    country: 'Test Country',
                    jobTitle: 'Test Job',
                    jobDetails: 'Test Details'
                },
                {
                    name: 'Another User',
                    email: 'another@test.com',
                    phoneNumber: '+1234567891',
                    companyName: 'Another Company',
                    country: 'Another Country',
                    jobTitle: 'Another Job',
                    jobDetails: 'Another Details'
                }
            ]);

            const req = {
                query: {
                    search: 'Search'
                }
            };
            const res = mockResponse();

            await inquiryController.getInquiries(req, res);

            const response = res.json.mock.calls[0][0];
            expect(response.result.inquiries.some(inquiry => 
                inquiry.name.includes('Search') || 
                inquiry.companyName.includes('Search')
            )).toBe(true);
        });

        it('should filter inquiries by status', async () => {
            const req = {
                query: {
                    status: 'pending'
                }
            };
            const res = mockResponse();

            await inquiryController.getInquiries(req, res);

            const response = res.json.mock.calls[0][0];
            expect(response.result.inquiries.every(inquiry => inquiry.status === 'pending')).toBe(true);
        });
    });

    describe('getInquiry', () => {
        it('should get a single inquiry by id', async () => {
            const req = {
                params: { id: testInquiryId }
            };
            const res = mockResponse();

            await inquiryController.getInquiry(req, res);

            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    con: true,
                    msg: 'Inquiry fetched successfully',
                    result: expect.objectContaining({
                        name: 'Test User',
                        email: 'test@example.com'
                    })
                })
            );
        });

        it('should return error for non-existent inquiry', async () => {
            const req = {
                params: { id: new mongoose.Types.ObjectId() }
            };
            const res = mockResponse();

            await inquiryController.getInquiry(req, res);

            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    con: false,
                    msg: 'Inquiry not found'
                })
            );
        });
    });

    describe('createInquiry', () => {
        it('should create a new inquiry successfully', async () => {
            const req = {
                body: {
                    name: 'New Test User',
                    email: 'newtest@example.com',
                    phoneNumber: '+1234567890',
                    companyName: 'New Test Company',
                    country: 'New Test Country',
                    jobTitle: 'New Test Job',
                    jobDetails: 'New Test Job Details'
                }
            };
            const res = mockResponse();

            await inquiryController.createInquiry(req, res);

            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    con: true,
                    msg: 'Inquiry created successfully'
                })
            );
        });

        it('should fail when required fields are missing', async () => {
            const req = {
                body: {
                    name: 'New Test User',
                    email: 'newtest@example.com'
                    // Missing required fields
                }
            };
            const res = mockResponse();

            await inquiryController.createInquiry(req, res);

            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    con: false,
                    msg: 'All fields are required'
                })
            );
        });
    });

    describe('updateInquiryStatus', () => {
        it('should update inquiry status successfully', async () => {
            const req = {
                params: { id: testInquiryId },
                body: {
                    status: 'in-progress'
                },
                user: {
                    _id: testUser._id
                }
            };
            const res = mockResponse();

            await inquiryController.updateInquiryStatus(req, res);

            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    con: true,
                    msg: 'Status updated successfully',
                    result: expect.objectContaining({
                        status: 'in-progress'
                    })
                })
            );
        });

        it('should fail with invalid status', async () => {
            const req = {
                params: { id: testInquiryId },
                body: {
                    status: 'invalid-status'
                },
                user: {
                    _id: testUser._id
                }
            };
            const res = mockResponse();

            await inquiryController.updateInquiryStatus(req, res);

            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    con: false,
                    msg: 'Invalid status value'
                })
            );
        });
    });

    describe('deleteInquiry', () => {
        it('should delete inquiry successfully', async () => {
            const req = {
                params: { id: testInquiryId }
            };
            const res = mockResponse();

            await inquiryController.deleteInquiry(req, res);

            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    con: true,
                    msg: 'Inquiry deleted successfully'
                })
            );

            // Verify inquiry was actually deleted
            const deletedInquiry = await Inquiry.findById(testInquiryId);
            expect(deletedInquiry).toBeNull();
        });
    });

    describe('replyToInquiry', () => {
        it('should send reply email successfully', async () => {
            const req = {
                params: { id: testInquiryId },
                body: {
                    subject: 'Test Reply',
                    content: 'Test Reply Content',
                    email: 'test@example.com'
                }
            };
            const res = mockResponse();

            await inquiryController.replyToInquiry(req, res);

            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    con: true,
                    msg: 'Email sent successfully'
                })
            );
        });
    });

    describe('exportInquiries', () => {
        it('should export inquiries as CSV', async () => {
            const req = {
                query: {
                    format: 'csv'
                }
            };
            const res = {
                setHeader: vi.fn(),
                status: vi.fn().mockReturnThis(),
                send: vi.fn()
            };

            await inquiryController.exportInquiries(req, res);

            expect(res.setHeader).toHaveBeenCalledWith('Content-Type', 'text/csv');
            expect(res.setHeader).toHaveBeenCalledWith(
                'Content-Disposition',
                'attachment; filename=inquiries-export.csv'
            );
        });

        it('should export inquiries as Excel', async () => {
            const req = {
                query: {
                    format: 'excel'
                }
            };
            const res = {
                setHeader: vi.fn(),
                status: vi.fn().mockReturnThis(),
                send: vi.fn()
            };

            await inquiryController.exportInquiries(req, res);

            expect(res.setHeader).toHaveBeenCalledWith(
                'Content-Type',
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            );
            expect(res.setHeader).toHaveBeenCalledWith(
                'Content-Disposition',
                'attachment; filename=inquiries-export.xlsx'
            );
        });
    });
}); 