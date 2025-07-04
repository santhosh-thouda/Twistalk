import React, { useState, useEffect } from 'react';
import './ProfileCard.css';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import * as UserApi from '../../api/UserRequest';
import io from 'socket.io-client';
import FollowersCard from '../FollowersCard/FollowersCard';

const ProfileCard = ({ location }) => {
  const { user } = useSelector((state) => state.authReducer.authData);
  const posts = useSelector((state) => state.postReducer.posts);
  const dispatch = useDispatch();
  const serverPublic = 'http://localhost:5000/images/';

  const [showFollowers, setShowFollowers] = useState(false);
  const [showFollowing, setShowFollowing] = useState(false);
  const [followersDetails, setFollowersDetails] = useState([]);
  const [followingDetails, setFollowingDetails] = useState([]);
  const [selectedProfileImage, setSelectedProfileImage] = useState(null);
  const [selectedCoverImage, setSelectedCoverImage] = useState(null);

  const handleProfileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedProfileImage(URL.createObjectURL(file));
      await uploadImage(file, 'profilePicture');
    }
  };

  const handleCoverChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedCoverImage(URL.createObjectURL(file));
      await uploadImage(file, 'coverPicture');
    }
  };

  const uploadImage = async (file, type) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);

    try {
      const response = await UserApi.uploadProfileImage(user._id, formData);
      const updatedUser = response.data;

      localStorage.setItem(
        'profile',
        JSON.stringify({
          ...JSON.parse(localStorage.getItem('profile')),
          user: updatedUser,
        })
      );

      dispatch({
        type: 'AUTH_SUCCESS',
        data: {
          user: updatedUser,
          token: JSON.parse(localStorage.getItem('profile')).token,
        },
      });
    } catch (err) {
      console.error('Error uploading image:', err);
    }
  };

  useEffect(() => {
    const fetchDetails = async () => {
      if (showFollowers && user.followers.length > 0) {
        const details = await Promise.all(
          user.followers.map((id) => UserApi.getUser(id).then((res) => res.data))
        );
        setFollowersDetails(details);
      }

      if (showFollowing && user.following.length > 0) {
        const details = await Promise.all(
          user.following.map((id) => UserApi.getUser(id).then((res) => res.data))
        );
        setFollowingDetails(details);
      }
    };
    fetchDetails();
  }, [showFollowers, showFollowing, user.followers, user.following]);

  useEffect(() => {
    const socket = io('http://localhost:5000', {
      transports: ['websocket'],
      reconnection: true,
    });

    socket.emit('user-connected', user._id);

    socket.on('followers-updated', async (data) => {
      if (
        data.userId === user._id ||
        user.followers.includes(data.userId) ||
        user.following.includes(data.userId)
      ) {
        const updatedUser = await UserApi.getUser(user._id);
        localStorage.setItem(
          'profile',
          JSON.stringify({
            ...JSON.parse(localStorage.getItem('profile')),
            user: updatedUser.data,
          })
        );
        dispatch({
          type: 'AUTH_SUCCESS',
          data: {
            user: updatedUser.data,
            token: JSON.parse(localStorage.getItem('profile')).token,
          },
        });
      }
    });

    return () => socket.disconnect();
  }, [user._id, dispatch]);

  const isSelf = true;
  const isFollower = false;
  const isPrivate = user.isPrivate;

  return (
    <div className="ProfileCard">
      <div className="ProfileImages">
        <label htmlFor="coverUpload" style={{ cursor: 'pointer' }}>
          <img
            src={
              selectedCoverImage ||
              (user.coverPicture &&
              user.coverPicture.startsWith('http')
                ? user.coverPicture
                : serverPublic + user.coverPicture) ||
              serverPublic + 'defaultCover.jpg'
            }
            alt="Cover"
            className="coverImage"
          />
        </label>
        <input
          type="file"
          id="coverUpload"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={handleCoverChange}
        />

        <label htmlFor="profileUpload" style={{ cursor: 'pointer' }}>
          <img
            src={
              selectedProfileImage ||
              (user.profilePicture &&
              user.profilePicture.startsWith('http')
                ? user.profilePicture
                : serverPublic + user.profilePicture) ||
              serverPublic + 'defaultProfile.png'
            }
            alt="Profile"
            className="profileImage"
          />
        </label>
        <input
          type="file"
          id="profileUpload"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={handleProfileChange}
        />
      </div>

      <div className="ProfileName">
        <span className="fullName">
          {user.firstname} {user.lastname}
          {isPrivate && (
            <span
              title="Private Profile"
              style={{ marginLeft: 8, color: '#764ba2', fontSize: '1.2em' }}
            >
              🔒
            </span>
          )}
        </span>
        <span className="workInfo">
          {user.worksAt ? user.worksAt : 'Add your work information'}
        </span>
        {user.about && <span className="aboutText">{user.about}</span>}
      </div>

      {isPrivate && !isSelf && !isFollower ? (
        <div className="private-profile-message">
          <span style={{ color: '#764ba2', fontWeight: 'bold' }}>
            This profile is private. Only followers can see details and posts.
          </span>
        </div>
      ) : (
        <>
          <hr />
          <div className="statsContainer">
            <div
              className="stat"
              style={{ cursor: 'pointer' }}
              onClick={() => setShowFollowers(true)}
            >
              <span className="statNumber">{user.followers.length}</span>
              <span className="statLabel">Followers</span>
            </div>
            <div className="vl"></div>
            <div
              className="stat"
              style={{ cursor: 'pointer' }}
              onClick={() => setShowFollowing(true)}
            >
              <span className="statNumber">{user.following.length}</span>
              <span className="statLabel">Following</span>
            </div>
            {location === 'profilePage' && (
              <>
                <div className="vl"></div>
                <div className="stat">
                  <span className="statNumber">
                    {posts.filter((post) => post.userId === user._id).length}
                  </span>
                  <span className="statLabel">Posts</span>
                </div>
              </>
            )}
          </div>
          <hr />

          {showFollowers && (
            <div className="modal-overlay" onClick={() => setShowFollowers(false)}>
              <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <h3>Followers</h3>
                <ul className="modal-list">
                  {followersDetails.length === 0 && <li>No followers yet.</li>}
                  {followersDetails.map((follower, idx) => (
                    <li key={follower._id + idx} className="modal-user-item">
                      <img
                        src={
                          follower.profilePicture &&
                          (follower.profilePicture.startsWith('http')
                            ? follower.profilePicture
                            : serverPublic + follower.profilePicture)
                        }
                        alt=""
                        className="modal-user-avatar"
                      />
                      <span>
                        {follower.firstname} {follower.lastname}{' '}
                        <span style={{ color: '#888', fontSize: '0.9em' }}>
                          @{follower.username}
                        </span>
                      </span>
                    </li>
                  ))}
                </ul>
                <button className="button" onClick={() => setShowFollowers(false)}>
                  Close
                </button>
              </div>
            </div>
          )}

          {showFollowing && (
            <div className="modal-overlay" onClick={() => setShowFollowing(false)}>
              <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <h3>Following</h3>
                <ul className="modal-list">
                  {followingDetails.length === 0 && <li>Not following anyone yet.</li>}
                  {followingDetails.map((following, idx) => (
                    <li key={following._id + idx} className="modal-user-item">
                      <img
                        src={
                          following.profilePicture &&
                          (following.profilePicture.startsWith('http')
                            ? following.profilePicture
                            : serverPublic + following.profilePicture)
                        }
                        alt=""
                        className="modal-user-avatar"
                      />
                      <span>
                        {following.firstname} {following.lastname}{' '}
                        <span style={{ color: '#888', fontSize: '0.9em' }}>
                          @{following.username}
                        </span>
                      </span>
                    </li>
                  ))}
                </ul>
                <button className="button" onClick={() => setShowFollowing(false)}>
                  Close
                </button>
              </div>
            </div>
          )}

          {location === 'profilePage' ? (
            <div className="profileActions">
              <div className="profileInfo">
                {user.livesin && (
                  <div className="infoItem">
                    <span className="infoLabel">📍 Lives in:</span>
                    <span className="infoValue">{user.livesin}</span>
                  </div>
                )}
                {user.country && (
                  <div className="infoItem">
                    <span className="infoLabel">🌍 Country:</span>
                    <span className="infoValue">{user.country}</span>
                  </div>
                )}
                {user.relationship && (
                  <div className="infoItem">
                    <span className="infoLabel">💕 Status:</span>
                    <span className="infoValue">{user.relationship}</span>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <span className="profileLink">
              <Link
                style={{ textDecoration: 'none', color: 'inherit' }}
                to={`/profile/${user._id}`}
              >
                My Profile
              </Link>
            </span>
          )}

          <FollowersCard userId={user._id} />
        </>
      )}
    </div>
  );
};

export default ProfileCard;
