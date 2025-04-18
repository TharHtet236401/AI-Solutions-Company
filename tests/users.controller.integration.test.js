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
                    password: 'Test123@pass',
                    role: 'Sales'
                },
                user: {
                    role: 'Super Admin'
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

        it('should reject weak passwords in user creation', async () => {
            const testCases = [
                {
                    username: 'weakpass1',
                    password: 'short',
                    description: 'too short'
                },
                {
                    username: 'weakpass2',
                    password: 'onlylowercase123@',
                    description: 'missing uppercase'
                },
                {
                    username: 'weakpass3',
                    password: 'ONLYUPPERCASE123@',
                    description: 'missing lowercase'
                },
                {
                    username: 'weakpass4',
                    password: 'NoSpecialChars123',
                    description: 'missing special character'
                },
                {
                    username: 'weakpass5',
                    password: 'NoNumbers@abcDEF',
                    description: 'missing numbers'
                }
            ];

            for (const testCase of testCases) {
                const req = {
                    body: {
                        username: testCase.username,
                        password: testCase.password,
                        role: 'Sales'
                    },
                    user: {
                        role: 'Super Admin'
                    }
                };
                const res = mockResponse();

                await userController.createUser(req, res);

                expect(res.status).toHaveBeenCalledWith(400);
                expect(res.json).toHaveBeenCalledWith(
                    expect.objectContaining({
                        con: false,
                        msg: 'Password must be at least 8 characters long and include uppercase, lowercase, number and special character'
                    })
                );
            }
        });

        it('should prevent creating duplicate usernames', async () => {
            const req = {
                body: {
                    username: 'testuser', // Already exists
                    password: 'newpass123',
                    role: 'Sales'
                },
                user: {
                    role: 'Super Admin'
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

            // Verify the update in database
            const updatedUser = await User.findById(testUserId);
            expect(updatedUser.username).toBe('updateduser');
            expect(updatedUser.role).toBe('Sales');
        });

        it('should prevent non-Super Admin from updating users', async () => {
            const req = {
                params: { id: testUserId },
                body: {
                    username: 'updateduser',
                    role: 'Sales'
                },
                user: { role: 'Admin' }
            };
            const res = mockResponse();

            await userController.updateUser(req, res);

            expect(res.status).toHaveBeenCalledWith(403);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    con: false,
                    msg: 'You are not authorized to update users'
                })
            );

            // Verify no changes in database
            const unchangedUser = await User.findById(testUserId);
            expect(unchangedUser.username).toBe('testuser');
            expect(unchangedUser.role).toBe('Customer Support');
        });

        it('should handle updating non-existent user', async () => {
            const req = {
                params: { id: new mongoose.Types.ObjectId() },
                body: {
                    username: 'updateduser',
                    role: 'Sales'
                },
                user: { role: 'Super Admin' }
            };
            const res = mockResponse();

            await userController.updateUser(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    con: false,
                    msg: 'User not found'
                })
            );
        });

        it('should prevent updating to existing username', async () => {
            // Create another user first
            const otherUser = await User.create({
                username: 'existinguser',
                password: await encode('testpass123'),
                role: 'Customer Support'
            });

            const req = {
                params: { id: testUserId },
                body: {
                    username: 'existinguser',
                    role: 'Sales'
                },
                user: { role: 'Super Admin' }
            };
            const res = mockResponse();

            await userController.updateUser(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    con: false,
                    msg: 'Username already exists'
                })
            );

            // Verify no changes in database
            const unchangedUser = await User.findById(testUserId);
            expect(unchangedUser.username).toBe('testuser');
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

            // Verify user still exists in database
            const existingUser = await User.findById(testUserId);
            expect(existingUser).not.toBeNull();
        });

        it('should prevent Super Admin from deleting their own account', async () => {
            const req = {
                params: { id: superAdminUser._id },
                user: {
                    _id: superAdminUser._id,
                    role: 'Super Admin'
                }
            };
            const res = mockResponse();

            await userController.deleteUser(req, res);

            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    con: false,
                    msg: 'You cannot delete your own account as Super Admin'
                })
            );

            // Verify Super Admin still exists in database
            const existingSuperAdmin = await User.findById(superAdminUser._id);
            expect(existingSuperAdmin).not.toBeNull();
        });

        it('should handle deleting non-existent user', async () => {
            const req = {
                params: { id: new mongoose.Types.ObjectId() },
                user: {
                    _id: superAdminUser._id,
                    role: 'Super Admin'
                }
            };
            const res = mockResponse();

            await userController.deleteUser(req, res);

            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    con: false,
                    msg: 'User not found'
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