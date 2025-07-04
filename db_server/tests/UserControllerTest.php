<?php
// filepath: tests/UserControllerTest.php

require_once __DIR__ . '/BaseApiTest.php';

class UserControllerTest extends BaseApiTest
{
    private $testUserEmail = 'testuser@test.com';
    private $testUserPassword = 'password123';
    private $testUserName = 'Test User';
    private $createdUserId = null;

    protected function tearDown(): void
    {
        // Clean up any test users that might have been created
        if ($this->createdUserId) {
            $this->delete("/users/{$this->createdUserId}", null, $this->withAdminAuth());
            $this->createdUserId = null;
        }
        parent::tearDown();
    }

    /**
     * Test user creation through registration endpoint
     */
    public function testCreateUser()
    {
        $userData = [
            'name' => $this->testUserName,
            'email' => $this->testUserEmail,
            'password' => $this->testUserPassword
        ];

        // Create user via registration
        [$status, $response] = $this->post('/auth/register', $userData);

        $this->assertEquals(201, $status, 'User creation should return 201 status');
        $this->assertArrayHasKey('message', $response, 'Response should contain message');
        $this->assertEquals('User registered', $response['message']);

        // Verify user can login (which confirms user was created)
        $loginData = [
            'email' => $this->testUserEmail,
            'password' => $this->testUserPassword
        ];

        [$loginStatus, $loginResponse] = $this->post('/auth/login', $loginData);

        $this->assertEquals(200, $loginStatus, 'Created user should be able to login');
        $this->assertArrayHasKey('token', $loginResponse, 'Login should return a token');

        // Get user ID for cleanup
        $this->createdUserId = $this->getUserIdByEmail($this->testUserEmail);
    }

    /**
     * Test user deletion by admin
     */
    public function testDeleteUserAsAdmin()
    {
        // First create a user to delete
        $userData = [
            'name' => $this->testUserName,
            'email' => $this->testUserEmail,
            'password' => $this->testUserPassword
        ];

        [$status, $response] = $this->post('/auth/register', $userData);
        $this->assertEquals(201, $status);

        $userId = $this->getUserIdByEmail($this->testUserEmail);
        $this->assertNotNull($userId, 'User should be created successfully');

        // Delete the user as admin
        [$deleteStatus, $deleteResponse] = $this->delete("/users/{$userId}", null, $this->withAdminAuth());

        $this->assertEquals(204, $deleteStatus, 'User deletion should return 204 status');

        // Verify user no longer exists
        [$getStatus, $getResponse] = $this->get("/users/{$userId}", $this->withAdminAuth());
        $this->assertEquals(404, $getStatus, 'Deleted user should not be found');
        $this->assertArrayHasKey('error', $getResponse);
        $this->assertEquals('Not found', $getResponse['error']);

        // Clear the user ID since it's been deleted
        $this->createdUserId = null;
    }

    /**
     * Test user deletion of non-existent user
     */
    public function testDeleteNonExistentUser()
    {
        $nonExistentUserId = 99999;

        [$status, $response] = $this->delete("/users/{$nonExistentUserId}", null, $this->withAdminAuth());

        $this->assertEquals(404, $status, 'Deleting non-existent user should return 404');
        $this->assertArrayHasKey('error', $response);
        $this->assertEquals('Not found', $response['error']);
    }

    /**
     * Test user deletion without admin privileges
     */
    public function testDeleteUserWithoutAdminAuth()
    {
        // First create a user to try to delete
        $userData = [
            'name' => $this->testUserName,
            'email' => $this->testUserEmail,
            'password' => $this->testUserPassword
        ];

        [$status, $response] = $this->post('/auth/register', $userData);
        $this->assertEquals(201, $status);

        $userId = $this->getUserIdByEmail($this->testUserEmail);
        $this->createdUserId = $userId; // For cleanup

        // Try to delete as regular user (should fail)
        [$deleteStatus, $deleteResponse] = $this->delete("/users/{$userId}", null, $this->withUserAuth());

        $this->assertEquals(403, $deleteStatus, 'Non-admin user should not be able to delete users');
        $this->assertArrayHasKey('error', $deleteResponse);

        // Try to delete as manager (should fail)
        [$deleteStatus, $deleteResponse] = $this->delete("/users/{$userId}", null, $this->withManagerAuth());

        $this->assertEquals(403, $deleteStatus, 'Manager should not be able to delete users');
        $this->assertArrayHasKey('error', $deleteResponse);
    }

