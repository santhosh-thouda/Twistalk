import React, { useState } from 'react';
import './MessageBubble.css';

const MessageBubble = ({ 
    message, 
    isOwnMessage, 
    onReaction, 
    onRemoveReaction, 
    onDelete, 
    currentUser 
}) => {
    const [showReactions, setShowReactions] = useState(false);
    const [showOptions, setShowOptions] = useState(false);

    const formatTime = (timestamp) => {
        const date = new Date(timestamp);
        return date.toLocaleTimeString('en-US', { 
            hour: 'numeric', 
            minute: '2-digit',
            hour12: true 
        });
    };

    const handleReaction = (emoji) => {
        const hasReaction = message.reactions?.some(r => r.user === currentUser._id);
        if (hasReaction) {
            onRemoveReaction(message._id);
        } else {
            onReaction(message._id, emoji);
        }
        setShowReactions(false);
    };

    const handleDelete = () => {
        onDelete(message._id);
        setShowOptions(false);
    };

    const getStatusIcon = () => {
        if (!isOwnMessage) return null;
        
        switch (message.status) {
            case 'read':
                return <span className="status-icon read">✓✓</span>;
            case 'delivered':
                return <span className="status-icon delivered">✓✓</span>;
            case 'sent':
                return <span className="status-icon sent">✓</span>;
            default:
                return <span className="status-icon sending">⋯</span>;
        }
    };

    const renderMessageContent = () => {
        if (message.image) {
            return (
                <div className="message-image">
                    <img 
                        src={`http://localhost:5000/images/${message.image}`} 
                        alt="Message" 
                        className="image-content"
                    />
                </div>
            );
        }

        if (message.file) {
            return (
                <div className="message-file">
                    <div className="file-icon">📎</div>
                    <div className="file-info">
                        <div className="file-name">{message.file.name || 'File'}</div>
                        <div className="file-size">
                            {message.file.size ? `${(message.file.size / 1024).toFixed(1)} KB` : 'Unknown size'}
                        </div>
                    </div>
                </div>
            );
        }

        return (
            <div className="message-text">
                {message.text}
            </div>
        );
    };

    const renderReactions = () => {
        if (!message.reactions || message.reactions.length === 0) return null;

        const reactionGroups = message.reactions.reduce((groups, reaction) => {
            if (!groups[reaction.emoji]) {
                groups[reaction.emoji] = [];
            }
            groups[reaction.emoji].push(reaction);
            return groups;
        }, {});

        return (
            <div className="message-reactions">
                {Object.entries(reactionGroups).map(([emoji, reactions]) => (
                    <div key={emoji} className="reaction-group">
                        <span className="reaction-emoji">{emoji}</span>
                        <span className="reaction-count">{reactions.length}</span>
                    </div>
                ))}
            </div>
        );
    };

    const commonEmojis = ['❤️', '👍', '👎', '😂', '😮', '😢', '😡'];

    return (
        <div className={`message-bubble ${isOwnMessage ? 'own-message' : 'other-message'}`}>
            {!isOwnMessage && (
                <img
                    src={`http://localhost:5000/images/${message.sender?.profilePicture || 'defaultProfile.png'}`}
                    alt={message.sender?.firstname}
                    className="sender-avatar"
                />
            )}

            <div className="message-content">
                <div className="message-wrapper">
                    {renderMessageContent()}
                    
                    <div className="message-footer">
                        <span className="message-time">{formatTime(message.createdAt)}</span>
                        {getStatusIcon()}
                    </div>

                    {renderReactions()}
                </div>

                <div className="message-actions">
                    <button 
                        className="action-btn reaction-btn"
                        onClick={() => setShowReactions(!showReactions)}
                        title="React"
                    >
                        😊
                    </button>
                    
                    {isOwnMessage && (
                        <button 
                            className="action-btn options-btn"
                            onClick={() => setShowOptions(!showOptions)}
                            title="More options"
                        >
                            ⋯
                        </button>
                    )}
                </div>

                {showReactions && (
                    <div className="reactions-picker">
                        {commonEmojis.map((emoji) => (
                            <button
                                key={emoji}
                                className="emoji-btn"
                                onClick={() => handleReaction(emoji)}
                            >
                                {emoji}
                            </button>
                        ))}
                    </div>
                )}

                {showOptions && (
                    <div className="message-options">
                        <button 
                            className="option-btn delete-btn"
                            onClick={handleDelete}
                        >
                            🗑️ Delete
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MessageBubble; 