import React from "react";
import { deleteUserProfile } from "../../bd/Users";
import { useUserAuth } from "../../context/UserAuthContext.js";
import Header from "../base/Header/Header.js";

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
    <>
      <Header></Header>
      <div>
        <h1>Settings</h1>
        <button onClick={handleDeleteClick}>Supprimer Le Profil</button>
      </div>
    </>
  );
};

export default Settings;
