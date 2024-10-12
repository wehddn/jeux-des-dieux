import React, { useState } from "react";
import Friend from "./Friend.js";
import FriendSearchModal from "./FriendSearchModal";
import FriendRequestsModal from "./FriendRequestsModal";

const Friends = ({ userProfile, handleAcceptFriendRequest, handleDeclineFriendRequest }) => {
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [isRequestsModalOpen, setIsRequestsModalOpen] = useState(false);

  const openSearchModal = () => setIsSearchModalOpen(true);
  const closeSearchModal = () => setIsSearchModalOpen(false);

  const openRequestsModal = () => setIsRequestsModalOpen(true);
  const closeRequestsModal = () => setIsRequestsModalOpen(false);

  return (
    <div className="card d-flex mt-4">
      <h2 className="pt-4 profile-tittle">Mes Amis</h2>
      <div className="p-3 pt-4 row">
        <div className="d-flex justify-content-center col-6">
          <button className="btn_1" onClick={openSearchModal}>Trouver</button>
          <FriendSearchModal
            isOpen={isSearchModalOpen}
            onRequestClose={closeSearchModal}
            userProfile={userProfile}
          />
        </div>
        <div className="d-flex justify-content-center col-6">
          <button className="btn_2" onClick={openRequestsModal}>Demandes</button>
          <FriendRequestsModal
            isOpen={isRequestsModalOpen}
            onRequestClose={closeRequestsModal}
            receivedRequests={userProfile.receivedRequests}
            handleAccept={handleAcceptFriendRequest}
            handleDecline={handleDeclineFriendRequest}
          />
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
