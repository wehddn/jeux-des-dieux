import React, { useState, useEffect } from 'react';
import { Button } from 'react-bootstrap';
import { getUser } from "../bd/Users.js";

const Friend = ({ userId }) => {
  const [userProfile, setUserProfile] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await getUser(userId);
        setUserProfile(userData);
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUser();
  }, [userId]);

  if (!userProfile) {
    return <React.Fragment></React.Fragment>;
  }

  return (
    <div className='card'>
      <h2>Mes Amis</h2>
      <div className='row d-flex'>
        <Button><i className='bx bx-x'></i></Button>
        {userProfile.photo ? (
          <img className="photoProfil" src={`/photoProfil/${userProfile.photo}`} alt="Profile" />
        ) : (
          <img className="photoProfil" src="/photoProfil/photo.png" alt="Default Profile" />
        )}
      </div>
      <p>{userProfile.name}</p>
    </div>
  );
}

export default Friend;
