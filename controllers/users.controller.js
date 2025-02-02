import User from '../models/users.model.js';
import { fMsg, fError,encode,decode,generateTokenAndSetCookie } from '../utils/libby.js';

export const getUsers = async (req, res) => {
    try {   
        const users = await User.find();
        fMsg(res, "Users fetched successfully", users);
    } catch (error) {
        fError(res, "Error fetching users", 500);
    }
};

export const createUser = async (req, res) => {
    try {
        const { username, password, role } = req.body;
        const user = await User.findOne({ username });
        if (user) return fError(res, "User already exists", 400);
        const newUser = new User({ username, password, role });
    if (!username || !password || !role) return fError(res, "All fields are required", 400);
    if (role !== 'admin' && role !== 'staff') return fError(res, "Invalid role", 400);
    
        const hashedPassword = await encode(password);
        newUser.password = hashedPassword;
        await newUser.save();
        fMsg(res, "User created successfully", newUser, 201);
    } catch (error) {
        fError(res, "Error creating user ddd", 500);
    }
};

export const loginUser = async (req, res) => {
    try {
        console.log(req.body);
        const { username, password } = req.body;
        const user = await User.findOne({ username });
        console.log(user);
        if (!user) return fError(res, "User not found", 404);
        const isMatch = await decode(password, user.password);
        console.log(isMatch);
        if (!isMatch) return fError(res, "Invalid password", 401);
        generateTokenAndSetCookie(res, user._id);
        console.log(req.cookies.jwt);
        fMsg(res, "User logged in successfully", {user});
    } catch (error) {
        console.log(error);
        fError(res, "Error logging in user", 500);
    }
};

export const logoutUser = async (req, res) => {
    try {   
        res.clearCookie('jwt');
        fMsg(res, "User logged out successfully");
    } catch (error) {
        fError(res, "Error logging out user", 500);
    }
};

