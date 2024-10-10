import React from 'react';
import Card from './Card';

function PlayerField({ player, index, colors, onDropCard, onSlotClick, currentPlayer, slotColors }) {
  const playerCurses = player.curses || {};

  return (
    <div className="player-field">
      <div className="card-slots">
        {colors.map((color, slotIndex) => {
          const cardsInSlot = player.table.filter(card => card.slot === slotIndex);
          const className = Object.keys(slotColors)[slotIndex];
          const curseCount = playerCurses[className] || 0;
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
              {curseCount > 0 && (
                <div className="curse-count">ПОРЧА: {curseCount}</div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default PlayerField;
