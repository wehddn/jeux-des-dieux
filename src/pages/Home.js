import React, { useState, useEffect } from "react";
import { Button } from "react-bootstrap";
import { useNavigate } from "react-router";
import { useUserAuth } from "../context/UserAuthContext";
import { getOrCreateUserName } from "../bd/Users.js";

import MyComponent from "../components/index.js";

const Home = () => {
  const { logOut, user } = useUserAuth();
  const [userName, setUserName] = useState('');
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
    const fetchUserName = async () => {
      try {
        const name = await getOrCreateUserName(userId);
        setUserName(name);
      } catch (error) {
        console.error('Error fetching or creating user name:', error);
      }
    };

    fetchUserName();
  }, [userId]);

  return (
    <>
      <div className="p-4 box mt-3 text-center">
        <h1>Home</h1>
        Welcome, {userName} <br />
        {user && user.email}
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