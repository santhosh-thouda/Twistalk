import React, { useState, useContext } from 'react';
import './RightSide.css';
import Home from '../../Img/home.png';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import Noti from '../../Img/noti.png';
import Comment from '../../Img/comment.png';
import TrendCard from '../TrendCard/TrendCard';
import ShareModal from '../ShareModal/ShareModal';
import { Link, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { NotificationContext, MessageContext } from '../../App';
import ProfileModal from '../ProfileModal/ProfileModal';

// Violet filter for #764ba2
const violetFilter = 'brightness(0) saturate(100%) invert(22%) sepia(24%) saturate(1812%) hue-rotate(230deg) brightness(90%) contrast(101%)';

const RightSide = () => {
    const [modalOpened, setModalOpened] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [showUserMenu, setShowUserMenu] = useState(false);
    const location = useLocation();
    const { user } = useSelector((state) => state.authReducer.authData);
    const serverPublic = "http://localhost:5000/images/";
    const { notifications, unreadCount, setUnreadCount } = useContext(NotificationContext);
    const { messageNotifications, unreadMessages, setUnreadMessages } = useContext(MessageContext);
    const [showMessagesDropdown, setShowMessagesDropdown] = useState(false);
    const [showProfileModal, setShowProfileModal] = useState(false);
    const [showPrivacyModal, setShowPrivacyModal] = useState(false);
    const [showNotificationsModal, setShowNotificationsModal] = useState(false);
    const [showHelpModal, setShowHelpModal] = useState(false);
    const [showThemeModal, setShowThemeModal] = useState(false);
    const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');

    const handleNotifications = () => {
        setShowNotifications(!showNotifications);
        setShowSettings(false);
        if (!showNotifications) setUnreadCount(0);
    };

    const handleSettings = () => {
        setShowSettings(!showSettings);
        setShowNotifications(false);
    };

    const handleMessaging = () => {
        setShowMessagesDropdown(!showMessagesDropdown);
        setUnreadMessages(0);
        window.location.href = '/messages';
    };

    const handleThemeChange = (newTheme) => {
        setTheme(newTheme);
        document.body.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
    };

    const settingsOptions = [
        { id: 1, text: 'Edit Profile', icon: '👤' },
        { id: 2, text: 'Privacy Settings', icon: '��' },
        { id: 3, text: 'Notifications', icon: '🔔' },
        { id: 4, text: 'Theme', icon: '🎨' },
        { id: 5, text: 'Help & Support', icon: '❓' },
        { id: 6, text: 'Logout', icon: '🚪' }
    ];

    // Helper to determine if an icon should be violet
    const isHomeActive = location.pathname === '/home';
    const isMessagesActive = location.pathname === '/messages';

    return (
        <div className='RightSide'>
            <div className="navIcons">
                <Link to="../home" className={isHomeActive ? 'active' : ''} tabIndex={0} aria-label="Home">
                    <img 
                        src={Home} 
                        alt="Home" 
                        title="Home" 
                        style={isHomeActive ? { filter: violetFilter } : {}}
                        onMouseOver={e => e.currentTarget.style.filter = violetFilter}
                        onMouseOut={e => e.currentTarget.style.filter = isHomeActive ? violetFilter : ''}
                    />
                </Link>
                <div className="icon-container">
                    <SettingsOutlinedIcon 
                        onClick={handleSettings}
                        className={showSettings ? 'active' : ''}
                        title="Settings"
                        style={showSettings ? { color: '#764ba2' } : { color: 'var(--black)' }}
                        tabIndex={0}
                        aria-label="Settings"
                        onKeyDown={e => { if (e.key === 'Enter') handleSettings(); }}
                        onMouseOver={e => e.currentTarget.style.color = '#764ba2'}
                        onMouseOut={e => e.currentTarget.style.color = showSettings ? '#764ba2' : 'var(--black)'}
                    />
                    {showSettings && (
                        <div className="dropdown-menu settings-menu">
                            {settingsOptions.map(option => (
                                <div 
                                    key={option.id} 
                                    className="dropdown-item"
                                    tabIndex={0}
                                    onClick={() => {
                                        setShowSettings(false);
                                        if (option.text === 'Edit Profile') {
                                            window.location.href = `/profile/${user._id}`;
                                        } else if (option.text === 'Privacy Settings') setShowPrivacyModal(true);
                                        else if (option.text === 'Notifications') setShowNotificationsModal(true);
                                        else if (option.text === 'Theme') setShowThemeModal(true);
                                        else if (option.text === 'Help & Support') setShowHelpModal(true);
                                        else if (option.text === 'Logout') {
                                            if (window.confirm('Are you sure you want to logout?')) {
                                                localStorage.clear();
                                                window.location.href = '/auth';
                                            }
                                        }
                                    }}
                                    onKeyDown={e => { if (e.key === 'Enter') {
                                        setShowSettings(false);
                                        if (option.text === 'Edit Profile') {
                                            window.location.href = `/profile/${user._id}`;
                                        } else if (option.text === 'Privacy Settings') setShowPrivacyModal(true);
                                        else if (option.text === 'Notifications') setShowNotificationsModal(true);
                                        else if (option.text === 'Theme') setShowThemeModal(true);
                                        else if (option.text === 'Help & Support') setShowHelpModal(true);
                                        else if (option.text === 'Logout') {
                                            if (window.confirm('Are you sure you want to logout?')) {
                                                localStorage.clear();
                                                window.location.href = '/auth';
                                            }
                                        }
                                    }}}
                                >
                                    <span className="item-icon">{option.icon}</span>
                                    <span className="item-text">{option.text}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                <div className="icon-container" style={{ position: 'relative' }}>
                    <img 
                        src={Noti} 
                        alt="Notifications" 
                        onClick={handleNotifications}
                        className={showNotifications ? 'active' : ''}
                        title="Notifications"
                        style={showNotifications ? { filter: violetFilter } : {}}
                        tabIndex={0}
                        aria-label="Notifications"
                        onKeyDown={e => { if (e.key === 'Enter') handleNotifications(); }}
                        onMouseOver={e => e.currentTarget.style.filter = violetFilter}
                        onMouseOut={e => e.currentTarget.style.filter = showNotifications ? violetFilter : ''}
                    />
                    {unreadCount > 0 && (
                        <span style={{ position: 'absolute', top: -6, right: -6, background: '#ed4956', color: 'white', borderRadius: '50%', width: 18, height: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 600, border: '2px solid #fff', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>{unreadCount}</span>
                    )}
                    {showNotifications && (
                        <div className="dropdown-menu notifications-menu">
                            <div className="dropdown-header">
                                <h4>Notifications</h4>
                                <button 
                                    className="mark-all-read"
                                    onClick={() => {
                                        setUnreadCount(0);
                                        setShowNotifications(false);
                                    }}
                                >
                                    Mark all read
                                </button>
                            </div>
                            {notifications.length === 0 ? (
                                <div className="dropdown-item notification-item">
                                    <div className="notification-content">
                                        <div className="notification-text">No notifications yet.</div>
                                    </div>
                                </div>
                            ) : notifications.slice(0, 10).map(notification => (
                                <div
                                    key={notification.id}
                                    className="dropdown-item notification-item"
                                    style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}
                                    onClick={() => {
                                        if (notification.type === 'like' && notification.postId) {
                                            window.location.href = `/post/${notification.postId}`;
                                        } else if (notification.type === 'follow' && notification.from) {
                                            window.location.href = `/profile/${notification.from}`;
                                        }
                                    }}
                                >
                                    {notification.fromAvatar && (
                                        <img src={notification.fromAvatar.startsWith('http') ? notification.fromAvatar : serverPublic + notification.fromAvatar} alt="avatar" style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover', border: '2px solid #764ba2' }} />
                                    )}
                                    <div className="notification-content">
                                        <div className="notification-text">
                                            <b>{notification.fromName || notification.from}</b> {notification.message}
                                        </div>
                                        <div className="notification-time">{new Date(notification.id).toLocaleTimeString()}</div>
                                    </div>
                                </div>
                            ))}
                            <div className="dropdown-footer">
                                <button 
                                    className="view-all-btn"
                                    onClick={() => {
                                        alert('View all notifications - Demo feature!');
                                        setShowNotifications(false);
                                    }}
                                >
                                    View All Notifications
                                </button>
                            </div>
                        </div>
                    )}
                </div>
                <div className="icon-container" style={{ position: 'relative' }}>
                    <img 
                        src={Comment} 
                        alt="Messages" 
                        onClick={handleMessaging}
                        className={isMessagesActive ? 'active' : ''}
                        title="Messages"
                        style={isMessagesActive ? { filter: violetFilter } : {}}
                        tabIndex={0}
                        aria-label="Messages"
                        onKeyDown={e => { if (e.key === 'Enter') handleMessaging(); }}
                        onMouseOver={e => setShowMessagesDropdown(true)}
                        onMouseOut={e => setShowMessagesDropdown(false)}
                    />
                    {unreadMessages > 0 && (
                        <span style={{ position: 'absolute', top: -6, right: -6, background: '#ed4956', color: 'white', borderRadius: '50%', width: 18, height: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 600, border: '2px solid #fff', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>{unreadMessages}</span>
                    )}
                    {showMessagesDropdown && (
                        <div className="dropdown-menu notifications-menu" style={{ minWidth: 320 }}>
                            <div className="dropdown-header">
                                <h4>Recent Messages</h4>
                            </div>
                            {messageNotifications.length === 0 ? (
                                <div className="dropdown-item notification-item">
                                    <div className="notification-content">
                                        <div className="notification-text">No new messages.</div>
                                    </div>
                                </div>
                            ) : messageNotifications.slice(0, 10).map(msg => (
                                <div
                                    key={msg.id}
                                    className="dropdown-item notification-item"
                                    style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}
                                    onClick={() => { window.location.href = `/messages?conversation=${msg.conversationId}`; }}
                                >
                                    {msg.fromAvatar && (
                                        <img src={msg.fromAvatar.startsWith('http') ? msg.fromAvatar : serverPublic + msg.fromAvatar} alt="avatar" style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover', border: '2px solid #764ba2' }} />
                                    )}
                                    <div className="notification-content">
                                        <div className="notification-text">
                                            <b>{msg.fromName || msg.from}</b>: {msg.message}
                                        </div>
                                        <div className="notification-time">{new Date(msg.id).toLocaleTimeString()}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
            <nav className="mainNavSection">
                <Link to="/home" className={`main-nav-link${isHomeActive ? ' active' : ''}`} tabIndex={0} aria-label="Home">
                    <span role="img" aria-label="Home">🏠</span> <span className="main-nav-label">Home</span>
                </Link>
                <Link to="/messages" className={`main-nav-link${isMessagesActive ? ' active' : ''}`} tabIndex={0} aria-label="Messages">
                    <span role="img" aria-label="Messages">💬</span> <span className="main-nav-label">Messages</span>
                </Link>
                <Link to="#" className="main-nav-link" tabIndex={0} aria-label="Notifications" onClick={handleNotifications}>
                    <span role="img" aria-label="Notifications">🔔</span> <span className="main-nav-label">Notifications</span>
                    {unreadCount > 0 && <span className="main-nav-badge">{unreadCount}</span>}
                </Link>
                <Link to="#" className="main-nav-link" tabIndex={0} aria-label="Settings" onClick={handleSettings}>
                    <span role="img" aria-label="Settings">⚙️</span> <span className="main-nav-label">Settings</span>
                </Link>
                <Link to={`/profile/${user._id}`} className="main-nav-link" tabIndex={0} aria-label="My Profile">
                    <span role="img" aria-label="My Profile">👤</span> <span className="main-nav-label">My Profile</span>
                </Link>
            </nav>

            <TrendCard />

            <div className="button rg-button" onClick={() => setModalOpened(true)}>
                Share
            </div>
            <ShareModal modalOpened={modalOpened} setModalOpened={setModalOpened} />

            {showProfileModal && <ProfileModal modalOpened={showProfileModal} setModalOpened={setShowProfileModal} />}
            {showPrivacyModal && (
                <div className="modal-overlay" onClick={() => setShowPrivacyModal(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <h3>Privacy Settings</h3>
                        <p>Toggle your profile privacy and manage blocked/muted users here. (Demo)</p>
                        <button className="button" onClick={() => setShowPrivacyModal(false)}>Close</button>
                    </div>
                </div>
            )}
            {showNotificationsModal && (
                <div className="modal-overlay" onClick={() => setShowNotificationsModal(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <h3>Notification Settings</h3>
                        <p>Manage your notification preferences here. (Demo)</p>
                        <button className="button" onClick={() => setShowNotificationsModal(false)}>Close</button>
                    </div>
                </div>
            )}
            {showHelpModal && (
                <div className="modal-overlay" onClick={() => setShowHelpModal(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <h3>Help & Support</h3>
                        <p>FAQ and contact support. (Demo)</p>
                        <button className="button" onClick={() => setShowHelpModal(false)}>Close</button>
                    </div>
                </div>
            )}
            {showThemeModal && (
                <div className="modal-overlay" onClick={() => setShowThemeModal(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <h3>Theme</h3>
                        <div style={{ display: 'flex', gap: 16, margin: '1em 0' }}>
                            <button className={`button ${theme === 'light' ? 'active' : ''}`} onClick={() => handleThemeChange('light')}>Light Mode</button>
                            <button className={`button ${theme === 'dark' ? 'active' : ''}`} onClick={() => handleThemeChange('dark')}>Dark Mode</button>
                        </div>
                        <button className="button" onClick={() => setShowThemeModal(false)}>Close</button>
                    </div>
                </div>
            )}
        </div>
    )
}

export default RightSide
