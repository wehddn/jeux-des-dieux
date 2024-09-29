import React from 'react';

function Card({ card, onDragStart }) {
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
    >
      {card.suit} {card.value}
    </div>
  );
}

export default Card;
