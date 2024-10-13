import React from "react";
import Modal from "react-modal";
import Friend from "./Friend.js";

const FriendRequestsModal = ({ isOpen, onRequestClose, receivedRequests, handleAccept, handleDecline }) => {
  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      overlayClassName="modal-overlay"
      className="modal-content"
    >
      <h2>Demandes d'amis reçues</h2>
      {receivedRequests && receivedRequests.length > 0 ? (
        <ul>
          {receivedRequests.map((friendId, index) => (
            <li key={index}>
              <Friend userId={friendId} />
              <div>
                <button onClick={() => handleAccept(friendId)} className="btn btn-success">
                  Accepter
                </button>
                <button onClick={() => handleDecline(friendId)} className="btn btn-danger">
                  Refuser
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p>Vous n'avez pas de nouvelles demandes.</p>
      )}
      <button onClick={onRequestClose} className="btn btn-secondary">Fermer</button>
    </Modal>
  );
};

export default FriendRequestsModal;
