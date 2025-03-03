import User from "../models/users.model.js";
import {
  fMsg,
  fError,
  encode,
  decode,
  generateTokenAndSetCookie,
} from "../utils/libby.js";

export const getUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const role = req.query.role;
    const sort = req.query.sort || '-createdAt';
    const search = req.query.search;

    // Build query object
    const query = {};
    
    // Add role filter if provided
    if (role) {
      query.role = role;
    }

    // Add search filter if provided
    if (search) {
      query.username = { $regex: search, $options: 'i' }; // Case-insensitive search
    }

    const totalUsers = await User.countDocuments(query);
    const totalPages = Math.ceil(totalUsers / limit);

    const users = await User.find(query)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .select('-password');

    return res.status(200).json({
      con: true,
      msg: 'Users fetched successfully',
      result: {
        users,
        currentPage: page,
        totalPages,
        totalUsers
      }
    });
  } catch (error) {
    console.error('Error in getUsers:', error);
    return res.status(500).json({
      con: false,
      msg: 'Internal server error'
    });
  }
};

export const createUser = async (req, res) => {
  try {
    const { username, password, role } = req.body;

    // Validate required fields
    if (!username || !password || !role) {
      return res.status(400).json({
        con: false,
        msg: "All fields are required"
      });
    }

    // Validate role
    if (role !== "admin" && role !== "staff") {
      return res.status(400).json({
        con: false,
        msg: "Invalid role"
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({
        con: false,
        msg: "Username already exists"
      });
    }

    // Hash password
    const hashedPassword = await encode(password);

    // Create new user
    const newUser = new User({
      username,
      password: hashedPassword,
      role
    });

    await newUser.save();

    // Return success without password
    const userWithoutPassword = newUser.toObject();
    delete userWithoutPassword.password;

    return res.status(201).json({
      con: true,
      msg: "User created successfully",
      result: userWithoutPassword
    });

  } catch (error) {
    console.error('Error in createUser:', error);
    return res.status(500).json({
      con: false,
      msg: "Error creating user"
    });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });

    if (!user) return fError(res, "User not found", 404);

    const isMatch = await decode(password, user.password);
    if (!isMatch) return fError(res, "Invalid password", 401);

    // Generate token and set cookie
    const token = generateTokenAndSetCookie(res, user._id);

    // Send response with user and token
    return res.status(200).json({
      con: true,
      msg: "User logged in successfully",
      result: {
        user,
        token: token, // Send the token directly
      },
    });
  } catch (error) {
    console.log(error);
    fError(res, "Error logging in user", 500);
  }
};

export const logoutUser = async (req, res) => {
  try {
    // Clear the jwt cookie with the same settings used when setting it
    res.cookie("jwt", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 0, // This makes the cookie expire immediately
    });

    fMsg(res, "User logged out successfully");
  } catch (error) {
    fError(res, "Error logging out user", 500);
  }
};

export const getUser = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    fMsg(res, "User fetched successfully", user);
  } catch (error) {
    fError(res, "Error fetching user", 500);
  }
};

export const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    const currentUser = await User.findById(req.user._id);
    if (!user) return fError(res, "User not found", 404);
    if (user._id.toString() === currentUser._id.toString() || currentUser.role !== "admin")
      return fError(res, "You cannot delete your own account or you are not an admin", 400);
    await User.findByIdAndDelete(req.params.id);
    fMsg(res, "User deleted successfully");
  } catch (error) {
    fError(res, "Error deleting user", 500);
  }
};
