import React from "react";
import Modal from "react-modal";

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
          <div className="d-flex flex-column">
            {receivedRequests.map((friend, index) => (
              <article className="mb-3" key={friend.id} aria-label="Friend Request">
                <div className="friend-card text-center">
                  <div className="box-btn-modal">
                    <button onClick={() => handleDecline(friend.id)} className="friend-button me-2" aria-label="Decline">
                      <img src={`/img/btn/croix.svg`} alt="suppr." width="20" />
                    </button>
                    {friend.name}
                    <button onClick={() => handleAccept(friend.id)} className="add-button" aria-label="Accept">
                      <img src={`/img/btn/save.svg`} alt="add." width="20" />
                    </button>
                  </div>
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
