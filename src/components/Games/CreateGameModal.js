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
        userId: user.uid,
        isPrivate: Boolean(isPrivate),
      };

      if (isPrivate) {
        if (!password) {
          alert("Пожалуйста, укажите пароль для закрытой игры.");
          return;
        }
        gameData.password = password;
      }

      const gameId = await createGame(gameData);
      authenticateRoom(gameId);
      navigate(`/room/${gameId}`);
      onRequestClose();
    } catch (error) {
      console.error("Ошибка при создании игры:", error);
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
      <div>
        <h2>Créer un jeux amical</h2>
        <hr />
        <form onSubmit={handleCreateGame}>
          <div>
            <label>
              Nom du jeu :
              <div>
                <input
                  type="text"
                  value={gameName}
                  onChange={(e) => setGameName(e.target.value)}
                  required
                />
              </div>
            </label>
          </div>
          <div className="checkbox-container">
            <label>Jeu fermé : </label>
            <input
              type="checkbox"
              checked={isPrivate}
              onChange={() => setIsPrivate(!isPrivate)}
            />
          </div>

          <div>
            {isPrivate && (
              <label>
                Mot de passe :
                <div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </label>
            )}
          </div>
          <div className="box-btn-modal">
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
          </div>
        </form>
      </div>
    </Modal>
  );
}

export default CreateGameModal;
