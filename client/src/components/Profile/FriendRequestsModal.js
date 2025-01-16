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
      contentLabel="Friend Requests"
    >
      <button onClick={onRequestClose} className="btn-close" aria-label="Close" />
      <h2>Demandes d'amis reçues</h2>
      <hr />
      {receivedRequests && receivedRequests.length > 0 ? (
        <section className="container-modal-friend">
          <div className="row">
            {receivedRequests.map((friendId, index) => (
              <article className="col-md-4 mb-4" key={index} aria-label="Friend Request">
                <div className="friend-card text-center">
                  <div className="d-flex justify-content-between me-4 ms-4">
                    <button onClick={() => handleDecline(friendId)} className="friend-button me-2" aria-label="Decline">
                      <img src={`/img/btn/croix.svg`} alt="suppr." width="20" />
                    </button>
                    <button onClick={() => handleAccept(friendId)} className=" add-button" aria-label="Accept">
                      <img src={`/img/btn/save.svg`} alt="add." width="20" />
                    </button>
                  </div>
                  <Friend userId={friendId} />
                </div>
              </article>
            ))}
          </div>
        </section>
      ) : (
        <p>Vous n'avez pas de nouvelles demandes.</p>
      )}
    </Modal>
  );
};

export default FriendRequestsModal;
