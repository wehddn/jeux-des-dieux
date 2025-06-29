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
