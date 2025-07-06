<?php
namespace App\Controllers;

use App\Core\Auth;
use App\Core\Response;
use App\Models\Block;

final class BlockController
{
    /** POST /users/{id}/block */
    public function blockUser(int $id): void
    {
        Auth::requireManager();
        Auth::requireNotSelf($id, 'blocking');
        
        $currentUserId = Auth::userId();
        
        try {
            $targetUser = \App\Models\User::find($id);
            if (!$targetUser) {
                Response::json(404, ['error' => 'User not found']);
                return;
            }
            
            if ($targetUser->role() === \App\Models\User::ROLE_ADMIN) {
                Response::json(403, ['error' => 'Cannot block administrator']);
                return;
            }
            
            Block::blockUser($id, $currentUserId);
            Response::json(200, ['message' => 'User blocked successfully']);
        } catch (\InvalidArgumentException $e) {
            Response::json(404, ['error' => 'User not found']);
        } catch (\RuntimeException $e) {
            Response::json(409, ['error' => $e->getMessage()]);
        } catch (\Exception $e) {
            error_log('Block user error: ' . $e->getMessage());
            Response::json(500, ['error' => 'Failed to block user']);
        }
    }
    
    /** DELETE /users/{id}/block */
    public function unblockUser(int $id): void
    {
        Auth::requireManager();
        Auth::requireNotSelf($id, 'unblocking');
        
        try {
            $targetUser = \App\Models\User::find($id);
            if (!$targetUser) {
                Response::json(404, ['error' => 'User not found']);
                return;
            }
            
            if ($targetUser->role() === \App\Models\User::ROLE_ADMIN) {
                Response::json(403, ['error' => 'Cannot unblock administrator']);
                return;
            }
            
            Block::unblockUser($id);
            Response::json(200, ['message' => 'User unblocked successfully']);
        } catch (\RuntimeException $e) {
            Response::json(404, ['error' => $e->getMessage()]);
        } catch (\Exception $e) {
            error_log('Unblock user error: ' . $e->getMessage());
            Response::json(500, ['error' => 'Failed to unblock user']);
        }
    }
        
    /** GET /blocked-users */
    public function listBlockedUsers(): void
    {
        Auth::requireManager();
        
        try {
            $blockedUsers = Block::getBlockedUsers();
            Response::json(200, $blockedUsers);
        } catch (\Exception $e) {
            error_log('List blocked users error: ' . $e->getMessage());
            Response::json(500, ['error' => 'Failed to retrieve blocked users']);
        }
    }
}
