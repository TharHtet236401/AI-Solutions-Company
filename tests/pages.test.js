import { describe, it, expect, vi, beforeEach } from 'vitest';
import Blog from '../models/blogs.model.js';
import { checkAuth } from '../middleware/authMiddleware.js';
import searchController from '../controllers/search.controller.js';
import router from '../routes/pages.js';

// Mock the Blog model
vi.mock('../models/blogs.model.js', () => {
    const mockBlogChain = {
        populate: vi.fn().mockReturnThis(),
        sort: vi.fn().mockReturnThis(),
        skip: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis()
    };

    return {
        default: {
            countDocuments: vi.fn(),
            find: vi.fn(() => mockBlogChain),
            findOne: vi.fn(() => mockBlogChain),
            findById: vi.fn(() => mockBlogChain)
        }
    };
});

// Mock the auth middleware
vi.mock('../middleware/authMiddleware.js', () => ({
    checkAuth: vi.fn((req, res, next) => next())
}));

// Mock the search controller
vi.mock('../controllers/search.controller.js', () => ({
    default: {
        search: vi.fn()
    }
}));

describe('Pages Routes', () => {
    let mockRequest;
    let mockResponse;
    let next;

    beforeEach(() => {
        mockRequest = {
            query: {},
            params: {},
            cookies: {}
        };

        mockResponse = {
            render: vi.fn().mockReturnThis(),
            status: vi.fn().mockReturnThis(),
            send: vi.fn().mockReturnThis(),
            redirect: vi.fn().mockReturnThis(),
            clearCookie: vi.fn().mockReturnThis()
        };

        next = vi.fn();

        // Clear all mocks before each test
        vi.clearAllMocks();
    });

    const findRouteHandler = (path) => {
        // Handle dynamic routes
        const routeStack = router.stack;
        for (const layer of routeStack) {
            if (layer.route) {
                const routePath = layer.route.path;
                // Check for exact match first
                if (routePath === path) {
                    return layer.route.stack[layer.route.stack.length - 1].handle;
                }
                // Check for parameter match
                if (routePath.includes(':')) {
                    const regexPath = routePath.replace(/:[^/]+/g, '[^/]+');
                    const regex = new RegExp(`^${regexPath}$`);
                    if (path.match(regex)) {
                        return layer.route.stack[layer.route.stack.length - 1].handle;
                    }
                }
            }
        }
        return null;
    };

    describe('Basic Pages', () => {
        it('should render index page', async () => {
            const handler = findRouteHandler('/');
            await handler(mockRequest, mockResponse, next);
            
            expect(mockResponse.render).toHaveBeenCalledWith('index', {
                title: 'AI Solutions - Transforming Tomorrow'
            });
        });

        it('should render solutions page', async () => {
            const handler = findRouteHandler('/solutions');
            await handler(mockRequest, mockResponse, next);
            
            expect(mockResponse.render).toHaveBeenCalledWith('solutions', {
                title: 'Software Solutions - AI Solutions'
            });
        });

        it('should render industries page', async () => {
            const handler = findRouteHandler('/industries');
            await handler(mockRequest, mockResponse, next);
            
            expect(mockResponse.render).toHaveBeenCalledWith('industries', {
                title: 'Industries - AI Solutions'
            });
        });

        it('should render feedback page', async () => {
            const handler = findRouteHandler('/feedback');
            await handler(mockRequest, mockResponse, next);
            
            expect(mockResponse.render).toHaveBeenCalledWith('feedback', {
                title: 'Customer Feedback - AI Solutions'
            });
        });

        it('should render about page', async () => {
            const handler = findRouteHandler('/about');
            await handler(mockRequest, mockResponse, next);
            
            expect(mockResponse.render).toHaveBeenCalledWith('about', {
                title: 'About Us'
            });
        });

        it('should render contact page', async () => {
            const handler = findRouteHandler('/contact');
            await handler(mockRequest, mockResponse, next);
            
            expect(mockResponse.render).toHaveBeenCalledWith('contact', {
                title: 'Contact'
            });
        });
    });

    describe('Blog Pages', () => {
        it('should render blog listing page with pagination', async () => {
            const mockBlogs = [{ title: 'Blog 1' }, { title: 'Blog 2' }];
            const mockFeaturedBlog = { title: 'Featured Blog' };

            // Setup mocks with proper chaining
            const findChain = Blog.find();
            findChain.populate.mockReturnThis();
            findChain.sort.mockReturnThis();
            findChain.skip.mockReturnThis();
            findChain.limit.mockResolvedValue(mockBlogs);

            const findOneChain = Blog.findOne();
            findOneChain.populate.mockReturnThis();
            findOneChain.sort.mockResolvedValue(mockFeaturedBlog);

            Blog.countDocuments.mockResolvedValue(10);

            mockRequest.query = { page: '2' };

            const handler = findRouteHandler('/blog');
            if (!handler) throw new Error('Route handler not found for /blog');
            await handler(mockRequest, mockResponse, next);

            expect(mockResponse.render).toHaveBeenCalledWith('blog', {
                title: 'Blog - AI Solutions',
                blogs: mockBlogs,
                featuredBlog: mockFeaturedBlog,
                currentPage: 2,
                totalPages: 2,
                total: 10
            });
        });

        it('should render single blog page', async () => {
            const mockBlog = {
                title: 'Test Blog',
                content: 'Test Content'
            };

            // Setup mock with proper chaining
            const findByIdChain = Blog.findById();
            findByIdChain.populate.mockResolvedValue(mockBlog);

            mockRequest.params = { id: 'testBlogId' };

            const handler = findRouteHandler('/blog/:id');
            if (!handler) throw new Error('Route handler not found for /blog/:id');
            await handler(mockRequest, mockResponse, next);

            expect(mockResponse.render).toHaveBeenCalledWith('single-blog', {
                title: mockBlog.title,
                blog: mockBlog
            });
        });

        it('should handle non-existent blog', async () => {
            // Setup mock
            const findByIdChain = Blog.findById();
            findByIdChain.populate.mockResolvedValue(null);

            mockRequest.params = { id: 'nonExistentId' };

            const handler = findRouteHandler('/blog/:id');
            if (!handler) throw new Error('Route handler not found for /blog/:id');
            await handler(mockRequest, mockResponse, next);

            expect(mockResponse.status).toHaveBeenCalledWith(404);
            expect(mockResponse.render).toHaveBeenCalledWith('404', {
                title: 'Blog Not Found'
            });
        });
    });

    describe('Admin Pages', () => {
        beforeEach(() => {
            // Mock checkAuth to simulate authenticated state
            checkAuth.mockImplementation((req, res, next) => next());
        });

        const testAdminRoute = async (path, expectedRender) => {
            const handler = findRouteHandler(path);
            if (!handler) throw new Error(`Route handler not found for ${path}`);
            
            // Call all middleware in the stack
            const middlewares = router.stack
                .find(layer => layer.route?.path === path)
                .route.stack;
            
            for (const middleware of middlewares) {
                await middleware.handle(mockRequest, mockResponse, next);
            }

            expect(mockResponse.render).toHaveBeenCalledWith(...expectedRender);
        };

        it('should render admin login page', async () => {
            await testAdminRoute('/admin/login', [
                'admin/login',
                {
                    title: 'Admin Login - AI Solutions',
                    error: null
                }
            ]);
        });

        it('should render admin dashboard', async () => {
            await testAdminRoute('/admin/dashboard', [
                'admin/dashboard',
                {
                    title: 'Admin Dashboard - AI Solutions',
                    activeTab: 'overview'
                }
            ]);
        });

        it('should render inquiries management page', async () => {
            await testAdminRoute('/admin/inquiries', [
                'admin/inquiries',
                {
                    title: 'Inquiries Management - AI Solutions',
                    activeTab: 'inquiries'
                }
            ]);
        });

        it('should render inquiry detail page', async () => {
            mockRequest.params = { id: 'testInquiryId' };
            await testAdminRoute('/admin/inquiry/:id', [
                'admin/inquiry-detail',
                {
                    title: 'Inquiry Detail - AI Solutions',
                    activeTab: 'inquiries',
                    inquiryId: 'testInquiryId'
                }
            ]);
        });

        it('should render admin profile page', async () => {
            await testAdminRoute('/admin/profile', [
                'admin/profile',
                {
                    title: 'Admin Profile - AI Solutions',
                    activeTab: 'profile'
                }
            ]);
        });

        it('should render admin settings page', async () => {
            await testAdminRoute('/admin/settings', [
                'admin/settings',
                {
                    title: 'Admin Settings - AI Solutions',
                    activeTab: 'settings'
                }
            ]);
        });

        it('should handle admin logout', async () => {
            const handler = findRouteHandler('/admin/logout');
            if (!handler) throw new Error('Route handler not found for /admin/logout');
            await handler(mockRequest, mockResponse, next);
            
            expect(mockResponse.clearCookie).toHaveBeenCalledWith('jwt');
            expect(mockResponse.redirect).toHaveBeenCalledWith('/admin/login');
        });
    });

    describe('Error Handling', () => {
        it('should handle rendering errors with 500 status', async () => {
            mockResponse.render.mockImplementation(() => {
                throw new Error('Rendering Error');
            });

            const handler = findRouteHandler('/');
            await handler(mockRequest, mockResponse, next);

            expect(mockResponse.status).toHaveBeenCalledWith(500);
            expect(mockResponse.send).toHaveBeenCalledWith('Internal Server Error');
        });
    });

    describe('OTP Verification Page', () => {
        it('should render OTP verification page with email', async () => {
            mockRequest.query = { email: 'test@example.com' };
            
            const handler = findRouteHandler('/otp-verification');
            await handler(mockRequest, mockResponse, next);
            
            expect(mockResponse.render).toHaveBeenCalledWith('otp-verification', {
                title: 'OTP Verification',
                email: 'test@example.com'
            });
        });

        it('should redirect to contact page when no email provided', async () => {
            const handler = findRouteHandler('/otp-verification');
            await handler(mockRequest, mockResponse, next);
            
            expect(mockResponse.redirect).toHaveBeenCalledWith('/contact');
        });
    });

    describe('Search Functionality', () => {
        it('should call search controller', async () => {
            const handler = findRouteHandler('/search');
            await handler(mockRequest, mockResponse, next);
            
            expect(searchController.search).toHaveBeenCalledWith(mockRequest, mockResponse);
        });
    });
}); 