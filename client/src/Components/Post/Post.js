import React, { useState } from 'react';
import './Post.css';
import Comment from '../../Img/comment.png';
import Share from '../../Img/share.png';
import Like from '../../Img/like.png';
import Notlike from '../../Img/notlike.png';
import { useSelector } from 'react-redux';
import { likePost, deletePost } from '../../api/PostRequest';

const Post = ({ post }) => {
  const { user } = useSelector((state) => state.authReducer.authData)
  const [liked, setLiked] = useState(post.liked);
  const [likes, setLikes] = useState(post.likes);
  const serverPublic = "http://localhost:5000/images/";

  const handleLike = () => {
    setLiked((prev) => !prev);
    setLikes((prev) => (liked ? prev - 1 : prev + 1));
    likePost(post._id, user._id);
  };

  const handleDelete = async () => {
    if(window.confirm('Are you sure you want to delete this post?')) {
      try {
        await deletePost(post._id, user._id);
        window.location.reload();
      } catch (err) {
        alert('Failed to delete post.');
      }
    }
  }

  return (
    <div className='Post' style={{ position: 'relative' }}>
      <div className="Post-image-container">
        <img src={post.image ? serverPublic + post.image : " "} alt="" />
      </div>
      {post.desc && (
        <div className="post-caption" style={{ margin: '0.5em 0', fontStyle: 'italic', color: '#444' }}>{post.desc}</div>
      )}
      {user._id === post.userId && (
        <button className="delete-post-btn" onClick={handleDelete} title="Delete Post">🗑️</button>
      )}
      <div className="postReact">
        <img src={liked ? Like : Notlike} alt="Like" style={{ cursor: "pointer" }} onClick={handleLike} />
        <img src={Comment} alt="Comment" />
        <img src={Share} alt="Share" />
      </div>
      <span className="likeCount">{likes} likes</span>
      <div className="detail">
        <span> <b>{post.name}</b> </span>
      </div>
    </div>
  )
}

export default Post
