import React, { useState, useEffect, Suspense } from "react";
import { useNavigate } from "react-router-dom";
import { getGamesList, getUser } from "../../bd/Games";

const CreateGameModal = React.lazy(() => import("./CreateGameModal"));
const PasswordModal = React.lazy(() => import("./PasswordModal"));

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
    <main className="games-container">
      <button className="btn-create-game" onClick={openModal}>
        Créer un JEU
      </button>

      <Suspense fallback={<div>Loading Create Game Modal...</div>}>
        <CreateGameModal
          isOpen={modalIsOpen}
          onRequestClose={closeModal}
          contentLabel="Fenetre pour créer un JEU"
        />
      </Suspense>

      <table className="games-table" aria-label="Games List">
        <thead>
          <tr>
            <th>Public ou non</th>
            <th>Nom de jeu</th>
            <th>Les joueurs</th>
            <th>Entrée</th>
          </tr>
        </thead>
        <tbody>
          {rooms.map((room) => (
            <tr key={room.id}>
              <td>
                <img
                  className="game-status-icon"
                  src={
                    room.password ? `/img/games/fermer.png` : `/img/games/ouver.png`
                  }
                  alt={room.password ? "closed" : "open"}
                />
              </td>
              <td>{room.name}</td>
              <td>
                {players[room.id]
                 ? players[room.id].join(", ")
                  : "Loading..."}
              </td>
              <td>
                <button
                  className="btn-join-room"
                  onClick={() => joinRoom(room)}
                  aria-label="Join Room"
                >
                  <img src={`/img/games/door.svg`} alt="door" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {selectedRoom && (
        <Suspense fallback={<div>Loading Password Modal...</div>}>
          <PasswordModal
            isOpen={passwordModalIsOpen}
            onRequestClose={closePasswordModal}
            room={selectedRoom}
            onPasswordCorrect={handlePasswordCorrect}
          />
        </Suspense>
      )}
    </main>
  );
}

export default Games;
