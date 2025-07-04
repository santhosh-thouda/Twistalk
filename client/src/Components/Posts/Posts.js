import React, { useEffect, useState } from 'react';
import Post from '../Post/Post';
import { useSelector } from 'react-redux';
import { getTimelinePosts } from '../../api/PostRequest';

const Posts = () => {
  const { user } = useSelector((state) => state.authReducer.authData);
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const { data } = await getTimelinePosts(user._id);
        setPosts(data);
      } catch (err) {
        setPosts([]);
      }
    };
    if (user && user._id) fetchPosts();
  }, [user]);

  return (
    <div>
      {posts.map((post, idx) => (
        <Post key={post._id || idx} post={post} />
      ))}
    </div>
  );
};

export default Posts;
