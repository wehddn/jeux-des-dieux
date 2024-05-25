import React, { useState } from 'react';
import { updateUserName, deleteUserProfile } from '../../bd/Users';

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
      <div className='pt-4 d-flex justify-content-center'>
        <img className="photoProfil" src={`/photoProfil/${userProfile.photo || 'photo.png'}`} alt="Profile" style={{ width: "15rem", height: "auto" }} />
      </div>
      <div className='p-4'>
        <div className='d-flex justify-content-start'>
          <h5>Pseudo</h5>
        </div>
        <div className='d-flex justify-content-start'>
          {isEditing ? (
            <div className='d-flex justify-content-start'  style={{ width: "100%"}}>
              <input
                type="text"
                value={newPseudo}
                onChange={handleInputChange} 
                className='p-2 d-flex justify-content-start'
                style={{ width: "85%", border: "none", backgroundColor: '#F3F2EE' }}
              />
              <button onClick={handleSaveClick} style={{border: "none", backgroundColor: "transparent"}}>
                <img src={`/btn/save.svg`} alt="Profile" style={{ width: "2rem", height: "auto"}} ></img>
              </button>
            </div>
          ) : (
            <>
              <div className='d-flex justify-content-start' style={{ width: "85%", backgroundColor: '#F3F2EE' }}>
                <p className='m-2'>{userProfile.name || 'Player'}</p>
              </div>
              <button onClick={handleEditClick} style={{border: "none", backgroundColor: "transparent"}}>
                <img src={`/btn/edit.svg`} alt="Profile" style={{ width: "2rem", height: "auto"}} ></img>
              </button>
            </>
          )}
        </div>

        <div className='pt-3 d-flex justify-content-start'>
          <h5>Mail</h5>
        </div>
        <div className='d-flex justify-content-start' style={{ width: "85%", backgroundColor: '#F3F2EE' }}>
          <p className='m-2'>{userProfile.email}</p>
        </div>

        <div className='pt-3 d-flex justify-content-start'>
          <h5>Numéro Unique</h5>
        </div>

        <div className='d-flex justify-content-start' style={{ width: "85%", backgroundColor: '#F3F2EE' }}>
          <p className='m-2'>{userProfile.id}</p>
        </div>
      </div>
      <button onClick={handleDeleteClick}>Supprimer Le Profil</button>
    </div>
  );
}

export default UserInfo;
