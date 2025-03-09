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
    if (role == "Super Admin") {
      return res.status(400).json({
        con: false,
        msg: "You cannot create a Super Admin account"
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
    if (!user) return fError(res, "User not found", 404);
    fMsg(res, "User fetched successfully", user);
  } catch (error) {
    fError(res, "Error fetching user", 500);
  }
};

export const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    const currentUser = await User.findById(req.user._id);
    if (req.user.role !== "Super Admin") {
      return fError(res, "You are not authorized to delete the users", 403);
    }
    if (!user) return fError(res, "User not found", 404);
    if (user._id.toString() === currentUser._id.toString() || currentUser.role !== "Super Admin")
      return fError(res, "You cannot delete your own account or you are not an admin", 400);
    await User.findByIdAndDelete(req.params.id);
    fMsg(res, "User deleted successfully");
  } catch (error) {
    fError(res, "Error deleting user", 500);
  }
};

export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { username, password, role } = req.body;

    if (req.user.role !== "Super Admin") {
      return fError(res, "You are not authorized to update the users", 403);
    }

    // Find user
    const user = await User.findById(id);
    if (!user) {
      return fError(res, "User not found", 404);
    }

    // Check if username is being changed and if it's already taken
    if (username !== user.username) {
      const existingUser = await User.findOne({ username });
      if (existingUser) {
        return fError(res, "Username already exists", 400);
      }
    }

    // Update user fields
    user.username = username;
    user.role = role;

    // Only update password if provided
    if (password) {
      user.password = await encode(password);
    }

    await user.save();

    // Return success without password
    const userWithoutPassword = user.toObject();
    delete userWithoutPassword.password;

    return res.status(200).json({
      con: true,
      msg: "User updated successfully",
      result: userWithoutPassword
    });

  } catch (error) {
    console.error('Error in updateUser:', error);
    return res.status(500).json({
      con: false,
      msg: "Error updating user"
    });
  }
};

export const getVisualizationData = async (req, res) => {
    try {
        // Get role distribution
        const roleDistribution = await User.aggregate([
            {
                $group: {
                    _id: "$role",
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        // Get staff growth over time (monthly)
        const growthData = await User.aggregate([
            {
                $group: {
                    _id: {
                        year: { $year: "$createdAt" },
                        month: { $month: "$createdAt" }
                    },
                    count: { $sum: 1 }
                }
            },
            {
                $project: {
                    _id: {
                        $dateFromParts: {
                            year: "$_id.year",
                            month: "$_id.month"
                        }
                    },
                    count: 1
                }
            },
            { $sort: { "_id": 1 } }
        ]);

        return res.status(200).json({
            con: true,
            msg: 'Visualization data fetched successfully',
            result: {
                roleDistribution,
                growthData
            }
        });
    } catch (error) {
        console.error('Error in getVisualizationData:', error);
        return res.status(500).json({
            con: false,
            msg: 'Error fetching visualization data'
        });
    }
};

export const updatePersonalInfo = async (req, res) => {
  try {
    const { username} = req.body;
    console.log(username);
    console.log(req.user);
    const user = await User.findById(req.user._id);
    console.log(user);
    if (!user) return fError(res, "User not found", 404);
    user.username = username;
    await user.save();
    const userWithoutPassword = user.toObject();
    delete userWithoutPassword.password;
    fMsg(res, "User updated successfully", userWithoutPassword);
  } catch (error) {
    fError(res, "Error updating user", 500);
  }
};
