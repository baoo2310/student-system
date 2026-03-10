import { Router } from 'express';
import { getMyConversations, getOrCreateConversation, getConversationMessages, sendMessage } from '../controller/chat.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/', getMyConversations);
router.post('/init', getOrCreateConversation);
router.get('/:id/messages', getConversationMessages);
router.post('/:id/messages', sendMessage);

export default router;
