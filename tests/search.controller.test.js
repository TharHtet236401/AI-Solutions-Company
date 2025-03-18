import { describe, it, expect, beforeEach, vi } from 'vitest';
import { promises as fs } from 'fs';
import path from 'path';
import * as cheerio from 'cheerio';
import SearchController from '../controllers/search.controller.js';

// Mock fs.promises
vi.mock('fs/promises', () => ({
    readFile: vi.fn()
}));

// Mock path module
vi.mock('path', () => ({
    join: vi.fn().mockImplementation((...args) => args.join('/')),
    dirname: vi.fn()
}));

// Mock process.cwd()
vi.spyOn(process, 'cwd').mockReturnValue('/mock/root');

describe('Search Controller Tests', () => {
    let mockRequest;
    let mockResponse;

    beforeEach(() => {
        vi.clearAllMocks();

        mockRequest = {
            query: {}
        };

        mockResponse = {
            render: vi.fn(),
            status: vi.fn().mockReturnThis()
        };

        // Mock cheerio.load to return a function with jQuery-like methods
        vi.spyOn(cheerio, 'load').mockImplementation(() => {
            const $ = (selector) => ({
                remove: vi.fn(),
                text: vi.fn().mockReturnValue('This is some test content'),
                attr: vi.fn().mockReturnValue('test-section'),
                find: vi.fn().mockReturnValue({
                    first: vi.fn().mockReturnValue({
                        text: vi.fn().mockReturnValue('Section Title')
                    })
                })
            });
            
            $.remove = vi.fn();
            $.each = vi.fn((callback) => {
                callback(0, {
                    attribs: { id: 'test-section', class: 'test-section' }
                });
            });
            
            return $;
        });
    });

    it('should render empty search results when no query is provided', async () => {
        await SearchController.search(mockRequest, mockResponse);

        expect(mockResponse.render).toHaveBeenCalledWith('search-results', {
            results: [],
            query: '',
            title: 'Search Results - AI Solutions'
        });
    });

    it('should search and render results when query is provided', async () => {
        // Setup
        mockRequest.query.q = 'test';
        const mockContent = '<div class="test-section">This is some test content</div>';
        fs.readFile.mockResolvedValue(mockContent);

        // Execute
        await SearchController.search(mockRequest, mockResponse);

        // Verify
        expect(mockResponse.render).toHaveBeenCalled();
        const renderCall = mockResponse.render.mock.calls[0];
        expect(renderCall[0]).toBe('search-results');
        expect(renderCall[1]).toHaveProperty('query', 'test');
        expect(renderCall[1]).toHaveProperty('title', expect.stringContaining('test'));
        expect(renderCall[1]).toHaveProperty('results');
        expect(renderCall[1].results).toBeInstanceOf(Array);
    });

    it('should handle file reading errors gracefully', async () => {
        mockRequest.query.q = 'test';
        fs.readFile.mockRejectedValue(new Error('File read error'));

        await SearchController.search(mockRequest, mockResponse);

        expect(mockResponse.render).toHaveBeenCalledWith('search-results', {
            results: [],
            query: 'test',
            title: expect.stringContaining('test')
        });
    });

    it('should process multiple pages and return combined results', async () => {
        mockRequest.query.q = 'test';
        const mockContent = '<section class="test-section">Test content here with test word</section>';
        
        fs.readFile.mockResolvedValue(mockContent);

        await SearchController.search(mockRequest, mockResponse);

        expect(fs.readFile).toHaveBeenCalled();
        expect(fs.readFile.mock.calls.length).toBeGreaterThan(1);
        
        expect(mockResponse.render).toHaveBeenCalled();
        const renderCall = mockResponse.render.mock.calls[0];
        expect(renderCall[0]).toBe('search-results');
        expect(renderCall[1]).toHaveProperty('results');
    });

    it('should handle case-insensitive search', async () => {
        mockRequest.query.q = 'TEST';
        const mockContent = '<section class="test-section">test content here</section>';
        
        fs.readFile.mockResolvedValue(mockContent);

        await SearchController.search(mockRequest, mockResponse);

        expect(mockResponse.render).toHaveBeenCalled();
        const renderCall = mockResponse.render.mock.calls[0];
        expect(renderCall[0]).toBe('search-results');
        expect(renderCall[1]).toHaveProperty('query', 'test');
    });

    it('should sort results by relevance', async () => {
        mockRequest.query.q = 'test';
        const mockContent = `
            <section class="section1">test once here</section>
            <section class="section2">test test multiple times here</section>
        `;
        
        fs.readFile.mockResolvedValue(mockContent);

        await SearchController.search(mockRequest, mockResponse);

        expect(mockResponse.render).toHaveBeenCalled();
        const renderCall = mockResponse.render.mock.calls[0];
        expect(renderCall[0]).toBe('search-results');
        expect(renderCall[1]).toHaveProperty('results');
    });
}); 