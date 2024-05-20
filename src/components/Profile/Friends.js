import React from 'react';
import Friend from './Friend.js';

const Friends = ({ userProfile }) => {

  return (
    <div className='card d-flex'>
      <h2>Mes Amis</h2>
      <div className='row justify-content-center m-2'>
        <div className='d-flex btn col-6 align-items-start p-0'>
          <button className='btn_1'>Trouver</button>
        </div>
        <div className='d-flex btn col-6 align-items-end p-0'>
          <button className='btn_2'>Envoyer</button>
        </div>
      </div>
      <div>
        {userProfile.friends && userProfile.friends.map((friendId, index) => (
          <Friend key={index} userId={friendId}></Friend>
        ))}
      </div>
    </div>
  );
}

export default Friends;