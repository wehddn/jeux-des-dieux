import React from "react";
import Modal from "react-modal";

Modal.setAppElement("#root");

function GameOverModal({ isOpen, onRequestClose, isDraw, isWinner }) {
  let message;
  
  if (isDraw) {
    message = "Le match s'est terminé par un match nul.";
  } else if (isWinner) {
    message = "Félicitations ! Vous avez gagné le jeu !";
  } else {
    message = "Vous avez perdu la partie.";
  }

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      contentLabel="Fin du jeu"
      className="modal-content"
      overlayClassName="modal-overlay"
    >
      <div className="game-over-modal">
        <button onClick={onRequestClose} className="btn-close" />
        <h2>Fin du jeu</h2>
        <p>{message}</p>
      </div>
    </Modal>
  );
}

export default GameOverModal;