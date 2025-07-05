<?php
namespace App\Controllers;

use App\Core\Auth;
use App\Core\Response;
use App\Models\FriendRequest;

final class FriendController
{
    /** POST /friends  body:{ "receiver_id":123 } */
    public function sendRequest(): void
    {
        $uid = Auth::userId();
        $data = json_decode(file_get_contents('php://input'), true);

        // Validate input
        if (!isset($data['receiver_id']) || !is_numeric($data['receiver_id'])) {
            Response::json(400, ['error' => 'receiver_id required']);
            return;
        }
        
        $receiverId = (int)$data['receiver_id'];

        try {
            FriendRequest::sendRequest($uid, $receiverId);
            Response::json(201, ['message' => 'Request sent']);
        } catch (\InvalidArgumentException $e) {
            // Handle different types of InvalidArgumentException
            if ($e->getMessage() === 'User not found') {
                Response::json(404, ['error' => $e->getMessage()]);
            } else {
                Response::json(400, ['error' => $e->getMessage()]);
            }
        } catch (\RuntimeException $e) {
            Response::json(409, ['error' => $e->getMessage()]);
        } catch (\Exception $e) {
            error_log('Send friend request error: ' . $e->getMessage());
            Response::json(500, ['error' => 'Failed to send friend request']);
        }
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
        $uid = Auth::userId();
        $data = json_decode(file_get_contents('php://input'), true);
        
        // Validate input
        if (!isset($data['sender_id']) || !is_numeric($data['sender_id'])) {
            Response::json(400, ['error' => 'sender_id required']);
            return;
        }
        
        $senderId = (int)$data['sender_id'];

        try {
            $request = FriendRequest::findPendingRequest($senderId, $uid);
            if (!$request) {
                Response::json(404, ['error' => 'Pending request not found']);
                return;
            }

            if ($to === 'accepted') {
                $request->accept();
            } else {
                $request->decline();
            }

            Response::json(200, ['status' => $to]);
        } catch (\Exception $e) {
            error_log('Change friend request status error: ' . $e->getMessage());
            Response::json(500, ['error' => 'Failed to update request status']);
        }
    }

    /** GET /friends/{id}/non-friends */
    public function nonFriends(int $id): void
    {
        Auth::requireSelfOrManager($id);

        try {
            $nonFriends = FriendRequest::getNonFriends($id);
            Response::json(200, $nonFriends);
        } catch (\Exception $e) {
            error_log('Get non-friends error: ' . $e->getMessage());
            Response::json(500, ['error' => 'Failed to retrieve non-friends']);
        }
    }

    /** GET /friends/{id}/pending-requests */
    public function pending(int $id): void
    {
        Auth::requireSelfOrManager($id);
        
        try {
            $pendingRequests = FriendRequest::getPendingRequests($id);
            Response::json(200, $pendingRequests);
        } catch (\Exception $e) {
            error_log('Get pending requests error: ' . $e->getMessage());
            Response::json(500, ['error' => 'Failed to retrieve pending requests']);
        }
    }

    /** GET /friends/{id}/list */
    public function list(int $id): void
    {
        Auth::requireSelfOrManager($id);
        
        try {
            $friends = FriendRequest::getFriends($id);
            Response::json(200, $friends);
        } catch (\Exception $e) {
            error_log('Get friends list error: ' . $e->getMessage());
            Response::json(500, ['error' => 'Failed to retrieve friends list']);
        }
    }

    /** DELETE /friends - Remove an existing friendship/friend request (Admin only) 
     *  body: { "user1_id": 123, "user2_id": 456 } */
    public function removeFriendship(): void
    {
        Auth::requireAdmin(); // Only admins can remove friendships
        
        $data = json_decode(file_get_contents('php://input'), true);
        
        // Validate input
        if (!isset($data['user1_id']) || !is_numeric($data['user1_id']) ||
            !isset($data['user2_id']) || !is_numeric($data['user2_id'])) {
            Response::json(400, ['error' => 'user1_id and user2_id required']);
            return;
        }
        
        $user1Id = (int)$data['user1_id'];
        $user2Id = (int)$data['user2_id'];

        try {
            FriendRequest::removeBetweenUsers($user1Id, $user2Id);
            Response::json(200, ['message' => 'Friend request removed']);
        } catch (\InvalidArgumentException $e) {
            Response::json(400, ['error' => $e->getMessage()]);
        } catch (\RuntimeException $e) {
            Response::json(404, ['error' => $e->getMessage()]);
        } catch (\Exception $e) {
            error_log('Remove friendship error: ' . $e->getMessage());
            Response::json(500, ['error' => 'Failed to remove friendship']);
        }
    }
}