    /**
     * Test user update by themselves
     */
    public function testUpdateUserBySelf()
    {
        // First create a user
        $userData = [
            'name' => $this->testUserName,
            'email' => $this->testUserEmail,
            'password' => $this->testUserPassword
        ];

        [$status, $response] = $this->post('/auth/register', $userData);
        $this->assertEquals(201, $status);

        $userId = $this->getUserIdByEmail($this->testUserEmail);
        $this->createdUserId = $userId;

        // Get user auth token
        $loginData = [
            'email' => $this->testUserEmail,
            'password' => $this->testUserPassword
        ];
        [$loginStatus, $loginResponse] = $this->post('/auth/login', $loginData);
        $this->assertEquals(200, $loginStatus);
        $token = $loginResponse['token'];

        // Update user name
        $newName = 'Updated Test User';
        $updateData = ['name' => $newName];

        [$updateStatus, $updateResponse] = $this->patch("/users/{$userId}", $updateData, $this->withToken($token));

        $this->assertEquals(200, $updateStatus, 'User should be able to update their own name');
        $this->assertArrayHasKey('name', $updateResponse);
        $this->assertEquals($newName, $updateResponse['name']);

        // Verify the change was persisted
        [$getStatus, $getResponse] = $this->get("/users/{$userId}", $this->withAdminAuth());
        $this->assertEquals(200, $getStatus);
        $this->assertEquals($newName, $getResponse['name']);
    }

    /**
     * Test user update by manager
     */
    public function testUpdateUserByManager()
    {
        // First create a user
        $userData = [
            'name' => $this->testUserName,
            'email' => $this->testUserEmail,
            'password' => $this->testUserPassword
        ];

        [$status, $response] = $this->post('/auth/register', $userData);
        $this->assertEquals(201, $status);

        $userId = $this->getUserIdByEmail($this->testUserEmail);
        $this->createdUserId = $userId;

        // Update user name as manager
        $newName = 'Manager Updated User';
        $updateData = ['name' => $newName];

        [$updateStatus, $updateResponse] = $this->patch("/users/{$userId}", $updateData, $this->withManagerAuth());

        $this->assertEquals(200, $updateStatus, 'Manager should be able to update user names');
        $this->assertArrayHasKey('name', $updateResponse);
        $this->assertEquals($newName, $updateResponse['name']);
    }

    /**
     * Test user update without proper authorization
     */
    public function testUpdateUserUnauthorized()
    {
        // First create a user
        $userData = [
            'name' => $this->testUserName,
            'email' => $this->testUserEmail,
            'password' => $this->testUserPassword
        ];

        [$status, $response] = $this->post('/auth/register', $userData);
        $this->assertEquals(201, $status);

        $userId = $this->getUserIdByEmail($this->testUserEmail);
        $this->createdUserId = $userId;

        // Try to update as different user (should fail)
        $newName = 'Unauthorized Update';
        $updateData = ['name' => $newName];

        [$updateStatus, $updateResponse] = $this->patch("/users/{$userId}", $updateData, $this->withUserAuth());

        $this->assertEquals(403, $updateStatus, 'User should not be able to update other users');
        $this->assertArrayHasKey('error', $updateResponse);
    }

    /**
     * Test user update with missing name
     */
    public function testUpdateUserMissingName()
    {
        // First create a user
        $userData = [
            'name' => $this->testUserName,
            'email' => $this->testUserEmail,
            'password' => $this->testUserPassword
        ];

        [$status, $response] = $this->post('/auth/register', $userData);
        $this->assertEquals(201, $status);

        $userId = $this->getUserIdByEmail($this->testUserEmail);
        $this->createdUserId = $userId;

        // Get user auth token
        $loginData = [
            'email' => $this->testUserEmail,
            'password' => $this->testUserPassword
        ];
        [$loginStatus, $loginResponse] = $this->post('/auth/login', $loginData);
        $token = $loginResponse['token'];

        // Try to update without name
        $updateData = ['email' => 'newemail@test.com']; // No name field

        [$updateStatus, $updateResponse] = $this->patch("/users/{$userId}", $updateData, $this->withToken($token));

        $this->assertEquals(400, $updateStatus, 'Update without name should return 400');
        $this->assertArrayHasKey('error', $updateResponse);
        $this->assertEquals('name required', $updateResponse['error']);
    }

