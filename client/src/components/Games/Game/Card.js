import React from "react";

function Card({ card, onDragStart }) {
  const slotColors = {
    Crèdes: "/img/Credes/Crede_",
    "Ordre de la Vérité": "/img/Ordres/Ordre_",
    Capères: "/img/Capers/Caper_",
    Phagots: "/img/Phagots/Phagot_",
    Mercenaires: "/img/Mercenaire/Mercenaire_"
  };
  
  return (
    <div
      className="card-game"
      draggable
      onDragStart={(e) => {
        if (onDragStart) {
          const cardData = JSON.stringify(card);
          e.dataTransfer.setData('card', cardData);
          onDragStart(e, card);
        }
      }}
      style={{
        backgroundImage: `url(${slotColors[card.suit]}${card.value}.svg)`,
      }}
      role="img"
      aria-label={`Card: ${card.suit} ${card.value}`}
    ></div>
  );
}

export default Card;
