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
        
        $limit = max(1, min(100, (int)($_GET['limit'] ?? 50))); // Between 1-100
        $offset = max(0, (int)($_GET['offset'] ?? 0));
        $table = !empty($_GET['table']) ? trim($_GET['table']) : null;
        
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
        
        $table = !empty($_GET['table']) ? trim($_GET['table']) : null;
        $recordId = !empty($_GET['record_id']) ? trim($_GET['record_id']) : null;
        
        if (!$table || !$recordId) {
            Response::json(400, ['error' => 'table and record_id are required']);
            return;
        }
        
        $logs = Audit::getLogsByRecord($table, $recordId);
        
        Response::json(200, $logs);
    }

    /** DELETE /audit/{id} - Delete specific audit log (admin only) */
    public function delete(int $id): void
    {
        Auth::requireAdmin();

        try {
            $success = Audit::deleteLog($id);
            if ($success) {
                Response::json(200, ['message' => 'Audit log deleted successfully']);
            } else {
                Response::json(404, ['error' => 'Audit log not found']);
            }
        } catch (\Exception $e) {
            error_log('Delete audit log error: ' . $e->getMessage());
            Response::json(500, ['error' => 'Failed to delete audit log']);
        }
    }

    /** DELETE /audit/clear - Clear all audit logs (admin only) */
    public function clear(): void
    {
        Auth::requireAdmin();

        try {
            $deletedCount = Audit::clearAllLogs();
            Response::json(200, [
                'message' => 'All audit logs cleared successfully',
                'deleted_count' => $deletedCount
            ]);
        } catch (\Exception $e) {
            error_log('Clear audit logs error: ' . $e->getMessage());
            Response::json(500, ['error' => 'Failed to clear audit logs']);
        }
    }
}
