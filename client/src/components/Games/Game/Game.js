import React, { useState, Suspense } from "react";
import PlayerField from "./PlayerField";
import Hand from "./Hand";

const HelpModal = React.lazy(() => import("./HelpModal"));

function Game({
  hand,
  deck,
  user,
  gameState,
  sendDiscardCard,
  sendPlayCard,
  sendPlayCurseCard,
  sendPlayPurificationCard,
}) {
  const [selectedCard, setSelectedCard] = useState(null);
  const [helpModalIsOpen, setHelpModalIsOpen] = useState(false);
  const isCurrentPlayer =
    gameState.players[gameState.currentPlayer].id === user.id;

  const slotColors = {
    Crèdes: "#136E71",
    "Ordre de la Vérité": "#FEDD9A",
    Capères: "#5C8EA6",
    Phagots: "#464B7B",
  };

  const getPlayerStatusMessage = (playerIndex) => {
    if (playerIndex === gameState.currentPlayer) {
      return <p style={{ color: "green" }}>Votre tour</p>;
    }
    return <p style={{ color: "red" }}>Tour de l'adversaire</p>;
  };

  const isSlotBlocked = (slotIndex, card, isOpponentSlot = false) => {
    const slotSuit = Object.keys(slotColors)[slotIndex];

    if (card.value === 9) {
      if (isOpponentSlot) {
        return true;
      }
      const player = gameState.players.find((p) => p.id === user.id);
      const slotHasCards = player.table.some((c) => c.slot === slotIndex);
      if (!slotHasCards) return true;

      if (card.suit === "Mercenaires") {
        return false;
      }
      return card.suit !== slotSuit;
    } else if (card.value === 8) {
      if (isOpponentSlot) {
        const opponent = gameState.players.find((p) => p.id !== user.id);
        const slotHasCards = opponent.table.some((c) => c.slot === slotIndex);
        if (!slotHasCards) return true;
        if (card.suit === "Mercenaires") {
          return false;
        }
        const slotSuit = Object.keys(slotColors)[slotIndex];
        return card.suit !== slotSuit;
      } else {
        return true;
      }
    } else {
      if (card.suit === "Mercenaires") {
        return false;
      }
      const slotSuit = Object.keys(slotColors)[slotIndex];
      return card.suit !== slotSuit;
    }
  };

  const discardCard = (card) => {
    sendDiscardCard(card);

    setSelectedCard(null);
  };

  const playCard = (card, slotIndex, targetPlayerId) => {
    if (card.value === "8") {
      if (!isSlotBlocked(slotIndex, card, true)) {
        sendPlayCurseCard(card, slotIndex, targetPlayerId);
      } else {
        console.log("Cannot play curse card on this slot");
      }
    } else if (card.value === "9") {
      if (!isSlotBlocked(slotIndex, card)) {
        sendPlayPurificationCard(card, slotIndex);
      } else {
        console.log("Cannot play purification card on this slot");
      }
    } else {
      if (!isSlotBlocked(slotIndex, card)) {
        sendPlayCard(card, slotIndex);
      } else {
        console.log("Cannot play card on this slot");
      }
    }
    setSelectedCard(null);
  };

  const openHelpModal = () => {
    setHelpModalIsOpen(true);
  };

  const closeHelpModal = () => {
    setHelpModalIsOpen(false);
  };

  return (
    <main className="game">
      <div className="d-flex justify-content-end align-items-center">
        <button className="btn-help" onClick={openHelpModal} aria-label="Open Help">
          <i alt="Help" className="bx bx-question-mark "></i>
        </button>
      </div>
      <Suspense fallback={<div>Loading Help Modal...</div>}>
        <HelpModal
          isOpen={helpModalIsOpen}
          onRequestClose={closeHelpModal}
          contentLabel="Aide"
        />
      </Suspense>
      <section className="opponent-field">
        {gameState.players
          .filter((player) => player.id !== user.id)
          .map((player, index) => (
            <div key={player.id}>
              <PlayerField
                player={player}
                index={index}
                colors={Object.values(slotColors)}
                onSlotClick={(slotIndex) => {
                  if (selectedCard && selectedCard.value === "8") {
                    playCard(selectedCard, slotIndex, player.id);
                  }
                }}
                onDropCard={() => {}}
                currentPlayer={gameState.currentPlayer}
                slotColors={slotColors}
                isOpponentSlot={true}
              />
            </div>
          ))}
      </section>

      <section className="deck-and-discard">
        <div
          className="discard-pile"
          aria-label="Discard Pile"
          style={{ padding: "10px", border: "1px solid black" }}
        >
          Défausse : {gameState.discardPile.length} cartes
        </div>
        <div
          className="deck"
          aria-label="Deck"
          style={{ padding: "10px", border: "1px solid black" }}
        >
          Pioche : {deck.length} cartes
        </div>
      </section>

      <section className="player-field">
        <PlayerField
          player={gameState.players.find((p) => p.id === user.id)}
          index={gameState.players.findIndex((p) => p.id === user.id)}
          colors={Object.values(slotColors)}
          onSlotClick={(slotIndex) => {
            if (selectedCard && !isSlotBlocked(slotIndex, selectedCard)) {
              playCard(selectedCard, slotIndex);
            }
          }}
          onDropCard={() => {}}
          currentPlayer={gameState.currentPlayer}
          slotColors={slotColors}
        />
      </section>

      <Hand
        cards={hand || []}
        onCardClick={(card) => {
          setSelectedCard(card);
        }}
        onCardDoubleClick={(card) => discardCard(card)}
        isCurrentPlayer={isCurrentPlayer}
      />
      {getPlayerStatusMessage(
        gameState.players.findIndex((p) => p.id === user.id)
      )}
    </main>
  );
}

export default Game;
