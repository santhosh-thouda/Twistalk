import React, { useEffect, useState } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import './App.css';
import Auth from './Pages/auth/Auth';
import Home from './Pages/home/Home';
import Profile from './Pages/profile/Profile';
import Messages from './Pages/messages/Messages';
import io from 'socket.io-client';

export const NotificationContext = React.createContext();
export const MessageContext = React.createContext();

function App() {
  const location = useLocation();
  const user = useSelector((state) => state.authReducer.authData);
  const [notifications, setNotifications] = useState(() => {
    const saved = localStorage.getItem('notifications');
    return saved ? JSON.parse(saved) : [];
  });
  const [unreadCount, setUnreadCount] = useState(0);
  const [messageNotifications, setMessageNotifications] = useState([]);
  const [unreadMessages, setUnreadMessages] = useState(0);

  const isMessagesPage = location.pathname === '/messages';

  useEffect(() => {
    if (!user) {
      localStorage.removeItem('store');
      localStorage.removeItem('profile');
    }
  }, [user]);

  useEffect(() => {
    if (!user) return;
    const socket = io('http://localhost:5000', {
      transports: ['websocket'],
      reconnection: true
    });
    socket.emit('user-connected', user.user?._id || user._id);
    socket.on('notification', (data) => {
      setNotifications(prev => {
        const updated = [{ ...data, id: Date.now() }, ...prev];
        localStorage.setItem('notifications', JSON.stringify(updated));
        return updated;
      });
      setUnreadCount(c => c + 1);
    });
    socket.on('message-notification', (data) => {
      setMessageNotifications(prev => [{ ...data, id: Date.now() }, ...prev]);
      setUnreadMessages(c => c + 1);
    });
    return () => {
      socket.disconnect();
    };
  }, [user]);

  return (
    <NotificationContext.Provider value={{ notifications, setNotifications, unreadCount, setUnreadCount }}>
      <MessageContext.Provider value={{ messageNotifications, setMessageNotifications, unreadMessages, setUnreadMessages }}>
        <div className={`App ${isMessagesPage ? 'full-width' : ''}`}>
          {/* Modern Dark Mode Toggle */}
          <div 
            className="dark-mode-toggle"
            onClick={() => document.body.classList.toggle('dark-mode')}
          >
            {document.body.classList.contains('dark-mode') ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="5"></circle>
                <line x1="12" y1="1" x2="12" y2="3"></line>
                <line x1="12" y1="21" x2="12" y2="23"></line>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                <line x1="1" y1="12" x2="3" y2="12"></line>
                <line x1="21" y1="12" x2="23" y2="12"></line>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
              </svg>
            )}
          </div>

          {!isMessagesPage && (
            <>
              <div className="blur" style={{ top: '-18%', right: '0' }}></div>
              <div className="blur" style={{ top: '36%', left: '-8rem' }}></div>
            </>
          )}
          <Routes>
            <Route path="/" element={user ? <Navigate to="home" /> : <Navigate to="auth" />} />
            <Route path="/home" element={user ? <Home /> : <Navigate to="../auth" />} />
            <Route path="/auth" element={user ? <Navigate to="../home" /> : <Auth />} />
            <Route path="/profile/:id" element={user ? <Profile /> : <Navigate to="../auth" />} />
            <Route path="/messages" element={user ? <Messages /> : <Navigate to="../auth" />} />
          </Routes>
        </div>
      </MessageContext.Provider>
    </NotificationContext.Provider>
  );
}

export default App;