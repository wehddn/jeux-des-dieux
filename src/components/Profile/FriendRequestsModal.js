import React from "react";
import Modal from "react-modal";
import Friend from "./Friend.js"; // Используйте компонент Friend, если нужно

const FriendRequestsModal = ({ isOpen, onRequestClose, receivedRequests, handleAccept, handleDecline }) => {
  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      overlayClassName="modal-overlay"
      className="modal-content"
    >
      <h2>Полученные заявки в друзья</h2>
      {receivedRequests && receivedRequests.length > 0 ? (
        <ul>
          {receivedRequests.map((friendId, index) => (
            <li key={index}>
              {/* Отобразить информацию о пользователе (например, через компонент Friend) */}
              <Friend userId={friendId} />
              <div>
                <button onClick={() => handleAccept(friendId)} className="btn btn-success">
                  Принять
                </button>
                <button onClick={() => handleDecline(friendId)} className="btn btn-danger">
                  Отклонить
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p>У вас нет новых заявок.</p>
      )}
      <button onClick={onRequestClose} className="btn btn-secondary">Закрыть</button>
    </Modal>
  );
};

export default FriendRequestsModal;
