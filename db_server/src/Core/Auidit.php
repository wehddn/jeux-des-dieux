<?php
namespace App\Core;

final class Audit
{
    public static function record(
        string $table, int|string|null $rid,
        array|\stdClass|null $old, array|\stdClass|null $new
    ): void {
        $pdo = Database::get();
        $stmt = $pdo->prepare(
            'INSERT INTO audit_log (table_name,record_id,old_data,new_data,changed_by)
                     VALUES (?,?,?,?,?)');
        $uid = Auth::user()['id'] ?? null;
        $stmt->execute([
            $table,
            $rid,
            $old ? json_encode($old, JSON_UNESCAPED_UNICODE) : null,
            $new ? json_encode($new, JSON_UNESCAPED_UNICODE) : null,
            $uid
        ]);
    }
}
