import React, { useState } from 'react';
import Modal from 'react-modal';
import { useNavigate } from 'react-router-dom';
import { createGame } from '../../bd/Games';
import { useUserAuth } from "../../context/UserAuthContext.js";

Modal.setAppElement('#root');

function CreateGameModal({ isOpen, onRequestClose, contentLabel }) {
  const [gameName, setGameName] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const { user, authenticateRoom } = useUserAuth();

  const handleCreateGame = async (e) => {
    e.preventDefault();

    try {
      const gameData = {
        name: gameName || '',
        userId: user.uid,
        isPrivate: Boolean(isPrivate),
      };

      if (isPrivate) {
        if (!password) {
          alert('Пожалуйста, укажите пароль для закрытой игры.');
          return;
        }
        gameData.password = password;
      }

      const gameId = await createGame(gameData);
      authenticateRoom(gameId);
      navigate(`/room/${gameId}`);
      onRequestClose();
    } catch (error) {
      console.error('Ошибка при создании игры:', error);
    }
  };

  return (
    <Modal isOpen={isOpen} onRequestClose={onRequestClose} contentLabel={contentLabel}>
      <div>
        <h2>Создать новую игру</h2>
        <form onSubmit={handleCreateGame}>
          <label>
            Название игры:
            <input
              type="text"
              value={gameName}
              onChange={(e) => setGameName(e.target.value)}
              required
            />
          </label>
          <label>
            <input
              type="checkbox"
              checked={isPrivate}
              onChange={() => setIsPrivate(!isPrivate)}
            />
            Закрытая игра
          </label>
          {isPrivate && (
            <label>
              Пароль:
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </label>
          )}
          <button type="submit">Создать</button>
          <button type="button" onClick={onRequestClose}>Отмена</button>
        </form>
      </div>
    </Modal>
  );
}

export default CreateGameModal;
