import React, { useState, useEffect } from "react";
import { useUserAuth } from "../../context/UserAuthContext.js";
import Stats from "./Stats.js";
import Friends from "./Friends.js";
import UserInfo from "./UserInfo.js";
import { getOrCreateUser, acceptFriendRequest, declineFriendRequest } from "../../bd/Users.js";

const Profile = () => {
  const { user } = useUserAuth();
  const [userProfile, setUserProfile] = useState(null);
  const userId = user.id;
  const userEmail = user.email;

  const handleAcceptFriendRequest = async (friendId) => {
    try {
      await acceptFriendRequest(userProfile.id, friendId);
    } catch (error) {
      console.error("Error accepting friend request:", error);
    }
  };
  
  const handleDeclineFriendRequest = async (friendId) => {
    try {
      await declineFriendRequest(userProfile.id, friendId);
    } catch (error) {
      console.error("Error declining friend request:", error);
    }
  };
  

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await getOrCreateUser(userId, userEmail);
        setUserProfile(userData);
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUser();
  }, [userId, userEmail]);

  return (
    <main className="profile">
      <section className="fon_profil" aria-label="User Profile">
        {userProfile ? (
          <div className="row d-flex">
            <section className="col-lg-4 col-12 colone-profil" aria-label="User Info">
              <UserInfo userProfile={userProfile} />
            </section>
            <section className="col-lg-4 col-12 colone-profil" aria-label="Friends Section">
              <Friends 
                userProfile={userProfile}
                handleAcceptFriendRequest={handleAcceptFriendRequest}
                handleDeclineFriendRequest={handleDeclineFriendRequest}
              />
            </section>
            <section className="col-lg-4 col-12 colone-profil" aria-label="User Stats">
              <Stats userProfile={userProfile} />
            </section>
          </div>
        ) : (
          <p>Loading...</p>
        )}
      </section>
    </main>
  );
};

export default Profile;
