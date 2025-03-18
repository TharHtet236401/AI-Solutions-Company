import { describe, it, expect, beforeEach, vi } from 'vitest';
import fs from 'fs';
import path from 'path';
import * as cheerio from 'cheerio';
import SearchController from '../controllers/search.controller.js';

// Mock the dependencies
vi.mock('fs', async () => {
    return {
        default: {
            promises: {
                readFile: vi.fn()
            },
            existsSync: vi.fn()
        },
        promises: {
            readFile: vi.fn()
        },
        existsSync: vi.fn()
    };
});
vi.mock('path');
vi.mock('cheerio');

describe('Search Controller Tests', () => {
    let mockRequest;
    let mockResponse;

    beforeEach(() => {
        mockRequest = {
            query: {},
        };

        mockResponse = {
            render: vi.fn(),
            status: vi.fn().mockReturnThis()
        };

        // Clear all mocks before each test
        vi.clearAllMocks();
    });

    describe('search', () => {
        it('should render empty results when no search query provided', async () => {
            await SearchController.search(mockRequest, mockResponse);

            expect(mockResponse.render).toHaveBeenCalledWith('search-results', {
                results: [],
                query: '',
                title: 'Search Results - AI Solutions'
            });
        });

        it('should search and find results successfully', async () => {
            mockRequest.query.q = 'test';
            const mockHtml = `
                <div class="content-section">
                    <h2>Test Section</h2>
                    <p>This is a test content with the word test in it.</p>
                </div>
            `;

            // Mock file reading
            fs.promises.readFile.mockResolvedValue(mockHtml);

            // Mock cheerio
            const mockCheerio = {
                remove: vi.fn(),
                text: vi.fn().mockReturnValue('This is a test content with the word test in it.'),
                attr: vi.fn().mockReturnValue('content-section'),
                find: vi.fn().mockReturnValue({
                    first: vi.fn().mockReturnValue({
                        text: vi.fn().mockReturnValue('Test Section')
                    })
                })
            };

            const $ = () => mockCheerio;
            $.load = vi.fn().mockReturnValue($);
            cheerio.load = $.load;

            // Mock path
            path.join.mockReturnValue('/mock/path');

            await SearchController.search(mockRequest, mockResponse);

            expect(mockResponse.render).toHaveBeenCalledWith(
                'search-results',
                expect.objectContaining({
                    query: 'test',
                    title: expect.stringContaining('test'),
                    results: expect.any(Array)
                })
            );
        });

        it('should handle empty search results', async () => {
            mockRequest.query.q = 'nonexistentterm';
            const mockHtml = `
                <div class="content-section">
                    <h2>Test Section</h2>
                    <p>This content does not contain the search term.</p>
                </div>
            `;

            // Mock file reading
            fs.promises.readFile.mockResolvedValue(mockHtml);

            // Mock cheerio
            const mockCheerio = {
                remove: vi.fn(),
                text: vi.fn().mockReturnValue('This content does not contain the search term.'),
                attr: vi.fn().mockReturnValue('content-section'),
                find: vi.fn().mockReturnValue({
                    first: vi.fn().mockReturnValue({
                        text: vi.fn().mockReturnValue('Test Section')
                    })
                })
            };

            const $ = () => mockCheerio;
            $.load = vi.fn().mockReturnValue($);
            cheerio.load = $.load;

            await SearchController.search(mockRequest, mockResponse);

            expect(mockResponse.render).toHaveBeenCalledWith(
                'search-results',
                expect.objectContaining({
                    results: expect.arrayContaining([]),
                    query: 'nonexistentterm'
                })
            );
        });
    });
}); 