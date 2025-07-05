<?php
namespace App\Models;

final class Game extends Model
{
    protected const TABLE = 'games';

    // Status constants
    public const STATUS_WAITING = 'waiting';
    public const STATUS_IN_PROGRESS = 'in_progress';
    public const STATUS_FINISHED = 'finished';

    // Valid status array
    private const VALID_STATUSES = [
        self::STATUS_WAITING,
        self::STATUS_IN_PROGRESS,
        self::STATUS_FINISHED
    ];

    // Getter methods
    public function id(): int { return $this->get('id'); }
    public function name(): string { return $this->get('name'); }
    public function creatorId(): int { return $this->get('created_by'); }
    public function status(): string { return $this->get('status'); }
    public function isPrivate(): bool { return (bool)$this->get('is_private'); }
    public function createdAt(): string { return $this->get('created_at'); }

    /**
     * Create a new game
     */
    public static function createGame(string $name, int $creatorId, bool $isPrivate = false, ?string $password = null): self
    {
        // Validate user exists
        if (!User::find($creatorId)) {
            throw new \InvalidArgumentException('Creator user not found');
        }

        // Hash password if provided for private game
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

    /**
     * Get all games with creator information
     */
    public static function getAllGames(): array
    {
        $stmt = self::db()->query(
            'SELECT g.id, g.name, g.status, u.name AS creator, g.created_at
             FROM games g 
             JOIN users u ON u.id = g.created_by
             ORDER BY g.created_at DESC'
        );
        return $stmt->fetchAll();
    }

    /**
     * Get game details with creator and players
     */
    public static function getGameDetails(int $gameId): ?array
    {
        // Get game basic info
        $stmt = self::db()->prepare(
            'SELECT g.id, g.name, g.status, u.name AS creator, g.created_at
             FROM games g 
             JOIN users u ON u.id = g.created_by
             WHERE g.id = ?'
        );
        $stmt->execute([$gameId]);
        $game = $stmt->fetch();

        if (!$game) {
            return null;
        }

        // Get players
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

    /**
     * Add a player to the game
     */
    public function addPlayer(int $userId): void
    {
        $stmt = self::db()->prepare(
            'INSERT IGNORE INTO game_players (game_id, user_id) VALUES (?, ?)'
        );
        $stmt->execute([$this->id(), $userId]);
    }

    /**
     * Remove a player from the game
     */
    public function removePlayer(int $userId): void
    {
        $stmt = self::db()->prepare(
            'DELETE FROM game_players WHERE game_id = ? AND user_id = ?'
        );
        $stmt->execute([$this->id(), $userId]);
    }

    /**
     * Update players (add and remove)
     */
    public function updatePlayers(array $playersToAdd = [], array $playersToRemove = []): array
    {
        $changes = ['added' => [], 'removed' => []];

        // Add players
        foreach ($playersToAdd as $playerId) {
            $this->addPlayer($playerId);
            $changes['added'][] = $playerId;
        }

        // Remove players
        foreach ($playersToRemove as $playerId) {
            $this->removePlayer($playerId);
            $changes['removed'][] = $playerId;
        }

        return $changes;
    }

    /**
     * Update game status
     */
    public function setStatus(string $status): void
    {
        if (!in_array($status, self::VALID_STATUSES, true)) {
            throw new \InvalidArgumentException('Invalid status');
        }

        $this->update(['status' => $status]);
    }

    /**
     * Check if user is the creator of the game
     */
    public function isCreator(int $userId): bool
    {
        return $this->creatorId() === $userId;
    }

    /**
     * Get all players of the game
     */
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

    /**
     * Check if user is a player in the game
     */
    public function hasPlayer(int $userId): bool
    {
        $stmt = self::db()->prepare(
            'SELECT 1 FROM game_players WHERE game_id = ? AND user_id = ?'
        );
        $stmt->execute([$this->id(), $userId]);
        return $stmt->fetch() !== false;
    }

    /**
     * Delete the game and associated data
     */
    public function deleteGame(): void
    {
        // Delete game players first (due to foreign key constraints)
        $stmt = self::db()->prepare('DELETE FROM game_players WHERE game_id = ?');
        $stmt->execute([$this->id()]);

        // Delete the game itself
        $stmt = self::db()->prepare('DELETE FROM games WHERE id = ?');
        $stmt->execute([$this->id()]);
    }

    /**
     * Get valid statuses
     */
    public static function getValidStatuses(): array
    {
        return self::VALID_STATUSES;
    }
}
