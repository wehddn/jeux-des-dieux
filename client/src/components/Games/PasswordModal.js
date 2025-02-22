import React, { useState } from "react";
import Modal from "react-modal";
import { getGame } from "../../bd/Games";
import { useUserAuth } from "../../context/UserAuthContext";

Modal.setAppElement("#root");

function PasswordModal({ isOpen, onRequestClose, room, onPasswordCorrect }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { authenticateRoom } = useUserAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const gameData = await getGame(room);

      if (gameData) {
        if (gameData.password === password) {
          authenticateRoom(room.id);
          onPasswordCorrect();
        } else {
          setError("Mot de passe incorrect. Veuillez réessayer.");
        }
      } else {
        setError("Jeu introuvable.");
      }
    } catch (error) {
      console.error("Erreur lors de la vérification du mot de passe:", error);
      setError("Erreur lors de la vérification du mot de passe. Veuillez réessayer.");
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
