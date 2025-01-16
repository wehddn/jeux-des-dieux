import React from "react";

const Rules = () => {
  return (
    <main className="rules-container" aria-label="Game Rules">
      <section className="rules-title">
        <h1>Règles du jeu "Jeux des dieux"</h1>
      </section>
      <section className="text-block text-block-clair" aria-labelledby="components-title">
        <h2>Composants du jeu :</h2>
        <p>Cartes des Héros. Il y a 4 factions principales :</p>
        <ul>
          <li>Ordre de la Vérité (7 héros)</li>
          <li>Phagots (7 héros)</li>
          <li>Crèdes (7 héros)</li>
          <li>Capères (7 héros)</li>
          <li>Il y a aussi une faction universelle : Mercenaires (7 héros).</li>
        </ul>
        <p>Cartes de Puissance :</p>
        <ul>
          <li>Corruption : 18 cartes. (4 cartes pour chaque faction + 2 cartes d'universelle.)</li>
          <li>Purification : 20 cartes. (4 cartes pour chaque faction + 4 cartes d'universelle.)</li>
        </ul>
      </section>

      <section className="text-block text-block-dark" aria-labelledby="how-to-play-title">
        <h2>Comment jouer :</h2>
        <ul>
            <li>Début du jeu : Chaque joueur commence avec 4 cartes.</li>
            <li>Le tour : Pendant son tour, chacun dois jouer une carte de héros ou une carte de puissance. Si le joueur ne veux pas jouer, il peut défausser une carte. À la fin de son tour, il pioche une nouvelle carte.</li>
            <li>Objectif du jeu : Le but est de rassembler 4 héros de la même faction pour gagner. Seuls les héros purifiés (non corrompus) comptent pour la victoire.</li>
            <li>Corruption et Purification : Corruption rend un héros faible. Si un héros reçoit 2 cartes de corruption, il est éliminé du jeu. Purification enlève la corruption.</li>
        </ul>
      </section>

      <section className="text-block text-block-clair" aria-labelledby="how-to-win-title">
        <h2>Comment gagner :</h2>
        <p>Le premier joueur qui réussit à avoir 4 héros de la même faction gagne la partie!</p>
        <p>Le jeu est basé sur la stratégie : utiliser les bonnes cartes au bon moment pour vaincre tes adversaires et gagner.</p>
      </section>
    </main>
  );
};

export default Rules;
