import express from 'express';
import { getUsers, createUser, loginUser, logoutUser } from '../controllers/users.controller.js';

const router = express.Router();

router.get('/', getUsers);
router.post('/', createUser);
router.post('/login', loginUser);
router.post('/logout', logoutUser);

export default router;