import React, { useState, useEffect, useRef, useCallback, Suspense } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useUserAuth } from "../../context/UserAuthContext.js";
import Game from "./Game/Game";

const GameOverModal = React.lazy(() => import("./GameOverModal"));

function GameRoom() {
  const { id } = useParams();
  const { user } = useUserAuth();
  const [status, setStatus] = useState("waiting");
  const [hand, setHand] = useState([]);
  const [deck, setDeck] = useState([]);
  const [gameState, setGameState] = useState({
    deck: [],
    players: [],
    discardPile: [],
    currentPlayer: 0,
    turn: 0,
  });
  const ws = useRef(null);
  const hasJoined = useRef(false);
  const messageQueue = useRef([]);
  const navigate = useNavigate();
  
  const [isGameOverModalOpen, setIsGameOverModalOpen] = useState(false);
  const [isDraw, setIsDraw] = useState(false);
  const [isWinner, setIsWinner] = useState(false);

  const handleIncomingMessage = useCallback(
    (data) => {
      switch (data.type) {
        case "start":
          setStatus("started");
          setGameState({
            deck: data.deck,
            players: data.players,
            discardPile: data.discardPile || [],
            currentPlayer: data.currentPlayer,
            turn: data.turn || 0,
          });
          setHand(data.hand);
          setDeck(data.deck);
          break;

        case "gameState":
          setGameState({
            deck: data.deck,
            players: data.players,
            discardPile: data.discardPile,
            currentPlayer: data.currentPlayer,
            turn: data.turn,
          });
          setDeck(data.deck);
          setHand(data.hand);
          break;

        case "rejoined":
          setHand(data.hand);
          setDeck(data.deck);
          setGameState({
            deck: data.deck,
            players: data.players,
            discardPile: data.discardPile || [],
            currentPlayer: data.currentPlayer,
            turn: data.turn || 0,
          });
          break;

        case "waiting":
          setStatus("waiting");
          break;

        case "full":
          setStatus("full");
          break;

        case "gameOver":
          setStatus("gameOver");
          if (data.isDraw) {
            setIsDraw(true);
            setIsWinner(false);
          } else {
            setIsDraw(false);
            setIsWinner(data.winnerId === user.uid);
          }
          setIsGameOverModalOpen(true);
          break;

        default:
          console.warn(`Unhandled message type: ${data.type}`);
          break;
      }
    },
    [user.uid]
  );

  useEffect(() => {
    ws.current = new WebSocket(process.env.REACT_APP_WS_URL);

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

  const sendDiscardCard = (card) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(
        JSON.stringify({
          type: "discardCard",
          card,
          room: id,
          userId: user.uid,
        })
      );
    }
  };

  const sendPlayCard = (card, slotIndex) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(
        JSON.stringify({
          type: "playCard",
          card,
          slotIndex,
          room: id,
          userId: user.uid,
        })
      );
    }
  };

  const sendPlayCurseCard = (card, slotIndex, targetPlayerId) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(
        JSON.stringify({
          type: "playCurseCard",
          card,
          slotIndex,
          targetPlayerId,
          room: id,
          userId: user.uid,
        })
      );
    }
  };

  const sendPlayPurificationCard = (card, slotIndex) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(
        JSON.stringify({
          type: "playPurificationCard",
          card,
          slotIndex,
          room: id,
          userId: user.uid,
        })
      );
    }
  };

  const closeGameOverModal = () => {
    setIsGameOverModalOpen(false);
    navigate("/games");
  };

  return (
    <main>
    <button onClick={() => setIsGameOverModalOpen(true)}>Open Game Over Modal</button>
      {status === "waiting" && <p>Waiting for players...</p>}
      {status === "joined" && (
        <p>Player joined. Waiting for another player...</p>
      )}
      {status === "started" && (
        <Game
          hand={hand}
          deck={deck}
          user={user}
          gameState={gameState}
          sendDiscardCard={sendDiscardCard}
          sendPlayCard={sendPlayCard}
          sendPlayCurseCard={sendPlayCurseCard}
          sendPlayPurificationCard={sendPlayPurificationCard}
        />
      )}
      {status === "gameOver" && (
        <p>Game Over</p>
      )}
      {status === "full" && <p>This room is full. You cannot join.</p>}
      {status === "disconnected" && <p>Disconnected from server.</p>}
      {status === "error" && <p>Error connecting to server.</p>}

      <Suspense fallback={<div>Loading...</div>}>
      <GameOverModal
        isOpen={isGameOverModalOpen}
        onRequestClose={closeGameOverModal}
        isDraw={isDraw}
        isWinner={isWinner}
      />
      </Suspense>
    </main>
  );
}

export default GameRoom;
