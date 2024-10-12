import React from 'react';
import Card from './Card';

function PlayerField({ player, index, colors, onDropCard, onSlotClick, currentPlayer, slotColors }) {

  return (
    <div className="player-field">
      <div className="card-slots">
        {colors.map((color, slotIndex) => {
          const cardsInSlot = player.table.filter(card => card.slot === slotIndex);
          const className = Object.keys(slotColors)[slotIndex];
          return (
            <div 
              key={slotIndex} 
              className="card-slot" 
              style={{ borderColor: color }}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => onDropCard(e, index, slotIndex)}
              onClick={() => onSlotClick(slotIndex)}
            >
              {cardsInSlot.map((card, i) => <Card key={i} card={card} />)}
              <div className="card-count">{cardsInSlot.length}</div>
              <div>{cardsInSlot.filter(card => card.isCurse === true).length}</div>
              <div>{cardsInSlot.filter(card => card.isPurification === true).length}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default PlayerField;
