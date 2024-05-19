import React from 'react';
import { Button } from 'react-bootstrap';
import Friend from './Friend.js';

const Friends = (userProfile) => {
return (
<div className='card'>
    <h2>Mes Amis</h2>
    <div className='row d-flex'>
        <Button>Trouver</Button>
        <Button>Envoyer</Button>
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