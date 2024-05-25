import React, { useState, useEffect } from 'react';
import { Button } from 'react-bootstrap';
import { getUser } from "../../bd/Users.js";

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
    return <React.Fragment />;
  }

  return (
    <div className='col-6'>
      <div className='d-flex row'>
        <button className="col-2 d-flex align-items-start" style={{ border: "none", backgroundColor: "transparent" }}>
          <img src={`/btn/croix.svg`} alt="suppr." style={{ width: "2rem", height: "auto" }} ></img>
        </button>
        <img className="col-10 photoProfil" src={`/photoProfil/${userProfile.photo || 'photo.png'}`} alt="Profile" style={{ width: "8rem", height: "auto" }} />
      </div>
      <p>{userProfile.name}</p>
    </div>
  );
}

export default Friend;
