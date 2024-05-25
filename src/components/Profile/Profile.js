import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { useUserAuth } from "../../context/UserAuthContext.js";
import Stats from "./Stats.js";
import Friends from "./Friends.js";
import Header from "../base/Header/Header.js";
import UserInfo from "./UserInfo.js";
import { getOrCreateUser } from "../../bd/Users.js";

const Profile = () => {
  const { logOut, user } = useUserAuth();
  const [userProfile, setUserProfile] = useState(null);
  const userId = user.uid;
  const userEmail = user.email;

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await getOrCreateUser(userId, userEmail);
        setUserProfile(userData);
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUser();
  }, [userId, userEmail]);

  return (
    <>
      <Header></Header>
      <div className="fon_profil text-center">
        {userProfile ? (
          <>
            <div className="row d-flex">
              <div className="col-4 pl-4">
                <UserInfo userProfile={userProfile}></UserInfo>
              </div>
              <div className="col-4">
                <Friends userProfile={userProfile}></Friends>
              </div>
              <div className="col-4">
                <Stats userProfile={userProfile}></Stats>
              </div>
            </div>
          </>
        ) : (
          <p>Loading...</p>
        )}
      </div>
      <div className="d-grid gap-2">
      </div>
    </>
  );
};

export default Profile;