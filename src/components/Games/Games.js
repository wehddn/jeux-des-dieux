// Games.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

function Games() {
  const [rooms, setRooms] = useState([]);

  useEffect(() => {
    // Здесь должна быть логика для получения списка комнат из вашего бэкенда или Firebase
    // Пример с заглушкой:
    setRooms([{ id: 'room1', name: 'Room 1' }, { id: 'room2', name: 'Room 2' }]);
  }, []);

  return (
    <div>
      <h1>Games</h1>
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
