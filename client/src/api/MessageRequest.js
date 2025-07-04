import axios from 'axios';

const API = axios.create({ 
    baseURL: 'http://localhost:5000',
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Add auth token to requests
API.interceptors.request.use((config) => {
    const profile = localStorage.getItem('profile');
    if (profile) {
        const token = JSON.parse(profile).token;
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    }
    return config;
});

// Send message
export const sendMessage = (messageData) => API.post('/message/send', messageData);

// Get conversations
export const getConversations = () => API.get('/message/conversations');

// Get messages for a conversation
export const getMessages = (conversationId) => API.get(`/message/messages/${conversationId}`);

// Mark message as read
export const markAsRead = (messageId) => API.put(`/message/read/${messageId}`);

// Add reaction to message
export const addReaction = (messageId, emoji) => API.post(`/message/reaction/${messageId}`, { emoji });

// Remove reaction from message
export const removeReaction = (messageId) => API.delete(`/message/reaction/${messageId}`);

// Delete message
export const deleteMessage = (messageId) => API.delete(`/message/delete/${messageId}`);

// Search messages
export const searchMessages = (query) => API.get(`/message/search?query=${query}`);

// Get online users
export const getOnlineUsers = () => API.get('/message/online-users'); 