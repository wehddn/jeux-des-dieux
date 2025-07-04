<?php
namespace App\Controllers;

use App\Core\Auth;
use App\Core\Database;
use App\Core\Response;

final class FriendController
{
    /** POST /friends  body:{ "receiver_id":123 } */
    public function sendRequest(): void
    {
        $uid = Auth::userId();
        $data = json_decode(file_get_contents('php://input'), true);

        if (!isset($data['receiver_id']) || !is_numeric($data['receiver_id'])) {
            Response::json(400, ['error' => 'receiver_id required']);
        }
        $rid = (int)$data['receiver_id'];
        if ($rid === $uid) {
            Response::json(400, ['error' => 'Cannot add yourself']);
        }

        $pdo = Database::get();
        
        // Check if receiver user exists
        $stmt = $pdo->prepare('SELECT id FROM users WHERE id = ?');
        $stmt->execute([$rid]);
        if (!$stmt->fetch()) {
            Response::json(404, ['error' => 'User not found']);
        }
        
        // нет ли уже дружбы/заявки?
        $stmt = $pdo->prepare(
          'SELECT status FROM friend_requests
             WHERE (sender_id=? AND receiver_id=?)
                OR (sender_id=? AND receiver_id=?)');
        $stmt->execute([$uid,$rid,$rid,$uid]);
        if ($stmt->fetch()) {
            Response::json(409, ['error' => 'Request or friendship already exists']);
        }

        $pdo->prepare('INSERT INTO friend_requests (sender_id,receiver_id)
                       VALUES (?,?)')->execute([$uid,$rid]);

        Response::json(201, ['message' => 'Request sent']);
    }

    /** PUT /friends/accept  body:{ "sender_id":123 } */
    public function acceptRequest(): void
    {
        $this->changeStatus('accepted');
    }

    /** PUT /friends/decline  body:{ "sender_id":123 } */
    public function declineRequest(): void
    {
        $this->changeStatus('declined');
    }

    private function changeStatus(string $to): void
    {
        $uid  = Auth::userId();
        $data = json_decode(file_get_contents('php://input'), true);
        if (!isset($data['sender_id']) || !is_numeric($data['sender_id'])) {
            Response::json(400, ['error' => 'sender_id required']);
        }
        $sid = (int)$data['sender_id'];

        $pdo = Database::get();
        $stmt = $pdo->prepare(
            'SELECT id,status FROM friend_requests
              WHERE sender_id=? AND receiver_id=? AND status="pending"');
        $stmt->execute([$sid,$uid]);
        $req = $stmt->fetch();
        if (!$req) {
            Response::json(404, ['error' => 'Pending request not found']);
        }

        $pdo->prepare('UPDATE friend_requests SET status=? WHERE id=?')
            ->execute([$to, $req['id']]);

        Response::json(200, ['status' => $to]);
    }

    /** GET /friends/{id}/non-friends */
    public function nonFriends(int $id): void
    {
        Auth::requireSelfOrManager($id);

        $pdo = Database::get();
        // все пользователи, не связанные никакими заявками/дружбой
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
        $stmt = $pdo->prepare($sql);
        $stmt->execute(['uid'=>$id]);
        Response::json(200, $stmt->fetchAll());
    }

    /** GET /friends/{id}/pending-requests */
    public function pending(int $id): void
    {
        Auth::requireSelfOrManager($id);
        
        $pdo = Database::get();
        $stmt = $pdo->prepare(
          'SELECT fr.id,sender_id as user_id,u.name,fr.created_at
             FROM friend_requests fr
             JOIN users u ON u.id=fr.sender_id
            WHERE fr.receiver_id=? AND fr.status="pending"');
        $stmt->execute([$id]);
        Response::json(200, $stmt->fetchAll());
    }

    /** GET /friends/{id}/list */
    public function list(int $id): void
    {
        Auth::requireSelfOrManager($id);
        
        $pdo = Database::get();
        $sql = "
          SELECT u.id,u.name
            FROM friend_requests fr
            JOIN users u ON u.id = CASE
                  WHEN fr.sender_id=:uid THEN fr.receiver_id
                  ELSE fr.sender_id END
           WHERE (fr.sender_id=:uid OR fr.receiver_id=:uid)
             AND fr.status='accepted'";
        $stmt = $pdo->prepare($sql);
        $stmt->execute(['uid'=>$id]);
        Response::json(200, $stmt->fetchAll());
    }

    /** DELETE /friends - Remove an existing friendship/friend request (Admin only) 
     *  body: { "user1_id": 123, "user2_id": 456 } */
    public function removeFriendship(): void
    {
        Auth::requireAdmin(); // Only admins can remove friendships
        
        $data = json_decode(file_get_contents('php://input'), true);
        if (!isset($data['user1_id']) || !is_numeric($data['user1_id']) ||
            !isset($data['user2_id']) || !is_numeric($data['user2_id'])) {
            Response::json(400, ['error' => 'user1_id and user2_id required']);
        }
        
        $user1Id = (int)$data['user1_id'];
        $user2Id = (int)$data['user2_id'];
        
        if ($user1Id === $user2Id) {
            Response::json(400, ['error' => 'Cannot remove friendship with oneself']);
        }
        
        $pdo = Database::get();
        
        // Find the specific friend request record between these two users (any status)
        $stmt = $pdo->prepare(
            'SELECT id, status FROM friend_requests
             WHERE (sender_id=? AND receiver_id=?) OR (sender_id=? AND receiver_id=?)');
        $stmt->execute([$user1Id, $user2Id, $user2Id, $user1Id]);
        $friendship = $stmt->fetch();
        
        if (!$friendship) {
            Response::json(404, ['error' => 'Friend request not found between specified users']);
        }
        
        // Delete the friend request record (regardless of status)
        $pdo->prepare('DELETE FROM friend_requests WHERE id=?')
            ->execute([$friendship['id']]);
            
        Response::json(200, ['message' => 'Friend request removed']);
    }
}
