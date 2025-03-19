import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach } from 'vitest';
import mongoose from 'mongoose';
import { connectMongo } from '../config/connectMongo.js';
import User from '../models/users.model.js';
import * as userController from '../controllers/users.controller.js';
import { encode } from '../utils/libby.js';

describe('User Controller Integration Tests', () => {
    let testUser;
    let superAdminUser;
    let testUserId;

    // Mock request and response objects
    const mockResponse = () => {
        const res = {};
        res.status = vi.fn().mockReturnValue(res);
        res.json = vi.fn().mockReturnValue(res);
        res.cookie = vi.fn().mockReturnValue(res);
        return res;
    };

    beforeAll(async () => {
        // Connect to test database
        await connectMongo();
        
        // Create a test super admin user
        const hashedPassword = await encode('superadmin123');
        superAdminUser = await User.create({
            username: 'superadmin',
            password: hashedPassword,
            role: 'Super Admin'
        });
    });

    afterAll(async () => {
        // Clean up and disconnect
        await User.deleteMany({});
        await mongoose.connection.close();
    });

    beforeEach(async () => {
        // Create a test user before each test
        const hashedPassword = await encode('testpass123');
        testUser = await User.create({
            username: 'testuser',
            password: hashedPassword,
            role: 'Customer Support'
        });
        testUserId = testUser._id;
    });

    afterEach(async () => {
        // Clean up test users after each test
        await User.deleteMany({ _id: { $ne: superAdminUser._id } });
    });

    describe('getUsers', () => {
        it('should get all users with pagination', async () => {
            const req = {
                query: {
                    page: 1,
                    limit: 10
                }
            };
            const res = mockResponse();

            await userController.getUsers(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    con: true,
                    msg: 'Users fetched successfully',
                    result: expect.objectContaining({
                        users: expect.any(Array),
                        currentPage: 1,
                        totalPages: expect.any(Number),
                        totalUsers: expect.any(Number)
                    })
                })
            );
        });

        it('should filter users by role', async () => {
            const req = {
                query: {
                    role: 'Customer Support'
                }
            };
            const res = mockResponse();

            await userController.getUsers(req, res);

            const response = res.json.mock.calls[0][0];
            expect(response.result.users.every(user => user.role === 'Customer Support')).toBe(true);
        });
    });

    describe('createUser', () => {
        it('should create a new user successfully', async () => {
            const req = {
                body: {
                    username: 'newuser',
                    password: 'newpass123',
                    role: 'Sales'
                }
            };
            const res = mockResponse();

            await userController.createUser(req, res);

            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    con: true,
                    msg: 'User created successfully',
                    result: expect.objectContaining({
                        username: 'newuser',
                        role: 'Sales'
                    })
                })
            );
        });

        it('should prevent creating duplicate usernames', async () => {
            const req = {
                body: {
                    username: 'testuser', // Already exists
                    password: 'newpass123',
                    role: 'Sales'
                }
            };
            const res = mockResponse();

            await userController.createUser(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    con: false,
                    msg: 'Username already exists'
                })
            );
        });
    });

    describe('loginUser', () => {
        it('should login successfully with correct credentials', async () => {
            const req = {
                body: {
                    username: 'testuser',
                    password: 'testpass123'
                }
            };
            const res = mockResponse();

            await userController.loginUser(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    con: true,
                    msg: 'User logged in successfully',
                    result: expect.objectContaining({
                        user: expect.objectContaining({
                            username: 'testuser'
                        }),
                        token: expect.any(String)
                    })
                })
            );
        });

        it('should fail login with incorrect password', async () => {
            const req = {
                body: {
                    username: 'testuser',
                    password: 'wrongpassword'
                }
            };
            const res = mockResponse();

            await userController.loginUser(req, res);

            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    con: false,
                    msg: 'Invalid password'
                })
            );
        });
    });

    describe('updateUser', () => {
        it('should update user details successfully', async () => {
            const req = {
                params: { id: testUserId },
                body: {
                    username: 'updateduser',
                    role: 'Sales'
                },
                user: { role: 'Super Admin' }
            };
            const res = mockResponse();

            await userController.updateUser(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    con: true,
                    msg: 'User updated successfully',
                    result: expect.objectContaining({
                        username: 'updateduser',
                        role: 'Sales'
                    })
                })
            );
        });
    });

    describe('deleteUser', () => {
        it('should allow Super Admin to delete other users', async () => {
            const req = {
                params: { id: testUserId },
                user: {
                    _id: superAdminUser._id,
                    role: 'Super Admin'
                }
            };
            const res = mockResponse();

            await userController.deleteUser(req, res);

            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    con: true,
                    msg: 'User deleted successfully'
                })
            );

            // Verify user was actually deleted from database
            const deletedUser = await User.findById(testUserId);
            expect(deletedUser).toBeNull();
        });

        it('should prevent non-Super Admin from deleting users', async () => {
            const req = {
                params: { id: testUserId },
                user: {
                    _id: testUserId,
                    role: 'Customer Support'
                }
            };
            const res = mockResponse();

            await userController.deleteUser(req, res);

            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    con: false,
                    msg: 'You are not authorized to delete the users'
                })
            );
        });
    });

    describe('updatePassword', () => {
        it('should update password successfully', async () => {
            const req = {
                body: {
                    currentPassword: 'testpass123',
                    newPassword: 'newpass123',
                    confirmPassword: 'newpass123'
                },
                user: {
                    _id: testUserId
                }
            };
            const res = mockResponse();

            await userController.updatePassword(req, res);

            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    con: true,
                    msg: 'Password updated successfully'
                })
            );
        });

        it('should fail when current password is incorrect', async () => {
            const req = {
                body: {
                    currentPassword: 'wrongpassword',
                    newPassword: 'newpass123',
                    confirmPassword: 'newpass123'
                },
                user: {
                    _id: testUserId
                }
            };
            const res = mockResponse();

            await userController.updatePassword(req, res);

            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    con: false,
                    msg: 'Current password is incorrect'
                })
            );
        });
    });

    describe('updatePersonalInfo', () => {
        it('should update personal information successfully', async () => {
            const req = {
                body: {
                    username: 'updatedusername'
                },
                user: {
                    _id: testUserId
                }
            };
            const res = mockResponse();

            await userController.updatePersonalInfo(req, res);

            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    con: true,
                    msg: 'User updated successfully',
                    result: expect.objectContaining({
                        username: 'updatedusername'
                    })
                })
            );
        });
    });
}); 