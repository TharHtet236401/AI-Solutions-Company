import express from 'express';
import chatBot from '../chatbot/chat-bot.js';

const router = express.Router();

router.post('/', chatBot);

export default router;
