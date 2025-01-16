import React from "react";
import { useNavigate, useLocation } from "react-router";

import { useEffect } from "react";

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const focusedElement = document.activeElement;
    if (focusedElement) {
      focusedElement.blur(); // Снимает фокус с текущего элемента
    }
  }, [location]);

  return (
    <header>
      <nav className="header-buttons">
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
      </nav>
    </header>
  );
};

export default Header;
