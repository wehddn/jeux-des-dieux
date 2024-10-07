import React from 'react';

function Card({ card, onDragStart }) {
  const slotColors = {
    Crèdes: "red",
    'Ordre de la Vérité': "blue",
    Capères: "green",
    Phagots: "purple",
  };
  
  return (
    <div
      className="card"
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
        width: "60px",
        height: "90px",
        border: "1px solid #000",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        backgroundColor: slotColors[card.suit],
      }}      
    >
      {card.suit}
    </div>
  );
}

export default Card;
