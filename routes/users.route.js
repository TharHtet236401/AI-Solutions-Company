import express from 'express';
import { getUsers, createUser, loginUser, logoutUser, getUser, deleteUser, updateUser, getVisualizationData } from '../controllers/users.controller.js';
import { validateToken } from '../utils/validator.js';
const router = express.Router();

router.get('/', validateToken, getUsers);
router.get('/visualization-data', validateToken, getVisualizationData);
router.post('/', validateToken, createUser);
router.post('/login', loginUser);
router.post('/logout', logoutUser);
router.delete('/:id', validateToken, deleteUser);
router.get('/profile', validateToken, getUser);
router.put('/:id', validateToken, updateUser);

export default router;