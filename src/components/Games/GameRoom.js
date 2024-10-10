import React, { useState, useEffect, useRef, useCallback } from "react";
import { useParams } from "react-router-dom";
import { useUserAuth } from "../../context/UserAuthContext.js";
import Game from "./Game/Game";

function GameRoom() {
  const { id } = useParams();
  const { user } = useUserAuth();
  const [status, setStatus] = useState("waiting");
  const [hand, setHand] = useState([]);
  const [table, setTable] = useState([]);
  const [deck, setDeck] = useState(0);
  const [gameState, setGameState] = useState({
    deck: 0,
    players: [],
    discardPile: 0,
    currentPlayer: 0,
    turn: 0,
  });
  const ws = useRef(null);
  const hasJoined = useRef(false);
  const messageQueue = useRef([]);

  const handleIncomingMessage = useCallback((data) => {
    switch (data.type) {
      case "start":
        console.log("handle start ", data);
        setStatus("started");
  
        setGameState({
          deck: data.deck.length,
          players: data.table.map((player) => ({
            ...player,
            hand: data.hand,
          })),
          discardPile: 0,
          currentPlayer: data.currentPlayer,
          turn: 0,
        });
  
        setHand(data.hand);
        setTable(data.table);
        setDeck(data.deck.length);
        break;
  
      case "gameState":
        console.log("handle gameState ", data);
  
        const updatedPlayers = data.table.map((player) => ({
          ...player,
          hand: player.hand || [],
        }));
  
        setGameState({
          ...data,
          players: updatedPlayers,
          discardPile: data.discardPile || 0,
        });
  
        setDeck(data.deck.length);
        setHand(
          data.table.find((p) => p.id === user.uid)?.hand || []
        );
        setTable(data.table.map(p => ({ id: p.id, table: p.table })));
        break;
  
      case "rejoined":
        console.log("handle rejoined ", data);
        setHand(data.hand);
        setTable(data.table);
        setDeck(data.deck.length);
  
        setGameState({
          deck: data.deck.length,
          players: data.table.map((player) => ({
            ...player,
            hand: data.hand || [],
          })),
          discardPile: data.discardPile || [],
          currentPlayer: 0,
          turn: 0,
        });
        break;
  
      default:
        console.warn(`Unhandled message type: ${data.type}`);
        break;
    }
  }, [user.uid]);
  

  useEffect(() => {
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

    ws.current.onclose = () => {
      console.log("WebSocket connection closed.");
      setStatus("disconnected");
    };

    ws.current.onerror = (error) => {
      console.error("WebSocket error:", error);
      setStatus("error");
    };

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

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
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
  }, [id, user, handleIncomingMessage]);

  const sendDrawCard = () => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(
        JSON.stringify({
          type: "drawCard",
          room: id,
          userId: user.uid,
        })
      );
    }
  };

  return (
    <div>
      {status === "waiting" && <p>Waiting for players...</p>}
      {status === "joined" && (
        <p>Player joined. Waiting for another player...</p>
      )}
      {status === "started" && (
        <Game
          hand={hand}
          table={table}
          deck={deck}
          ws={ws.current}
          user={user}
          gameState={gameState}
          setGameState={setGameState}
          sendDrawCard={sendDrawCard}
        />
      )}
      {status === "full" && <p>This room is full. You cannot join.</p>}
      {status === "disconnected" && <p>Disconnected from server.</p>}
      {status === "error" && <p>Error connecting to server.</p>}
    </div>
  );
}

export default GameRoom;
