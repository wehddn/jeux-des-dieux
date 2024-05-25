import React from 'react';
import Friend from './Friend.js';

const Friends = ({ userProfile }) => {

  return (
    <div className='card d-flex' style={{border: "none", backgroundColor: '#F3F2EE' }}>
      <h2 className='pt-4'>Mes Amis</h2>
      <div className='p-3 pt-4 row'>
        <div className='d-flex justify-content-center col-6'>
          <button className='btn_1'>Trouver</button>
        </div>
        <div className='d-flex justify-content-center col-6'>
          <button className='btn_2'>Envoyer</button>
        </div>
      </div>
      <hr style={{width: "90%", margin: "0 auto"}}/>
      <div className='row d-flex p-4 pt-4'>
        {userProfile.friends && userProfile.friends.map((friendId, index) => (
          <Friend key={index} userId={friendId}></Friend>
        ))}
      </div>
    </div>
  );
}

export default Friends;