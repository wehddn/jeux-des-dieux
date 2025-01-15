import React from "react";
import { useNavigate } from "react-router";

const Header = () => {
  const navigate = useNavigate();

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
    </header>
);
};

export default Header;
