<?php
// filepath: tests/FriendControllerTest.php

require_once 'BaseApiTest.php';

class FriendControllerTest extends BaseApiTest
{
    private $friend1Token;
    private $friend2Token;
    private $friend3Token;
    private $friend1Id;
    private $friend2Id;
    private $friend3Id;

    protected function setUp(): void
    {
        parent::setUp();
        
        // Setup test friend users and get their tokens and IDs
        $friend1Data = $this->getTokenAndIdForUser('friend1@friend1.friend1', 'friend1');
        $friend2Data = $this->getTokenAndIdForUser('friend2@friend2.friend2', 'friend2');
        $friend3Data = $this->getTokenAndIdForUser('friend3@friend3.friend3', 'friend3');
        
        $this->friend1Token = $friend1Data['token'];
        $this->friend1Id = $friend1Data['id'];
        
        $this->friend2Token = $friend2Data['token'];
        $this->friend2Id = $friend2Data['id'];
        
        $this->friend3Token = $friend3Data['token'];
        $this->friend3Id = $friend3Data['id'];
    }

    protected function tearDown(): void
    {
        // Clear all test friendships after each test
        $this->clearTestFriendships();
        parent::tearDown();
    }

    /**
     * Get authorization headers for specific friend
     */
    private function withFriend1Auth($additionalHeaders = [])
    {
        $authHeaders = ['Authorization: Bearer ' . $this->friend1Token];
        return array_merge($authHeaders, $additionalHeaders);
    }

    private function withFriend2Auth($additionalHeaders = [])
    {
        $authHeaders = ['Authorization: Bearer ' . $this->friend2Token];
        return array_merge($authHeaders, $additionalHeaders);
    }

    private function withFriend3Auth($additionalHeaders = [])
    {
        $authHeaders = ['Authorization: Bearer ' . $this->friend3Token];
        return array_merge($authHeaders, $additionalHeaders);
    }

    /**
     * Clear all test friendships - removes all friend_requests involving test users
     */
    public function clearTestFriendships(): void
    {
        $testUserIds = [$this->friend1Id, $this->friend2Id, $this->friend3Id];
        
        foreach ($testUserIds as $userId1) {
            foreach ($testUserIds as $userId2) {
                if ($userId1 !== $userId2) {
                    // Try to remove friendship between users (admin required)
                    $this->delete('/friends', [
                        'user1_id' => $userId1,
                        'user2_id' => $userId2
                    ], $this->withAdminAuth());
                }
            }
        }
    }

    /**
     * Helper method to create a friendship between two users
     */
    private function createFriendship(int $senderId, int $receiverId, string $senderToken, string $receiverToken): void
    {
        // Send friend request
        [$status, $response] = $this->post('/friends', [
            'receiver_id' => $receiverId
        ], ['Authorization: Bearer ' . $senderToken]);
        
        $this->assertEquals(201, $status, 'Failed to send friend request');
        
        // Accept friend request
        [$status, $response] = $this->put('/friends/accept', [
            'sender_id' => $senderId
        ], ['Authorization: Bearer ' . $receiverToken]);
        
        $this->assertEquals(200, $status, 'Failed to accept friend request');
    }

    /**
     * Test deleting a friendship
     */
    public function testDeleteFriendship(): void
    {
        // First create a friendship between friend1 and friend2
        $this->createFriendship(
            $this->friend1Id, 
            $this->friend2Id, 
            $this->friend1Token, 
            $this->friend2Token
        );

        // Verify friendship exists by checking friend list
        [$status, $response] = $this->get('/friends/' . $this->friend1Id . '/list', 
            $this->withFriend1Auth());
        
        $this->assertEquals(200, $status);
        $this->assertIsArray($response);
        $this->assertNotEmpty($response, 'Friend list should not be empty');
        
        $friendIds = array_column($response, 'id');
        $this->assertContains($this->friend2Id, $friendIds, 'Friend2 should be in friend1\'s list');

        // Now delete the friendship (admin required)
        [$status, $response] = $this->delete('/friends', [
            'user1_id' => $this->friend1Id,
            'user2_id' => $this->friend2Id
        ], $this->withAdminAuth());

        $this->assertEquals(200, $status, 'Failed to delete friendship');
        $this->assertIsArray($response);
        $this->assertEquals('Friend request removed', $response['message']);

        // Verify friendship no longer exists
        [$status, $response] = $this->get('/friends/' . $this->friend1Id . '/list', 
            $this->withFriend1Auth());
        
        $this->assertEquals(200, $status);
        $this->assertIsArray($response);
        
        $friendIds = array_column($response, 'id');
        $this->assertNotContains($this->friend2Id, $friendIds, 'Friend2 should not be in friend1\'s list after deletion');
    }
    
