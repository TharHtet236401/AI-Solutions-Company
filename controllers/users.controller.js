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
    if (!username || !password || !role)
      return fError(res, "All fields are required", 400);
    if (role !== "admin" && role !== "staff")
      return fError(res, "Invalid role", 400);

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
