import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { sendMessage } from '../../actions/MessageAction';
import './NewMessageModal.css';

const NewMessageModal = ({ onClose, onConversationCreated, currentUser, onlineUsers }) => {
    const dispatch = useDispatch();
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [message, setMessage] = useState('');

    const filteredUsers = onlineUsers.filter(user => 
        user._id !== currentUser._id &&
        `${user.firstname} ${user.lastname}`.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleUserSelect = (user) => {
        const isSelected = selectedUsers.find(u => u._id === user._id);
        if (isSelected) {
            setSelectedUsers(selectedUsers.filter(u => u._id !== user._id));
        } else {
            setSelectedUsers([...selectedUsers, user]);
        }
    };

    const handleSendMessage = async () => {
        if (selectedUsers.length === 0 || (!message.trim() && selectedUsers.length === 0)) {
            return;
        }

        try {
            const promises = selectedUsers.map(user => 
                dispatch(sendMessage({
                    receiverId: user._id,
                    text: message.trim(),
                    messageType: 'text'
                }))
            );

            const results = await Promise.all(promises);
            
            // Create conversation object for the first user (for simplicity)
            if (results.length > 0) {
                const conversation = {
                    _id: results[0].conversationId,
                    participants: [currentUser, selectedUsers[0]],
                    lastMessage: results[0],
                    unreadCount: 0
                };
                onConversationCreated(conversation);
            }
        } catch (error) {
            console.error('Failed to send message:', error);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const removeSelectedUser = (userId) => {
        setSelectedUsers(selectedUsers.filter(u => u._id !== userId));
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="new-message-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h3>New Message</h3>
                    <button className="close-btn" onClick={onClose}>✕</button>
                </div>

                <div className="modal-content">
                    <div className="search-section">
                        <input
                            type="text"
                            placeholder="Search users..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="search-input"
                        />
                    </div>

                    {selectedUsers.length > 0 && (
                        <div className="selected-users">
                            <h4>To:</h4>
                            <div className="selected-users-list">
                                {selectedUsers.map(user => (
                                    <div key={user._id} className="selected-user">
                                        <img
                                            src={`http://localhost:5000/images/${user.profilePicture || 'defaultProfile.png'}`}
                                            alt={user.firstname}
                                            className="user-avatar"
                                        />
                                        <span className="user-name">
                                            {user.firstname} {user.lastname}
                                        </span>
                                        <button
                                            className="remove-user-btn"
                                            onClick={() => removeSelectedUser(user._id)}
                                        >
                                            ✕
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="users-list">
                        {filteredUsers.map(user => {
                            const isSelected = selectedUsers.find(u => u._id === user._id);
                            return (
                                <div
                                    key={user._id}
                                    className={`user-item ${isSelected ? 'selected' : ''}`}
                                    onClick={() => handleUserSelect(user)}
                                >
                                    <img
                                        src={`http://localhost:5000/images/${user.profilePicture || 'defaultProfile.png'}`}
                                        alt={user.firstname}
                                        className="user-avatar"
                                    />
                                    <div className="user-info">
                                        <span className="user-name">
                                            {user.firstname} {user.lastname}
                                        </span>
                                        <span className="user-status">Active now</span>
                                    </div>
                                    {isSelected && (
                                        <div className="selected-indicator">✓</div>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    {selectedUsers.length > 0 && (
                        <div className="message-section">
                            <textarea
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder="Write a message..."
                                className="message-textarea"
                                rows="3"
                            />
                            <button
                                className="send-message-btn"
                                onClick={handleSendMessage}
                                disabled={!message.trim()}
                            >
                                Send
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default NewMessageModal; 