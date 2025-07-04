import React from 'react';
import './ConversationList.css';

const ConversationList = ({ 
    conversations, 
    selectedConversation, 
    onConversationSelect, 
    loading, 
    currentUser 
}) => {
    if (loading) {
        return (
            <div className="conversation-list">
                <div className="loading-conversations">
                    <div className="loading-spinner"></div>
                    <p>Loading conversations...</p>
                </div>
            </div>
        );
    }

    if (conversations.length === 0) {
        return (
            <div className="conversation-list">
                <div className="no-conversations">
                    <p>No conversations yet</p>
                    <span>Start a conversation to see it here</span>
                </div>
            </div>
        );
    }

    const formatTime = (timestamp) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diffInHours = (now - date) / (1000 * 60 * 60);

        if (diffInHours < 1) {
            return 'now';
        } else if (diffInHours < 24) {
            return date.toLocaleTimeString('en-US', { 
                hour: 'numeric', 
                minute: '2-digit',
                hour12: true 
            });
        } else if (diffInHours < 48) {
            return 'yesterday';
        } else {
            return date.toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric' 
            });
        }
    };

    const getOtherParticipant = (conversation) => {
        return conversation.participants.find(p => p._id !== currentUser._id);
    };

    const getLastMessagePreview = (conversation) => {
        if (!conversation.lastMessage) {
            return 'No messages yet';
        }

        const message = conversation.lastMessage;
        if (message.image) {
            return '📷 Photo';
        } else if (message.file) {
            return '📎 File';
        } else if (message.text) {
            return message.text.length > 30 
                ? message.text.substring(0, 30) + '...' 
                : message.text;
        }
        return 'Message';
    };

    return (
        <div className="conversation-list">
            {conversations.map((conversation) => {
                const otherParticipant = getOtherParticipant(conversation);
                const isSelected = selectedConversation?._id === conversation._id;
                const unreadCount = conversation.unreadCount || 0;

                return (
                    <div
                        key={conversation._id}
                        className={`conversation-item ${isSelected ? 'selected' : ''}`}
                        onClick={() => onConversationSelect(conversation)}
                    >
                        <div className="conversation-avatar">
                            <img
                                src={`http://localhost:5000/images/${otherParticipant?.profilePicture || 'defaultProfile.png'}`}
                                alt={otherParticipant?.firstname}
                                className="avatar-image"
                            />
                            {unreadCount > 0 && (
                                <span className="unread-badge">{unreadCount}</span>
                            )}
                        </div>

                        <div className="conversation-content">
                            <div className="conversation-header">
                                <h4 className="participant-name">
                                    {otherParticipant ? 
                                        `${otherParticipant.firstname} ${otherParticipant.lastname}` : 
                                        'Unknown User'
                                    }
                                </h4>
                                {conversation.lastMessage && (
                                    <span className="last-message-time">
                                        {formatTime(conversation.lastMessage.createdAt)}
                                    </span>
                                )}
                            </div>

                            <div className="conversation-preview">
                                <p className="last-message-text">
                                    {getLastMessagePreview(conversation)}
                                </p>
                                {conversation.lastMessage && (
                                    <div className="message-status">
                                        {conversation.lastMessage.sender === currentUser._id && (
                                            <span className={`status-indicator ${conversation.lastMessage.status}`}>
                                                {conversation.lastMessage.status === 'read' && '✓✓'}
                                                {conversation.lastMessage.status === 'delivered' && '✓✓'}
                                                {conversation.lastMessage.status === 'sent' && '✓'}
                                            </span>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default ConversationList; 