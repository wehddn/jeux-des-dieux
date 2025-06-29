<?php
namespace App\Controllers;

use App\Core\Auth;
use App\Core\Database;
use App\Core\Response;

final class AuditController
{
    /** GET /audit */
    public function list(): void
    {
        Auth::requireAdmin();
        
        $limit = (int)($_GET['limit'] ?? 50);
        $offset = (int)($_GET['offset'] ?? 0);
        $table = $_GET['table'] ?? null;
        
        $pdo = Database::get();
        
        $whereClause = '';
        $params = [];
        
        if ($table) {
            $whereClause = 'WHERE table_name = ?';
            $params[] = $table;
        }
        
        // LIMIT and OFFSET must be integers, not bound parameters
        $sql = "SELECT a.*, u.name as changed_by_name 
                FROM audit_log a 
                LEFT JOIN users u ON a.changed_by = u.id 
                $whereClause
                ORDER BY a.changed_at DESC 
                LIMIT $limit OFFSET $offset";
        
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        $logs = $stmt->fetchAll();
        
        // Get total count
        $countSql = "SELECT COUNT(*) as total FROM audit_log a $whereClause";
        $countParams = $table ? [$table] : [];
        $countStmt = $pdo->prepare($countSql);
        $countStmt->execute($countParams);
        $total = $countStmt->fetch()['total'];
        
        Response::json(200, [
            'logs' => $logs,
            'total' => $total,
            'limit' => $limit,
            'offset' => $offset
        ]);
    }
    
    /** GET /audit/record?table=users&record_id=1 */
    public function getByRecord(): void
    {
        Auth::requireAdmin();
        
        $table = $_GET['table'] ?? null;
        $recordId = $_GET['record_id'] ?? null;
        
        if (!$table || !$recordId) {
            Response::json(400, ['error' => 'table and record_id are required']);
        }
        
        $pdo = Database::get();
        
        $sql = "SELECT a.*, u.name as changed_by_name 
                FROM audit_log a 
                LEFT JOIN users u ON a.changed_by = u.id 
                WHERE a.table_name = ? AND a.record_id = ?
                ORDER BY a.changed_at DESC";
        
        $stmt = $pdo->prepare($sql);
        $stmt->execute([$table, $recordId]);
        $logs = $stmt->fetchAll();
        
        Response::json(200, $logs);
    }
}
