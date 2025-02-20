
import User from '../models/users.model.js';
import { 
    getUsers, 
    createUser, 
    loginUser, 
    logoutUser,
    getUser 
} from '../controllers/users.controller.js';
import { encode } from '../utils/libby.js';

// Mock the User model
jest.mock('../models/users.model.js');

// Mock response object
const mockResponse = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    res.cookie = jest.fn().mockReturnValue(res);
    return res;
};

describe('Users Controller', () => {
    let req;
    let res;

    beforeEach(() => {
        req = {
            body: {},
            user: {}
        };
        res = mockResponse();
        // Clear all mocks before each test
        jest.clearAllMocks();
    });

    describe('getUsers', () => {
        it('should fetch all users successfully', async () => {
            const mockUsers = [
                { _id: '1', username: 'user1', role: 'admin' },
                { _id: '2', username: 'user2', role: 'staff' }
            ];
            
            User.find.mockResolvedValue(mockUsers);

            await getUsers(req, res);

            expect(User.find).toHaveBeenCalled();
            expect(res.json).toHaveBeenCalledWith({
                con: true,
                msg: 'Users fetched successfully',
                result: mockUsers
            });
        });

        it('should handle errors when fetching users', async () => {
            const error = new Error('Database error');
            User.find.mockRejectedValue(error);

            await getUsers(req, res);

            expect(res.json).toHaveBeenCalledWith({
                con: false,
                msg: 'Error fetching users'
            });
        });
    });

    describe('createUser', () => {
        it('should create a new user successfully', async () => {
            const mockUser = {
                username: 'newuser',
                password: 'password123',
                role: 'admin'
            };
            req.body = mockUser;

            User.findOne.mockResolvedValue(null);
            User.prototype.save.mockResolvedValue({
                ...mockUser,
                _id: 'some-id'
            });

            await createUser(req, res);

            expect(User.findOne).toHaveBeenCalledWith({ username: mockUser.username });
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith({
                con: true,
                msg: 'User created successfully',
                result: expect.any(Object)
            });
        });

        it('should handle existing username', async () => {
            req.body = {
                username: 'existinguser',
                password: 'password123',
                role: 'admin'
            };

            User.findOne.mockResolvedValue({ username: 'existinguser' });

            await createUser(req, res);

            expect(res.json).toHaveBeenCalledWith({
                con: false,
                msg: 'User already exists'
            });
        });

        it('should validate required fields', async () => {
            req.body = {
                username: 'newuser'
                // Missing password and role
            };

            User.findOne.mockResolvedValue(null); // User doesn't exist yet

            await createUser(req, res);

            expect(res.json).toHaveBeenCalledWith({
                con: false,
                msg: 'All fields are required'
            });
        });
    });

    describe('loginUser', () => {
        it('should login user successfully', async () => {
            const mockUser = {
                _id: 'user-id',
                username: 'testuser',
                password: await encode('password123')
            };
            
            req.body = {
                username: 'testuser',
                password: 'password123'
            };

            User.findOne.mockResolvedValue(mockUser);

            await loginUser(req, res);

            expect(User.findOne).toHaveBeenCalledWith({ username: req.body.username });
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                con: true,
                msg: 'User logged in successfully',
                result: expect.objectContaining({
                    user: mockUser,
                    token: expect.any(String)
                })
            });
        });

        it('should handle invalid credentials', async () => {
            req.body = {
                username: 'wronguser',
                password: 'wrongpass'
            };

            User.findOne.mockResolvedValue(null);

            await loginUser(req, res);

            expect(res.json).toHaveBeenCalledWith({
                con: false,
                msg: 'User not found'
            });
        });
    });

    describe('logoutUser', () => {
        it('should logout user successfully', async () => {
            await logoutUser(req, res);

            expect(res.cookie).toHaveBeenCalledWith('jwt', '', {
                httpOnly: true,
                secure: expect.any(Boolean),
                sameSite: 'strict',
                maxAge: 0
            });
            expect(res.json).toHaveBeenCalledWith({
                con: true,
                msg: 'User logged out successfully',
                result: {}
            });
        });
    });

    describe('getUser', () => {
        it('should fetch user profile successfully', async () => {
            const mockUser = {
                _id: 'user-id',
                username: 'testuser',
                role: 'admin'
            };
            req.user = { _id: 'user-id' };

            User.findById.mockReturnValue({
                select: jest.fn().mockResolvedValue(mockUser)
            });

            await getUser(req, res);

            expect(User.findById).toHaveBeenCalledWith(req.user._id);
            expect(res.json).toHaveBeenCalledWith({
                con: true,
                msg: 'User fetched successfully',
                result: mockUser
            });
        });

        it('should handle errors when fetching user profile', async () => {
            req.user = { _id: 'invalid-id' };

            User.findById.mockReturnValue({
                select: jest.fn().mockRejectedValue(new Error('Database error'))
            });

            await getUser(req, res);

            expect(res.json).toHaveBeenCalledWith({
                con: false,
                msg: 'Error fetching user'
            });
        });
    });
}); 