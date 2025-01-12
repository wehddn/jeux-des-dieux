import React from "react";
import Modal from "react-modal";

Modal.setAppElement("#root");

function GameOverModal({ isOpen, onRequestClose }) {
  const ordreImg = `/img/Ordres/Ordre_1.svg`;
  const phagotsImg = `/img/Phagots/Phagot_1.svg`;
  const credesImg = `/img/Credes/Crede_1.svg`;
  const caperesImg = `/img/Capers/Caper_1.svg`;
  const mercenairesImg = `/img/Mercenaire/Mercenaire_1.svg`;
  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      contentLabel="Aide"
      className="modal-content"
      overlayClassName="modal-overlay"
      style={{
        content: {
          marginTop: "-20px"
        }
      }}
    >
      <section className="game-over-modal">
      
        <button onClick={onRequestClose} className="btn-close" aria-label="Close Help" />
        
        <h2>Aide</h2>
        <ul>
        <h2>Comment gagner :</h2>
        <p>Le premier joueur qui réussit à avoir 4 héros de la même faction gagne la partie!</p>
        <p>Corruption et Purification : Corruption rend un héros faible. Si un héros reçoit 2 cartes de corruption, il est éliminé du jeu. Purification enlève la corruption.</p>
        <h2>Composants du jeu :</h2>
        <table className="factions-table" aria-label="Game Components">
          <thead>
            <tr>
              <th>Fraction</th>
              <th>Example de carte</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Ordre de la Vérité</td>
              <td>
                <img src={ordreImg} alt="Ordre de la Vérité" className="faction-image" />
              </td>
            </tr>
            <tr>
              <td>Phagots</td>
              <td>
                <img src={phagotsImg} alt="Phagots" className="faction-image" />
              </td>
            </tr>
            <tr>
              <td>Crèdes</td>
              <td>
                <img src={credesImg} alt="Crèdes" className="faction-image" />
              </td>
            </tr>
            <tr>
              <td>Capères</td>
              <td>
                  <img src={caperesImg} alt="Capères" className="faction-image" />
              </td>
            </tr>
            <tr>
              <td>Mercenaires</td>
              <td>
                  <img src={mercenairesImg} alt="Mercenaires" className="faction-image" />
              </td>
            </tr>
          </tbody>
        </table>
      </ul>  
      </section>
    </Modal>
  );
}

export default GameOverModal;
