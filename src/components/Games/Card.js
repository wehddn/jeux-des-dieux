import React from 'react';

function Card({ card, onDragStart }) {
  return (
    <div
      className="card"
      draggable
      onDragStart={(e) => onDragStart(e, card)}
    >
      {card.suit} {card.value}
    </div>
  );
}

export default Card;
