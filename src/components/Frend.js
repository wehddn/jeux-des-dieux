import React from 'react';
import { Button } from 'react-bootstrap';

const Frends = (user) => {
return (
<div className='card'>
    <h2>Mes Amis</h2>
    <div className='row d-flex'>
        <Button><i class='bx bx-x'></i></Button>
        if ({{user.img}}){
            <img class="photoProfil" src="/photoProfil/{{user.img}}" alt="Photo Profil" />
        } else {
            <img class="photoProfil" src="/photoProfil/photo.png" alt="Photo Profil" />
        }
    </div>
    <p>{{user.NickName}}</p>
</div>
);
}

export default Frends;