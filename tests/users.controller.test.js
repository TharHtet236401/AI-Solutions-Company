import { describe, it, expect, beforeEach, vi } from 'vitest';
import mongoose from 'mongoose';
import User from '../models/users.model.js';
import * as userController from '../controllers/users.controller.js';
import { encode, decode, generateTokenAndSetCookie, fMsg, fError } from '../utils/libby.js';

// Mock the User model
vi.mock('../models/users.model.js');

// Mock the libby utilities
vi.mock('../utils/libby.js', () => ({
  encode: vi.fn(),
  decode: vi.fn(),
  fMsg: vi.fn(),
  fError: vi.fn(),
  generateTokenAndSetCookie: vi.fn()
}));

describe('User Controller Tests', () => {
  let mockRequest;
  let mockResponse;

  beforeEach(() => {
    mockRequest = {
      body: {},
      query: {},
      params: {},
      user: {
        _id: 'mockUserId',
        role: 'Super Admin'
      }
    };

    mockResponse = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
      cookie: vi.fn()
    };

    // Reset all mocks before each test
    vi.clearAllMocks();
  });

  describe('getUsers', () => {
    it('should get users successfully', async () => {
      const mockUsers = [
        { _id: '1', username: 'user1', role: 'Admin' },
        { _id: '2', username: 'user2', role: 'User' }
      ];

      User.countDocuments.mockResolvedValue(2);
      User.find.mockReturnValue({
        sort: vi.fn().mockReturnThis(),
        skip: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        select: vi.fn().mockResolvedValue(mockUsers)
      });

      await userController.getUsers(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        con: true,
        msg: "Users fetched successfully",
        result: {
          users: mockUsers,
          currentPage: 1,
          totalPages: 1,
          totalUsers: 2
        }
      });
    });

    it('should filter users by role', async () => {
      const mockUsers = [
        { _id: '1', username: 'admin1', role: 'Admin' },
        { _id: '2', username: 'admin2', role: 'Admin' }
      ];

      mockRequest.query.role = 'Admin';
      User.countDocuments.mockResolvedValue(2);
      User.find.mockReturnValue({
        sort: vi.fn().mockReturnThis(),
        skip: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        select: vi.fn().mockResolvedValue(mockUsers)
      });

      await userController.getUsers(mockRequest, mockResponse);

      expect(User.find).toHaveBeenCalledWith({ role: 'Admin' });
    });
  });

  describe('createUser', () => {
    it('should create user successfully when user is Super Admin', async () => {
      const mockUser = {
        username: 'testuser',
        password: 'Test123@pass',
        role: 'Admin'
      };

      mockRequest.body = mockUser;
      mockRequest.user.role = 'Super Admin';
      
      User.findOne.mockResolvedValue(null);
      encode.mockResolvedValue('hashedPassword');

      const mockSavedUser = {
        ...mockUser,
        _id: 'mockId',
        password: 'hashedPassword',
        toObject: () => ({
          _id: 'mockId',
          username: mockUser.username,
          role: mockUser.role
        })
      };

      const mockUserInstance = {
        ...mockSavedUser,
        save: vi.fn().mockResolvedValue(mockSavedUser)
      };
      
      User.mockImplementation(() => mockUserInstance);

      await userController.createUser(mockRequest, mockResponse);

      expect(User.findOne).toHaveBeenCalledWith({ username: mockUser.username });
      expect(encode).toHaveBeenCalledWith(mockUser.password);
      expect(mockUserInstance.save).toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith({
        con: true,
        msg: "User created successfully",
        result: expect.objectContaining({
          username: mockUser.username,
          role: mockUser.role
        })
      });
    });

    it('should prevent non-Super Admin from creating users', async () => {
      const mockUser = {
        username: 'testuser',
        password: 'Test123@pass',
        role: 'Admin'
      };

      mockRequest.body = mockUser;
      mockRequest.user.role = 'Admin'; // Non-Super Admin role

      await userController.createUser(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        con: false,
        msg: "You are not authorized to create a user"
      });
    });

    it('should prevent creating Super Admin account', async () => {
      const mockUser = {
        username: 'testuser',
        password: 'Test123@pass',
        role: 'Super Admin'
      };

      mockRequest.body = mockUser;
      mockRequest.user.role = 'Super Admin';

      await userController.createUser(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        con: false,
        msg: "You cannot create a Super Admin account"
      });
    });

    it('should reject weak passwords', async () => {
      const weakPasswords = [
        'short',                 // Too short
        'onlylowercase123',      // No uppercase
        'ONLYUPPERCASE123',      // No lowercase
        'NoSpecialChar123',      // No special characters
        'NoNumbers@abc',         // No numbers
        'Test@abc'               // Too short with all requirements
      ];

      for (const password of weakPasswords) {
        mockRequest.body = {
          username: 'testuser',
          password: password,
          role: 'Admin'
        };

        await userController.createUser(mockRequest, mockResponse);

        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({
          con: false,
          msg: "Password must be at least 8 characters long and include uppercase, lowercase, number and special character"
        });
      }
    });

    it('should handle missing required fields', async () => {
      mockRequest.body = { username: 'testuser' }; // Missing password and role

      await userController.createUser(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        con: false,
        msg: "All fields are required"
      });
    });

    it('should handle existing username', async () => {
      mockRequest.body = {
        username: 'existinguser',
        password: 'password123',
        role: 'Admin'
      };

      User.findOne.mockResolvedValue({ username: 'existinguser' });

      await userController.createUser(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        con: false,
        msg: "Username already exists"
      });
    });
  });

  describe('loginUser', () => {
    it('should login user successfully', async () => {
      const mockUser = {
        _id: 'userId',
        username: 'testuser',
        password: 'hashedPassword',
        role: 'Admin',
        toObject: () => ({
          _id: 'userId',
          username: 'testuser',
          role: 'Admin'
        })
      };

      mockRequest.body = {
        username: 'testuser',
        password: 'password123'
      };

      User.findOne.mockResolvedValue(mockUser);
      decode.mockResolvedValue(true);
      generateTokenAndSetCookie.mockReturnValue('mockToken');
      
      await userController.loginUser(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        con: true,
        msg: "User logged in successfully",
        result: expect.objectContaining({
          user: expect.objectContaining({
            username: 'testuser',
            role: 'Admin'
          }),
          token: 'mockToken'
        })
      });
    });

    it('should handle invalid password', async () => {
      const mockUser = {
        username: 'testuser',
        password: 'hashedPassword'
      };

      mockRequest.body = {
        username: 'testuser',
        password: 'wrongpassword'
      };

      User.findOne.mockResolvedValue(mockUser);
      decode.mockResolvedValue(false);

      await userController.loginUser(mockRequest, mockResponse);

      expect(fError).toHaveBeenCalledWith(mockResponse, "Invalid password", 401);
    });

    it('should handle non-existent user', async () => {
      mockRequest.body = {
        username: 'nonexistentuser',
        password: 'password123'
      };

      User.findOne.mockResolvedValue(null);

      await userController.loginUser(mockRequest, mockResponse);

      expect(fError).toHaveBeenCalledWith(mockResponse, "User not found", 404);
    });
  });

  describe('updatePersonalInfo', () => {
    it('should update personal info successfully', async () => {
      const mockUser = {
        _id: 'mockUserId',
        username: 'oldUsername',
        save: vi.fn(),
        toObject: () => ({
          _id: 'mockUserId',
          username: 'newUsername'
        })
      };

      mockRequest.body = { username: 'newUsername' };
      mockRequest.user = { _id: 'mockUserId' };

      User.findById.mockResolvedValue(mockUser);

      await userController.updatePersonalInfo(mockRequest, mockResponse);

      expect(mockUser.save).toHaveBeenCalled();
      expect(mockUser.username).toBe('newUsername');
    });

    it('should handle user not found', async () => {
      mockRequest.body = { username: 'newUsername' };
      mockRequest.user = { _id: 'nonexistentId' };

      User.findById.mockResolvedValue(null);

      await userController.updatePersonalInfo(mockRequest, mockResponse);

      expect(fError).toHaveBeenCalledWith(mockResponse, "User not found", 404);
    });
  });

  describe('updatePassword', () => {
    it('should update password successfully', async () => {
      const mockUser = {
        _id: 'mockUserId',
        password: 'oldHashedPassword',
        save: vi.fn()
      };

      mockRequest.body = {
        currentPassword: 'oldPassword',
        newPassword: 'newPassword',
        confirmPassword: 'newPassword'
      };
      mockRequest.user = { _id: 'mockUserId' };

      User.findById.mockResolvedValue(mockUser);
      decode.mockResolvedValue(true);
      encode.mockResolvedValue('newHashedPassword');

      await userController.updatePassword(mockRequest, mockResponse);

      expect(mockUser.save).toHaveBeenCalled();
      expect(mockUser.password).toBe('newHashedPassword');
    });

    it('should handle password mismatch', async () => {
      mockRequest.body = {
        currentPassword: 'oldPassword',
        newPassword: 'newPassword',
        confirmPassword: 'differentPassword'
      };

      await userController.updatePassword(mockRequest, mockResponse);

      expect(fError).toHaveBeenCalledWith(mockResponse, "Passwords do not match", 400);
    });

    it('should handle incorrect current password', async () => {
      const mockUser = {
        _id: 'mockUserId',
        password: 'hashedPassword'
      };

      mockRequest.body = {
        currentPassword: 'wrongPassword',
        newPassword: 'newPassword',
        confirmPassword: 'newPassword'
      };
      mockRequest.user = { _id: 'mockUserId' };

      User.findById.mockResolvedValue(mockUser);
      decode.mockResolvedValue(false);

      await userController.updatePassword(mockRequest, mockResponse);

      expect(fError).toHaveBeenCalledWith(mockResponse, "Current password is incorrect", 400);
    });
  });

  describe('updateUser', () => {
    it('should allow Super Admin to update any user', async () => {
      const mockUser = {
        _id: 'targetUserId',
        username: 'targetuser',
        role: 'Admin',
        save: vi.fn().mockResolvedValue({
          _id: 'targetUserId',
          username: 'updateduser',
          role: 'Content',
          toObject: () => ({
            _id: 'targetUserId',
            username: 'updateduser',
            role: 'Content'
          })
        }),
        toObject: () => ({
          _id: 'targetUserId',
          username: 'updateduser',
          role: 'Content'
        })
      };

      mockRequest.params.id = 'targetUserId';
      mockRequest.body = {
        username: 'updateduser',
        role: 'Content'
      };
      mockRequest.user.role = 'Super Admin';

      User.findById.mockResolvedValue(mockUser);

      await userController.updateUser(mockRequest, mockResponse);

      expect(mockUser.save).toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        con: true,
        msg: "User updated successfully",
        result: expect.objectContaining({
          username: 'updateduser',
          role: 'Content'
        })
      });
    });

    it('should prevent non-Super Admin from updating users', async () => {
      mockRequest.params.id = 'targetUserId';
      mockRequest.body = {
        username: 'updateduser',
        role: 'Content'
      };
      mockRequest.user.role = 'Admin'; // Non-Super Admin role

      await userController.updateUser(mockRequest, mockResponse);

      expect(fError).toHaveBeenCalledWith(
        mockResponse,
        "You are not authorized to update users",
        403
      );
    });

    it('should handle user not found during update', async () => {
      mockRequest.params.id = 'nonexistentId';
      mockRequest.body = {
        username: 'updateduser',
        role: 'Content'
      };
      mockRequest.user.role = 'Super Admin';

      User.findById.mockResolvedValue(null);

      await userController.updateUser(mockRequest, mockResponse);

      expect(fError).toHaveBeenCalledWith(
        mockResponse,
        "User not found",
        404
      );
    });
  });

  describe('deleteUser', () => {
    it('should allow Super Admin to delete any user except themselves', async () => {
      const mockUserToDelete = {
        _id: 'userToDeleteId',
        toString: () => 'userToDeleteId'
      };

      mockRequest.params.id = 'userToDeleteId';
      mockRequest.user = { 
        _id: 'currentUserId', 
        role: 'Super Admin',
        toString: () => 'currentUserId'
      };

      User.findById
        .mockResolvedValueOnce(mockUserToDelete)
        .mockResolvedValueOnce(mockRequest.user);
      
      User.findByIdAndDelete.mockResolvedValue(true);

      await userController.deleteUser(mockRequest, mockResponse);

      expect(User.findByIdAndDelete).toHaveBeenCalledWith('userToDeleteId');
      expect(fMsg).toHaveBeenCalledWith(mockResponse, "User deleted successfully");
    });

    it('should prevent Super Admin from deleting their own account', async () => {
      const mockUser = {
        _id: 'userId',
        toString: () => 'userId'
      };

      mockRequest.params.id = 'userId';
      mockRequest.user = { 
        _id: 'userId', 
        role: 'Super Admin',
        toString: () => 'userId'
      };

      User.findById
        .mockResolvedValueOnce(mockUser)
        .mockResolvedValueOnce(mockUser);

      await userController.deleteUser(mockRequest, mockResponse);

      expect(fError).toHaveBeenCalledWith(
        mockResponse,
        "You cannot delete your own account as Super Admin",
        400
      );
    });

    it('should prevent non-Super Admin from deleting users', async () => {
      mockRequest.user = { role: 'Admin' }; // Non-Super Admin role

      await userController.deleteUser(mockRequest, mockResponse);

      expect(fError).toHaveBeenCalledWith(
        mockResponse,
        "You are not authorized to delete the users",
        403
      );
    });
  });
});