    // ====== SEND FRIEND REQUEST TESTS ======

    /**
     * Test sending a friend request successfully
     */
    public function testSendFriendRequestSuccess(): void
    {
        // Send friend request from friend1 to friend2
        [$status, $response] = $this->post('/friends', [
            'receiver_id' => $this->friend2Id
        ], $this->withFriend1Auth());

        $this->assertEquals(201, $status, 'Friend request should be sent successfully');
        $this->assertIsArray($response);
        $this->assertEquals('Request sent', $response['message']);

        // Verify the request appears in friend2's pending requests
        [$status, $response] = $this->get('/friends/' . $this->friend2Id . '/pending-requests', 
            $this->withFriend2Auth());
        
        $this->assertEquals(200, $status);
        $this->assertIsArray($response);
        $this->assertNotEmpty($response, 'Friend2 should have pending requests');
        
        $senderIds = array_column($response, 'user_id');
        $this->assertContains($this->friend1Id, $senderIds, 'Friend1 should appear in friend2\'s pending requests');
    }

    /**
     * Test sending a friend request to self (should fail)
     */
    public function testSendFriendRequestToSelf(): void
    {
        // Try to send friend request to self
        [$status, $response] = $this->post('/friends', [
            'receiver_id' => $this->friend1Id
        ], $this->withFriend1Auth());

        $this->assertEquals(400, $status, 'Friend request to self should fail');
        $this->assertIsArray($response);
        $this->assertEquals('Cannot add yourself', $response['error']);
    }

    /**
     * Test sending a friend request without receiver_id (should fail)
     */
    public function testSendFriendRequestMissingReceiver(): void
    {
        // Try to send friend request without receiver_id
        [$status, $response] = $this->post('/friends', [], $this->withFriend1Auth());

        $this->assertEquals(400, $status, 'Friend request without receiver_id should fail');
        $this->assertIsArray($response);
        $this->assertEquals('receiver_id required', $response['error']);

        // Also test with invalid receiver_id (non-numeric)
        [$status, $response] = $this->post('/friends', [
            'receiver_id' => 'invalid'
        ], $this->withFriend1Auth());

        $this->assertEquals(400, $status, 'Friend request with invalid receiver_id should fail');
        $this->assertIsArray($response);
        $this->assertEquals('receiver_id required', $response['error']);
    }

    /**
     * Test sending a friend request to nonexistent user (should fail)
     */
    public function testSendFriendRequestNonexistentUser(): void
    {
        // Try to send friend request to a user that doesn't exist
        $nonexistentUserId = 99999;
        
        [$status, $response] = $this->post('/friends', [
            'receiver_id' => $nonexistentUserId
        ], $this->withFriend1Auth());

        $this->assertEquals(404, $status, 'Friend request to nonexistent user should fail');
        $this->assertIsArray($response);
        $this->assertEquals('User not found', $response['error']);
    }

    public function testSendDuplicateFriendRequest(): void
    {
        // Send first friend request from friend1 to friend2
        [$status, $response] = $this->post('/friends', [
            'receiver_id' => $this->friend2Id
        ], $this->withFriend1Auth());

        $this->assertEquals(201, $status, 'First friend request should be sent successfully');
        $this->assertIsArray($response);
        $this->assertEquals('Request sent', $response['message']);

        // Try to send the same friend request again (should fail)
        [$status, $response] = $this->post('/friends', [
            'receiver_id' => $this->friend2Id
        ], $this->withFriend1Auth());

        $this->assertEquals(409, $status, 'Duplicate friend request should fail with conflict');
        $this->assertIsArray($response);
        $this->assertEquals('Request or friendship already exists', $response['error']);

        // Verify that friend2 still has only 1 pending request (not duplicated)
        [$status, $response] = $this->get('/friends/' . $this->friend2Id . '/pending-requests', 
            $this->withFriend2Auth());
        
        $this->assertEquals(200, $status);
        $this->assertIsArray($response);
        $this->assertCount(1, $response, 'Friend2 should have exactly 1 pending request, not duplicated');
        
        $senderIds = array_column($response, 'user_id');
        $this->assertContains($this->friend1Id, $senderIds, 'Friend1 should appear in friend2\'s pending requests');
    }

