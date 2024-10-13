import React, { useState, useEffect } from "react";
import Friend from "./Friend.js";
import FriendSearchModal from "./FriendSearchModal";
import FriendRequestsModal from "./FriendRequestsModal";

const Friends = ({ userProfile, handleAcceptFriendRequest, handleDeclineFriendRequest }) => {
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [isRequestsModalOpen, setIsRequestsModalOpen] = useState(false);
  const [receivedRequests, setReceivedRequests] = useState(userProfile.receivedRequests || []);

  useEffect(() => {
    // Обновляем receivedRequests при изменении профиля пользователя
    setReceivedRequests(userProfile.receivedRequests || []);
  }, [userProfile]);

  const openSearchModal = () => setIsSearchModalOpen(true);
  const closeSearchModal = () => setIsSearchModalOpen(false);

  const openRequestsModal = () => setIsRequestsModalOpen(true);
  const closeRequestsModal = () => setIsRequestsModalOpen(false);

  const handleAccept = async (friendId) => {
    try {
      await handleAcceptFriendRequest(friendId);
      // Убираем заявку из списка после принятия
      setReceivedRequests(receivedRequests.filter((id) => id !== friendId));
    } catch (error) {
      console.error("Error accepting friend request:", error);
    }
  };

  const handleDecline = async (friendId) => {
    try {
      await handleDeclineFriendRequest(friendId);
      // Убираем заявку из списка после отклонения
      setReceivedRequests(receivedRequests.filter((id) => id !== friendId));
    } catch (error) {
      console.error("Error declining friend request:", error);
    }
  };

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
            receivedRequests={receivedRequests}
            handleAccept={handleAccept}
            handleDecline={handleDecline}
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
