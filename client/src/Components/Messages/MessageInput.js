import React, { useState, useRef } from 'react';
import './MessageInput.css';

const MessageInput = ({ 
    onSendMessage, 
    onFileUpload, 
    fileInputRef, 
    showEmojiPicker, 
    setShowEmojiPicker 
}) => {
    const [message, setMessage] = useState('');
    const [imagePreview, setImagePreview] = useState(null);
    const imageInputRef = useRef(null);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (message.trim() || imagePreview) {
            onSendMessage(message, imagePreview);
            setMessage('');
            setImagePreview(null);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
        }
    };

    const handleImageUpload = (event) => {
        const file = event.target.files[0];
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (e) => {
                setImagePreview(e.target.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleFileSelect = () => {
        fileInputRef.current?.click();
    };

    const handleImageSelect = () => {
        imageInputRef.current?.click();
    };

    const removeImagePreview = () => {
        setImagePreview(null);
        if (imageInputRef.current) {
            imageInputRef.current.value = '';
        }
    };

    const commonEmojis = [
        '😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇',
        '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚',
        '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🤩',
        '🥳', '😏', '😒', '😞', '😔', '😟', '😕', '🙁', '☹️', '😣',
        '😖', '😫', '😩', '🥺', '😢', '😭', '😤', '😠', '😡', '🤬',
        '🤯', '😳', '🥵', '🥶', '😱', '😨', '😰', '😥', '😓', '🤗',
        '🤔', '🤭', '🤫', '🤥', '😶', '😐', '😑', '😯', '😦', '😧',
        '😮', '😲', '🥱', '😴', '🤤', '😪', '😵', '🤐', '🥴', '🤢',
        '🤮', '🤧', '😷', '🤒', '🤕', '🤑', '🤠', '💩', '👻', '💀',
        '☠️', '👽', '👾', '🤖', '😺', '😸', '😹', '😻', '😼', '😽',
        '🙀', '😿', '😾', '🙈', '🙉', '🙊', '👶', '👧', '🧒', '👦',
        '👩', '🧑', '👨', '👵', '🧓', '👴', '👮‍♀️', '👮', '👮‍♂️', '🕵️‍♀️',
        '🕵️', '🕵️‍♂️', '💂‍♀️', '💂', '💂‍♂️', '👷‍♀️', '👷', '👷‍♂️', '🤴', '👸',
        '👳‍♀️', '👳', '👳‍♂️', '👲', '🧕', '🤵', '👰', '🤰', '🤱', '👼',
        '🎅', '🤶', '🧙‍♀️', '🧙', '🧙‍♂️', '🧝‍♀️', '🧝', '🧝‍♂️', '🧛‍♀️', '🧛',
        '🧛‍♂️', '🧟‍♀️', '🧟', '🧟‍♂️', '🧞‍♀️', '🧞', '🧞‍♂️', '🧜‍♀️', '🧜', '🧜‍♂️',
        '🧚‍♀️', '🧚', '🧚‍♂️', '👼', '🤰', '🤱', '👼', '🎅', '🤶', '🧙‍♀️', '🧙'
    ];

    const handleEmojiClick = (emoji) => {
        setMessage(prev => prev + emoji);
        setShowEmojiPicker(false);
    };

    return (
        <div className="message-input-container">
            {imagePreview && (
                <div className="image-preview">
                    <img src={imagePreview} alt="Preview" className="preview-image" />
                    <button 
                        className="remove-image-btn"
                        onClick={removeImagePreview}
                        title="Remove image"
                    >
                        ✕
                    </button>
                </div>
            )}

            <form onSubmit={handleSubmit} className="message-input-form">
                <div className="input-actions">
                    <button 
                        type="button"
                        className="action-btn emoji-btn"
                        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                        title="Add emoji"
                    >
                        😊
                    </button>
                    
                    <button 
                        type="button"
                        className="action-btn attachment-btn"
                        onClick={handleFileSelect}
                        title="Attach file"
                    >
                        📎
                    </button>
                    
                    <button 
                        type="button"
                        className="action-btn image-btn"
                        onClick={handleImageSelect}
                        title="Send photo"
                    >
                        📷
                    </button>
                </div>

                <div className="input-wrapper">
                    <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Message..."
                        className="message-textarea"
                        rows="1"
                    />
                    <button 
                        type="submit" 
                        className="send-btn"
                        disabled={!message.trim() && !imagePreview}
                    >
                        ➤
                    </button>
                </div>
            </form>

            {showEmojiPicker && (
                <div className="emoji-picker">
                    <div className="emoji-grid">
                        {commonEmojis.map((emoji, index) => (
                            <button
                                key={index}
                                className="emoji-option"
                                onClick={() => handleEmojiClick(emoji)}
                            >
                                {emoji}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            <input
                ref={fileInputRef}
                type="file"
                onChange={onFileUpload}
                style={{ display: 'none' }}
                accept=".pdf,.doc,.docx,.txt,.zip,.rar"
            />

            <input
                ref={imageInputRef}
                type="file"
                onChange={handleImageUpload}
                style={{ display: 'none' }}
                accept="image/*"
            />
        </div>
    );
};

export default MessageInput; 