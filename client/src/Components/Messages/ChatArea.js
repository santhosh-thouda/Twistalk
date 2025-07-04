import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { getMessages, sendMessage, addReaction, removeReaction, deleteMessage } from '../../actions/MessageAction';
import MessageBubble from './MessageBubble';
import MessageInput from './MessageInput';
import './ChatArea.css';

const ChatArea = ({ conversation, currentUser }) => {
    const dispatch = useDispatch();
    const { currentMessages, loading } = useSelector((state) => state.messageReducer);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const messagesEndRef = useRef(null);
    const fileInputRef = useRef(null);

    useEffect(() => {
        if (conversation?._id) {
            dispatch(getMessages(conversation._id));
        }
    }, [dispatch, conversation?._id]);

    useEffect(() => {
        scrollToBottom();
    }, [currentMessages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleSendMessage = async (text, image = null, file = null) => {
        if (!text.trim() && !image && !file) return;

        const otherParticipant = conversation.participants.find(p => p._id !== currentUser._id);
        
        const messageData = {
            receiverId: otherParticipant._id,
            conversationId: conversation._id,
            text: text.trim(),
            messageType: image ? 'image' : file ? 'file' : 'text'
        };

        if (image) {
            messageData.image = image;
        }

        if (file) {
            messageData.file = file;
        }

        try {
            await dispatch(sendMessage(messageData));
        } catch (error) {
            console.error('Failed to send message:', error);
        }
    };

    const handleReaction = async (messageId, emoji) => {
        try {
            await dispatch(addReaction(messageId, emoji));
        } catch (error) {
            console.error('Failed to add reaction:', error);
        }
    };

    const handleRemoveReaction = async (messageId) => {
        try {
            await dispatch(removeReaction(messageId));
        } catch (error) {
            console.error('Failed to remove reaction:', error);
        }
    };

    const handleDeleteMessage = async (messageId) => {
        if (window.confirm('Are you sure you want to delete this message?')) {
            try {
                await dispatch(deleteMessage(messageId));
            } catch (error) {
                console.error('Failed to delete message:', error);
            }
        }
    };

    const handleFileUpload = (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const fileData = {
                    name: file.name,
                    type: file.type,
                    size: file.size,
                    data: e.target.result
                };
                handleSendMessage('', null, fileData);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleVoiceCall = () => {
        const otherParticipant = getOtherParticipant();
        alert(`Initiating voice call with ${otherParticipant?.firstname} ${otherParticipant?.lastname}...\n\nNote: This is a demo feature. In a real app, this would integrate with WebRTC or a calling service.`);
    };

    const handleVideoCall = () => {
        const otherParticipant = getOtherParticipant();
        alert(`Initiating video call with ${otherParticipant?.firstname} ${otherParticipant?.lastname}...\n\nNote: This is a demo feature. In a real app, this would integrate with WebRTC or a calling service.`);
    };

    const handleMoreOptions = () => {
        const otherParticipant = getOtherParticipant();
        const options = [
            'View Profile',
            'Block User',
            'Report User',
            'Clear Chat History'
        ];
        
        const selectedOption = prompt(
            `Options for ${otherParticipant?.firstname} ${otherParticipant?.lastname}:\n\n` +
            options.map((option, index) => `${index + 1}. ${option}`).join('\n') +
            '\n\nEnter option number (1-4):'
        );
        
        if (selectedOption) {
            const optionIndex = parseInt(selectedOption) - 1;
            if (optionIndex >= 0 && optionIndex < options.length) {
                alert(`Selected: ${options[optionIndex]}\n\nNote: This is a demo feature.`);
            }
        }
    };

    const getOtherParticipant = () => {
        return conversation.participants.find(p => p._id !== currentUser._id);
    };

    const otherParticipant = getOtherParticipant();

    if (loading) {
        return (
            <div className="chat-area">
                <div className="loading-messages">
                    <div className="loading-spinner"></div>
                    <p>Loading messages...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="chat-area">
            <div className="chat-header">
                <div className="chat-participant-info">
                    <img
                        src={`http://localhost:5000/images/${otherParticipant?.profilePicture || 'defaultProfile.png'}`}
                        alt={otherParticipant?.firstname}
                        className="participant-avatar"
                    />
                    <div className="participant-details">
                        <h3>{otherParticipant ? 
                            `${otherParticipant.firstname} ${otherParticipant.lastname}` : 
                            'Unknown User'
                        }</h3>
                        <span className="online-status">Active now</span>
                    </div>
                </div>
                <div className="chat-actions">
                    <button 
                        className="action-btn" 
                        title="Voice call"
                        onClick={handleVoiceCall}
                    >
                        📞
                    </button>
                    <button 
                        className="action-btn" 
                        title="Video call"
                        onClick={handleVideoCall}
                    >
                        📹
                    </button>
                    <button 
                        className="action-btn" 
                        title="More options"
                        onClick={handleMoreOptions}
                    >
                        ⋯
                    </button>
                </div>
            </div>

            <div className="messages-container">
                {currentMessages.length === 0 ? (
                    <div className="no-messages">
                        <div className="no-messages-content">
                            <div className="message-icon">💬</div>
                            <h3>No messages yet</h3>
                            <p>Send a message to start the conversation</p>
                        </div>
                    </div>
                ) : (
                    <div className="messages-list">
                        {currentMessages.map((message) => (
                            <MessageBubble
                                key={message._id}
                                message={message}
                                isOwnMessage={message.sender === currentUser._id}
                                onReaction={handleReaction}
                                onRemoveReaction={handleRemoveReaction}
                                onDelete={handleDeleteMessage}
                                currentUser={currentUser}
                            />
                        ))}
                        <div ref={messagesEndRef} />
                    </div>
                )}
            </div>

            <MessageInput
                onSendMessage={handleSendMessage}
                onFileUpload={handleFileUpload}
                fileInputRef={fileInputRef}
                showEmojiPicker={showEmojiPicker}
                setShowEmojiPicker={setShowEmojiPicker}
            />
        </div>
    );
};

export default ChatArea; 