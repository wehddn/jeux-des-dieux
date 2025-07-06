# Documentation Backend - Jeux des Dieux

## Table des matières

1. [Vue d'ensemble](#vue-densemble)
2. [Architecture](#architecture)
3. [API REST](#api-rest)
4. [Base de données](#base-de-données)
5. [Authentification](#authentification)
6. [Tests](#tests)
7. [Déploiement](#déploiement)
8. [Sécurité](#sécurité)

## Vue d'ensemble

Le backend de "Jeux des Dieux" est une API REST développée en PHP utilisant une architecture MVC moderne.

### Technologies utilisées

- **PHP 8.0+** - Langage principal
- **MySQL** - Base de données
- **JWT** - Authentification basée sur les tokens
- **Composer** - Gestionnaire de dépendances
- **PHPUnit** - Tests unitaires
- **OpenAPI** - Documentation API

### Fonctionnalités principales

- Système d'authentification JWT
- Gestion des utilisateurs avec rôles (user, manager, admin)
- Système d'amitié
- Création et gestion des parties de jeu
- Administration et modération
- Système d'audit
- Tests unitaires

## Architecture

### Pattern MVC

#### Modèles
- **Responsabilité** : Gestion des données et logique métier
- **Base** : Classe `Model` avec méthodes CRUD communes
- **ORM Simple** : Mapping objet-relationnel basique

#### Vues
- **Format** : JSON uniquement (API REST)
- **Gestion** : Classe `Response` pour les réponses standardisées

#### Contrôleurs
- **Responsabilité** : Logique de traitement des requêtes
- **Validation** : Validation des données d'entrée
- **Autorisation** : Vérification des permissions

### Composants Core

#### Router
- Gestion des routes publiques et protégées

#### Auth
- Gestion de l'authentification JWT

#### Database
- Singleton pour la connexion PDO

## API REST

### Authentification

Toutes les routes protégées nécessitent un header `Authorization` :

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Endpoints principaux

#### Authentification
- `POST /auth/register` - Inscription
- `POST /auth/login` - Connexion

#### Utilisateurs
- `GET /users` - Liste des utilisateurs (Manager+)
- `GET /users/{id}` - Détails utilisateur
- `PATCH /users/{id}` - Modifier utilisateur
- `DELETE /users/{id}` - Supprimer utilisateur (Admin)

#### Parties
- `GET /games` - Liste des parties
- `POST /games` - Créer une partie
- `GET /games/{id}` - Détails d'une partie
- `POST /games/{id}/join` - Rejoindre une partie

#### Amis
- `POST /friends` - Envoyer demande d'amitié
- `PUT /friends/accept` - Accepter demande
- `GET /friends/{id}/list` - Liste des amis

## Base de données

### Schéma principal

- Voir le fichier `db_schema.sql` pour la structure complète

## Authentification

### Système JWT

#### Génération du token

Le token JWT est construite à partir des informations de l'utilisateur et signé avec une clé secrète : 
- `sub` : ID de l'utilisateur
- `role` : Rôle de l'utilisateur (user, manager, admin)
- `iat` : Date de création du token
- `exp` : Date d'expiration du token

#### Vérification

Le token est vérifié à chaque requête protégée. On extrait les données pour vérifier l'authenticité et les permissions.


### Gestion des rôles

#### Niveaux d'autorisation
- **1 - User** : Utilisateur standard
- **2 - Manager** : Modérateur
- **3 - Admin** : Administrateur

#### Vérification des permissions

On utilise les méthodes suivantes pour vérifier les permissions lors de l'accès aux routes protégées :

- requireManager : Vérifie que l'utilisateur est connecté et a le rôle de manager ou admin
- requireAdmin : Vérifie que l'utilisateur est connecté et a le rôle d'admin
- requireOwnerOrManager : Vérifie que l'utilisateur est connecté et est le propriétaire des données ou est manager/admin 
- requireSelfOrManager : Vérifie que l'utilisateur est connecté et a le droit d'accéder aux données de l'utilisateur spécifié ou est manager/admin
- requireNotSelf : Vérifie que l'utilisateur n'est pas en train de modifier ses propres données

## Tests


### Exécution des tests

```bash
# Tous les tests
vendor/bin/phpunit tests

# Test spécifique
vendor/bin/phpunit tests/UserControllerTest.php
```

## Déploiement

CI/CD avec GitHub Actions pour automatiser les tests et le déploiement.

## Sécurité

### Mesures implémentées

- **JWT** pour l'authentification stateless
- **Password hashing** avec Argon2ID
- **Requêtes préparées** pour éviter les injections SQL
- **Validation stricte** des données d'entrée
- **CORS** configuré pour le frontend
- **Gestion des rôles** pour la sécurité des accès