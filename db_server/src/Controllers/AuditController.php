<?php
namespace App\Controllers;

use App\Core\Auth;
use App\Core\Response;
use App\Models\Audit;

final class AuditController
{
    /** GET /audit */
    public function list(): void
    {
        Auth::requireAdmin();
        
        // Validate and sanitize input
        $limit = max(1, min(100, (int)($_GET['limit'] ?? 50))); // Between 1-100
        $offset = max(0, (int)($_GET['offset'] ?? 0));
        $table = !empty($_GET['table']) ? trim($_GET['table']) : null;
        
        // Get data from model
        $logs = Audit::getAuditLogs($limit, $offset, $table);
        $total = Audit::getAuditLogsCount($table);
        
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
        
        // Validate required parameters
        $table = !empty($_GET['table']) ? trim($_GET['table']) : null;
        $recordId = !empty($_GET['record_id']) ? trim($_GET['record_id']) : null;
        
        if (!$table || !$recordId) {
            Response::json(400, ['error' => 'table and record_id are required']);
            return;
        }
        
        // Get data from model
        $logs = Audit::getLogsByRecord($table, $recordId);
        
        Response::json(200, $logs);
    }
}
