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
    <header className="header-buttons">
        <button 
            className="header-button header-btn-profile" 
            onClick={() => navigate("/profile")}
            aria-label="Profile">
            Profile
        </button>
        <button 
            className="header-button header-btn-rules" 
            onClick={() => navigate("/rules")}
            aria-label="Rules">
            Règles
        </button>
        <button 
            className="header-button header-btn-games" 
            onClick={() => navigate("/games")}
            aria-label="Games">
            Games
        </button>
        <button 
            className="header-button header-btn-settings" 
            onClick={() => navigate("/settings")}
            aria-label="Settings">
            Settings
        </button>
        <button 
            className="header-button header-btn-logout" 
            onClick={handleLogout}
            aria-label="Log out">
            Log out
        </button>
    </header>
);
};

export default Header;
