<?php
namespace App\Models;

final class Block extends Model
{
    protected const TABLE = 'blocklist';

    public static function isUserBlocked(int $userId): bool
    {
        $stmt = self::db()->prepare('SELECT 1 FROM blocklist WHERE blocked_user_id = ?');
        $stmt->execute([$userId]);
        return $stmt->fetch() !== false;
    }

    public static function blockUser(int $userId, int $blockerUserId): void
    {
        if (!User::find($userId)) {
            throw new \InvalidArgumentException('User not found');
        }

        if (self::isUserBlocked($userId)) {
            throw new \RuntimeException('User already blocked');
        }

        self::create([
            'blocked_user_id' => $userId,
            'blocker_user_id' => $blockerUserId,
            'blocked_at' => date('Y-m-d H:i:s')
        ]);
    }

    public static function unblockUser(int $userId): void
    {
        if (!self::isUserBlocked($userId)) {
            throw new \RuntimeException('User is not blocked');
        }

        $stmt = self::db()->prepare('DELETE FROM blocklist WHERE blocked_user_id = ?');
        $stmt->execute([$userId]);
    }

    public static function getBlockedUsers(): array
    {
        $stmt = self::db()->prepare('
            SELECT 
                u.id,
                u.name,
                u.email,
                b.blocked_at,
                blocker.name as blocked_by_name
            FROM blocklist b
            JOIN users u ON b.blocked_user_id = u.id
            JOIN users blocker ON b.blocker_user_id = blocker.id
            ORDER BY b.blocked_at DESC
        ');
        $stmt->execute();
        return $stmt->fetchAll();
    }

    public static function getBlockRecord(int $userId): ?array
    {
        $stmt = self::db()->prepare('
            SELECT 
                b.*,
                u.name as blocked_user_name,
                blocker.name as blocked_by_name
            FROM blocklist b
            JOIN users u ON b.blocked_user_id = u.id
            JOIN users blocker ON b.blocker_user_id = blocker.id
            WHERE b.blocked_user_id = ?
        ');
        $stmt->execute([$userId]);
        return $stmt->fetch() ?: null;
    }

    public function getBlockedUserId(): int { return $this->get('blocked_user_id'); }
    public function getBlockerUserId(): int { return $this->get('blocker_user_id'); }
    public function getBlockedAt(): string { return $this->get('blocked_at'); }
}
