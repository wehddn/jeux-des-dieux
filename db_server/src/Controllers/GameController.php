<?php
namespace App\Controllers;

use App\Core\Auth;
use App\Core\Database;
use App\Core\Response;
use App\Core\Audit;
use App\Core\EventLogger;

final class GameController
{
    /** POST /games   body:{ "name":"Foo" } */
    public function create(): void
    {
        $uid  = Auth::userId();
        $data = json_decode(file_get_contents('php://input'), true);
        $name = $data['name'] ?? null;
        $isPrivate = !empty($data['isPrivate']);
        $pwdHash   = $isPrivate && !empty($data['password'])
           ? password_hash($data['password'], PASSWORD_DEFAULT)
           : null;

        try {
            $pdo = Database::get();
            error_log("GameController::create - About to insert game");
            
            $pdo->prepare('INSERT INTO games (name,created_by,is_private,password) VALUES (?,?,?,?)')
                ->execute([$name,$uid,$isPrivate,$pwdHash]);
            $gid = (int)$pdo->lastInsertId();
            
            error_log("GameController::create - Game created with ID: " . $gid);

            // создатель сразу становится игроком
            $pdo->prepare('INSERT INTO game_players (game_id,user_id) VALUES (?,?)')
                ->execute([$gid,$uid]);
                
            error_log("GameController::create - Player added");

            Audit::record('games',$gid,null,['name'=>$name,'status'=>'waiting']);
            EventLogger::log('game_created',"Game $gid by $uid",$uid);
            
            error_log("GameController::create - Audit and event logged");

            Response::json(201,['gameId'=>$gid,'name'=>$name,'status'=>'waiting']);
        } catch (\Exception $e) {
            error_log("GameController::create - Error: " . $e->getMessage());
            Response::json(500, ['error' => 'Database error']);
        }
    }

    /** GET /games */
    public function list(): void
    {
        $pdo = Database::get();
        $rows = $pdo->query(
            'SELECT g.id,g.name,g.status,u.name AS creator,g.created_at
               FROM games g JOIN users u ON u.id=g.created_by
            ORDER BY g.created_at DESC')->fetchAll();
        Response::json(200,$rows);
    }

    /** GET /games/{id} */
    public function detail(int $id): void
    {
        $pdo = Database::get();
        $stmt = $pdo->prepare(
            'SELECT g.id,g.name,g.status,u.name AS creator,g.created_at
               FROM games g JOIN users u ON u.id=g.created_by
              WHERE g.id=?');
        $stmt->execute([$id]);
        $game = $stmt->fetch();
        if (!$game) Response::json(404,['error'=>'Game not found']);

        $players = $pdo->prepare(
            'SELECT u.id,u.name
               FROM game_players gp JOIN users u ON u.id=gp.user_id
              WHERE gp.game_id=?');
        $players->execute([$id]);
        $game['players'] = $players->fetchAll();

        Response::json(200,$game);
    }

    /** PUT /games/{id}/players   body:{ "add":[2,3], "remove":[4] } */
    public function setPlayers(int $id): void
    {
        $uid = Auth::userId();
        $pdo = Database::get();

        // Check that current user is the creator or manager/admin
        $owner = $pdo->prepare('SELECT created_by FROM games WHERE id=?');
        $owner->execute([$id]);
        $createdBy = $owner->fetchColumn();
        if (!$createdBy) Response::json(404,['error'=>'Game not found']);
        
        Auth::requireOwnerOrManager($createdBy);

        $data = json_decode(file_get_contents('php://input'), true);
        $add = $data['add']??[];
        $rem = $data['remove']??[];

        $changes = ['added'=>[],'removed'=>[]];
        foreach ($add as $pid){
            $pdo->prepare(
              'INSERT IGNORE INTO game_players (game_id,user_id) VALUES (?,?)')
                ->execute([$id,$pid]);
            $changes['added'][] = $pid;
        }
        foreach ($rem as $pid){
            $pdo->prepare(
              'DELETE FROM game_players WHERE game_id=? AND user_id=?')
                ->execute([$id,$pid]);
            $changes['removed'][] = $pid;
        }

        Audit::record('game_players',$id,null,$changes);
        Response::json(200,$changes);
    }

    /** PUT /games/{id}/status  body:{ "status":"in_progress" } */
    public function setStatus(int $id): void
    {
        $pdo = Database::get();

        $cur = $pdo->prepare('SELECT status,created_by FROM games WHERE id=?');
        $cur->execute([$id]);
        $row = $cur->fetch();
        if (!$row) Response::json(404,['error'=>'Game not found']);

        Auth::requireOwnerOrManager($row['created_by']);

        $data   = json_decode(file_get_contents('php://input'),true);
        $status = $data['status'] ?? null;
        if (!in_array($status,['waiting','in_progress','finished'],true))
            Response::json(400,['error'=>'Invalid status']);

        $pdo->prepare('UPDATE games SET status=? WHERE id=?')
            ->execute([$status,$id]);

        Audit::record('games',$id,
            ['status'=>$row['status']],['status'=>$status]);

        Response::json(200,['status'=>$status]);
    }

    /** DELETE /games/{id} */
    public function delete(int $id): void
    {
        Auth::requireManager();
        
        $pdo = Database::get();
        $stmt = $pdo->prepare('SELECT * FROM games WHERE id=?');
        $stmt->execute([$id]);
        $old = $stmt->fetch();
        if (!$old) Response::json(404,['error'=>'Game not found']);

        $pdo->prepare('DELETE FROM games WHERE id=?')->execute([$id]);
        Audit::record('games',$id,$old,null);
        EventLogger::log('game_deleted',"Game $id deleted",Auth::userId());

        Response::json(204,[]);
    }
}
