import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import CreateGameModal from "./CreateGameModal";
import { getGamesList, getUser } from "../../bd/Games";
import PasswordModal from "./PasswordModal";

function Games() {
  const [rooms, setRooms] = useState([]);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [passwordModalIsOpen, setPasswordModalIsOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [players, setPlayers] = useState({});
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
    if (room.password) {
      openPasswordModal(room);
    } else {
      navigate(`/room/${room.id}`);
    }
  };

  const fetchPlayers = async (players) => {
    const playerNames = await Promise.all(
      players.map(async (player) => {
        const playerData = await getUser(player.id);
        return playerData ? playerData.name : "Unknown";
      })
    );
    return playerNames;
  };

  useEffect(() => {
    const fetchGames = async () => {
      try {
        const games = await getGamesList();
        const playersData = {};

        for (const game of games) {
          if (Array.isArray(game.players)) {
            playersData[game.id] = await fetchPlayers(game.players);
          }
        }

        setRooms(games);
        setPlayers(playersData);
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
      <table>
        <thead>
          <tr>
            <th></th>
            <th>Nom de jeu</th>
            <th>Les joueurs</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {rooms.map((room) => (
            <tr key={room.id}>
              <td>
                <img 
                  src={room.password ? `${process.env.REACT_APP_API_URL}/games/fermer.png` : `${process.env.REACT_APP_API_URL}/games/ouver.png`} 
                  alt={room.password ? "closed" : "open"} 
                />
              </td>
              <td>{room.name}</td>
              <td>{players[room.id] ? players[room.id].join(", ") : "Loading..."}</td>
              <td>
                <button onClick={() => joinRoom(room)}>
                  <img src={`${process.env.REACT_APP_API_URL}/games/door.png`} alt="door" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
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