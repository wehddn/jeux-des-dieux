import React, { useState, useEffect } from "react";
import { getUser } from "../../bd/Users.js";

const Friend = ({ userId }) => {
  const [userProfile, setUserProfile] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await getUser(userId);
        setUserProfile(userData);
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUser();
  }, [userId]);

  if (!userProfile) {
    return <React.Fragment />;
  }

  return (
    <div className="col-6">
      <div className="d-flex row">
        <button className="col-2 d-flex align-items-start friend-button">
          <img src={`/btn/croix.svg`} alt="suppr." className="friend-button" />
        </button>
        <img
          className="col-10 friend-photo"
          src={`/photoProfil/${userProfile.photo}`}
          alt="Profile"
        />
      </div>
      <p>{userProfile.name}</p>
    </div>
  );
};

export default Friend;
