<?php
// filepath: tests/BlockControllerTest.php

require_once 'BaseApiTest.php';

class BlockControllerTest extends BaseApiTest
{
    private $targetUserId = 12; // test2@test2.test2

    // Run unblock tests first to ensure clean state
    public function testUnblockUserWithoutAuth()
    {
        // Test without authorization header
        [$status, $json] = $this->delete("/users/{$this->targetUserId}/block");
        $this->assertEquals(401, $status);
        $this->assertEquals(['error' => 'Unauthorized'], $json);
    }

    public function testUnblockUserWithUserAuth()
    {
        // Test with regular user (should get 403 - requires manager+)
        [$status, $json] = $this->delete("/users/{$this->targetUserId}/block", null, $this->withUserAuth());
        $this->assertEquals(403, $status);
        $this->assertArrayHasKey('error', $json);
    }

    public function testUnblockUserNotBlocked()
    {
        // First ensure user is not blocked
        $this->delete("/users/{$this->targetUserId}/block", null, $this->withManagerAuth());
        
        // Test unblocking a user that is not blocked
        [$status, $json] = $this->delete("/users/{$this->targetUserId}/block", null, $this->withManagerAuth());
        $this->assertEquals(404, $status);
        $this->assertEquals(['error' => 'User is not blocked'], $json);
    }

    // Now run block tests with clean state
    public function testBlockUserWithoutAuth()
    {
        // Test without authorization header
        [$status, $json] = $this->post("/users/{$this->targetUserId}/block", []);
        $this->assertEquals(401, $status);
        $this->assertEquals(['error' => 'Unauthorized'], $json);
    }

    public function testBlockUserWithUserAuth()
    {
        // Test with regular user (should get 403 - requires manager+)
        [$status, $json] = $this->post("/users/{$this->targetUserId}/block", [], $this->withUserAuth());
        $this->assertEquals(403, $status);
        $this->assertArrayHasKey('error', $json);
    }

    public function testBlockUserWithManagerAuth()
    {
        // First ensure user is not blocked
        $this->delete("/users/{$this->targetUserId}/block", null, $this->withManagerAuth());
        
        // Test with manager user (should succeed)
        [$status, $json] = $this->post("/users/{$this->targetUserId}/block", [], $this->withManagerAuth());
        $this->assertEquals(200, $status);
        $this->assertEquals(['message' => 'User blocked successfully'], $json);
    }

    public function testBlockUserWithAdminAuth()
    {
        // First unblock user to ensure clean state
        $this->delete("/users/{$this->targetUserId}/block", null, $this->withAdminAuth());
        
        // Test with admin user (should succeed)
        [$status, $json] = $this->post("/users/{$this->targetUserId}/block", [], $this->withAdminAuth());
        $this->assertEquals(200, $status);
        $this->assertEquals(['message' => 'User blocked successfully'], $json);
    }

    public function testBlockNonExistentUser()
    {
        // Test blocking a user that doesn't exist
        $nonExistentUserId = 99999;
        [$status, $json] = $this->post("/users/{$nonExistentUserId}/block", [], $this->withManagerAuth());
        $this->assertEquals(404, $status);
        $this->assertEquals(['error' => 'User not found'], $json);
    }

    public function testUnblockUserWithManagerAuth()
    {
        // First ensure user is blocked
        $this->post("/users/{$this->targetUserId}/block", [], $this->withManagerAuth());
        
        // Test with manager user (should succeed)
        [$status, $json] = $this->delete("/users/{$this->targetUserId}/block", null, $this->withManagerAuth());
        $this->assertEquals(200, $status);
        $this->assertEquals(['message' => 'User unblocked successfully'], $json);
    }

    public function testUnblockUserWithAdminAuth()
    {
        // First ensure user is blocked
        $this->post("/users/{$this->targetUserId}/block", [], $this->withAdminAuth());
        
        // Test with admin user (should succeed)
        [$status, $json] = $this->delete("/users/{$this->targetUserId}/block", null, $this->withAdminAuth());
        $this->assertEquals(200, $status);
        $this->assertEquals(['message' => 'User unblocked successfully'], $json);
    }

    public function testBlockAlreadyBlockedUser()
    {
        // First ensure user is blocked
        $this->post("/users/{$this->targetUserId}/block", [], $this->withManagerAuth());
        
        // Try to block again
        [$status, $json] = $this->post("/users/{$this->targetUserId}/block", [], $this->withManagerAuth());
        $this->assertEquals(409, $status);
        $this->assertEquals(['error' => 'User already blocked'], $json);
    }

    public function testManagerCannotBlockAdmin()
    {
        $adminUserId = 1;
        [$status, $json] = $this->post("/users/{$adminUserId}/block", [], $this->withManagerAuth());
        $this->assertEquals(403, $status);
        $this->assertEquals(['error' => 'Cannot block administrator'], $json);
    }

    public function testManagerCannotUnblockAdmin()
    {
        $adminUserId = 1;
        [$status, $json] = $this->delete("/users/{$adminUserId}/block", null, $this->withManagerAuth());
        $this->assertEquals(403, $status);
        $this->assertEquals(['error' => 'Cannot unblock administrator'], $json);
    }

    protected function tearDown(): void
    {
        // Clean up: ensure test user is unblocked after each test
        try {
            $this->delete("/users/{$this->targetUserId}/block", null, $this->withAdminAuth());
        } catch (Exception $e) {
            // Ignore errors in cleanup
        }
        parent::tearDown();
    }
}
