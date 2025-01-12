import React from 'react';
import Card from './Card';

function Hand({ cards, onDragStart, onCardClick, onCardDoubleClick }) {
  return (
    <section className="hand" aria-label="Player Hand">
      {cards.map((card, index) => (
        <div
          key={`${card.suit}-${card.value}-${index}`}
          onClick={() => onCardClick(card)}
          onDoubleClick={() => onCardDoubleClick(card)}
        >
          <Card 
            card={card} 
            onDragStart={onDragStart} 
          />
        </div>
      ))}
    </section>
  );
}

export default Hand;