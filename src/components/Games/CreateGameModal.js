import React, {useState} from 'react';
import Modal from 'react-modal';
import {useNavigate} from 'react-router-dom';
import {createGame} from '../../bd/Games';
import { useUserAuth } from "../../context/UserAuthContext.js";

Modal.setAppElement('#root');

function CreateGameModal({ isOpen, onRequestClose, contentLabel }) {
  const [gameName, setGameName] = useState('');
  const navigate = useNavigate();
  const { user } = useUserAuth();

  const handleCreateGame = async (e) => {
    e.preventDefault();

    try {
      console.log('user', user.uid);
      const gameId = await createGame(gameName, user.uid);
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
          <button type="submit">Создать</button>
          <button type="button" onClick={onRequestClose}>Отмена</button>
        </form>
      </div>
    </Modal>
  );
}

export default CreateGameModal;