import React from 'react';
import { Button } from 'react-bootstrap';
import Friend from './Friend.js';

const Friends = (userProfile) => {
return (
<div className='card d-flex'>
    <h2>Mes Amis</h2>
    <div className='row justify-content-center align-items-center'>
        <Button className='col-5'>Trouver</Button>
        <Button className='col-5'>Envoyer</Button>
    </div>
    <div>
        {userProfile.friends && userProfile.friends.map((friend, index) => (
          <Friend user={friend}></Friend>
        ))}
    </div>
</div>
);
}

export default Friends;