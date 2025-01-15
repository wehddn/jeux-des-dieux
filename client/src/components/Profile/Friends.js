import React, { useState, useEffect } from "react";
import Friend from "./Friend.js";
import FriendSearchModal from "./FriendSearchModal";
import FriendRequestsModal from "./FriendRequestsModal";

const Friends = ({ userProfile, handleAcceptFriendRequest, handleDeclineFriendRequest }) => {
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [isRequestsModalOpen, setIsRequestsModalOpen] = useState(false);
  const [receivedRequests, setReceivedRequests] = useState(userProfile.receivedRequests || []);

  useEffect(() => {
    setReceivedRequests(userProfile.receivedRequests || []);
  }, [userProfile]);

  const openSearchModal = () => setIsSearchModalOpen(true);
  const closeSearchModal = () => setIsSearchModalOpen(false);

  const openRequestsModal = () => setIsRequestsModalOpen(true);
  const closeRequestsModal = () => setIsRequestsModalOpen(false);

  const handleAccept = async (friendId) => {
    try {
      await handleAcceptFriendRequest(friendId);
      setReceivedRequests(receivedRequests.filter((id) => id !== friendId));
    } catch (error) {
      console.error("Error accepting friend request:", error);
    }
  };

  const handleDecline = async (friendId) => {
    try {
      await handleDeclineFriendRequest(friendId);
      setReceivedRequests(receivedRequests.filter((id) => id !== friendId));
    } catch (error) {
      console.error("Error declining friend request:", error);
    }
  };

  return (
    <section className="card d-flex mt-4" aria-label="Friends List">
      <h2 className="mt-4 profile-title">Mes Amis</h2>
      <div className="m-3 mt-4 row">
        <div className="d-flex justify-content-center col-6">
          <button className="btn_1" onClick={openSearchModal} aria-label="Search Friends">Trouver</button>
          <FriendSearchModal
            isOpen={isSearchModalOpen}
            onRequestClose={closeSearchModal}
            userProfile={userProfile}
          />
        </div>
        <div className="d-flex justify-content-center col-6">
          <button className="btn_2" onClick={openRequestsModal} aria-label="View Friend Requests">Demandes</button>
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
            <article className="col-6 mb-4" key={index} aria-label="Friend">
              <Friend userId={friendId} />
            </article>
          ))}
      </div>
    </section>
  );
};

export default Friends;
