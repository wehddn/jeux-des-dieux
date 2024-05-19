import React from 'react';
import { Button } from 'react-bootstrap';
import Friend from './Friend.js';

const Friends = ({userProfile}) => {
    
return (
<div className='card d-flex'>
    <h2>Mes Amis</h2>
    <div className='row justify-content-center align-items-center'>
        <button className='col-5 btn_1'>Trouver</button>
        <button className='col-5 btn_2'>Envoyer</button>
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