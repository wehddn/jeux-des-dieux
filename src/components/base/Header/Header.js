import React from "react";
import { useNavigate } from "react-router";
import { useUserAuth } from "../../../context/UserAuthContext.js";

const Header = () => {
  const { logOut } = useUserAuth();
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
    <div className="header-buttons">
      <button className="header-button header-btn-logout" onClick={handleLogout}>
        Log out
      </button>
      <button className="header-button header-btn-profile" onClick={() => navigate("/profile")}>
        Profile
      </button>
      <button className="header-button header-btn-settings" onClick={() => navigate("/settings")}>
        Settings
      </button>
      <button className="header-button header-btn-games" onClick={() => navigate("/games")}>
        Games
      </button>
    </div>
  );
};

export default Header;
