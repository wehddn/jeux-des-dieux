<?php
namespace App\Models;

final class Game extends Model
{
    protected const TABLE = 'games';

    public function creatorId(): int { return $this->get('created_by'); }

    /** Добавить игрока в игру */
    public function addPlayer(int $uid): void
    {
        self::db()->prepare(
          'INSERT IGNORE INTO game_players (game_id,user_id) VALUES (?,?)')
          ->execute([$this->id(), $uid]);
    }

    /** Убрать игрока */
    public function removePlayer(int $uid): void
    {
        self::db()->prepare(
          'DELETE FROM game_players WHERE game_id=? AND user_id=?')
          ->execute([$this->id(), $uid]);
    }

    public function id(): int { return $this->get('id'); }
}
