<?php
namespace App\Models;

final class Audit extends Model
{
    protected const TABLE = 'audit_log';

    public static function getAuditLogs(int $limit = 50, int $offset = 0, ?string $table = null): array
    {
        $whereClause = '';
        $params = [];
        
        if ($table) {
            $whereClause = 'WHERE table_name = ?';
            $params[] = $table;
        }
        
        $sql = "SELECT a.*, u.name as changed_by_name 
                FROM audit_log a 
                LEFT JOIN users u ON a.changed_by = u.id 
                $whereClause
                ORDER BY a.changed_at DESC 
                LIMIT $limit OFFSET $offset";
        
        $stmt = self::db()->prepare($sql);
        $stmt->execute($params);
        return $stmt->fetchAll();
    }

    public static function getAuditLogsCount(?string $table = null): int
    {
        $whereClause = '';
        $params = [];
        
        if ($table) {
            $whereClause = 'WHERE table_name = ?';
            $params[] = $table;
        }
        
        $sql = "SELECT COUNT(*) as total FROM audit_log a $whereClause";
        $stmt = self::db()->prepare($sql);
        $stmt->execute($params);
        return (int) $stmt->fetch()['total'];
    }

    public static function getLogsByRecord(string $table, string $recordId): array
    {
        $sql = "SELECT a.*, u.name as changed_by_name 
                FROM audit_log a 
                LEFT JOIN users u ON a.changed_by = u.id 
                WHERE a.table_name = ? AND a.record_id = ?
                ORDER BY a.changed_at DESC";
        
        $stmt = self::db()->prepare($sql);
        $stmt->execute([$table, $recordId]);
        return $stmt->fetchAll();
    }

    public static function log(string $table, string $recordId, string $action, ?array $oldValues = null, ?array $newValues = null, ?int $changedBy = null): void
    {
        $data = [
            'table_name' => $table,
            'record_id' => $recordId,
            'action' => $action,
            'old_values' => $oldValues ? json_encode($oldValues) : null,
            'new_values' => $newValues ? json_encode($newValues) : null,
            'changed_by' => $changedBy,
            'changed_at' => date('Y-m-d H:i:s')
        ];

        self::create($data);
    }

    public function getTableName(): string { return $this->get('table_name'); }
    public function getRecordId(): string { return $this->get('record_id'); }
    public function getAction(): string { return $this->get('action'); }
    public function getOldValues(): ?array { 
        $values = $this->get('old_values');
        return $values ? json_decode($values, true) : null;
    }
    public function getNewValues(): ?array { 
        $values = $this->get('new_values');
        return $values ? json_decode($values, true) : null;
    }
    public function getChangedBy(): ?int { return $this->get('changed_by'); }
    public function getChangedAt(): string { return $this->get('changed_at'); }

    public static function deleteLog(int $id): bool
    {
        $stmt = self::db()->prepare('DELETE FROM audit_log WHERE id = ?');
        $result = $stmt->execute([$id]);
        return $result && $stmt->rowCount() > 0;
    }

    public static function clearAllLogs(): int
    {
        $stmt = self::db()->prepare('DELETE FROM audit_log');
        $stmt->execute();
        return $stmt->rowCount();
    }
}
