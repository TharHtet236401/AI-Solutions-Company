import { describe, it, expect, beforeEach, vi } from 'vitest';
import mongoose from 'mongoose';
import * as inquiryController from '../controllers/inquiries.controller.js';
import Inquiry from '../models/inquiries.model.js';
import UnvalidatedInquiry from '../models/unvalidated_inquiries.model.js';
import { fMsg, fError } from '../utils/libby.js';
import { sendVerficationCodeEmail, sendThankYouEmail, sendInquiryReplyEmail } from '../email/mailtrap/email.js';

// Mock the models and utilities
vi.mock('../models/inquiries.model.js');
vi.mock('../models/unvalidated_inquiries.model.js');
vi.mock('../utils/libby.js');
vi.mock('../email/mailtrap/email.js');

describe('Inquiry Controller Tests', () => {
    let mockRequest;
    let mockResponse;

    beforeEach(() => {
        mockRequest = {
            query: {},
            body: {},
            params: {},
            user: {
                _id: 'mockUserId'
            }
        };

        mockResponse = {
            status: vi.fn().mockReturnThis(),
            json: vi.fn(),
            send: vi.fn(),
            setHeader: vi.fn()
        };

        // Clear all mocks before each test
        vi.clearAllMocks();
    });

    describe('getInquiries', () => {
        it('should fetch inquiries successfully with default parameters', async () => {
            const mockInquiries = [
                { id: '1', name: 'Test 1' },
                { id: '2', name: 'Test 2' }
            ];

            Inquiry.find.mockReturnValue({
                sort: vi.fn().mockReturnThis(),
                skip: vi.fn().mockReturnThis(),
                limit: vi.fn().mockResolvedValue(mockInquiries)
            });

            Inquiry.countDocuments.mockResolvedValue(2);
            Inquiry.distinct.mockResolvedValue(['USA', 'UK']);
            Inquiry.aggregate.mockResolvedValue([
                { _id: 'pending', count: 1 },
                { _id: 'in-progress', count: 1 }
            ]);

            await inquiryController.getInquiries(mockRequest, mockResponse);

            expect(fMsg).toHaveBeenCalledWith(
                mockResponse,
                "Inquiries fetched successfully",
                expect.objectContaining({
                    inquiries: mockInquiries,
                    totalPages: expect.any(Number)
                }),
                200
            );
        });
    });

    describe('createInquiry', () => {
        it('should return error when required fields are missing', async () => {
            mockRequest.body = {
                name: 'Test User'
                // Missing other required fields
            };

            await inquiryController.createInquiry(mockRequest, mockResponse);

            expect(fError).toHaveBeenCalledWith(
                mockResponse,
                "All fields are required",
                400
            );
        });
    });

    describe('verifyInquiry', () => {
        it('should verify inquiry successfully', async () => {
            const mockUnvalidatedInquiry = {
                name: 'Test User',
                email: 'test@example.com',
                phoneNumber: '1234567890',
                companyName: 'Test Company',
                country: 'Test Country',
                jobTitle: 'Test Title',
                jobDetails: 'Test Details',
                verificationCodeExpiresAt: new Date(Date.now() + 1000 * 60),
                deleteOne: vi.fn().mockResolvedValue(true)
            };

            mockRequest.body = {
                verificationCode: '123456'
            };

            UnvalidatedInquiry.findOne.mockResolvedValue(mockUnvalidatedInquiry);
            Inquiry.create.mockResolvedValue(mockUnvalidatedInquiry);
            sendThankYouEmail.mockResolvedValue(true);

            await inquiryController.verifyInquiry(mockRequest, mockResponse);

            expect(fMsg).toHaveBeenCalledWith(
                mockResponse,
                "Inquiry verified successfully",
                expect.any(Object),
                200
            );
        });
    });

    describe('updateInquiryStatus', () => {
        it('should update inquiry status successfully', async () => {
            mockRequest.params = { id: 'mockId' };
            mockRequest.body = { status: 'in-progress' };

            const mockUpdatedInquiry = {
                _id: 'mockId',
                status: 'in-progress'
            };

            Inquiry.findByIdAndUpdate.mockResolvedValue(mockUpdatedInquiry);

            await inquiryController.updateInquiryStatus(mockRequest, mockResponse);

            expect(fMsg).toHaveBeenCalledWith(
                mockResponse,
                "Status updated successfully",
                mockUpdatedInquiry,
                200
            );
        });

        it('should return error for invalid status', async () => {
            mockRequest.params = { id: 'mockId' };
            mockRequest.body = { status: 'invalid-status' };

            await inquiryController.updateInquiryStatus(mockRequest, mockResponse);

            expect(fError).toHaveBeenCalledWith(
                mockResponse,
                "Invalid status value",
                400
            );
        });
    });

    describe('replyToInquiry', () => {
        it('should send reply email successfully', async () => {
            mockRequest.params = { id: 'mockId' };
            mockRequest.body = {
                email: 'test@example.com',
                subject: 'Test Subject',
                content: 'Test Content'
            };

            const mockInquiry = {
                _id: 'mockId',
                status: 'pending',
                save: vi.fn().mockResolvedValue(true)
            };

            Inquiry.findById.mockResolvedValue(mockInquiry);
            sendInquiryReplyEmail.mockResolvedValue(true);

            await inquiryController.replyToInquiry(mockRequest, mockResponse);

            expect(fMsg).toHaveBeenCalledWith(
                mockResponse,
                "Email sent successfully"
            );
        });
    });

    describe('getVisualizationData', () => {
        it('should fetch visualization data successfully', async () => {
            const mockAggregateData = [
                { _id: 'pending', count: 1 },
                { _id: 'in-progress', count: 1 }
            ];

            Inquiry.aggregate.mockResolvedValue(mockAggregateData);

            await inquiryController.getVisualizationData(mockRequest, mockResponse);

            expect(fMsg).toHaveBeenCalledWith(
                mockResponse,
                "Visualization data fetched successfully",
                expect.any(Object),
                200
            );
        });
    });
}); 