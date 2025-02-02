import User from '../models/users.model.js';

export const getUsers = async (req, res) => {
    const users = await User.find();
    res.json(users);
};

export const createUser = async (req, res) => {
    const { username, password, role } = req.body;
    const newUser = new User({ username, password, role });
    await newUser.save();
    res.status(201).json(newUser);
};

