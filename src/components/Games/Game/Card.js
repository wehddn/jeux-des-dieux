import React from 'react';

function Card({ card, onDragStart }) {
  const slotColors = {
    Crèdes: "/Credes/Crede_",
    'Ordre de la Vérité': "/Ordres/Ordre_",
    Capères: "/Capers/Caper_",
    Phagots: "/Phagots/Phagot_",
    Mercenaires: "/Mercenaire/Mercenaire_"
  };
  
  return (
    <div
      className="card-game"
      draggable
      onDragStart={(e) => {
        if (onDragStart) {
          const cardData = JSON.stringify(card);
          e.dataTransfer.setData('card', cardData);
          console.log('Dragging card:', cardData);
          onDragStart(e, card);
        }
      }}
      style={{
        width: "100px",
        height: "133px",
        border: "1px solid #000",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        fontSize: "10px",
        backgroundImage: `url(${slotColors[card.suit]}${card.value}.svg)`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}      
    >
    </div>
  );
}

export default Card;
