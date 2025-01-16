import React, { useEffect } from "react";
import { deleteUserProfile } from "../../bd/Users";
import { useNavigate } from "react-router";
import { useUserAuth } from "../../context/UserAuthContext.js";
import { getUserRole } from "../../bd/Users";

const Settings = () => {
  const { user, logOut } = useUserAuth();
  const [role, setRole] = React.useState(null);
  const navigate = useNavigate();

  const handleDeleteClick = async () => {
    try {
      await deleteUserProfile(user.uid);
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

  useEffect(() => {
    const fetchUserRole = async () => {
      if (user) {
        try {
          const userRole = await getUserRole(user.uid);
          setRole(userRole);
        } catch (error) {
          console.error("Error fetching user role:", error);
        }
      }
    };

    fetchUserRole();
  }, [user]);

  useEffect(() => {
    const fetchUserRole = async () => {
      if (user) {
        try {
          const userRole = await getUserRole(user.uid);
          setRole(userRole);
        } catch (error) {
          console.error("Error fetching user role:", error);
        }
      }
    };

    fetchUserRole();
  }, [user]);

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <main>
      <section className="settings_context" aria-label="User Settings">
        <h1>Settings</h1>
        {role === "admin" && (
          <button onClick={() => navigate("/admin")} className="btn-del" aria-label="Navigate to Admin page">Page d'admin</button>
          )}
        <button onClick={handleDeleteClick} className="btn-del" aria-label="Delete Profile">Supprimer Profil</button>
        <button onClick={handleLogout} className="btn-del" aria-label="Logout">Logout</button>
      </section>
    </main>
  );
};

export default Settings;
