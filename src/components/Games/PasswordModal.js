import React, { useState } from "react";
import Modal from "react-modal";
import { getDoc, doc } from "firebase/firestore";
import { db } from "../../firebase";
import { useUserAuth } from "../../context/UserAuthContext";

Modal.setAppElement("#root");

function PasswordModal({ isOpen, onRequestClose, room, onPasswordCorrect }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { authenticateRoom } = useUserAuth();
  console.log("PasswordModal1", room.id);

  const handleSubmit = async (e) => {
    console.log("PasswordModal", room.id);

    e.preventDefault();

    try {
      const roomRef = doc(db, "Games", room.id);
      const roomDoc = await getDoc(roomRef);

      if (roomDoc.exists()) {
        const roomData = roomDoc.data();
        if (roomData.password === password) {
          authenticateRoom(room.id);
          onPasswordCorrect();
        } else {
          setError("Неверный пароль. Пожалуйста, попробуйте снова.");
        }
      }
    } catch (error) {
      console.error("Ошибка при проверке пароля:", error);
      setError("Ошибка при проверке пароля. Пожалуйста, попробуйте снова.");
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      overlayClassName="modal-overlay"
      className="modal-content"
    >
      <div>
        <h2>Entrez le mot de passe de la pièce</h2>
        <hr />
        <form onSubmit={handleSubmit}>
          <div>
            <label>
              Mot de passe:
              <div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </label>
          </div>
          {error && <p style={{ color: "red" }}>{error}</p>}
          <div className="box-btn-modal">
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
          </div>
        </form>
      </div>
    </Modal>
  );
}

export default PasswordModal;
