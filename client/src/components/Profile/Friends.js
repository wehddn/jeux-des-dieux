import React, { useState, useEffect, useCallback } from "react";
import Friend from "./Friend.js";
import FriendSearchModal from "./FriendSearchModal";
import FriendRequestsModal from "./FriendRequestsModal";
import { getPendingFriendRequests, getFriendsList } from "../../bd/Users";

const Friends = ({ userProfile, handleAcceptFriendRequest, handleDeclineFriendRequest }) => {
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [isRequestsModalOpen, setIsRequestsModalOpen] = useState(false);
  const [receivedRequests, setReceivedRequests] = useState([]);
  const [friends, setFriends] = useState([]);

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

  const fetchFriendsList = useCallback(async () => {
    try {
      const friendsList = await getFriendsList(userProfile.id);
      setFriends(friendsList);
      console.log("Friends : useEffect friendsList", friendsList);
    } catch (error) {
      console.error("Ошибка при получении списка друзей:", error);
    }
  }, [userProfile.id]);

  useEffect(() => {
    fetchFriendsList();
  }, [fetchFriendsList]);

  const openSearchModal = () => setIsSearchModalOpen(true);
  const closeSearchModal = () => setIsSearchModalOpen(false);

  const openRequestsModal = () => setIsRequestsModalOpen(true);
  const closeRequestsModal = () => setIsRequestsModalOpen(false);

  const handleAccept = async (friendId) => {
    try {
      await handleAcceptFriendRequest(friendId);
      setReceivedRequests(receivedRequests.filter((request) => request.id !== friendId));
      await fetchFriendsList(); // Теперь fetchFriendsList доступна и корректно обновляет список друзей
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
        {friends.length > 0 ? (
          friends.map((friend) => (
            <article className="col-6 mb-4" key={friend.id} aria-label="Friend">
              <Friend userId={friend.id} />
            </article>
          ))
        ) : (
          <p className="text-center">Vous n'avez pas encore d'amis.</p>
        )}
      </div>
    </section>
  );
};

export default Friends;