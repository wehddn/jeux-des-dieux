// src/components/GameOverModal.js
import React from "react";
import Modal from "react-modal";
import "./GameOverModal.css"; // Не забудьте создать CSS для стилизации модального окна

Modal.setAppElement("#root");

function GameOverModal({ isOpen, onRequestClose, isDraw, isWinner }) {
  let message;
  
  if (isDraw) {
    message = "Игра закончилась ничьей.";
  } else if (isWinner) {
    message = "Поздравляем! Вы выиграли игру!";
  } else {
    message = "Вы проиграли игру.";
  }

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      contentLabel="Игра окончена"
      className="modal-content"
      overlayClassName="modal-overlay"
    >
      <div className="game-over-modal">
        <h2>Игра окончена</h2>
        <p>{message}</p>
        <button onClick={onRequestClose} className="btn-close-modal">
          Закрыть
        </button>
      </div>
    </Modal>
  );
}

export default GameOverModal;