    // ====== GET NON-FRIENDS TESTS ======

    public function testGetNonFriendsSuccess(): void
    {
        // Initially, all test friends should be non-friends to each other
        [$status, $response] = $this->get('/friends/' . $this->friend1Id . '/non-friends', 
            $this->withFriend1Auth());

        $this->assertEquals(200, $status, 'Should get non-friends list successfully');
        $this->assertIsArray($response);
        
        // Should contain friend2 and friend3 as non-friends
        $nonFriendIds = array_column($response, 'id');
        $this->assertContains($this->friend2Id, $nonFriendIds, 'Friend2 should be in non-friends list');
        $this->assertContains($this->friend3Id, $nonFriendIds, 'Friend3 should be in non-friends list');
        $this->assertNotContains($this->friend1Id, $nonFriendIds, 'Friend1 should not appear in own non-friends list');

        // Create a friendship between friend1 and friend2
        $this->createFriendship(
            $this->friend1Id, 
            $this->friend2Id, 
            $this->friend1Token, 
            $this->friend2Token
        );

        // Now check non-friends list again - friend2 should no longer be there
        [$status, $response] = $this->get('/friends/' . $this->friend1Id . '/non-friends', 
            $this->withFriend1Auth());

        $this->assertEquals(200, $status);
        $this->assertIsArray($response);
        
        $nonFriendIds = array_column($response, 'id');
        $this->assertNotContains($this->friend2Id, $nonFriendIds, 'Friend2 should not be in non-friends list after becoming friends');
        $this->assertContains($this->friend3Id, $nonFriendIds, 'Friend3 should still be in non-friends list');
    }

    // ====== GET PENDING REQUESTS TESTS ======

    public function testGetPendingRequestsSuccess(): void
    {
        // Initially, friend2 should have no pending requests
        [$status, $response] = $this->get('/friends/' . $this->friend2Id . '/pending-requests', 
            $this->withFriend2Auth());

        $this->assertEquals(200, $status, 'Should get pending requests successfully');
        $this->assertIsArray($response);
        $this->assertEmpty($response, 'Should have no pending requests initially');

        // Send a friend request from friend1 to friend2
        [$status, $requestResponse] = $this->post('/friends', [
            'receiver_id' => $this->friend2Id
        ], $this->withFriend1Auth());
        $this->assertEquals(201, $status, 'Friend request should be sent');

        // Now friend2 should have 1 pending requests
        [$status, $response] = $this->get('/friends/' . $this->friend2Id . '/pending-requests', 
            $this->withFriend2Auth());

        $this->assertEquals(200, $status);
        $this->assertIsArray($response);
        $this->assertCount(1, $response, 'Should have 2 pending requests');

        $senderIds = array_column($response, 'user_id');
        $this->assertContains($this->friend1Id, $senderIds, 'Friend1 should be in pending requests');

        // Each request should have required fields
        foreach ($response as $request) {
            $this->assertArrayHasKey('id', $request);
            $this->assertArrayHasKey('user_id', $request);
            $this->assertArrayHasKey('name', $request);
            $this->assertArrayHasKey('created_at', $request);
        }
    }

    // ====== GET FRIENDS LIST TESTS ======
    
