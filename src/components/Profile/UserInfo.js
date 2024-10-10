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
    <div className="card profile-info d-flex ms-4 mt-4">
      <div className="p-4">
        <div className="d-flex justify-content-center">
          <img
            className="photoProfil"
            src={`/photoProfil/${userProfile.photo}`}
            alt="Profile"
          />
        </div>
        <div className="d-flex justify-content-start">
          <h5>Pseudo</h5>
        </div>
        <div className="d-flex justify-content-start box-pseudo-input">
          {isEditing ? (
            <div className="d-flex justify-content-start pseudo-input">
              <input
                type="text"
                value={newPseudo}
                onChange={handleInputChange}
                className="pseudo-input"
              />
              <button onClick={handleSaveClick} className="btn-save">
                <img src={`/btn/save.svg`} alt="Save" className="btn-save" />
              </button>
            </div>
          ) : (
            <>
              <div className="pseudo-container">
                <p className="m-2">{userProfile.name || "Player"}</p>
              </div>
              <button onClick={handleEditClick} className="btn-edit">
                <img src={`/btn/edit.svg`} alt="Edit" className="btn-edit" />
              </button>
            </>
          )}
        </div>

        <div className="pt-3 d-flex justify-content-start">
          <h5>Mail</h5>
        </div>
        <div className="pseudo-container">
          <p className="m-2">{userProfile.email}</p>
        </div>

        <div className="pt-3 d-flex justify-content-start">
          <h5>Numéro Unique</h5>
        </div>
        <div className="pseudo-container">
          <p className="m-2 word-break">{userProfile.id}</p>
        </div>
      </div>
    </div>
  );
};

export default UserInfo;
