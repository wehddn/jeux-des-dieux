<?php
namespace App\Controllers;

use App\Core\Auth;
use App\Core\Database;
use App\Core\Response;

final class BlockController
{
    /** POST /users/{id}/block */
    public function blockUser(int $id): void
    {
        Auth::requireAdmin();
        Auth::requireNotSelf($id, 'blocking');
        
        $currentUserId = Auth::userId();
        $pdo = Database::get();
        
        // Check if user exists
        $stmt = $pdo->prepare('SELECT id FROM users WHERE id = ?');
        $stmt->execute([$id]);
        if (!$stmt->fetch()) {
            Response::json(404, ['error' => 'User not found']);
        }
        
        // Check if user is already blocked
        $stmt = $pdo->prepare('SELECT 1 FROM blocklist WHERE blocked_user_id = ?');
        $stmt->execute([$id]);
        if ($stmt->fetch()) {
            Response::json(409, ['error' => 'User already blocked']);
        }
        
        // Block the user
        $stmt = $pdo->prepare('INSERT INTO blocklist (blocked_user_id, blocker_user_id, blocked_at) VALUES (?, ?, NOW())');
        $stmt->execute([$id, $currentUserId]);
        
        Response::json(200, ['message' => 'User blocked successfully']);
    }
    
    /** DELETE /users/{id}/block */
    public function unblockUser(int $id): void
    {
        Auth::requireAdmin();
        Auth::requireNotSelf($id, 'unblocking');
        
        $pdo = Database::get();
        
        // Check if user is blocked
        $stmt = $pdo->prepare('SELECT 1 FROM blocklist WHERE blocked_user_id = ?');
        $stmt->execute([$id]);
        if (!$stmt->fetch()) {
            Response::json(404, ['error' => 'User is not blocked']);
        }
        
        // Unblock the user
        $stmt = $pdo->prepare('DELETE FROM blocklist WHERE blocked_user_id = ?');
        $stmt->execute([$id]);
        
        Response::json(200, ['message' => 'User unblocked successfully']);
    }
    
    /** GET /blocked-users */
    public function listBlockedUsers(): void
    {
        Auth::requireManager();
        
        $pdo = Database::get();
        $stmt = $pdo->prepare('
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
        $blockedUsers = $stmt->fetchAll();
        
        Response::json(200, $blockedUsers);
    }
}
