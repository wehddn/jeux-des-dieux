import React from 'react';

const UserInfo = ({ userProfile }) => {
  console.log(userProfile);

  return (
    <div className='card d-flex'>
      {userProfile.photo ? (
        <img className="photoProfil" src={`/photoProfil/${userProfile.photo}`} alt="Profile" />
      ) : (
        <img className="photoProfil" src="/photoProfil/photo.png" alt="Default Profile" />
      )}
      <h5>Pseudo</h5>
      <p>{userProfile.name}</p>
      <h5>Mail</h5>
      <p>{userProfile.email}</p>
      <h5>Numéro Unique</h5>
      <p>{userProfile.id}</p>
    </div>
  );
}

export default UserInfo;