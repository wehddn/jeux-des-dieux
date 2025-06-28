<?php
namespace App\Models;

final class FriendRequest extends Model
{
    protected const TABLE = 'friend_requests';

    public function senderId(): int   { return $this->get('sender_id'); }
    public function receiverId(): int { return $this->get('receiver_id'); }

    public function accept(): void   { $this->update(['status'=>'accepted']); }
    public function decline(): void  { $this->update(['status'=>'declined']); }
}
