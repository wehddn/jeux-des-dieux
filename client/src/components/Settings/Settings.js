import React from "react";
import { deleteUserProfile } from "../../bd/Users";
import { useNavigate } from "react-router";
import { useUserAuth } from "../../context/UserAuthContext.js";
import { isManagerOrAdmin } from "../../utils/roleUtils";

const Settings = () => {
  const { user, logOut } = useUserAuth();
  const navigate = useNavigate();

  const handleDeleteClick = async () => {
    try {
      await deleteUserProfile(user.id);
    } catch (error) {
      console.error("Error deleting profile:", error);
    }
  };

  const handleLogout = async () => {
    try {
      await logOut();
      navigate("/");
    } catch (error) {
      console.log(error.message);
    }
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <main>
      <section className="settings_context" aria-label="User Settings">
        <h1>Settings</h1>
        {isManagerOrAdmin(user.role) && (
          <button onClick={() => navigate("/admin")} className="btn-del" aria-label="Navigate to Admin page">Page d'admin</button>
          )}
        <button onClick={handleDeleteClick} className="btn-del" aria-label="Delete Profile">Supprimer Profil</button>
        <button onClick={handleLogout} className="btn-del" aria-label="Logout">Logout</button>
      </section>
    </main>
  );
};

export default Settings;
