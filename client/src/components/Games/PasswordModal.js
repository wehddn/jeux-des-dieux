import React, { useState } from "react";
import Modal from "react-modal";
import { joinGame } from "../../bd/Games";

Modal.setAppElement("#root");

function PasswordModal({ isOpen, onRequestClose, room, onPasswordCorrect }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      await joinGame(room.id, password);
      onPasswordCorrect();
    } catch (error) {
      setError(error.message || "Erreur lors de la vérification du mot de passe. Veuillez réessayer.");
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      overlayClassName="modal-overlay"
      className="modal-content"
    >
      <section>
        <button onClick={onRequestClose} className="btn-close" aria-label="Close" />
        <h2>Entrez le mot de passe de la pièce</h2>
        <hr />
        <form onSubmit={handleSubmit}>
          <label>
            Mot de passe:
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>
          {error && <p style={{ color: "red" }}>{error}</p>}
          <footer className="box-btn-modal">
            <button type="submit" className="btn-save">
              Entrer
            </button>
            <button
              type="button"
              onClick={onRequestClose}
              className="btn-cancel"
            >
              Annulation
            </button>
          </footer>
        </form>
      </section>
    </Modal>
  );
}

export default PasswordModal;
