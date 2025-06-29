<?php
namespace App\Core;

final class Audit
{
    public static function record(string $table, int $recordId, ?array $oldData, ?array $newData): void
    {
        $pdo = Database::get();
        $stmt = $pdo->prepare(
            'INSERT INTO audit_log (table_name, record_id, old_data, new_data, changed_by) VALUES (?,?,?,?,?)');
        
        $changedBy = Auth::check() ? Auth::user()['id'] : null;
        
        $stmt->execute([
            $table,
            $recordId,
            $oldData ? json_encode($oldData) : null,
            $newData ? json_encode($newData) : null,
            $changedBy
        ]);
    }
}