    public function testGetFriendsListSuccess(): void
    {
        // Initially, friend1 should have no friends
        [$status, $response] = $this->get('/friends/' . $this->friend1Id . '/list', 
            $this->withFriend1Auth());

        $this->assertEquals(200, $status, 'Should get friends list successfully');
        $this->assertIsArray($response);
        $this->assertEmpty($response, 'Should have no friends initially');

        // Create friendship between friend1 and friend2
        $this->createFriendship(
            $this->friend1Id, 
            $this->friend2Id, 
            $this->friend1Token, 
            $this->friend2Token
        );

        // Create friendship between friend1 and friend3
        $this->createFriendship(
            $this->friend1Id, 
            $this->friend3Id, 
            $this->friend1Token, 
            $this->friend3Token
        );

        // Now friend1 should have 2 friends
        [$status, $response] = $this->get('/friends/' . $this->friend1Id . '/list', 
            $this->withFriend1Auth());

        $this->assertEquals(200, $status);
        $this->assertIsArray($response);
        $this->assertCount(2, $response, 'Should have 2 friends');

        $friendIds = array_column($response, 'id');
        $this->assertContains($this->friend2Id, $friendIds, 'Friend2 should be in friends list');
        $this->assertContains($this->friend3Id, $friendIds, 'Friend3 should be in friends list');

        // Each friend should have required fields
        foreach ($response as $friend) {
            $this->assertArrayHasKey('id', $friend);
            $this->assertArrayHasKey('name', $friend);
        }

        // Test that friend2 also sees friend1 in their list
        [$status, $response] = $this->get('/friends/' . $this->friend2Id . '/list', 
            $this->withFriend2Auth());

        $this->assertEquals(200, $status);
        $this->assertIsArray($response);
        $this->assertCount(1, $response, 'Friend2 should have 1 friend');

        $friendIds = array_column($response, 'id');
        $this->assertContains($this->friend1Id, $friendIds, 'Friend1 should be in friend2\'s friends list');
    }

    public function testAcceptFriendRequestMissingSender(): void
    {
        // Try to accept a friend request without sender_id
        [$status, $response] = $this->put('/friends/accept', [], $this->withFriend2Auth());

        $this->assertEquals(400, $status, 'Accept request without sender_id should fail');
        $this->assertIsArray($response);
        $this->assertEquals('sender_id required', $response['error']);

        // Also test with invalid sender_id (non-numeric)
        [$status, $response] = $this->put('/friends/accept', [
            'sender_id' => 'invalid'
        ], $this->withFriend2Auth());

        $this->assertEquals(400, $status, 'Accept request with invalid sender_id should fail');
        $this->assertIsArray($response);
        $this->assertEquals('sender_id required', $response['error']);
    }

    public function testAcceptNonexistentFriendRequest(): void
    {
        // Try to accept a friend request that doesn't exist
        [$status, $response] = $this->put('/friends/accept', [
            'sender_id' => $this->friend1Id
        ], $this->withFriend2Auth());

        $this->assertEquals(404, $status, 'Accept nonexistent request should fail');
        $this->assertIsArray($response);
        $this->assertEquals('Pending request not found', $response['error']);

        // Also test accepting from a nonexistent user
        $nonexistentUserId = 99999;
        [$status, $response] = $this->put('/friends/accept', [
            'sender_id' => $nonexistentUserId
        ], $this->withFriend2Auth());

        $this->assertEquals(404, $status, 'Accept request from nonexistent user should fail');
        $this->assertIsArray($response);
        $this->assertEquals('Pending request not found', $response['error']);
    }

    // ====== DECLINE FRIEND REQUEST TESTS ======

    public function testDeclineFriendRequestMissingSender(): void
    {
        // Try to decline a friend request without sender_id
        [$status, $response] = $this->put('/friends/decline', [], $this->withFriend2Auth());

        $this->assertEquals(400, $status, 'Decline request without sender_id should fail');
        $this->assertIsArray($response);
        $this->assertEquals('sender_id required', $response['error']);

        // Also test with invalid sender_id (non-numeric)
        [$status, $response] = $this->put('/friends/decline', [
            'sender_id' => 'invalid'
        ], $this->withFriend2Auth());

        $this->assertEquals(400, $status, 'Decline request with invalid sender_id should fail');
        $this->assertIsArray($response);
        $this->assertEquals('sender_id required', $response['error']);
    }

    public function testDeclineNonexistentFriendRequest(): void
    {
        // Try to decline a friend request that doesn't exist
        [$status, $response] = $this->put('/friends/decline', [
            'sender_id' => $this->friend1Id
        ], $this->withFriend2Auth());

        $this->assertEquals(404, $status, 'Decline nonexistent request should fail');
        $this->assertIsArray($response);
        $this->assertEquals('Pending request not found', $response['error']);

        // Also test declining from a nonexistent user
        $nonexistentUserId = 99999;
        [$status, $response] = $this->put('/friends/decline', [
            'sender_id' => $nonexistentUserId
        ], $this->withFriend2Auth());

        $this->assertEquals(404, $status, 'Decline request from nonexistent user should fail');
        $this->assertIsArray($response);
        $this->assertEquals('Pending request not found', $response['error']);
    }
}
