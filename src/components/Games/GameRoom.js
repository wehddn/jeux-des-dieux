import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { useUserAuth } from "../../context/UserAuthContext.js";
import Game from "./Game/Game";

function GameRoom() {
  const { id } = useParams(); // Получаем ID комнаты из URL
  const { user } = useUserAuth(); // Получаем данные текущего пользователя
  const [status, setStatus] = useState("waiting"); // Статус игры (waiting, joined, started, full)
  const [hand, setHand] = useState([]); // Рука игрока
  const [table, setTable] = useState([]); // Карты на столе
  const [deck, setDeck] = useState([]); // Карты в колоде
  const ws = useRef(null); // Используем useRef для хранения WebSocket соединения
  const hasJoined = useRef(false); // Флаг, показывающий, присоединился ли игрок
  const messageQueue = useRef([]); // Очередь сообщений, которые нужно обработать после присоединения

  useEffect(() => {
    // Создаем новое WebSocket соединение
    ws.current = new WebSocket("ws://localhost:3001");

    ws.current.onopen = () => {
      if (ws.current && ws.current.readyState === WebSocket.OPEN) {
        ws.current.send(
          JSON.stringify({
            type: "join",
            room: id,
            userId: user.uid,
          })
        );
      }
    };

    // Обработчик при входе новых пользователей в комнату
    ws.current.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.type === "joined") {
        setStatus("joined");
        hasJoined.current = true;
        messageQueue.current.forEach((queuedMessage) => {
          handleIncomingMessage(queuedMessage);
        });
        messageQueue.current = [];
      } else if (!hasJoined.current) {
        messageQueue.current.push(data);
      } else {
        handleIncomingMessage(data);
      }
    };

    // Обработчик для закрытия соединения при перезагрузке страницы
    const handleBeforeUnload = () => {
      if (ws.current && ws.current.readyState === WebSocket.OPEN) {
        ws.current.send(
          JSON.stringify({
            type: "leave",
            room: id,
            userId: user.uid,
          })
        );
        ws.current.close();
      }
    };

    // Добавляем обработчик события перезагрузки страницы
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      // Удаляем обработчик события и закрываем соединение при размонтировании компонента
      window.removeEventListener("beforeunload", handleBeforeUnload);
      if (ws.current && ws.current.readyState === WebSocket.OPEN) {
        ws.current.send(
          JSON.stringify({
            type: "leave",
            room: id,
            userId: user.uid,
          })
        );
        ws.current.close();
      }
    };
  }, [id, user]); // Эффект срабатывает при изменении id комнаты или данных пользователя

  // Функция для обработки входящих сообщений
  const handleIncomingMessage = (data) => {
    switch (data.type) {
      case "start":
        setStatus("started");
        setHand(data.hand);
        setTable(data.table);
        setDeck(data.deck); // Сохраняем состояние колоды
        break;
      case "full":
        setStatus("full");
        break;
      case "waiting":
        setStatus("waiting");
        break;
      case "rejoined":
        setHand(data.hand);
        setTable(data.table);
        setDeck(data.deck); // Сохраняем колоду при повторном входе
        break;
      default:
        break;
    }
  };

  return (
    <div>
      <h1>Game Room {id}</h1>
      {status === "waiting" && <p>Waiting for players...</p>}
      {status === "joined" && (
        <p>Player joined. Waiting for another player...</p>
      )}
      {status === "started" && (
        <Game
          hand={hand} // Передаем состояние руки в компонент игры
          table={table} // Передаем состояние стола в компонент игры
          deck={deck} // Передаем состояние стола в компонент игры
          ws={ws.current} // Передаем WebSocket соединение в компонент игры
          user={user} // Передаем информацию о пользователе в компонент игры
        />
      )}
      {status === "full" && <p>This room is full. You cannot join.</p>}{" "}
      {/* Сообщение о том, что комната полная */}
    </div>
  );
}

export default GameRoom;
