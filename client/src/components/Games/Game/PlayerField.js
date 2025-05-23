import React from 'react';
import Card from './Card';

function PlayerField({ player, index, colors, onDropCard, onSlotClick, currentPlayer, slotColors }) {
  const getBackgroundImage = (type, className) => {
    switch (className) {
      case 'Capères':
        if (type === 'count') return '/img/Capers/count_cards_capere.svg';
        break;
      case 'Crèdes':
        if (type === 'count') return '/img/Credes/count_cards_crede.svg';
        break;
      case 'Ordre de la Vérité':
        if (type === 'count') return '/img/Ordres/count_cards_ordre.svg';
        break;
      case 'Phagots':
        if (type === 'count') return '/img/Phagots/count_cards_phagot.svg';
        break;
      default:
        return '';
    }
  };
  return (
    <section className="player-field pb-2" aria-label="Player Field">
      <div className="card-slots">
        {colors.map((color, slotIndex) => {
          const cardsInSlot = player.table.filter(card => card.slot === slotIndex);
          return (
            <div 
              key={slotIndex} 
              className="card-slot" 
              style={{ borderColor: color }}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => onDropCard(e, index, slotIndex)}
              onClick={() => onSlotClick(slotIndex)}
              aria-label={`Slot ${slotIndex}`}
            >
              {cardsInSlot.map((card, i) => <Card key={i} card={card} />)}
              <div 
                className="card-count" 
                style={{ backgroundImage: `url(${getBackgroundImage('count', Object.keys(slotColors)[slotIndex])})` }} aria-label="Card Count"
              >
                {cardsInSlot.length - cardsInSlot.filter(card => card.isCurse === true).length - cardsInSlot.filter(card => card.isPurification === true).length}
              </div>
              
              <div className="curse-count" aria-label="Curse Count">
                {cardsInSlot.filter(card => card.isCurse === true).length}
              </div>

              <div className="purification-count" aria-label="Purification Count">
                {cardsInSlot.filter(card => card.isPurification === true).length}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default PlayerField;
