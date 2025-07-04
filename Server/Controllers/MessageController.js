import MessageModel from '../Models/messageModel.js';
import ConversationModel from '../Models/conversationModel.js';
import UserModel from '../Models/userModel.js';

// Send a message
export const sendMessage = async (req, res) => {
    try {
        const { conversationId, receiverId, text, image, file, messageType, replyTo } = req.body;
        const senderId = req.user.id;

        // Validate required fields
        if (!receiverId) {
            return res.status(400).json({ message: "Receiver ID is required" });
        }

        let conversation;
        
        // Find or create conversation
        if (conversationId) {
            conversation = await ConversationModel.findById(conversationId);
        } else {
            // Create new conversation
            conversation = await ConversationModel.findOne({
                participants: { $all: [senderId, receiverId] },
                isGroupChat: false
            });

            if (!conversation) {
                conversation = new ConversationModel({
                    participants: [senderId, receiverId],
                    unreadCount: new Map([[receiverId, 1]])
                });
                await conversation.save();
            }
        }

        // Create message
        const newMessage = new MessageModel({
            conversationId: conversation._id,
            sender: senderId,
            receiver: receiverId,
            text: text || "",
            image: image || "",
            file: file || "",
            messageType: messageType || "text",
            replyTo: replyTo || null
        });

        const savedMessage = await newMessage.save();

        // Update conversation
        conversation.lastMessage = savedMessage._id;
        const currentUnread = conversation.unreadCount.get(receiverId) || 0;
        conversation.unreadCount.set(receiverId, currentUnread + 1);
        await conversation.save();

        // Populate sender and receiver details
        const populatedMessage = await MessageModel.findById(savedMessage._id)
            .populate('sender', 'firstname lastname profilePicture')
            .populate('receiver', 'firstname lastname profilePicture')
            .populate('replyTo', 'text image');

        // Emit socket.io event to receiver for real-time notification
        const io = req.app.get('io');
        if (io && receiverId !== senderId) {
            io.to(receiverId.toString()).emit('message-notification', {
                type: 'message',
                from: senderId,
                fromName: populatedMessage.sender.firstname + ' ' + populatedMessage.sender.lastname,
                fromAvatar: populatedMessage.sender.profilePicture,
                conversationId: conversation._id,
                message: text || (image ? 'Sent an image' : file ? 'Sent a file' : 'New message'),
                time: new Date().toISOString()
            });
        }

        res.status(200).json(populatedMessage);
    } catch (error) {
        console.error('Send message error:', error);
        res.status(500).json({ message: error.message });
    }
};

// Get conversations for a user
export const getConversations = async (req, res) => {
    try {
        const userId = req.user.id;

        const conversations = await ConversationModel.find({
            participants: userId,
            isActive: true
        })
        .populate('participants', 'firstname lastname profilePicture')
        .populate('lastMessage')
        .populate('groupAdmin', 'firstname lastname')
        .sort({ updatedAt: -1 });

        // Get unread counts
        const conversationsWithUnread = conversations.map(conv => {
            const unreadCount = conv.unreadCount.get(userId) || 0;
            return {
                ...conv.toObject(),
                unreadCount
            };
        });

        res.status(200).json(conversationsWithUnread);
    } catch (error) {
        console.error('Get conversations error:', error);
        res.status(500).json({ message: error.message });
    }
};

// Get messages for a conversation
export const getMessages = async (req, res) => {
    try {
        const { conversationId } = req.params;
        const userId = req.user.id;

        // Verify user is part of conversation
        const conversation = await ConversationModel.findById(conversationId);
        if (!conversation || !conversation.participants.includes(userId)) {
            return res.status(403).json({ message: "Access denied" });
        }

        const messages = await MessageModel.find({
            conversationId,
            isDeleted: false
        })
        .populate('sender', 'firstname lastname profilePicture')
        .populate('receiver', 'firstname lastname profilePicture')
        .populate('replyTo', 'text image')
        .sort({ createdAt: 1 });

        // Mark messages as read
        await MessageModel.updateMany(
            {
                conversationId,
                receiver: userId,
                status: { $ne: "read" }
            },
            { status: "read" }
        );

        // Reset unread count
        conversation.unreadCount.set(userId, 0);
        await conversation.save();

        res.status(200).json(messages);
    } catch (error) {
        console.error('Get messages error:', error);
        res.status(500).json({ message: error.message });
    }
};

