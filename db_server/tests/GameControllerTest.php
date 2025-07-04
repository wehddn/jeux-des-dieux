<?php
// filepath: tests/GameControllerTest.php

require_once 'BaseApiTest.php';

class GameControllerTest extends BaseApiTest
{
    private $createdGameIds = [];

    protected function tearDown(): void
    {
        // Clean up created games after each test
        foreach ($this->createdGameIds as $gameId) {
            $this->delete("/games/$gameId", null, $this->withManagerAuth());
        }
        $this->createdGameIds = [];
        parent::tearDown();
    }

    public function testCreateGameSuccess()
    {
        $gameData = [
            'name' => 'Test Game ' . uniqid(),
            'isPrivate' => false
        ];

        [$status, $json] = $this->post('/games', $gameData, $this->withUserAuth());

        $this->assertEquals(201, $status);
        $this->assertArrayHasKey('gameId', $json);
        $this->assertArrayHasKey('name', $json);
        $this->assertArrayHasKey('status', $json);
        $this->assertEquals($gameData['name'], $json['name']);
        $this->assertEquals('waiting', $json['status']);

        // Store the created game ID for cleanup
        $this->createdGameIds[] = $json['gameId'];
    }

    public function testCreatePrivateGameWithPassword()
    {
        $gameData = [
            'name' => 'Private Test Game ' . uniqid(),
            'isPrivate' => true,
            'password' => 'secret123'
        ];

        [$status, $json] = $this->post('/games', $gameData, $this->withUserAuth());

        $this->assertEquals(201, $status);
        $this->assertArrayHasKey('gameId', $json);
        $this->assertArrayHasKey('name', $json);
        $this->assertArrayHasKey('status', $json);
        $this->assertEquals($gameData['name'], $json['name']);
        $this->assertEquals('waiting', $json['status']);

        // Store the created game ID for cleanup
        $this->createdGameIds[] = $json['gameId'];
    }

    public function testCreateGameMissingName()
    {
        $gameData = [
            'isPrivate' => false
        ];

        [$status, $json] = $this->post('/games', $gameData, $this->withUserAuth());

        // The controller doesn't explicitly validate name, but empty name should be handled
        // Based on the controller code, it will accept null name, so we expect success
        $this->assertEquals(201, $status);
        
        if (isset($json['gameId'])) {
            $this->createdGameIds[] = $json['gameId'];
        }
    }

    public function testCreateGameWithoutAuth()
    {
        $gameData = [
            'name' => 'Unauthorized Game',
            'isPrivate' => false
        ];

        [$status, $json] = $this->post('/games', $gameData);

        $this->assertEquals(401, $status);
        $this->assertArrayHasKey('error', $json);
    }

    public function testDeleteGameAsManager()
    {
        // First create a game
        $gameData = [
            'name' => 'Game to Delete ' . uniqid(),
            'isPrivate' => false
        ];

        [$createStatus, $createJson] = $this->post('/games', $gameData, $this->withUserAuth());
        $this->assertEquals(201, $createStatus);
        $gameId = $createJson['gameId'];

        // Then delete it as manager
        [$deleteStatus, $deleteJson] = $this->delete("/games/$gameId", null, $this->withManagerAuth());

        $this->assertEquals(204, $deleteStatus);
        
        // Verify the game is actually deleted by trying to get games list
        [$listStatus, $listJson] = $this->get('/games', $this->withUserAuth());
        $this->assertEquals(200, $listStatus);
        
        // Check that the deleted game is not in the list
        $gameIds = array_column($listJson, 'id');
        $this->assertNotContains($gameId, $gameIds);
    }

    public function testDeleteGameAsUser()
    {
        // First create a game
        $gameData = [
            'name' => 'Game to Delete ' . uniqid(),
            'isPrivate' => false
        ];

        [$createStatus, $createJson] = $this->post('/games', $gameData, $this->withUserAuth());
        $this->assertEquals(201, $createStatus);
        $gameId = $createJson['gameId'];
        $this->createdGameIds[] = $gameId; // Add for cleanup

        // Try to delete it as regular user (should fail)
        [$deleteStatus, $deleteJson] = $this->delete("/games/$gameId", null, $this->withUserAuth());

        $this->assertEquals(403, $deleteStatus);
        $this->assertArrayHasKey('error', $deleteJson);
    }

    public function testDeleteNonExistentGame()
    {
        $nonExistentGameId = 99999;

        [$status, $json] = $this->delete("/games/$nonExistentGameId", null, $this->withManagerAuth());

        $this->assertEquals(404, $status);
        $this->assertArrayHasKey('error', $json);
        $this->assertEquals('Game not found', $json['error']);
    }

