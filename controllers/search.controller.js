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
                    
                    // Remove navigation, scripts, styles, and footer
                    $('.main-nav').remove();
                    $('script').remove();
                    $('style').remove();
                    $('.site-footer').remove();
                    
                    // Get text content
                    const text = $('body').text().toLowerCase();
                    
                    // Check if search query exists in the content
                    if (text.includes(searchQuery)) {
                        // Find the surrounding context of the search term
                        const index = text.indexOf(searchQuery);
                        const start = Math.max(0, index - 100);
                        const end = Math.min(text.length, index + searchQuery.length + 100);
                        const excerpt = text.slice(start, end)
                            .replace(/\s+/g, ' ')
                            .trim();

                        results.push({
                            title: page.title,
                            url: page.url,
                            excerpt: '...' + excerpt + '...'
                        });
                    }
                } catch (error) {
                    console.error(`Error processing ${page.path}:`, error);
                    // Continue with other pages even if one fails
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