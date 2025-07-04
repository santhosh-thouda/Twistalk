import express from 'express';
import { 
    sendMessage, 
    getConversations, 
    getMessages, 
    markAsRead, 
    addReaction, 
    removeReaction, 
    deleteMessage, 
    searchMessages, 
    getOnlineUsers 
} from '../Controllers/MessageController.js';
import { verifyToken } from '../Middleware/authMiddleWare.js';

const router = express.Router();

// All routes require authentication
router.use(verifyToken);

// Message routes
router.post('/send', sendMessage);
router.get('/conversations', getConversations);
router.get('/messages/:conversationId', getMessages);
router.put('/read/:messageId', markAsRead);
router.post('/reaction/:messageId', addReaction);
router.delete('/reaction/:messageId', removeReaction);
router.delete('/delete/:messageId', deleteMessage);
router.get('/search', searchMessages);
router.get('/online-users', getOnlineUsers);

export default router; 