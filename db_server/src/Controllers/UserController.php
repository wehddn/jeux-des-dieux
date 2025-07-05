<?php
namespace App\Controllers;

use App\Core\Auth;
use App\Core\Response;
use App\Models\User;

final class UserController
{
    /** GET /users/{id} */
    public function get(int $id): void
    {
        try {
            $user = User::find($id);
            if (!$user) {
                Response::json(404, ['error' => 'User not found']);
                return;
            }

            $userData = $user->getProfileData();
            Response::json(200, $userData);
        } catch (\Exception $e) {
            error_log('Get user error: ' . $e->getMessage());
            Response::json(500, ['error' => 'Failed to retrieve user']);
        }
    }

    /** PATCH /users/{id}  body:{ "name":"New" } */
    public function update(int $id): void
    {
        Auth::requireSelfOrManager($id);

        $data = json_decode(file_get_contents('php://input'), true);
        
        // Validate JSON data
        if ($data === null) {
            Response::json(400, ['error' => 'Invalid JSON data']);
            return;
        }

        // Validate name
        if (!isset($data['name']) || !is_string($data['name']) || trim($data['name']) === '') {
            Response::json(400, ['error' => 'Name is required']);
            return;
        }

        try {
            $user = User::find($id);
            if (!$user) {
                Response::json(404, ['error' => 'User not found']);
                return;
            }

            $user->updateName($data['name']);

            Response::json(200, ['name' => trim($data['name'])]);
        } catch (\InvalidArgumentException $e) {
            Response::json(400, ['error' => $e->getMessage()]);
        } catch (\Exception $e) {
            error_log('Update user error: ' . $e->getMessage());
            Response::json(500, ['error' => 'Failed to update user']);
        }
    }

    /** GET /users */
    public function list(): void
    {
        Auth::requireManager();
        
        try {
            $users = User::getAllUsers();
            Response::json(200, $users);
        } catch (\Exception $e) {
            error_log('List users error: ' . $e->getMessage());
            Response::json(500, ['error' => 'Failed to retrieve users']);
        }
    }

    /** PUT /users/{id}/role  body:{ "role":2 } */
    public function setRole(int $id): void
    {
        Auth::requireAdmin();
        Auth::requireNotSelf($id, 'role change');
        
        $data = json_decode(file_get_contents('php://input'), true);
        
        // Validate JSON data
        if ($data === null) {
            Response::json(400, ['error' => 'Invalid JSON data']);
            return;
        }

        // Validate role
        if (!isset($data['role']) || !is_numeric($data['role'])) {
            Response::json(400, ['error' => 'Role is required']);
            return;
        }

        $role = (int)$data['role'];

        try {
            $user = User::find($id);
            if (!$user) {
                Response::json(404, ['error' => 'User not found']);
                return;
            }

            $user->setRole($role);

            Response::json(200, ['role' => $role]);
        } catch (\InvalidArgumentException $e) {
            Response::json(400, ['error' => $e->getMessage()]);
        } catch (\Exception $e) {
            error_log('Set user role error: ' . $e->getMessage());
            Response::json(500, ['error' => 'Failed to update user role']);
        }
    }

    /** DELETE /users/{id} */
    public function delete(int $id): void
    {
        Auth::requireAdmin();
        
        try {
            $user = User::find($id);
            if (!$user) {
                Response::json(404, ['error' => 'User not found']);
                return;
            }

            $user->deleteUser();

            Response::json(204, []);
        } catch (\Exception $e) {
            error_log('Delete user error: ' . $e->getMessage());
            Response::json(500, ['error' => 'Failed to delete user']);
        }
    }

    /** GET /users/{id}/role */
    public function getRole(int $id): void
    {
        Auth::requireSelfOrManager($id);

        try {
            $user = User::find($id);
            if (!$user) {
                Response::json(404, ['error' => 'User not found']);
                return;
            }

            Response::json(200, ['role' => $user->getUserRole()]);
        } catch (\Exception $e) {
            error_log('Get user role error: ' . $e->getMessage());
            Response::json(500, ['error' => 'Failed to retrieve user role']);
        }
    }
}
