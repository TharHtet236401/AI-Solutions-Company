import { promises as fs } from 'fs';
import path from 'path';
import * as cheerio from 'cheerio';
import { fileURLToPath } from 'url';

// Get current directory name in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class SearchController {
    async search(req, res) {
        try {
            const searchQuery = req.query.q?.toLowerCase();
            if (!searchQuery) {
                return res.render('search-results', { 
                    results: [], 
                    query: '',
                    title: 'Search Results - AI Solutions'
                });
            }

            // Define pages to search through with their titles
            const pagesToSearch = [
                { path: 'views/index.ejs', url: '/', title: 'Home' },
                { path: 'views/feedback.ejs', url: '/feedback', title: 'Customer Feedback' },
                { path: 'views/gallery.ejs', url: '/gallery', title: 'Gallery' },
                { path: 'views/industries.ejs', url: '/industries', title: 'Industries' },
                { path: 'views/solutions.ejs', url: '/solutions', title: 'Solutions' },
                { path: 'views/contact.ejs', url: '/contact', title: 'Contact' }
            ];

            const results = [];

            // Search through each page
            for (const page of pagesToSearch) {
                try {
                    const content = await fs.readFile(path.join(process.cwd(), page.path), 'utf-8');
                    const $ = cheerio.load(content);
                    
                    // Remove navigation, scripts, styles, footer and EJS includes
                    $('.main-nav').remove();
                    $('script').remove();
                    $('style').remove();
                    $('.site-footer').remove();
                    
                    // Clean up EJS syntax and other unwanted content
                    let text = $('body').text()
                        .replace(/<%[^>]*%>/g, '') // Remove EJS syntax
                        .replace(/\[Object object\]/gi, '') // Remove object references
                        .replace(/undefined/gi, '') // Remove undefined values
                        .replace(/\s+/g, ' ') // Normalize whitespace
                        .toLowerCase()
                        .trim();
                    
                    // Check if search query exists in the content
                    if (text.includes(searchQuery)) {
                        const index = text.indexOf(searchQuery);
                        const start = Math.max(0, index - 100);
                        const end = Math.min(text.length, index + searchQuery.length + 100);
                        let excerpt = text.slice(start, end)
                            .replace(/\s+/g, ' ')
                            .trim();

                        // Clean up any remaining template syntax or special characters
                        excerpt = excerpt
                            .replace(/<%[^>]*%>/g, '')
                            .replace(/\[Object object\]/gi, '')
                            .replace(/undefined/gi, '')
                            .trim();

                        // Escape HTML special characters to prevent XSS
                        excerpt = excerpt
                            .replace(/&/g, '&amp;')
                            .replace(/</g, '&lt;')
                            .replace(/>/g, '&gt;')
                            .replace(/"/g, '&quot;')
                            .replace(/'/g, '&#039;');

                        // Highlight the search query
                        const regex = new RegExp(searchQuery, 'gi');
                        excerpt = excerpt.replace(regex, match => `<mark class="highlight">${match}</mark>`);

                        results.push({
                            title: page.title,
                            url: page.url,
                            excerpt: '...' + excerpt + '...'
                        });
                    }
                } catch (error) {
                    console.error(`Error processing ${page.path}:`, error);
                    continue;
                }
            }

            res.render('search-results', { 
                results, 
                query: searchQuery,
                title: `Search Results for "${searchQuery}" - AI Solutions`
            });
        } catch (error) {
            console.error('Search error:', error);
            res.status(500).render('error', { 
                message: 'An error occurred while searching',
                title: 'Error - AI Solutions'
            });
        }
    }
}

export default new SearchController(); 