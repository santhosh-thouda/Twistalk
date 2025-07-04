import * as MessageApi from '../api/MessageRequest.js';

// Send message
export const sendMessage = (messageData) => async (dispatch) => {
    dispatch({ type: 'SEND_MESSAGE_START' });
    try {
        const { data } = await MessageApi.sendMessage(messageData);
        dispatch({ type: 'SEND_MESSAGE_SUCCESS', data });
        return data;
    } catch (error) {
        console.log('Send message error:', error);
        dispatch({ type: 'SEND_MESSAGE_FAIL' });
        throw error;
    }
};

// Get conversations
export const getConversations = () => async (dispatch) => {
    dispatch({ type: 'GET_CONVERSATIONS_START' });
    try {
        const { data } = await MessageApi.getConversations();
        dispatch({ type: 'GET_CONVERSATIONS_SUCCESS', data });
    } catch (error) {
        console.log('Get conversations error:', error);
        dispatch({ type: 'GET_CONVERSATIONS_FAIL' });
    }
};

// Get messages for a conversation
export const getMessages = (conversationId) => async (dispatch) => {
    dispatch({ type: 'GET_MESSAGES_START' });
    try {
        const { data } = await MessageApi.getMessages(conversationId);
        dispatch({ type: 'GET_MESSAGES_SUCCESS', data, conversationId });
    } catch (error) {
        console.log('Get messages error:', error);
        dispatch({ type: 'GET_MESSAGES_FAIL' });
    }
};

// Mark message as read
export const markAsRead = (messageId) => async (dispatch) => {
    try {
        await MessageApi.markAsRead(messageId);
        dispatch({ type: 'MARK_AS_READ', messageId });
    } catch (error) {
        console.log('Mark as read error:', error);
    }
};

// Add reaction to message
export const addReaction = (messageId, emoji) => async (dispatch) => {
    try {
        const { data } = await MessageApi.addReaction(messageId, emoji);
        dispatch({ type: 'ADD_REACTION', data });
    } catch (error) {
        console.log('Add reaction error:', error);
    }
};

// Remove reaction from message
export const removeReaction = (messageId) => async (dispatch) => {
    try {
        const { data } = await MessageApi.removeReaction(messageId);
        dispatch({ type: 'REMOVE_REACTION', data });
    } catch (error) {
        console.log('Remove reaction error:', error);
    }
};

// Delete message
export const deleteMessage = (messageId) => async (dispatch) => {
    try {
        await MessageApi.deleteMessage(messageId);
        dispatch({ type: 'DELETE_MESSAGE', messageId });
    } catch (error) {
        console.log('Delete message error:', error);
    }
};

// Search messages
export const searchMessages = (query) => async (dispatch) => {
    dispatch({ type: 'SEARCH_MESSAGES_START' });
    try {
        const { data } = await MessageApi.searchMessages(query);
        dispatch({ type: 'SEARCH_MESSAGES_SUCCESS', data });
    } catch (error) {
        console.log('Search messages error:', error);
        dispatch({ type: 'SEARCH_MESSAGES_FAIL' });
    }
};

// Get online users
export const getOnlineUsers = () => async (dispatch) => {
    try {
        const { data } = await MessageApi.getOnlineUsers();
        dispatch({ type: 'GET_ONLINE_USERS', data });
    } catch (error) {
        console.log('Get online users error:', error);
    }
};

// Add new message to conversation (for real-time updates)
export const addNewMessage = (message) => async (dispatch) => {
    dispatch({ type: 'ADD_NEW_MESSAGE', data: message });
};

// Update conversation with new message
export const updateConversation = (conversation) => async (dispatch) => {
    dispatch({ type: 'UPDATE_CONVERSATION', data: conversation });
}; 