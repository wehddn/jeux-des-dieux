import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import CreateGameModal from './CreateGameModal';
import { getGamesList } from '../../bd/Games';

function Games() {
  const [rooms, setRooms] = useState([]);
  const [modalIsOpen, setModalIsOpen] = useState(false);

  const openModal = () => {
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
  };

  useEffect(() => {
    // Загрузка списка игр из Firebase
    const fetchGames = async () => {
      try {
        const games = await getGamesList();
        setRooms(games);
      } catch (error) {
        console.error("Ошибка при загрузке списка игр:", error);
      }
    };

    fetchGames();
  }, []);

  return (
    <div>
      <h1>Games</h1>
      <button onClick={openModal}>Открыть модальное окно</button>
      <CreateGameModal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        contentLabel="Пример модального окна"
      />
      <ul>
        {rooms.map(room => (
          <li key={room.id}>
            <Link to={`/room/${room.id}`}>{room.name}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Games;