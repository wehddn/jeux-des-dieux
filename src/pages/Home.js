import React from "react";
import { Button } from "react-bootstrap";
import { useNavigate } from "react-router";
import { useUserAuth } from "../context/UserAuthContext";

import MyComponent from "../components/index.js";

const Home = () => {
  const { logOut, user } = useUserAuth();
  const navigate = useNavigate();
  const handleLogout = async () => {
    try {
      await logOut();
      navigate("/");
    } catch (error) {
      console.log(error.message);
    }
  };
  return (
    <>
      <div className="p-4 box mt-3 text-center">
        <h1>Home</h1>
        Welcome <br />
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