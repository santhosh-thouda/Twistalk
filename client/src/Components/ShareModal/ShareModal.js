import React from 'react';
import PostShare from '../PostShare/PostShare';
import './ShareModal.css';

function ShareModal({ modalOpened, setModalOpened }) {
    if (!modalOpened) return null;

    return (
        <div className="share-modal-overlay" onClick={() => setModalOpened(false)}>
            <div className="share-modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="share-modal-header">
                    <h3>Create Post</h3>
                    <button 
                        className="share-modal-close" 
                        onClick={() => setModalOpened(false)}
                    >
                        ✕
                    </button>
                </div>
                <div className="share-modal-body">
                    <PostShare />
                </div>
            </div>
        </div>
    );
}

export default ShareModal;