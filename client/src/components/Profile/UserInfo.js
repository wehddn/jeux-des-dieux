import React, { useState } from "react";
import { updateUserName } from "../../bd/Users";

const UserInfo = ({ userProfile }) => {
  const [newPseudo, setNewPseudo] = useState(userProfile.name);
  const [isEditing, setIsEditing] = useState(false);

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleInputChange = (e) => {
    setNewPseudo(e.target.value);
  };

  const handleSaveClick = async () => {
    if (userProfile.name === newPseudo) {
      setIsEditing(false);
      return;
    }

    try {
      await updateUserName(userProfile.id, newPseudo);
      setIsEditing(false);
      userProfile.name = newPseudo;
    } catch (error) {
      console.error("Error updating pseudo:", error);
    }
  };

  return (
    <section className="card profile-info d-flex ms-4 mt-4" aria-label="User Information">
        <div className="d-flex justify-content-center">
          <img
            className="photoProfil"
            src={`/img/photoProfil/${userProfile.photo}`}
            alt="User profile"
          />
        </div>
        <div className="d-flex justify-content-start">
          <h5 className="profile-tittle">Pseudo</h5>
        </div>
        <div className="d-flex justify-content-start pseudo-input-container">
          {isEditing ? (
            <div className="d-flex justify-content-start">
              <input
                type="text"
                value={newPseudo}
                onChange={handleInputChange}
                className="pseudo-input"
                aria-label="Edit Pseudo"
              />
              <button onClick={handleSaveClick} className="btn-save-pseudo"  aria-label="Save Pseudo">
                <img src={`/img/btn/save.svg`} alt="Save" className="btn-save-pseudo-img"/>
              </button>
            </div>
          ) : (
            <>
              <div className="pseudo-container">
                <p className="m-2">{userProfile.name || "Player"}</p>
              </div>
              <button onClick={handleEditClick} className="btn-edit" aria-label="Edit Pseudo">
                <img src={`/img/btn/edit.svg`} alt="Edit" className="btn-edit-img"/>
              </button>
            </>
          )}
        </div>

        <div className="pt-3 d-flex justify-content-start">
          <h5 className="profile-tittle">Mail</h5>
        </div>
        <div className="pseudo-container">
          <p className="m-2">{userProfile.email}</p>
        </div>

        <div className="pt-3 d-flex justify-content-start">
          <h5 className="profile-tittle">Numéro Unique</h5>
        </div>
        <div className="pseudo-container container-numero">
          <p className="m-2 word-break">{userProfile.id}</p>
        </div>
    </section>
  );
};

export default UserInfo;
