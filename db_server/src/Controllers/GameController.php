<?php
namespace App\Controllers;

use App\Core\Auth;
use App\Core\Response;
use App\Models\Game;

final class GameController
{
    /** POST /games   body:{ "name":"Foo" } */
    public function create(): void
    {
        $uid = Auth::userId();
        $data = json_decode(file_get_contents('php://input'), true);
        
        // Validate JSON data
        if ($data === null) {
            Response::json(400, ['error' => 'Invalid JSON data']);
            return;
        }
        
        // Validate input
        if (!isset($data['name']) || !is_string($data['name']) || trim($data['name']) === '') {
            Response::json(400, ['error' => 'Game name is required']);
            return;
        }
        
        $name = trim($data['name']);
        $isPrivate = !empty($data['isPrivate']);
        $password = $data['password'] ?? null;

        try {
            $game = Game::createGame($name, $uid, $isPrivate, $password);
            
            Response::json(201, [
                'gameId' => $game->id(),
                'name' => $game->name(),
                'status' => $game->status()
            ]);
        } catch (\InvalidArgumentException $e) {
            Response::json(400, ['error' => $e->getMessage()]);
        } catch (\Exception $e) {
            error_log('Create game error: ' . $e->getMessage());
            Response::json(500, ['error' => 'Failed to create game']);
        }
    }

    /** GET /games */
    public function list(): void
    {
        try {
            $games = Game::getAllGames();
            Response::json(200, $games);
        } catch (\Exception $e) {
            error_log('List games error: ' . $e->getMessage());
            Response::json(500, ['error' => 'Failed to retrieve games']);
        }
    }

    /** GET /games/{id} */
    public function detail(int $id): void
    {
        try {
            $gameDetails = Game::getGameDetails($id);
            if (!$gameDetails) {
                Response::json(404, ['error' => 'Game not found']);
                return;
            }

            Response::json(200, $gameDetails);
        } catch (\Exception $e) {
            error_log('Get game details error: ' . $e->getMessage());
            Response::json(500, ['error' => 'Failed to retrieve game details']);
        }
    }

    /** PUT /games/{id}/players   body:{ "add":[2,3], "remove":[4] } */
    public function setPlayers(int $id): void
    {
        try {
            $game = Game::find($id);
            if (!$game) {
                Response::json(404, ['error' => 'Game not found']);
                return;
            }

            // Check that current user is the creator or manager/admin
            Auth::requireOwnerOrManager($game->creatorId());

            $data = json_decode(file_get_contents('php://input'), true);
            $playersToAdd = $data['add'] ?? [];
            $playersToRemove = $data['remove'] ?? [];

            $changes = $game->updatePlayers($playersToAdd, $playersToRemove);

            Response::json(200, $changes);
        } catch (\Exception $e) {
            error_log('Set players error: ' . $e->getMessage());
            Response::json(500, ['error' => 'Failed to update players']);
        }
    }

    /** PUT /games/{id}/status  body:{ "status":"in_progress" } */
    public function setStatus(int $id): void
    {
        try {
            $game = Game::find($id);
            if (!$game) {
                Response::json(404, ['error' => 'Game not found']);
                return;
            }

            Auth::requireOwnerOrManager($game->creatorId());

            $data = json_decode(file_get_contents('php://input'), true);
            $status = $data['status'] ?? null;

            $game->setStatus($status);

            Response::json(200, ['status' => $status]);
        } catch (\InvalidArgumentException $e) {
            Response::json(400, ['error' => $e->getMessage()]);
        } catch (\Exception $e) {
            error_log('Set game status error: ' . $e->getMessage());
            Response::json(500, ['error' => 'Failed to update game status']);
        }
    }