    /**
     * Test setting user role as admin
     */
    public function testSetUserRoleAsAdmin()
    {
        // First create a user
        $userData = [
            'name' => $this->testUserName,
            'email' => $this->testUserEmail,
            'password' => $this->testUserPassword
        ];

        [$status, $response] = $this->post('/auth/register', $userData);
        $this->assertEquals(201, $status);

        $userId = $this->getUserIdByEmail($this->testUserEmail);
        $this->createdUserId = $userId;

        // Set user role to manager (role 2)
        $roleData = ['role' => 2];

        [$roleStatus, $roleResponse] = $this->put("/users/{$userId}/role", $roleData, $this->withAdminAuth());

        $this->assertEquals(200, $roleStatus, 'Admin should be able to set user roles');
        $this->assertArrayHasKey('role', $roleResponse);
        $this->assertEquals(2, $roleResponse['role']);

        // Verify the role was changed
        [$getStatus, $getResponse] = $this->get("/users/{$userId}/role", $this->withAdminAuth());
        $this->assertEquals(200, $getStatus);
        $this->assertEquals(2, $getResponse['role']);
    }

    /**
     * Test setting invalid user role
     */
    public function testSetInvalidUserRole()
    {
        // First create a user
        $userData = [
            'name' => $this->testUserName,
            'email' => $this->testUserEmail,
            'password' => $this->testUserPassword
        ];

        [$status, $response] = $this->post('/auth/register', $userData);
        $this->assertEquals(201, $status);

        $userId = $this->getUserIdByEmail($this->testUserEmail);
        $this->createdUserId = $userId;

        // Try to set invalid role (role 5)
        $roleData = ['role' => 5];

        [$roleStatus, $roleResponse] = $this->put("/users/{$userId}/role", $roleData, $this->withAdminAuth());

        $this->assertEquals(400, $roleStatus, 'Invalid role should return 400');
        $this->assertArrayHasKey('error', $roleResponse);
        $this->assertEquals('Bad role', $roleResponse['error']);
    }

    /**
     * Test setting user role without admin privileges
     */
    public function testSetUserRoleUnauthorized()
    {
        // First create a user
        $userData = [
            'name' => $this->testUserName,
            'email' => $this->testUserEmail,
            'password' => $this->testUserPassword
        ];

        [$status, $response] = $this->post('/auth/register', $userData);
        $this->assertEquals(201, $status);

        $userId = $this->getUserIdByEmail($this->testUserEmail);
        $this->createdUserId = $userId;

        // Try to set role as regular user
        $roleData = ['role' => 2];

        [$roleStatus, $roleResponse] = $this->put("/users/{$userId}/role", $roleData, $this->withUserAuth());

        $this->assertEquals(403, $roleStatus, 'Non-admin should not be able to set roles');
        $this->assertArrayHasKey('error', $roleResponse);

        // Try to set role as manager
        [$roleStatus, $roleResponse] = $this->put("/users/{$userId}/role", $roleData, $this->withManagerAuth());

        $this->assertEquals(403, $roleStatus, 'Manager should not be able to set roles');
        $this->assertArrayHasKey('error', $roleResponse);
    }

    /**
     * Test setting role for non-existent user
     */
    public function testSetRoleForNonExistentUser()
    {
        $nonExistentUserId = 99999;
        $roleData = ['role' => 2];

        [$roleStatus, $roleResponse] = $this->put("/users/{$nonExistentUserId}/role", $roleData, $this->withAdminAuth());

        $this->assertEquals(404, $roleStatus, 'Setting role for non-existent user should return 404');
        $this->assertArrayHasKey('error', $roleResponse);
        $this->assertEquals('User?', $roleResponse['error']);
    }

    /**
     * Helper method to get user ID by email
     */
    private function getUserIdByEmail(string $email): ?int
    {
        [$status, $response] = $this->get('/users', $this->withAdminAuth());
        
        if ($status !== 200 || !is_array($response)) {
            return null;
        }

        foreach ($response as $user) {
            if ($user['email'] === $email) {
                return (int)$user['id'];
            }
        }

        return null;
    }
}
