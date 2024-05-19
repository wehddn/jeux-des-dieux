import React, { useState } from 'react';
import { updateUserName, deleteUserProfile } from '../bd/Users';

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
    try {
      await updateUserName(userProfile.id, newPseudo);
      setIsEditing(false);
      userProfile.name = newPseudo;
    } catch (error) {
      console.error('Error updating pseudo:', error);
    }
  };

  const handleDeleteClick = async () => {
    try {
      await deleteUserProfile(userProfile.id);

    } catch (error) {
      console.error('Error deleting profile:', error);
    }
  };

  return (
    <div className='card d-flex'>
      {userProfile.photo ? (
        <img className="photoProfil" src={`/photoProfil/${userProfile.photo}`} alt="Profile" />
      ) : (
        <img className="photoProfil" src="/photoProfil/photo.png" alt="Default Profile" />
      )}
      <h5>Pseudo</h5>
      {isEditing ? (
        <div>
          <input
            type="text"
            value={newPseudo}
            onChange={handleInputChange}
          />
          <button onClick={handleSaveClick}>Save</button>
        </div>
      ) : (
        <div>
          <p>{userProfile.name}</p>
          <button onClick={handleEditClick}>Edit</button>
        </div>
      )}
      <h5>Numéro Unique</h5>
      <p>{userProfile.id}</p>
      <button onClick={handleDeleteClick}>Supprimer Le Profil</button>
    </div>
  );
}

export default UserInfo;
