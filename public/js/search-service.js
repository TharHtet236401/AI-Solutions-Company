class SearchService {
    constructor() {
        console.log('Initializing SearchService...');
        this.initialized = false;
        this.initializeContent();
    }

    initializeContent() {
        console.log('Getting page content...');
        
        // Get current page content
        const currentPath = window.location.pathname;
        console.log('Current path:', currentPath);
        
        // Define the pages to search through with correct class names
        this.pages = [
            { 
                url: '/', 
                title: 'Home', 
                content: this.getPageContent([
                    'home-hero-section',
                    'features-section',
                    'stats-section',
                    'projects-section',
                    'impact-section',
                    'cta-section'
                ])
            },
            { 
                url: '/solutions', 
                title: 'Solutions', 
                content: this.getPageContent(['solutions-page', 'main-solutions', 'process-section', 'benefits-section'])
            },
            { 
                url: '/industries', 
                title: 'Industries', 
                content: this.getPageContent(['industries-hero', 'industries-showcase', 'success-metrics', 'industry-testimonials'])
            },
            { 
                url: '/feedback', 
                title: 'Feedback', 
                content: this.getPageContent(['feedback-page'])
            },
            { 
                url: '/blog', 
                title: 'Blog', 
                content: this.getPageContent(['blog-page'])
            },
            { 
                url: '/gallery', 
                title: 'Gallery', 
                content: this.getPageContent(['gallery-content'])
            },
            { 
                url: '/contact', 
                title: 'Contact', 
                content: this.getPageContent(['contact-page'])
            }
        ];

        // Get content for current page
        const currentPage = this.pages.find(page => page.url === currentPath);
        if (currentPage) {
            console.log(`Found content for current page (${currentPath}):`, !!currentPage.content);
        }

        console.log('SearchService initialized with pages:', this.pages.map(p => ({
            url: p.url,
            hasContent: !!p.content
        })));

        this.initialized = true;
        console.log('SearchService initialization complete');
    }

    getPageContent(selectors) {
        console.log('Getting content for selectors:', selectors);
        
        let content = '';
        
        // Try to get content from each selector
        selectors.forEach(selector => {
            const elements = document.querySelectorAll(`.${selector}`);
            console.log(`Found ${elements.length} elements for selector: ${selector}`);
            
            elements.forEach(element => {
                // Get text content and clean it up
                const text = element.textContent
                    .replace(/\s+/g, ' ')
                    .trim();
                content += text + ' ';
            });
        });

        // Also get all visible text from the page
        if (!content) {
            content = Array.from(document.querySelectorAll('p, h1, h2, h3, h4, h5, h6, li, span, div'))
                .filter(element => {
                    // Check if element is visible
                    const style = window.getComputedStyle(element);
                    return style.display !== 'none' && style.visibility !== 'hidden';
                })
                .map(element => element.textContent)
                .join(' ')
                .replace(/\s+/g, ' ')
                .trim();
        }

        return content;
    }

    search(query) {
        console.log('Searching for:', query);
        
        if (!query) return [];
        
        const regex = new RegExp(query, 'gi');
        const results = this.pages
            .map(page => {
                if (!page.content) {
                    console.log(`No content found for page: ${page.url}`);
                    return null;
                }
                
                const matches = page.content.match(regex);
                if (!matches) {
                    console.log(`No matches found in page: ${page.url}`);
                    return null;
                }

                console.log(`Found ${matches.length} matches in ${page.url}`);

                // Get surrounding context for each match
                const contexts = matches.map(match => {
                    const index = page.content.indexOf(match);
                    const start = Math.max(0, index - 50);
                    const end = Math.min(page.content.length, index + match.length + 50);
                    const context = page.content.substring(start, end);
                    return context.replace(/\s+/g, ' ').trim().replace(regex, `<mark>${match}</mark>`);
                });

                return {
                    url: page.url,
                    title: page.title,
                    matches: matches.length,
                    contexts: contexts.slice(0, 2) // Limit to 2 context snippets
                };
            })
            .filter(result => result !== null)
            .sort((a, b) => b.matches - a.matches);

        console.log('Search results:', results);
        return results;
    }
}

// Initialize search service and make it globally available
function initializeSearchService() {
    if (!window.searchService) {
        console.log('Creating new SearchService instance');
        window.searchService = new SearchService();
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeSearchService);
} else {
    initializeSearchService();
} 