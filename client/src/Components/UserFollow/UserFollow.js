import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { followUser, unFollowUser } from '../../actions/UserAction'
import './UserFollow.css'
import io from 'socket.io-client'

const UserFollow = ({ person }) => {
    const serverPublic = "http://localhost:5000/images/";
    const { user } = useSelector((state) => state.authReducer.authData)
    const dispatch = useDispatch()
    const [following, setFollowing] = useState(person.followers.includes(user._id))
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        const socket = io('http://localhost:5000', {
            transports: ['websocket'],
            reconnection: true
        });
        socket.emit('user-connected', person._id);
        socket.on('followers-updated', (data) => {
            if (data.userId === person._id) {
                if (data.type === 'follow') {
                    setFollowing(true);
                } else if (data.type === 'unfollow') {
                    setFollowing(false);
                }
            }
        });
        return () => {
            socket.disconnect();
        };
    }, [person._id]);

    const handleFollow = async () => {
        setLoading(true)
        if (following) {
            await dispatch(unFollowUser(person._id, { _id: user._id }))
            const index = person.followers.indexOf(user._id)
            if (index > -1) person.followers.splice(index, 1)
        } else {
            await dispatch(followUser(person._id, { _id: user._id }))
            person.followers.push(user._id)
        }
        setFollowing(!following)
        setLoading(false)
    }

    return (
        <div className="follower">
            <div>
                <img src={person.profilePicture ? serverPublic + person.profilePicture : serverPublic + "defaultProfile.png"} alt="" className='followerImg' />
                <div className="name">
                    <span>{person.firstname}</span>
                    <span>{person.username}</span>
                </div>
            </div>
            <button className={following ? "button fc-button UnfollowButton" : "button fc-button"} onClick={handleFollow} disabled={loading}>
                {loading ? "Loading..." : following ? "Unfollow" : "Follow"}
            </button>
        </div>
    )
}

export default UserFollow
