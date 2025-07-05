<?php
namespace App\Models;

final class FriendRequest extends Model
{
    protected const TABLE = 'friend_requests';

    // Status constants
    public const STATUS_PENDING = 'pending';
    public const STATUS_ACCEPTED = 'accepted';
    public const STATUS_DECLINED = 'declined';

    // Getter methods
    public function senderId(): int { return $this->get('sender_id'); }
    public function receiverId(): int { return $this->get('receiver_id'); }
    public function status(): string { return $this->get('status'); }
    public function createdAt(): string { return $this->get('created_at'); }

    // Instance methods
    public function accept(): void { $this->update(['status' => self::STATUS_ACCEPTED]); }
    public function decline(): void { $this->update(['status' => self::STATUS_DECLINED]); }

    /**
     * Send a friend request
     */
    public static function sendRequest(int $senderId, int $receiverId): self
    {
        // Validate users exist
        if (!User::find($senderId) || !User::find($receiverId)) {
            throw new \InvalidArgumentException('User not found');
        }

        // Cannot send request to yourself
        if ($senderId === $receiverId) {
            throw new \InvalidArgumentException('Cannot add yourself');
        }

        // Check if request or friendship already exists
        if (self::relationshipExists($senderId, $receiverId)) {
            throw new \RuntimeException('Request or friendship already exists');
        }

        return self::create([
            'sender_id' => $senderId,
            'receiver_id' => $receiverId,
            'status' => self::STATUS_PENDING
        ]);
    }

    /**
     * Check if any relationship exists between two users
     */
    public static function relationshipExists(int $userId1, int $userId2): bool
    {
        $stmt = self::db()->prepare(
            'SELECT 1 FROM friend_requests 
             WHERE (sender_id=? AND receiver_id=?) OR (sender_id=? AND receiver_id=?)'
        );
        $stmt->execute([$userId1, $userId2, $userId2, $userId1]);
        return $stmt->fetch() !== false;
    }

    /**
     * Find pending request from specific sender to receiver
     */
    public static function findPendingRequest(int $senderId, int $receiverId): ?self
    {
        $stmt = self::db()->prepare(
            'SELECT * FROM friend_requests 
             WHERE sender_id=? AND receiver_id=? AND status=?'
        );
        $stmt->execute([$senderId, $receiverId, self::STATUS_PENDING]);
        $data = $stmt->fetch();
        return $data ? new self($data) : null;
    }

    /**
     * Get users who are not friends and have no pending requests
     */
    public static function getNonFriends(int $userId): array
    {
        $sql = "
            SELECT u.id, u.name
            FROM users u
            WHERE u.id <> :uid
              AND u.id NOT IN (
                SELECT CASE
                       WHEN sender_id = :uid THEN receiver_id
                       ELSE sender_id END
                  FROM friend_requests
                 WHERE sender_id=:uid OR receiver_id=:uid
              )";
        $stmt = self::db()->prepare($sql);
        $stmt->execute(['uid' => $userId]);
        return $stmt->fetchAll();
    }

    /**
     * Get pending friend requests for a user (as receiver)
     */
    public static function getPendingRequests(int $userId): array
    {
        $stmt = self::db()->prepare(
            'SELECT fr.id, sender_id as user_id, u.name, fr.created_at
             FROM friend_requests fr
             JOIN users u ON u.id = fr.sender_id
             WHERE fr.receiver_id=? AND fr.status=?'
        );
        $stmt->execute([$userId, self::STATUS_PENDING]);
        return $stmt->fetchAll();
    }

    /**
     * Get list of friends for a user
     */
    public static function getFriends(int $userId): array
    {
        $sql = "
            SELECT u.id, u.name
            FROM friend_requests fr
            JOIN users u ON u.id = CASE
                  WHEN fr.sender_id=:uid THEN fr.receiver_id
                  ELSE fr.sender_id END
            WHERE (fr.sender_id=:uid OR fr.receiver_id=:uid)
              AND fr.status=:status";
        $stmt = self::db()->prepare($sql);
        $stmt->execute(['uid' => $userId, 'status' => self::STATUS_ACCEPTED]);
        return $stmt->fetchAll();
    }

    /**
     * Find friendship/request between two users (any status)
     */
    public static function findBetweenUsers(int $userId1, int $userId2): ?self
    {
        $stmt = self::db()->prepare(
            'SELECT * FROM friend_requests
             WHERE (sender_id=? AND receiver_id=?) OR (sender_id=? AND receiver_id=?)'
        );
        $stmt->execute([$userId1, $userId2, $userId2, $userId1]);
        $data = $stmt->fetch();
        return $data ? new self($data) : null;
    }

    /**
     * Remove friendship/request between two users
     */
    public static function removeBetweenUsers(int $userId1, int $userId2): bool
    {
        if ($userId1 === $userId2) {
            throw new \InvalidArgumentException('Cannot remove friendship with oneself');
        }

        $friendship = self::findBetweenUsers($userId1, $userId2);
        if (!$friendship) {
            throw new \RuntimeException('Friend request not found between specified users');
        }

        $stmt = self::db()->prepare('DELETE FROM friend_requests WHERE id=?');
        $stmt->execute([$friendship->get('id')]);
        return true;
    }
}
