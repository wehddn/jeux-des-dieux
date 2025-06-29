<?php
namespace App\Controllers;

use App\Core\Auth;
use App\Core\Database;
use App\Core\Response;
use App\Core\Audit;

final class UserController
{
    /** GET /users/{id} */
    public function get(int $id): void
    {
        Auth::requireLogin();
        $pdo = Database::get();
        $stmt = $pdo->prepare(
          'SELECT id,name,email,photo,role_id,created_at FROM users WHERE id=?');
        $stmt->execute([$id]);
        $u = $stmt->fetch();
        $u ?: Response::json(404,['error'=>'Not found']);
        Response::json(200,$u);
    }

    /** PATCH /users/{id}  body:{ "name":"New" } */
    public function update(int $id): void
    {
        Auth::requireLogin();
        if (Auth::user()['id']!=$id && Auth::user()['role_id']<2)
            Response::json(403,['error'=>'Forbidden']);

        $data = json_decode(file_get_contents('php://input'),true);
        if (empty($data['name'])) Response::json(400,['error'=>'name required']);

        $pdo = Database::get();
        $pdo->prepare('UPDATE users SET name=? WHERE id=?')
            ->execute([$data['name'],$id]);

        Audit::record('users',$id,['name'=>'*'],['name'=>$data['name']]);
        Response::json(200,['name'=>$data['name']]);
    }

    /** GET /users */
    public function list(): void
    {
        Auth::requireLogin(2);
        $rows = Database::get()->query(
          'SELECT id,name,email,photo,role_id,created_at FROM users')->fetchAll();
        Response::json(200,$rows);
    }

    /** PUT /users/{id}/role  body:{ "role":2 } */
    public function setRole(int $id): void
    {
        Auth::requireLogin(3);                    // только admin
        $data = json_decode(file_get_contents('php://input'),true);
        $role = (int)($data['role']??0);
        if (!in_array($role,[1,2,3],true))
            Response::json(400,['error'=>'Bad role']);

        $pdo = Database::get();
        $old = $pdo->prepare('SELECT role_id FROM users WHERE id=?');
        $old->execute([$id]);
        $oldRole = $old->fetchColumn() ?: Response::json(404,['error'=>'User?']);

        $pdo->prepare('UPDATE users SET role_id=? WHERE id=?')
            ->execute([$role,$id]);
        Audit::record('users',$id,['role_id'=>$oldRole],['role_id'=>$role]);
        Response::json(200,['role'=>$role]);
    }

    /** DELETE /users/{id} */
    public function delete(int $id): void
    {
        Auth::requireLogin(3);
        $pdo = Database::get();
        $stmt = $pdo->prepare('SELECT * FROM users WHERE id=?');
        $stmt->execute([$id]);
        $old = $stmt->fetch();
        if (!$old) Response::json(404,['error'=>'Not found']);

        $pdo->prepare('DELETE FROM users WHERE id=?')->execute([$id]);
        Audit::record('users',$id,$old,null);
        Response::json(204,[]);
    }

    /** GET /users/{id}/role */
    public function getRole(int $id): void
    {
        \App\Core\Auth::requireLogin();

        $user      = \App\Core\Auth::user();
        $isSelf    = ($user['id'] === $id);
        $isManager = ($user['role_id'] >= 2);

        if (!$isSelf && !$isManager) {
            \App\Core\Response::json(403, ['error' => 'Forbidden']);
        }

        $pdo  = \App\Core\Database::get();
        $stmt = $pdo->prepare('SELECT role_id FROM users WHERE id = ?');
        $stmt->execute([$id]);
        $role = $stmt->fetchColumn();

        if ($role === false) {
            \App\Core\Response::json(404, ['error' => 'User not found']);
        }

        \App\Core\Response::json(200, ['role' => (int)$role]);
    }

}