    /** DELETE /games/{id} */
    public function delete(int $id): void
    {
        Auth::requireManager();
        
        try {
            $game = Game::find($id);
            if (!$game) {
                Response::json(404, ['error' => 'Game not found']);
                return;
            }

            $game->deleteGame();

            Response::json(204, []);
        } catch (\Exception $e) {
            error_log('Delete game error: ' . $e->getMessage());
            Response::json(500, ['error' => 'Failed to delete game']);
        }
    }

    /** POST /games/{id}/join   body:{ "password":"secret" } */
    public function join(int $id): void
    {
        $uid = Auth::userId();
        
        try {
            $game = Game::find($id);
            if (!$game) {
                Response::json(404, ['error' => 'Game not found']);
                return;
            }

            // Check if game is private and requires password
            if ($game->isPrivate()) {
                $data = json_decode(file_get_contents('php://input'), true);
                $password = $data['password'] ?? '';
                
                if (!$game->verifyPassword($password)) {
                    Response::json(403, ['error' => 'Invalid password']);
                    return;
                }
            }

            // Check if user is already a player
            if ($game->hasPlayer($uid)) {
                Response::json(200, ['message' => 'Already a player in this game']);
                return;
            }

            // Add user to the game
            $game->addPlayer($uid);

            Response::json(200, ['message' => 'Successfully joined the game']);
        } catch (\Exception $e) {
            error_log('Join game error: ' . $e->getMessage());
            Response::json(500, ['error' => 'Failed to join game']);
        }
    }

    /** PUT /games/{id}   body:{ "name":"New Name", "status":"in_progress" } */
    public function update(int $id): void
    {
        Auth::requireManager();
        
        try {
            $game = Game::find($id);
            if (!$game) {
                Response::json(404, ['error' => 'Game not found']);
                return;
            }

            $data = json_decode(file_get_contents('php://input'), true);
            
            // Validate JSON data
            if ($data === null) {
                Response::json(400, ['error' => 'Invalid JSON data']);
                return;
            }

            $updateData = [];
            
            // Update name if provided
            if (isset($data['name'])) {
                if (!is_string($data['name']) || trim($data['name']) === '') {
                    Response::json(400, ['error' => 'Game name must be a non-empty string']);
                    return;
                }
                $updateData['name'] = trim($data['name']);
            }

            // Update status if provided
            if (isset($data['status'])) {
                if (!in_array($data['status'], Game::getValidStatuses())) {
                    Response::json(400, ['error' => 'Invalid status']);
                    return;
                }
                $updateData['status'] = $data['status'];
            }

            // Update is_private if provided
            if (isset($data['is_private'])) {
                $updateData['is_private'] = (bool)$data['is_private'];
            }

            // Update password if provided
            if (isset($data['password'])) {
                if (is_string($data['password']) && !empty(trim($data['password']))) {
                    $updateData['password'] = password_hash(trim($data['password']), PASSWORD_DEFAULT);
                } else {
                    // Clear password if empty string is provided
                    $updateData['password'] = null;
                }
            }

            if (empty($updateData)) {
                Response::json(400, ['error' => 'No valid fields to update']);
                return;
            }

            $game->update($updateData);

            // Return updated game data
            $updatedGame = Game::find($id);
            Response::json(200, [
                'id' => $updatedGame->id(),
                'name' => $updatedGame->name(),
                'status' => $updatedGame->status(),
                'is_private' => $updatedGame->isPrivate(),
                'created_by' => $updatedGame->creatorId(),
                'created_at' => $updatedGame->createdAt()
            ]);
        } catch (\Exception $e) {
            error_log('Update game error: ' . $e->getMessage());
            Response::json(500, ['error' => 'Failed to update game']);
        }
    }

    /** GET /admin/games - Get all games for admin panel */
    public function adminList(): void
    {
        Auth::requireManager();
        
        try {
            $games = Game::getAllGamesForAdmin();
            Response::json(200, $games);
        } catch (\Exception $e) {
            error_log('Admin list games error: ' . $e->getMessage());
            Response::json(500, ['error' => 'Failed to retrieve games']);
        }
    }
}
