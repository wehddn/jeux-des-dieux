<?php
namespace App\Models;

final class User extends Model
{
    protected const TABLE = 'users';

    public const ROLE_USER = 1;
    public const ROLE_MANAGER = 2;
    public const ROLE_ADMIN = 3;

    private const VALID_ROLES = [
        self::ROLE_USER,
        self::ROLE_MANAGER,
        self::ROLE_ADMIN
    ];

    public function id(): int        { return $this->get('id'); }
    public function role(): int      { return $this->get('role_id'); }
    public function name(): string   { return $this->get('name'); }

    public function checkPassword(string $plain): bool
    {
        return password_verify($plain, $this->get('password'));
    }

    public function setPassword(string $plain): void
    {
        $hash = password_hash($plain, PASSWORD_ARGON2ID);
        $this->update(['password' => $hash]);
    }

    public static function emailExists(string $email): bool
    {
        $stmt = self::db()->prepare('SELECT id FROM users WHERE email = ?');
        $stmt->execute([$email]);
        return $stmt->fetch() !== false;
    }

    public static function findByEmail(string $email): ?self
    {
        $stmt = self::db()->prepare('SELECT * FROM users WHERE email = ?');
        $stmt->execute([$email]);
        $data = $stmt->fetch();
        return $data ? new self($data) : null;
    }

    public static function register(string $email, string $password, ?string $name = null): self
    {
        // Use email prefix as name if not provided
        $name = $name ?? explode('@', $email)[0];
        
        $hash = password_hash($password, PASSWORD_ARGON2ID);
        
        return self::create([
            'name' => $name,
            'email' => $email,
            'password' => $hash,
            'photo' => 'photo_1.png'
        ]);
    }

    public static function createUser(string $name, string $email, string $password, int $roleId = self::ROLE_USER): int
    {
        if (!self::isValidRole($roleId)) {
            throw new \InvalidArgumentException('Invalid role ID');
        }
        
        if (self::emailExists($email)) {
            throw new \Exception('Email already exists');
        }
        
        $hash = password_hash($password, PASSWORD_ARGON2ID);
        
        $user = self::create([
            'name' => $name,
            'email' => $email,
            'password' => $hash,
            'role_id' => $roleId,
            'photo' => 'photo_1.png'
        ]);
        
        return $user->id();
    }

    public function isBlocked(): bool
    {
        return Block::isUserBlocked($this->id());
    }

    public function getAuthData(): array
    {
        return [
            'id' => $this->id(),
            'role_id' => $this->role(),
            'name' => $this->name(),
            'email' => $this->get('email')
        ];
    }

    public function getProfileData(): array
    {
        return [
            'id' => $this->id(),
            'name' => $this->name(),
            'email' => $this->get('email'),
            'photo' => $this->get('photo'),
            'role_id' => $this->role(),
            'created_at' => $this->get('created_at')
        ];
    }

    public static function getAllUsers(): array
    {
        $stmt = self::db()->query(
            'SELECT id, name, email, photo, role_id, created_at FROM users ORDER BY created_at DESC'
        );
        return $stmt->fetchAll();
    }

    public function updateName(string $name): void
    {
        $name = trim($name);
        if (empty($name)) {
            throw new \InvalidArgumentException('Name is required');
        }

        $this->update(['name' => $name]);
    }

    public function setRole(int $role): void
    {
        if (!in_array($role, self::VALID_ROLES, true)) {
            throw new \InvalidArgumentException('Invalid role');
        }

        $this->update(['role_id' => $role]);
    }

    public function getUserRole(): int
    {
        return $this->role();
    }

    public function deleteUser(): void
    {
        $stmt = self::db()->prepare('DELETE FROM games WHERE created_by = ?');
        $stmt->execute([$this->id()]);

        $stmt = self::db()->prepare('DELETE FROM game_players WHERE user_id = ?');
        $stmt->execute([$this->id()]);

        $stmt = self::db()->prepare('DELETE FROM friend_requests WHERE sender_id = ? OR receiver_id = ?');
        $stmt->execute([$this->id(), $this->id()]);

        $stmt = self::db()->prepare('DELETE FROM blocklist WHERE blocked_user_id = ? OR blocker_user_id = ?');
        $stmt->execute([$this->id(), $this->id()]);

        $stmt = self::db()->prepare('DELETE FROM users WHERE id = ?');
        $stmt->execute([$this->id()]);
    }

    public static function getValidRoles(): array
    {
        return self::VALID_ROLES;
    }

    public static function isValidRole(int $role): bool
    {
        return in_array($role, self::VALID_ROLES, true);
    }

    public function getRoleName(): string
    {
        switch ($this->role()) {
            case self::ROLE_USER:
                return 'User';
            case self::ROLE_MANAGER:
                return 'Manager';
            case self::ROLE_ADMIN:
                return 'Admin';
            default:
                return 'Unknown';
        }
    }
}
