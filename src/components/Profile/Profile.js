import React, { useState, useEffect } from "react";
import { useUserAuth } from "../../context/UserAuthContext.js";
import Stats from "./Stats.js";
import Friends from "./Friends.js";
import Header from "../base/Header/Header.js";
import UserInfo from "./UserInfo.js";
import { getOrCreateUser } from "../../bd/Users.js";

const Profile = () => {
  const { user } = useUserAuth();
  const [userProfile, setUserProfile] = useState(null);
  const userId = user.uid;
  const userEmail = user.email;

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
    <>
      <Header></Header>
      <div className="fon_profil">
        {userProfile ? (
          <div className="row d-flex">
            <div className="col-lg-4 col-12 colone-profil">
              <UserInfo userProfile={userProfile} />
            </div>
            <div className="col-lg-4 col-12 colone-profil">
              <Friends userProfile={userProfile} />
            </div>
            <div className="col-lg-4 col-12 colone-profil">
              <Stats userProfile={userProfile} />
            </div>
          </div>
        ) : (
          <p>Loading...</p>
        )}
      </div>

      <div className="d-grid gap-2"></div>
    </>
  );
};

export default Profile;
