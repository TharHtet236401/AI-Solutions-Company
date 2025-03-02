import express from 'express';
import { getUsers, createUser, loginUser, logoutUser ,getUser,deleteUser} from '../controllers/users.controller.js';
import { validateToken } from '../utils/validator.js';
const router = express.Router();

router.get('/', validateToken, getUsers);
router.post('/', validateToken, createUser);
router.post('/login', loginUser);
router.post('/logout', logoutUser);
router.delete('/:id', validateToken, deleteUser);
router.get('/profile', validateToken, getUser);


export default router;