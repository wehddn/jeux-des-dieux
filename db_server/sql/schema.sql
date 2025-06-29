CREATE TABLE roles (
  id TINYINT UNSIGNED PRIMARY KEY,
  name VARCHAR(20) NOT NULL UNIQUE
);

INSERT INTO roles (id, name) VALUES
  (1,'user'), (2,'manager'), (3,'admin');

CREATE TABLE users (
  id        BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  name      VARCHAR(80) NOT NULL,
  email     VARCHAR(120) NOT NULL UNIQUE,
  password  VARCHAR(255) NOT NULL,
  photo     VARCHAR(50),
  role_id   TINYINT UNSIGNED NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX(role_id),
  CONSTRAINT fk_users_role FOREIGN KEY (role_id) REFERENCES roles(id)
);

CREATE TABLE friend_requests (
  id          BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  sender_id   BIGINT UNSIGNED NOT NULL,
  receiver_id BIGINT UNSIGNED NOT NULL,
  status      ENUM('pending','accepted','declined') DEFAULT 'pending',
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_request (sender_id, receiver_id),
  CONSTRAINT fk_fr_sender  FOREIGN KEY (sender_id)  REFERENCES users(id),
  CONSTRAINT fk_fr_receiver FOREIGN KEY (receiver_id) REFERENCES users(id)
);

CREATE TABLE games (
  id          BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  name        VARCHAR(100),
  status      ENUM('waiting','in_progress','finished') DEFAULT 'waiting',
  is_private TINYINT(1) DEFAULT 0,
  password   VARCHAR(255) NULL,
  created_by  BIGINT UNSIGNED NOT NULL,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_games_creator FOREIGN KEY (created_by) REFERENCES users(id)
);

