# Jeux des dieux

## Description du projet

**Jeux des dieux** est un jeu de cartes stratégique où les joueurs incarnent des dieux contrôlant le destin de différentes factions. Les joueurs utilisent des héros, des cartes de pouvoir et de manipulation pour atteindre la victoire. L'objectif est de rassembler 4 héros d'une même faction.

Ce projet sert également de plateforme promotionnelle pour le livre *"Carrefour : Le début après la fin"* d'Antoine Vinorado.

## Objectif du projet

Développer une application web comprenant :

- Un système d'inscription et d'authentification des joueurs
- Un profil personnel avec des statistiques
- La possibilité de créer et rejoindre des salles de jeu
- Une interface de jeu pour des parties multijoueurs
- Un système de personnalisation de compte

## Stack technologique

- **Frontend** : React (avec Bootstrap, Sass, React Router)
- **Backend API** : PHP (avec Composer, OpenAPI/Swagger, PHPUnit pour les tests)
- **Game Server** : Node.js (WebSocket pour le gameplay en temps réel)
- **Base de données** : MySQL
- **Communications** : WebSocket (game server), REST API (backend)
- **Authentification** : JWT (JSON Web Tokens) avec Firebase JWT

## Exigences fonctionnelles

1. **Authentification** :
   - Inscription et connexion via e-mail
   - Sessions sécurisées avec tokens JWT
   - Gestion des rôles (utilisateur, manager, admin)
   - Récupération de mot de passe (à implémenter)

2. **Profil du joueur** :
   - Personnalisation du pseudonyme
   - Recherche de joueurs et système d'amis

3. **Gameplay** :
   - Lobby avec les salles disponibles
   - Création et participation à des jeux publics ou privés
   - Game server WebSocket pour les parties en temps réel

4. **Administration** :
   - Panel d'administration pour gérer les utilisateurs
   - Gestion des jeux et modération
   - Gestion des utilisateurs bloqués
   - Système d'audit et de logs

## Plans de développement

- Ajout de nouveaux types de cartes et de règles
- Amélioration des statistiques dans le profil (ex. : victoires par faction, efficacité des cartes)
- Introduction d’un chat intégré au jeu
- Extension des fonctionnalités avec de nouvelles factions et cartes

## Design et maquettes

[Lien vers Figma](https://www.figma.com/proto/NzUvvQnPHH4e5zXTx7KJ7L/jeux-des-dieux)

## Architecture du projet

Le projet est structuré en 3 services principaux :

### 1. **Client** (`/client/`)
- Application React frontend
- Interface utilisateur avec Bootstrap et Sass
- Gestion des routes et composants
- Communication avec l'API backend et le game server

### 2. **DB Server** (`/db_server/`)
- API REST en PHP avec architecture MVC
- Gestion de l'authentification et des utilisateurs
- CRUD pour les jeux, amis, et administration
- Tests avec PHPUnit
- Documentation API avec OpenAPI/Swagger

### 3. **Game Server** (`/game_server/`)
- Serveur Node.js pour le gameplay en temps réel
- Communication WebSocket pour les parties
- Logique de jeu et gestion des cartes

## Installation et démarrage

### Prérequis
- Node.js (v14 ou supérieur)
- PHP (v8.0 ou supérieur)
- MySQL
- Composer

### Configuration
1. Cloner le repository
2. Configurer la base de données MySQL avec le schéma dans `/db_server/sql/schema.sql`
3. Créer un fichier `.env` dans `/db_server/` avec les variables de configuration de base de données
4. Installer les dépendances :
   ```bash
   # Frontend
   cd client && npm install
   
   # Backend PHP
   cd ../db_server && composer install
   
   # Game Server
   cd ../game_server && npm install
   ```

### Démarrage des services
```bash
# Backend API (port 5000)
cd db_server && php -S localhost:5000 index.php

# Game Server WebSocket
cd game_server/src && node server.js

# Frontend React
cd client && npm start
```
