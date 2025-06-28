<?php
namespace App\Core;

final class EventLogger
{
    public static function log(string $type, string $desc, ?int $uid = null): void
    {
        $pdo = Database::get();
        $stmt = $pdo->prepare(
            'INSERT INTO event_log (event_type, description, user_id) VALUES (?,?,?)');
        $stmt->execute([$type, $desc, $uid]);
    }

    public static function error(string $type, string $message, ?int $uid = null): void
    {
        self::log($type . '_error', $message, $uid);
    }
}
