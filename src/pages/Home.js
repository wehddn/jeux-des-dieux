import React, { useState, useEffect } from "react";
import { Button } from "react-bootstrap";
import { useNavigate } from "react-router";
import { useUserAuth } from "../context/UserAuthContext";
import Friends from "../components/Friends.js";
import UserInfo from "../components/UserInfo.js";
import { getOrCreateUser } from "../bd/Users.js";

const Home = () => {
  const { logOut, user } = useUserAuth();
  const [userProfile, setUserProfile] = useState(null);
  const userId = user.uid;
  const userEmail = user.email;

  const navigate = useNavigate();
  const handleLogout = async () => {
    try {
      await logOut();
      navigate("/");
    } catch (error) {
      console.log(error.message);
    }
  };

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
      <Button variant="primary" onClick={handleLogout}>Log out</Button>
      <div className="text-center">
        <h1>Profil</h1>
        {userProfile ? (
          <>
            <div className="row d-flex">
              <div className="col-4">
                <UserInfo userProfile={userProfile}></UserInfo>
              </div>
              <div className="col-4">
                <Friends userProfile={userProfile}></Friends>
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

export default Home;