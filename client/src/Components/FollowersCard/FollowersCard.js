import React, { useEffect, useState } from 'react'
import './FollowersCard.css';
import UserFollow from '../UserFollow/UserFollow';
import { useSelector } from 'react-redux';
import { getAllUser } from '../../api/UserRequest';
import io from 'socket.io-client';




const FollowersCard = ({ userId }) => {

  const [persons, setPersons] = useState([]);
  const { user } = useSelector((state) => state.authReducer.authData);
  const effectiveUserId = userId || user._id;


  useEffect(() => {
    const fetchPersons = async () => {
      const { data } = await getAllUser();
      setPersons(data);
    }
    fetchPersons();
  }, [])

  useEffect(() => {
    const socket = io('http://localhost:5000', {
      transports: ['websocket'],
      reconnection: true
    });
    socket.emit('user-connected', effectiveUserId);
    socket.on('followers-updated', (data) => {
      if (data.userId === effectiveUserId) {
        // Refetch the list of users for live update
        (async () => {
          const { data } = await getAllUser();
          setPersons(data);
        })();
      }
    });
    return () => {
      socket.disconnect();
    };
  }, [effectiveUserId]);



  return (
    <div className='FollowersCard'>
      <h3>People you may know...</h3>

      {persons.map((person, id) => {
        if (person._id !== user._id) {
          return <UserFollow person={person} key={id} />
        }
        return null;
      })}

    </div>
  )
}

export default FollowersCard
