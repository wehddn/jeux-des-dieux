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
      <button onClick={onRequestClose} className="btn-close" />
      <h2>Demandes d'amis reçues</h2>
      <hr />
      {receivedRequests && receivedRequests.length > 0 ? (
        <div className="container-modal-friend">
          <div className="row">
            {receivedRequests.map((friendId, index) => (
              <div className="col-md-4 mb-4" key={index}>
                <div className="friend-card text-center">
                  <div className="d-flex justify-content-between me-4 ms-4">
                    <button onClick={() => handleDecline(friendId)} className="friend-button me-2">
                      <img src={`/img/btn/croix.svg`} alt="suppr." width="20" />
                    </button>
                    <button onClick={() => handleAccept(friendId)} className=" add-button">
                      <img src={`/img/btn/save.svg`} alt="add." width="20" />
                    </button>
                  </div>
                  <Friend userId={friendId} />
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <p>Vous n'avez pas de nouvelles demandes.</p>
      )}
    </Modal>
  );
};

export default FriendRequestsModal;
