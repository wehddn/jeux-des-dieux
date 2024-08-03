import React, { useState, useEffect, useRef } from 'react';

function GameRoom() {
  const [counter, setCounter] = useState(0);
  const ws = useRef(null);

  useEffect(() => {
    // Установление соединения с WebSocket сервером
    ws.current = new WebSocket('ws://localhost:3001');

    // Обработка входящих сообщений
    ws.current.onmessage = (event) => {
      const gameState = JSON.parse(event.data);
      setCounter(gameState.counter);
    };

    // Закрытие соединения при размонтировании компонента
    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, []);

  // Обработка нажатия на кнопку
  const handleClick = () => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send('increment');
    }
  };

  return (
    <div>
      <h1>Game Room</h1>
      <p>Counter: {counter}</p>
      <button onClick={handleClick}>Increase Counter</button>
    </div>
  );
}

export default GameRoom;