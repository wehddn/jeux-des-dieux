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
    <section className="friend" aria-label="Friend">
      <img
        className="friend-photo"
        src={`/img/photoProfil/${userProfile.photo}`}
        alt={`${userProfile.name}'s profile`}
      />
      <p>{userProfile.name}</p>
    </section>
  );
};

export default Friend;
