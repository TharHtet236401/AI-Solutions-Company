import express from 'express';
import { getUsers, createUser, loginUser, logoutUser ,getUser} from '../controllers/users.controller.js';
import { validateToken } from '../utils/validator.js';
const router = express.Router();

router.get('/', validateToken, getUsers);
router.post('/', createUser);
router.post('/login', loginUser);
router.post('/logout', logoutUser);
router.get('/profile', validateToken, getUser);

export default router;