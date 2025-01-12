import React from "react";
import { deleteUserProfile } from "../../bd/Users";
import { useUserAuth } from "../../context/UserAuthContext.js";
import Header from "../base/Header/Header.js";
import Footer from "../base/Footer/Footer.js";

const Settings = () => {
  const { user } = useUserAuth();

  const handleDeleteClick = async () => {
    try {
      await deleteUserProfile(user.uid);
    } catch (error) {
      console.error("Error deleting profile:", error);
    }
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <main>
      <Header />
      <section className="settings_context" aria-label="User Settings">
        <h1>Settings</h1>
        <button onClick={handleDeleteClick} className="btn-del" aria-label="Delete Profile">Supprimer Le Profil</button>
      </section>
      <Footer />
    </main>
  );
};

export default Settings;