// Mark message as read
export const markAsRead = async (req, res) => {
    try {
        const { messageId } = req.params;
        const userId = req.user.id;

        const message = await MessageModel.findById(messageId);
        if (!message) {
            return res.status(404).json({ message: "Message not found" });
        }

        if (message.receiver.toString() !== userId) {
            return res.status(403).json({ message: "Access denied" });
        }

        message.status = "read";
        await message.save();

        // Update conversation unread count
        const conversation = await ConversationModel.findById(message.conversationId);
        if (conversation) {
            const currentUnread = conversation.unreadCount.get(userId) || 0;
            if (currentUnread > 0) {
                conversation.unreadCount.set(userId, currentUnread - 1);
                await conversation.save();
            }
        }

        res.status(200).json({ message: "Message marked as read" });
    } catch (error) {
        console.error('Mark as read error:', error);
        res.status(500).json({ message: error.message });
    }
};

// Add reaction to message
export const addReaction = async (req, res) => {
    try {
        const { messageId } = req.params;
        const { emoji } = req.body;
        const userId = req.user.id;

        if (!emoji) {
            return res.status(400).json({ message: "Emoji is required" });
        }

        const message = await MessageModel.findById(messageId);
        if (!message) {
            return res.status(404).json({ message: "Message not found" });
        }

        // Remove existing reaction from this user
        message.reactions = message.reactions.filter(
            reaction => reaction.user.toString() !== userId
        );

        // Add new reaction
        message.reactions.push({ user: userId, emoji });
        await message.save();

        const populatedMessage = await MessageModel.findById(messageId)
            .populate('sender', 'firstname lastname profilePicture')
            .populate('receiver', 'firstname lastname profilePicture')
            .populate('reactions.user', 'firstname lastname profilePicture');

        res.status(200).json(populatedMessage);
    } catch (error) {
        console.error('Add reaction error:', error);
        res.status(500).json({ message: error.message });
    }
};

// Remove reaction from message
export const removeReaction = async (req, res) => {
    try {
        const { messageId } = req.params;
        const userId = req.user.id;

        const message = await MessageModel.findById(messageId);
        if (!message) {
            return res.status(404).json({ message: "Message not found" });
        }

        message.reactions = message.reactions.filter(
            reaction => reaction.user.toString() !== userId
        );
        await message.save();

        const populatedMessage = await MessageModel.findById(messageId)
            .populate('sender', 'firstname lastname profilePicture')
            .populate('receiver', 'firstname lastname profilePicture')
            .populate('reactions.user', 'firstname lastname profilePicture');

        res.status(200).json(populatedMessage);
    } catch (error) {
        console.error('Remove reaction error:', error);
        res.status(500).json({ message: error.message });
    }
};

// Delete message
export const deleteMessage = async (req, res) => {
    try {
        const { messageId } = req.params;
        const userId = req.user.id;

        const message = await MessageModel.findById(messageId);
        if (!message) {
            return res.status(404).json({ message: "Message not found" });
        }

        if (message.sender.toString() !== userId) {
            return res.status(403).json({ message: "You can only delete your own messages" });
        }

        message.isDeleted = true;
        await message.save();

        res.status(200).json({ message: "Message deleted successfully" });
    } catch (error) {
        console.error('Delete message error:', error);
        res.status(500).json({ message: error.message });
    }
};

// Search messages
export const searchMessages = async (req, res) => {
    try {
        const { query } = req.query;
        const userId = req.user.id;

        if (!query) {
            return res.status(400).json({ message: "Search query is required" });
        }

        // Get user's conversations
        const conversations = await ConversationModel.find({
            participants: userId
        });

        const conversationIds = conversations.map(conv => conv._id);

        const messages = await MessageModel.find({
            conversationId: { $in: conversationIds },
            text: { $regex: query, $options: 'i' },
            isDeleted: false
        })
        .populate('sender', 'firstname lastname profilePicture')
        .populate('receiver', 'firstname lastname profilePicture')
        .populate('conversationId')
        .sort({ createdAt: -1 })
        .limit(50);

        res.status(200).json(messages);
    } catch (error) {
        console.error('Search messages error:', error);
        res.status(500).json({ message: error.message });
    }
};

// Get online users
export const getOnlineUsers = async (req, res) => {
    try {
        const userId = req.user.id;

        // Get users who are not the current user
        const users = await UserModel.find({
            _id: { $ne: userId }
        })
        .select('firstname lastname profilePicture');

        res.status(200).json(users);
    } catch (error) {
        console.error('Get online users error:', error);
        res.status(500).json({ message: error.message });
    }
}; 