CREATE TABLE game_players (
  game_id BIGINT UNSIGNED,
  user_id BIGINT UNSIGNED,
  PRIMARY KEY (game_id, user_id),
  CONSTRAINT fk_gp_game FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE CASCADE,
  CONSTRAINT fk_gp_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE audit_log (
  id          BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  table_name  VARCHAR(64),
  record_id   BIGINT UNSIGNED,
  old_data    JSON,
  new_data    JSON,
  changed_by  BIGINT UNSIGNED,
  changed_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE game_players
  ADD INDEX ix_game (game_id),
  ADD INDEX ix_user (user_id);

-- Database Triggers for Audit Logging

-- Users table triggers
DELIMITER $$

CREATE TRIGGER users_after_insert 
AFTER INSERT ON users 
FOR EACH ROW 
BEGIN
  INSERT INTO audit_log (table_name, record_id, old_data, new_data, changed_by, changed_at)
  VALUES ('users', NEW.id, NULL, JSON_OBJECT(
    'id', NEW.id,
    'name', NEW.name,
    'email', NEW.email,
    'role_id', NEW.role_id,
    'created_at', NEW.created_at
  ), NEW.id, NOW());
END$$

CREATE TRIGGER users_after_update 
AFTER UPDATE ON users 
FOR EACH ROW 
BEGIN
  INSERT INTO audit_log (table_name, record_id, old_data, new_data, changed_by, changed_at)
  VALUES ('users', NEW.id, JSON_OBJECT(
    'id', OLD.id,
    'name', OLD.name,
    'email', OLD.email,
    'role_id', OLD.role_id
  ), JSON_OBJECT(
    'id', NEW.id,
    'name', NEW.name,
    'email', NEW.email,
    'role_id', NEW.role_id
  ), NEW.id, NOW());
END$$

CREATE TRIGGER users_after_delete 
AFTER DELETE ON users 
FOR EACH ROW 
BEGIN
  INSERT INTO audit_log (table_name, record_id, old_data, new_data, changed_by, changed_at)
  VALUES ('users', OLD.id, JSON_OBJECT(
    'id', OLD.id,
    'name', OLD.name,
    'email', OLD.email,
    'role_id', OLD.role_id
  ), NULL, OLD.id, NOW());
END$$

-- Games table triggers
CREATE TRIGGER games_after_insert 
AFTER INSERT ON games 
FOR EACH ROW 
BEGIN
  INSERT INTO audit_log (table_name, record_id, old_data, new_data, changed_by, changed_at)
  VALUES ('games', NEW.id, NULL, JSON_OBJECT(
    'id', NEW.id,
    'name', NEW.name,
    'status', NEW.status,
    'is_private', NEW.is_private,
    'created_by', NEW.created_by,
    'created_at', NEW.created_at
  ), NEW.created_by, NOW());
END$$

CREATE TRIGGER games_after_update 
AFTER UPDATE ON games 
FOR EACH ROW 
BEGIN
  INSERT INTO audit_log (table_name, record_id, old_data, new_data, changed_by, changed_at)
  VALUES ('games', NEW.id, JSON_OBJECT(
    'id', OLD.id,
    'name', OLD.name,
    'status', OLD.status,
    'is_private', OLD.is_private,
    'created_by', OLD.created_by
  ), JSON_OBJECT(
    'id', NEW.id,
    'name', NEW.name,
    'status', NEW.status,
    'is_private', NEW.is_private,
    'created_by', NEW.created_by
  ), NEW.created_by, NOW());
END$$

CREATE TRIGGER games_after_delete 
AFTER DELETE ON games 
FOR EACH ROW 
BEGIN
  INSERT INTO audit_log (table_name, record_id, old_data, new_data, changed_by, changed_at)
  VALUES ('games', OLD.id, JSON_OBJECT(
    'id', OLD.id,
    'name', OLD.name,
    'status', OLD.status,
    'is_private', OLD.is_private,
    'created_by', OLD.created_by
  ), NULL, OLD.created_by, NOW());
END$$

-- Friend requests table triggers
CREATE TRIGGER friend_requests_after_insert 
AFTER INSERT ON friend_requests 
FOR EACH ROW 
BEGIN
  INSERT INTO audit_log (table_name, record_id, old_data, new_data, changed_by, changed_at)
  VALUES ('friend_requests', NEW.id, NULL, JSON_OBJECT(
    'id', NEW.id,
    'sender_id', NEW.sender_id,
    'receiver_id', NEW.receiver_id,
    'status', NEW.status,
    'created_at', NEW.created_at
  ), NEW.sender_id, NOW());
END$$

CREATE TRIGGER friend_requests_after_update 
AFTER UPDATE ON friend_requests 
FOR EACH ROW 
BEGIN
  INSERT INTO audit_log (table_name, record_id, old_data, new_data, changed_by, changed_at)
  VALUES ('friend_requests', NEW.id, JSON_OBJECT(
    'id', OLD.id,
    'sender_id', OLD.sender_id,
    'receiver_id', OLD.receiver_id,
    'status', OLD.status
  ), JSON_OBJECT(
    'id', NEW.id,
    'sender_id', NEW.sender_id,
    'receiver_id', NEW.receiver_id,
    'status', NEW.status
  ), NEW.sender_id, NOW());
END$$

CREATE TRIGGER friend_requests_after_delete 
AFTER DELETE ON friend_requests 
FOR EACH ROW 
BEGIN
  INSERT INTO audit_log (table_name, record_id, old_data, new_data, changed_by, changed_at)
  VALUES ('friend_requests', OLD.id, JSON_OBJECT(
    'id', OLD.id,
    'sender_id', OLD.sender_id,
    'receiver_id', OLD.receiver_id,
    'status', OLD.status
  ), NULL, OLD.sender_id, NOW());
END$$

-- Game players table triggers
CREATE TRIGGER game_players_after_insert 
AFTER INSERT ON game_players 
FOR EACH ROW 
BEGIN
  INSERT INTO audit_log (table_name, record_id, old_data, new_data, changed_by, changed_at)
  VALUES ('game_players', CONCAT(NEW.game_id, '-', NEW.user_id), NULL, JSON_OBJECT(
    'game_id', NEW.game_id,
    'user_id', NEW.user_id
  ), NEW.user_id, NOW());
END$$

CREATE TRIGGER game_players_after_delete 
AFTER DELETE ON game_players 
FOR EACH ROW 
BEGIN
  INSERT INTO audit_log (table_name, record_id, old_data, new_data, changed_by, changed_at)
  VALUES ('game_players', CONCAT(OLD.game_id, '-', OLD.user_id), JSON_OBJECT(
    'game_id', OLD.game_id,
    'user_id', OLD.user_id
  ), NULL, OLD.user_id, NOW());
END$$

DELIMITER ;