import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useUserAuth } from "../../context/UserAuthContext.js";

function GameRoom() {
  const { id } = useParams();
  const { user } = useUserAuth();
  const [status, setStatus] = useState('waiting');
  const [hand, setHand] = useState([]);
  const [table, setTable] = useState([]);
  const ws = useRef(null);
  console.log("GameRoom", id);

  useEffect(() => {
    ws.current = new WebSocket('ws://localhost:3001');

    ws.current.onopen = () => {
      ws.current.send(JSON.stringify({
        type: 'join',
        room: id,
        userId: user.uid
      }));
    };

    ws.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log("message : ", data.type);

      if (data.type === 'joined') {
        setStatus('joined');
      } else if (data.type === 'start') {
        setStatus('started');
        setHand(data.hand);
        setTable(data.table);
        console.log("Your hand:", data.hand); // Выводим руку игрока в консоль
        console.log("Game table:", data.table); // Выводим общий стол в консоль
      } else if (data.type === 'full') {
        setStatus('full');
      } else if (data.type === 'waiting') {
        setStatus('waiting');
      } else if (data.type === 'rejoined') {
        setHand(data.hand);
        setTable(data.table);
        console.log("Rejoined. Your hand:", data.hand); // Выводим руку игрока в консоль при повторном подключении
        console.log("Game table:", data.table); // Выводим общий стол в консоль при повторном подключении
      }
    };

    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, [id, user]);

  return (
    <div>
      <h1>Game Room {id}</h1>
      {status === 'waiting' && <p>Waiting for players...</p>}
      {status === 'joined' && <p>Player joined. Waiting for another player...</p>}
      {status === 'started' && <p>The game has started!</p>}
      {status === 'full' && <p>This room is full. You cannot join.</p>}
    </div>
  );
}

export default GameRoom;
