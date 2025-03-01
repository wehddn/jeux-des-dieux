import React, { useState } from "react";
import Modal from "react-modal";
import { useNavigate } from "react-router-dom";
import { createGame } from "../../bd/Games";
import { useUserAuth } from "../../context/UserAuthContext.js";

Modal.setAppElement("#root");

function CreateGameModal({ isOpen, onRequestClose, contentLabel }) {
  const [gameName, setGameName] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const { user, authenticateRoom } = useUserAuth();

  const handleCreateGame = async (e) => {
    e.preventDefault();

    try {
      const gameData = {
        name: gameName || "",
        userId: user.id,
        isPrivate: Boolean(isPrivate),
      };

      if (isPrivate) {
        if (!password) {
          alert("S'il vous plaît fournir un mot de passe pour le jeu fermé.");
          return;
        }
        gameData.password = password;
      }

      const gameId = await createGame(gameData);
      authenticateRoom(gameId);
      navigate(`/room/${gameId}`);
      onRequestClose();
    } catch (error) {
      console.error("Error creating game:", error);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      contentLabel={contentLabel}
      className="modal-content"
      overlayClassName="modal-overlay"
    >
      <section>
        <button
          onClick={onRequestClose}
          className="btn-close"
          aria-label="Close"
        />
        <h2>Créer un jeux amical</h2>
        <hr />
        <form onSubmit={handleCreateGame}>
          <label>
            Nom du jeu :
            <input
              className="create-game-input"
              type="text"
              value={gameName}
              onChange={(e) => setGameName(e.target.value)}
              required
            />
          </label>
          <label>
            Jeu fermé :
            <input
              className="create-game-checkbox"
              type="checkbox"
              checked={isPrivate}
              onChange={() => setIsPrivate(!isPrivate)}
            />
          </label>

          {isPrivate && (
            <label>
              Mot de passe :
              <input
                className="create-game-input"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </label>
          )}
          <footer className="box-btn-modal">
            <button type="submit" className="btn-save">
              Créer
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

export default CreateGameModal;
