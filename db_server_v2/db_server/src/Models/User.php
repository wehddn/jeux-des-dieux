<?php
namespace App\Models;

final class User extends Model
{
    protected const TABLE = 'users';

    /* sugar-методы */
    public function id(): int        { return $this->get('id'); }
    public function role(): int      { return $this->get('role_id'); }
    public function name(): string   { return $this->get('name'); }

    /** Вернёт true, если пароль подходит */
    public function checkPassword(string $plain): bool
    {
        return password_verify($plain, $this->get('password'));
    }

    /** Установить новый пароль (хешуется Argon2id) */
    public function setPassword(string $plain): void
    {
        $hash = password_hash($plain, PASSWORD_ARGON2ID);
        $this->update(['password' => $hash]);
    }
}
