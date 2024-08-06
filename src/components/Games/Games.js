import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import CreateGameModal from "./CreateGameModal";
import { getGamesList } from "../../bd/Games";
import PasswordModal from "./PasswordModal"; // Импортируем новое модальное окно для ввода пароля

function Games() {
  const [rooms, setRooms] = useState([]);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [passwordModalIsOpen, setPasswordModalIsOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const navigate = useNavigate();

  const openModal = () => {
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
  };

  const openPasswordModal = (room) => {
    setSelectedRoom(room);
    setPasswordModalIsOpen(true);
  };

  const closePasswordModal = () => {
    setPasswordModalIsOpen(false);
    setSelectedRoom(null);
  };

  const handlePasswordCorrect = () => {
    if (selectedRoom) {
      navigate(`/room/${selectedRoom.id}`);
    }
    closePasswordModal();
  };

  const joinRoom = (room) => {
    console.log("Attempting to join room:", room);
    if (room.password) {
      openPasswordModal(room);
    } else {
      console.log("Room is public, navigating to room", room.id);
      navigate(`/room/${room.id}`);
      console.log("Navigated to room", `/room/${room.id}`);
    }
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
      <button onClick={openModal}>Создать ИГРУ</button>
      <CreateGameModal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        contentLabel="Пример модального окна"
      />
      <ul>
        {rooms.map((room) => (
          <li key={room.id}>
            <button to="#" onClick={() => joinRoom(room)}>
          {room.name} - {room.id}
            </button>
          </li>
        ))}
      </ul>
      {selectedRoom && (
        <PasswordModal
          isOpen={passwordModalIsOpen}
          onRequestClose={closePasswordModal}
          room={selectedRoom}
          onPasswordCorrect={handlePasswordCorrect}
        />
      )}
    </div>
  );
}

export default Games;
