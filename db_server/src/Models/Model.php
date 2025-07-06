<?php
namespace App\Models;

use App\Core\Database;
use PDO;

abstract class Model
{
    protected const TABLE = '';

    final protected static function db(): PDO
    {
        return \App\Core\Database::get();
    }

    /** Trouver une enregistrement par ID */
    public static function find(int $id): ?static
    {
        $stmt = self::db()->prepare(
            'SELECT * FROM ' . static::TABLE . ' WHERE id=?');
        $stmt->execute([$id]);
        $data = $stmt->fetch();
        return $data ? new static($data) : null;
    }

    public static function create(array $fields): static
    {
        $cols = array_keys($fields);
        $sql  = 'INSERT INTO ' . static::TABLE .
                ' (' . implode(',', $cols) . ')' .
                ' VALUES (' . rtrim(str_repeat('?,', count($cols)), ',') . ')';
        self::db()->prepare($sql)->execute(array_values($fields));
        $id = (int)self::db()->lastInsertId();
        return static::find($id);
    }

    public function __construct(protected array $attr) {}

    public function get(string $k): mixed   { return $this->attr[$k] ?? null; }
    public function toArray(): array        { return $this->attr; }

    public function update(array $fields): void
    {
        $sets = [];
        foreach ($fields as $k => $v) {
            $sets[] = "$k=?";
            $this->attr[$k] = $v;
        }
        $sql = 'UPDATE ' . static::TABLE .
               ' SET ' . implode(',', $sets) . ' WHERE id=?';
        self::db()->prepare($sql)->execute([...array_values($fields),
                                            $this->attr['id']]);
    }
}
