import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { getConversations, getOnlineUsers } from '../../actions/MessageAction';
import ConversationList from '../../Components/Messages/ConversationList';
import ChatArea from '../../Components/Messages/ChatArea';
import NewMessageModal from '../../Components/Messages/NewMessageModal';
import './Messages.css';

const Messages = () => {
    const dispatch = useDispatch();
    const { conversations, loading, onlineUsers } = useSelector((state) => state.messageReducer);
    const { user } = useSelector((state) => state.authReducer.authData);
    const [selectedConversation, setSelectedConversation] = useState(null);
    const [showNewMessageModal, setShowNewMessageModal] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        dispatch(getConversations());
        dispatch(getOnlineUsers());
    }, [dispatch]);

    const filteredConversations = conversations.filter(conv => {
        if (!searchQuery) return true;
        
        const otherParticipant = conv.participants.find(p => p._id !== user._id);
        if (!otherParticipant) return false;
        
        const fullName = `${otherParticipant.firstname} ${otherParticipant.lastname}`.toLowerCase();
        return fullName.includes(searchQuery.toLowerCase());
    });

    const handleConversationSelect = (conversation) => {
        setSelectedConversation(conversation);
    };

    const handleNewMessage = () => {
        setShowNewMessageModal(true);
    };

    return (
        <div className="messages-container">
            <div className="messages-header">
                <h2>Messages</h2>
                <div className="header-actions">
                    <Link to="/home" className="home-btn">
                        🏠 Home
                    </Link>
                    <button 
                        className="new-message-btn"
                        onClick={handleNewMessage}
                    >
                        ✉️ New Message
                    </button>
                </div>
            </div>

            <div className="messages-content">
                <div className="conversations-sidebar">
                    <div className="search-container">
                        <input
                            type="text"
                            placeholder="Search conversations..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="search-input"
                        />
                    </div>

                    <div className="online-users-section">
                        <h4>Online</h4>
                        <div className="online-users-list">
                            {onlineUsers.slice(0, 5).map((onlineUser) => (
                                <div key={onlineUser._id} className="online-user">
                                    <img 
                                        src={`http://localhost:5000/images/${onlineUser.profilePicture || 'defaultProfile.png'}`} 
                                        alt={onlineUser.firstname}
                                        className="online-user-avatar"
                                    />
                                    <span className="online-indicator"></span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <ConversationList
                        conversations={filteredConversations}
                        selectedConversation={selectedConversation}
                        onConversationSelect={handleConversationSelect}
                        loading={loading}
                        currentUser={user}
                    />
                </div>

                <div className="chat-area">
                    {selectedConversation ? (
                        <ChatArea
                            conversation={selectedConversation}
                            currentUser={user}
                        />
                    ) : (
                        <div className="no-conversation-selected">
                            <div className="no-conversation-content">
                                <div className="message-icon">💬</div>
                                <h3>Your Messages</h3>
                                <p>Send photos and messages to friends</p>
                                <button 
                                    className="send-message-btn"
                                    onClick={handleNewMessage}
                                >
                                    Send Message
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {showNewMessageModal && (
                <NewMessageModal
                    onClose={() => setShowNewMessageModal(false)}
                    onConversationCreated={(conversation) => {
                        setSelectedConversation(conversation);
                        setShowNewMessageModal(false);
                    }}
                    currentUser={user}
                    onlineUsers={onlineUsers}
                />
            )}
        </div>
    );
};

export default Messages; 