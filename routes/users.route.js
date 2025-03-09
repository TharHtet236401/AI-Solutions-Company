import express from 'express';
import { getUsers, createUser, loginUser, logoutUser, getUser, deleteUser, updateUser, getVisualizationData, updatePersonalInfo, updatePassword } from '../controllers/users.controller.js';
import { validateToken } from '../utils/validator.js';
const router = express.Router();

// Non-parameterized routes first
router.get("/", validateToken, getUsers);
router.get("/visualization-data", validateToken, getVisualizationData);
router.get("/profile", validateToken, getUser);
router.post("/login", loginUser);
router.post("/logout", logoutUser);
router.post("/", validateToken, createUser);
router.put("/personal-info", validateToken, updatePersonalInfo);
router.put("/update-password", validateToken, updatePassword);

// Parameterized routes last
router.delete("/:id", validateToken, deleteUser);
router.put("/:id", validateToken, updateUser);

export default router;
