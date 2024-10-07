import React, { useState, useEffect, useRef, useCallback } from "react";
import { useParams } from "react-router-dom";
import { useUserAuth } from "../../context/UserAuthContext.js";
import Game from "./Game/Game";

function GameRoom() {
  const { id } = useParams(); // Get room ID from URL
  const { user } = useUserAuth(); // Get current user data
  const [status, setStatus] = useState("waiting"); // Game status
  const [hand, setHand] = useState([]); // Player's hand
  const [table, setTable] = useState([]); // Cards on the table
  const [deck, setDeck] = useState(0); // Number of cards in the deck
  const [gameState, setGameState] = useState({
    deck: 0,
    players: [],
    discardPile: 0,
    currentPlayer: 0,
    turn: 0,
  }); // Comprehensive game state
  const ws = useRef(null); // WebSocket connection reference
  const hasJoined = useRef(false); // Flag to indicate if the player has joined
  const messageQueue = useRef([]); // Queue for messages before joining

  // Wrap handleIncomingMessage in useCallback to avoid unnecessary re-renders
  const handleIncomingMessage = useCallback((data) => {
    switch (data.type) {
      case "start":
        console.log("handle start ", data);
        setStatus("started");
  
        // Initializing players correctly and ensuring discardPile is set
        setGameState({
          deck: data.deck.length,
          players: data.table.map((player) => ({
            ...player,
            hand: data.hand, // Assuming you only have the current player's hand at this stage
          })),
          discardPile: 0, // Ensuring discardPile is initialized
          currentPlayer: data.currentPlayer,
          turn: 0,
        });
  
        setHand(data.hand);  // Current player's hand
        setTable(data.table); // Cards on the table
        setDeck(data.deck.length);  // Assuming deck is an array
        break;
  
      case "gameState":
        console.log("handle gameState ", data);
  
        // Find current player's hand and ensure player structure is correct
        const updatedPlayers = data.table.map((player) => ({
          ...player,
          hand: player.hand || [],  // Ensuring hand is always an array
        }));
  
        setGameState({
          ...data,
          players: updatedPlayers,
          discardPile: data.discardPile || 0,  // Ensure discardPile is always an array
        });
  
        setDeck(data.deck.length);
        setHand(
          data.table.find((p) => p.id === user.uid)?.hand || []  // Get current player's hand
        );
        setTable(data.table.map(p => ({ id: p.id, table: p.table })));  // Map player's table data
        break;
  
      case "rejoined":
        console.log("handle rejoined ", data);
        setHand(data.hand);  // Rejoined player's hand
        setTable(data.table);  // Rejoined player's table state
        setDeck(data.deck.length);
  
        setGameState({
          deck: data.deck.length,
          players: data.table.map((player) => ({
            ...player,
            hand: data.hand || [],  // Set hand to empty array if not available
          })),
          discardPile: data.discardPile || [],  // Ensure discardPile is always initialized
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
    // Establish WebSocket connection
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

    // Handle incoming messages
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

    // Handle connection closure
    ws.current.onclose = () => {
      console.log("WebSocket connection closed.");
      setStatus("disconnected");
    };

    ws.current.onerror = (error) => {
      console.error("WebSocket error:", error);
      setStatus("error");
    };

    // Handle leaving the game on page unload
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
      // Cleanup on component unmount
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

  // Function to send a drawCard request
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
      <h1>Game Room {id}</h1>
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
