import React from "react";
import Friend from "./Friend.js";

const Friends = ({ userProfile }) => {
  return (
    <div className="card d-flex mt-4">
      <h2 className="pt-4 profile-tittle">Mes Amis</h2>
      <div className="p-3 pt-4 row">
        <div className="d-flex justify-content-center col-6">
          <button className="btn_1">Trouver</button>
        </div>
        <div className="d-flex justify-content-center col-6">
          <button className="btn_2">Envoyer</button>
        </div>
      </div>
      <hr className="m-2" />
      <div className="row d-flex p-4 pt-4">
        {userProfile.friends &&
          userProfile.friends.map((friendId, index) => (
            <Friend key={index} userId={friendId} />
          ))}
      </div>
    </div>
  );
};

export default Friends;
