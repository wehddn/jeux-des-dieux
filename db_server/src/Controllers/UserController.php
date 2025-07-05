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

            Response::json(200, ['message' => 'User deleted successfully']);
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

    /** POST /users - Create new user (admin only) */
    public function create(): void
    {
        Auth::requireAdmin();

        $data = json_decode(file_get_contents('php://input'), true);
        
        if ($data === null) {
            Response::json(400, ['error' => 'Invalid JSON data']);
            return;
        }

        if (!isset($data['name']) || !is_string($data['name']) || trim($data['name']) === '') {
            Response::json(400, ['error' => 'Name is required']);
            return;
        }

        if (!isset($data['email']) || !is_string($data['email']) || !filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
            Response::json(400, ['error' => 'Valid email is required']);
            return;
        }

        if (!isset($data['password']) || !is_string($data['password']) || strlen($data['password']) < 6) {
            Response::json(400, ['error' => 'Password must be at least 6 characters long']);
            return;
        }

        $roleId = isset($data['role_id']) ? (int)$data['role_id'] : 1;
        if (!in_array($roleId, [1, 2, 3])) {
            Response::json(400, ['error' => 'Invalid role ID']);
            return;
        }

        try {
            $userId = User::createUser(
                trim($data['name']),
                strtolower(trim($data['email'])),
                $data['password'],
                $roleId
            );

            $newUser = User::find($userId);
            if ($newUser) {
                Response::json(201, [
                    'message' => 'User created successfully',
                    'user' => $newUser->getProfileData()
                ]);
            } else {
                Response::json(201, ['message' => 'User created successfully', 'id' => $userId]);
            }
        } catch (\Exception $e) {
            error_log('Create user error: ' . $e->getMessage());
            
            if (strpos($e->getMessage(), 'Email already exists') !== false) {
                Response::json(409, ['error' => 'A user with this email already exists']);
            } elseif (strpos($e->getMessage(), 'Invalid role') !== false) {
                Response::json(400, ['error' => 'Invalid role ID']);
            } else {
                Response::json(500, ['error' => 'Failed to create user']);
            }
        }
    }

    /** PUT /users/{id} - Update user data (admin only) */
    public function updateUser(int $id): void
    {
        Auth::requireAdmin();

        $data = json_decode(file_get_contents('php://input'), true);
        
        if ($data === null) {
            Response::json(400, ['error' => 'Invalid JSON data']);
            return;
        }

        try {
            $user = User::find($id);
            if (!$user) {
                Response::json(404, ['error' => 'User not found']);
                return;
            }

            $updateData = [];

            if (isset($data['name'])) {
                if (!is_string($data['name']) || trim($data['name']) === '') {
                    Response::json(400, ['error' => 'Name must be a non-empty string']);
                    return;
                }
                $updateData['name'] = trim($data['name']);
            }

            if (isset($data['email'])) {
                if (!is_string($data['email']) || !filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
                    Response::json(400, ['error' => 'Valid email is required']);
                    return;
                }
                
                $email = strtolower(trim($data['email']));
                
                $existingUser = User::findByEmail($email);
                if ($existingUser && $existingUser->id() !== $id) {
                    Response::json(409, ['error' => 'Email already exists']);
                    return;
                }
                
                $updateData['email'] = $email;
            }

            if (isset($data['role_id'])) {
                $roleId = (int)$data['role_id'];
                if (!User::isValidRole($roleId)) {
                    Response::json(400, ['error' => 'Invalid role ID']);
                    return;
                }
                $updateData['role_id'] = $roleId;
            }

            if (isset($data['password'])) {
                if (!is_string($data['password']) || strlen($data['password']) < 6) {
                    Response::json(400, ['error' => 'Password must be at least 6 characters long']);
                    return;
                }
                $updateData['password'] = password_hash($data['password'], PASSWORD_ARGON2ID);
            }

            if (!empty($updateData)) {
                $user->update($updateData);
            }

            $updatedUser = User::find($id);
            Response::json(200, [
                'message' => 'User updated successfully',
                'user' => $updatedUser->getProfileData()
            ]);

        } catch (\Exception $e) {
            error_log('Update user error: ' . $e->getMessage());
            Response::json(500, ['error' => 'Failed to update user']);
        }
    }
}