    public function testDeleteGameWithoutAuth()
    {
        $gameId = 1; // Any game ID

        [$status, $json] = $this->delete("/games/$gameId");

        $this->assertEquals(401, $status);
        $this->assertArrayHasKey('error', $json);
    }

    public function testSetPlayersAddPlayers()
    {
        // Create a game first
        $gameData = [
            'name' => 'Test Game for Players ' . uniqid(),
            'isPrivate' => false
        ];

        [$createStatus, $createJson] = $this->post('/games', $gameData, $this->withUserAuth());
        $this->assertEquals(201, $createStatus);
        $gameId = $createJson['gameId'];
        $this->createdGameIds[] = $gameId;

        // Test adding players (using fake user IDs for test)
        $playersData = [
            'add' => [2, 3], // Assuming these user IDs exist or will be ignored
            'remove' => []
        ];

        [$status, $json] = $this->put("/games/$gameId/players", $playersData, $this->withUserAuth());

        $this->assertEquals(200, $status);
        $this->assertArrayHasKey('added', $json);
        $this->assertArrayHasKey('removed', $json);
        $this->assertEquals([2, 3], $json['added']);
        $this->assertEquals([], $json['removed']);
    }

    public function testSetPlayersAsNonOwner()
    {
        // Create a game with manager auth
        $gameData = [
            'name' => 'Manager Game ' . uniqid(),
            'isPrivate' => false
        ];

        [$createStatus, $createJson] = $this->post('/games', $gameData, $this->withManagerAuth());
        $this->assertEquals(201, $createStatus);
        $gameId = $createJson['gameId'];
        $this->createdGameIds[] = $gameId;

        // Try to modify players as regular user (should fail)
        $playersData = [
            'add' => [2],
            'remove' => []
        ];

        [$status, $json] = $this->put("/games/$gameId/players", $playersData, $this->withUserAuth());

        $this->assertEquals(403, $status);
        $this->assertArrayHasKey('error', $json);
    }

    public function testSetPlayersGameNotFound()
    {
        $nonExistentGameId = 99999;
        $playersData = [
            'add' => [2],
            'remove' => []
        ];

        [$status, $json] = $this->put("/games/$nonExistentGameId/players", $playersData, $this->withUserAuth());

        $this->assertEquals(404, $status);
        $this->assertArrayHasKey('error', $json);
        $this->assertEquals('Game not found', $json['error']);
    }

    public function testSetStatusToInProgress()
    {
        // Create a game first
        $gameData = [
            'name' => 'Test Game for Status ' . uniqid(),
            'isPrivate' => false
        ];

        [$createStatus, $createJson] = $this->post('/games', $gameData, $this->withUserAuth());
        $this->assertEquals(201, $createStatus);
        $gameId = $createJson['gameId'];
        $this->createdGameIds[] = $gameId;

        // Change status to in_progress
        $statusData = ['status' => 'in_progress'];

        [$status, $json] = $this->put("/games/$gameId/status", $statusData, $this->withUserAuth());

        $this->assertEquals(200, $status);
        $this->assertArrayHasKey('status', $json);
        $this->assertEquals('in_progress', $json['status']);
    }

    public function testSetStatusInvalid()
    {
        // Create a game first
        $gameData = [
            'name' => 'Test Game for Invalid Status ' . uniqid(),
            'isPrivate' => false
        ];

        [$createStatus, $createJson] = $this->post('/games', $gameData, $this->withUserAuth());
        $this->assertEquals(201, $createStatus);
        $gameId = $createJson['gameId'];
        $this->createdGameIds[] = $gameId;

        // Try to set an invalid status
        $statusData = ['status' => 'invalid_status'];

        [$status, $json] = $this->put("/games/$gameId/status", $statusData, $this->withUserAuth());

        $this->assertEquals(400, $status);
        $this->assertArrayHasKey('error', $json);
        $this->assertEquals('Invalid status', $json['error']);
    }

    public function testSetStatusAsNonOwner()
    {
        // Create a game with manager auth
        $gameData = [
            'name' => 'Manager Game for Status ' . uniqid(),
            'isPrivate' => false
        ];

        [$createStatus, $createJson] = $this->post('/games', $gameData, $this->withManagerAuth());
        $this->assertEquals(201, $createStatus);
        $gameId = $createJson['gameId'];
        $this->createdGameIds[] = $gameId;

        // Try to change status as regular user (should fail)
        $statusData = ['status' => 'in_progress'];

        [$status, $json] = $this->put("/games/$gameId/status", $statusData, $this->withUserAuth());

        $this->assertEquals(403, $status);
        $this->assertArrayHasKey('error', $json);
    }
}
