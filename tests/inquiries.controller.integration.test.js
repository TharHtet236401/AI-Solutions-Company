import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach, vi } from 'vitest';
import mongoose from 'mongoose';
import { connectMongo } from '../config/connectMongo.js';
import Inquiry from '../models/inquiries.model.js';
import UnvalidatedInquiry from '../models/unvalidated_inquiries.model.js';
import User from '../models/users.model.js';
import * as inquiryController from '../controllers/inquiries.controller.js';
import { encode } from '../utils/libby.js';
import { sendVerficationCodeEmail, sendThankYouEmail, sendInquiryReplyEmail } from '../email/mailtrap/email.js';

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
    let testUnvalidatedInquiry;

    // Mock request and response objects
    const mockResponse = () => {
        const res = {};
        res.status = vi.fn().mockReturnValue(res);
        res.json = vi.fn().mockReturnValue(res);
        res.setHeader = vi.fn().mockReturnValue(res);
        res.send = vi.fn().mockReturnValue(res);
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
        // Create a test inquiry before each test
        testInquiry = await Inquiry.create({
            name: 'Test User',
            email: 'test@example.com',
            phoneNumber: '1234567890',
            companyName: 'Test Company',
            country: 'Test Country',
            jobTitle: 'Test Title',
            jobDetails: 'Test Details',
            status: 'pending'
        });
        testInquiryId = testInquiry._id;

        // Create a test unvalidated inquiry
        testUnvalidatedInquiry = await UnvalidatedInquiry.create({
            name: 'Unvalidated User',
            email: 'unvalidated@example.com',
            phoneNumber: '0987654321',
            companyName: 'Unvalidated Company',
            country: 'Test Country',
            jobTitle: 'Test Title',
            jobDetails: 'Test Details',
            verificationCode: '123456',
            verificationCodeExpiresAt: new Date(Date.now() + 15 * 60 * 1000),
            verificationCodeSentAt: new Date()
        });
    });

    afterEach(async () => {
        // Clean up test data after each test
        await Inquiry.deleteMany({});
        await UnvalidatedInquiry.deleteMany({});
    });

    afterAll(async () => {
        // Clean up and disconnect
        await Inquiry.deleteMany({});
        await UnvalidatedInquiry.deleteMany({});
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

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    con: true,
                    msg: 'Inquiries fetched successfully',
                    result: expect.objectContaining({
                        inquiries: expect.any(Array),
                        totalPages: expect.any(Number),
                        total: expect.any(Number),
                        statusCounts: expect.any(Object),
                        countries: expect.any(Array)
                    })
                })
            );
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

        it('should filter inquiries by country', async () => {
            const req = {
                query: {
                    country: 'Test Country'
                }
            };
            const res = mockResponse();

            await inquiryController.getInquiries(req, res);

            const response = res.json.mock.calls[0][0];
            expect(response.result.inquiries.every(inquiry => inquiry.country === 'Test Country')).toBe(true);
        });
    });

    describe('createInquiry', () => {
        it('should create a new inquiry successfully', async () => {
            const req = {
                body: {
                    name: 'New User',
                    email: 'new@example.com',
                    phoneNumber: '1234567890',
                    companyName: 'New Company',
                    country: 'Test Country',
                    jobTitle: 'Test Title',
                    jobDetails: 'Test Details'
                }
            };
            const res = mockResponse();

            await inquiryController.createInquiry(req, res);

            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    con: true,
                    msg: 'Inquiry created successfully',
                    result: expect.objectContaining({
                        name: 'New User',
                        email: 'new@example.com'
                    })
                })
            );
            expect(sendVerficationCodeEmail).toHaveBeenCalled();
        });

        it('should fail when required fields are missing', async () => {
            const req = {
                body: {
                    name: 'New User',
                    email: 'new@example.com'
                    // Missing other required fields
                }
            };
            const res = mockResponse();

            await inquiryController.createInquiry(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    con: false,
                    msg: 'All fields are required'
                })
            );
        });
    });

    describe('verifyInquiry', () => {
        it('should verify inquiry successfully', async () => {
            const req = {
                body: {
                    verificationCode: '123456'
                }
            };
            const res = mockResponse();

            await inquiryController.verifyInquiry(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    con: true,
                    msg: 'Inquiry verified successfully',
                    result: expect.objectContaining({
                        name: 'Unvalidated User',
                        email: 'unvalidated@example.com'
                    })
                })
            );
            expect(sendThankYouEmail).toHaveBeenCalled();
        });

        it('should fail with invalid verification code', async () => {
            const req = {
                body: {
                    verificationCode: 'invalid'
                }
            };
            const res = mockResponse();

            await inquiryController.verifyInquiry(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    con: false,
                    msg: 'Invalid verification code'
                })
            );
        });
    });

    describe('updateInquiryStatus', () => {
        it('should update inquiry status successfully', async () => {
            const req = {
                params: { id: testInquiryId },
                body: { status: 'in-progress' },
                user: { _id: testUser._id }
            };
            const res = mockResponse();

            await inquiryController.updateInquiryStatus(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    con: true,
                    msg: 'Status updated successfully',
                    result: expect.objectContaining({
                        status: 'in-progress',
                        statusResponsedBy: testUser._id
                    })
                })
            );
        });

        it('should fail with invalid status', async () => {
            const req = {
                params: { id: testInquiryId },
                body: { status: 'invalid-status' },
                user: { _id: testUser._id }
            };
            const res = mockResponse();

            await inquiryController.updateInquiryStatus(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    con: false,
                    msg: 'Invalid status value'
                })
            );
        });
    });

    describe('replyToInquiry', () => {
        it('should send reply email successfully', async () => {
            const req = {
                params: { id: testInquiryId },
                body: {
                    subject: 'Test Subject',
                    content: 'Test Content',
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
            expect(sendInquiryReplyEmail).toHaveBeenCalled();

            // Verify status was updated to follow-up
            const updatedInquiry = await Inquiry.findById(testInquiryId);
            expect(updatedInquiry.status).toBe('follow-up');
        });
    });

    describe('getVisualizationData', () => {
        it('should fetch visualization data successfully', async () => {
            const req = {};
            const res = mockResponse();

            await inquiryController.getVisualizationData(req, res);

            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    con: true,
                    msg: 'Visualization data fetched successfully',
                    result: expect.objectContaining({
                        statusDistribution: expect.any(Array),
                        yearDistribution: expect.any(Array),
                        geographicalDistribution: expect.any(Array)
                    })
                })
            );
        });
    });
}); 