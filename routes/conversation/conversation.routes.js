import { Router } from 'express';
import { checkAuth } from '../../middlewares/checkAuth.middleware.js';
import {
    startGetConversationsLastMessage,
    startGetConversationById,
    startSendStartMessage
} from '../../controllers/conversation.controller.js';

const router = Router();

router.get('/lastMessage', checkAuth, startGetConversationsLastMessage);
router.get('/:conversationId', checkAuth, startGetConversationById);
router.post('/', checkAuth, startSendStartMessage);

export default router;
