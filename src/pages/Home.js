import React, { useState, useEffect } from "react";
import { Button } from "react-bootstrap";
import { useNavigate } from "react-router";
import { useUserAuth } from "../context/UserAuthContext";
import { getOrCreateUser } from "../bd/Users.js";

import MyComponent from "../components/index.js";

const Home = () => {
  const { logOut, user } = useUserAuth();
  const [userProfile, setUserProfile] = useState(null);
  const userId = user.uid;

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
        const userData = await getOrCreateUser(userId);
        setUserProfile(userData);
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUser();
  }, [userId]);

  return (
    <>
      <div className="p-4 box mt-3 text-center">
        <h1>Home</h1>
        {userProfile ? (
          <>
            Welcome, {userProfile.name} <br />
            {user && user.email}
          </>
        ) : (
          <p>Loading...</p>
        )}
        <MyComponent></MyComponent>
      </div>
      <div className="d-grid gap-2">

          <Button variant="primary" onClick={handleLogout}>
            Log out
          </Button>

      </div>
    </>
  );
};

export default Home;