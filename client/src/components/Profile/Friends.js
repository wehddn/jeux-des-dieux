import React, { useState, useEffect } from "react";
import Friend from "./Friend.js";
import FriendSearchModal from "./FriendSearchModal";
import FriendRequestsModal from "./FriendRequestsModal";
import { getPendingFriendRequests } from "../../bd/Users";

const Friends = ({ userProfile, handleAcceptFriendRequest, handleDeclineFriendRequest }) => {
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [isRequestsModalOpen, setIsRequestsModalOpen] = useState(false);
  const [receivedRequests, setReceivedRequests] = useState([]);

  useEffect(() => {
    const fetchPendingRequests = async () => {
      try {
        const pendingRequests = await getPendingFriendRequests(userProfile.id);
        setReceivedRequests(pendingRequests);
        console.log("Friends : useEffect pendingRequests", pendingRequests);
      } catch (error) {
        console.error("Ошибка при получении входящих заявок в друзья:", error);
      }
    };

    fetchPendingRequests();
  }, [userProfile.id]);

  const openSearchModal = () => setIsSearchModalOpen(true);
  const closeSearchModal = () => setIsSearchModalOpen(false);

  const openRequestsModal = () => setIsRequestsModalOpen(true);
  const closeRequestsModal = () => setIsRequestsModalOpen(false);

  const handleAccept = async (friendId) => {
    try {
      await handleAcceptFriendRequest(friendId);
      setReceivedRequests(receivedRequests.filter((request) => request.id !== friendId));
    } catch (error) {
      console.error("Ошибка при принятии заявки:", error);
    }
  };

  const handleDecline = async (friendId) => {
    try {
      await handleDeclineFriendRequest(friendId);
      setReceivedRequests(receivedRequests.filter((request) => request.id !== friendId));
    } catch (error) {
      console.error("Ошибка при отклонении заявки:", error);
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
          userProfile.friends.map((friend, index) => (
            <article className="col-6 mb-4" key={index} aria-label="Friend">
              <Friend userId={friend.id} />
            </article>
          ))}
      </div>
    </section>
  );
};

export default Friends;
