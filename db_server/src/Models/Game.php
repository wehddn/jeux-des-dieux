<?php
namespace App\Models;

final class Game extends Model
{
    protected const TABLE = 'games';

    public const STATUS_WAITING = 'waiting';
    public const STATUS_IN_PROGRESS = 'in_progress';
    public const STATUS_FINISHED = 'finished';

    private const VALID_STATUSES = [
        self::STATUS_WAITING,
        self::STATUS_IN_PROGRESS,
        self::STATUS_FINISHED
    ];

    public function id(): int { return $this->get('id'); }
    public function name(): string { return $this->get('name'); }
    public function creatorId(): int { return $this->get('created_by'); }
    public function status(): string { return $this->get('status'); }
    public function isPrivate(): bool { return (bool)$this->get('is_private'); }
    public function createdAt(): string { return $this->get('created_at'); }

    public static function createGame(string $name, int $creatorId, bool $isPrivate = false, ?string $password = null): self
    {
        if (!User::find($creatorId)) {
            throw new \InvalidArgumentException('Creator user not found');
        }

        $passwordHash = null;
        if ($isPrivate && !empty($password)) {
            $passwordHash = password_hash($password, PASSWORD_DEFAULT);
        }

        $game = self::create([
            'name' => $name,
            'created_by' => $creatorId,
            'is_private' => $isPrivate,
            'password' => $passwordHash,
            'status' => self::STATUS_WAITING
        ]);

        // Creator automatically becomes a player
        $game->addPlayer($creatorId);

        return $game;
    }

    public static function getAllGames(): array
    {
        $stmt = self::db()->query(
            'SELECT g.id, g.name, g.status, g.is_private, u.name AS creator, g.created_at
             FROM games g 
             JOIN users u ON u.id = g.created_by
             ORDER BY g.created_at DESC'
        );
        return $stmt->fetchAll();
    }

    public static function getGameDetails(int $gameId): ?array
    {
        $stmt = self::db()->prepare(
            'SELECT g.id, g.name, g.status, g.is_private, u.name AS creator, g.created_at
             FROM games g 
             JOIN users u ON u.id = g.created_by
             WHERE g.id = ?'
        );
        $stmt->execute([$gameId]);
        $game = $stmt->fetch();

        if (!$game) {
            return null;
        }

        $playersStmt = self::db()->prepare(
            'SELECT u.id, u.name
             FROM game_players gp 
             JOIN users u ON u.id = gp.user_id
             WHERE gp.game_id = ?'
        );
        $playersStmt->execute([$gameId]);
        $game['players'] = $playersStmt->fetchAll();

        return $game;
    }

    public function addPlayer(int $userId): void
    {
        $stmt = self::db()->prepare(
            'INSERT IGNORE INTO game_players (game_id, user_id) VALUES (?, ?)'
        );
        $stmt->execute([$this->id(), $userId]);
    }

    public function removePlayer(int $userId): void
    {
        $stmt = self::db()->prepare(
            'DELETE FROM game_players WHERE game_id = ? AND user_id = ?'
        );
        $stmt->execute([$this->id(), $userId]);
    }

    public function updatePlayers(array $playersToAdd = [], array $playersToRemove = []): array
    {
        $changes = ['added' => [], 'removed' => []];

        foreach ($playersToAdd as $playerId) {
            $this->addPlayer($playerId);
            $changes['added'][] = $playerId;
        }

        foreach ($playersToRemove as $playerId) {
            $this->removePlayer($playerId);
            $changes['removed'][] = $playerId;
        }

        return $changes;
    }

    public function setStatus(string $status): void
    {
        if (!in_array($status, self::VALID_STATUSES, true)) {
            throw new \InvalidArgumentException('Invalid status');
        }

        $this->update(['status' => $status]);
    }

    public function isCreator(int $userId): bool
    {
        return $this->creatorId() === $userId;
    }

    public function getPlayers(): array
    {
        $stmt = self::db()->prepare(
            'SELECT u.id, u.name
             FROM game_players gp 
             JOIN users u ON u.id = gp.user_id
             WHERE gp.game_id = ?'
        );
        $stmt->execute([$this->id()]);
        return $stmt->fetchAll();
    }

    public function hasPlayer(int $userId): bool
    {
        $stmt = self::db()->prepare(
            'SELECT 1 FROM game_players WHERE game_id = ? AND user_id = ?'
        );
        $stmt->execute([$this->id(), $userId]);
        return $stmt->fetch() !== false;
    }

    public function deleteGame(): void
    {
        $stmt = self::db()->prepare('DELETE FROM game_players WHERE game_id = ?');
        $stmt->execute([$this->id()]);

        $stmt = self::db()->prepare('DELETE FROM games WHERE id = ?');
        $stmt->execute([$this->id()]);
    }

    public static function getValidStatuses(): array
    {
        return self::VALID_STATUSES;
    }

    public function verifyPassword(string $password): bool
    {
        if (!$this->isPrivate()) {
            return true;
        }
        
        $hashedPassword = $this->get('password');
        if (empty($hashedPassword)) {
            return empty($password);
        }
        
        return password_verify($password, $hashedPassword);
    }

    public static function getAllGamesForAdmin(): array
    {
        $stmt = self::db()->prepare('
            SELECT 
                g.id,
                g.name,
                g.status,
                g.is_private,
                g.created_at,
                g.created_by,
                u.name as creator_name,
                u.email as creator_email,
                COUNT(gp.user_id) as player_count
            FROM games g
            LEFT JOIN users u ON g.created_by = u.id
            LEFT JOIN game_players gp ON g.id = gp.game_id
            GROUP BY g.id, g.name, g.status, g.is_private, g.created_at, g.created_by, u.name, u.email
            ORDER BY g.created_at DESC
        ');
        $stmt->execute();
        return $stmt->fetchAll(\PDO::FETCH_ASSOC);
    }
}
