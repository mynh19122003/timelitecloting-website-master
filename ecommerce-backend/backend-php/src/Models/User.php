<?php

namespace App\Models;

use App\Config\Database;
use PDO;
use PDOException;

class User
{
    private PDO $db;

    public function __construct()
    {
        $this->db = Database::getInstance();
    }

    /**
     * Create new user with email and password
     * Auto-generates user_code in format UID00001, UID00002, etc.
     */
    public function create(string $email, string $passwordHash): array
    {
        try {
            $stmt = $this->db->prepare(
                'INSERT INTO users (email, password_hash) VALUES (?, ?)'
            );
            $stmt->execute([$email, $passwordHash]);
            
            $userId = $this->db->lastInsertId();
            
            // Generate and set user_code: UID00001, UID00002, ...
            $userCode = 'UID' . str_pad($userId, 5, '0', STR_PAD_LEFT);
            $stmt = $this->db->prepare(
                'UPDATE users SET user_code = ? WHERE id = ?'
            );
            $stmt->execute([$userCode, $userId]);
            
            // Get user with generated user_code
            return $this->findById($userId);
        } catch (PDOException $e) {
            if ($e->getCode() == 23000) { // Duplicate entry
                throw new \Exception('ERR_EMAIL_EXISTS');
            }
            throw new \Exception('ERR_REGISTRATION_FAILED');
        }
    }

    /**
     * Find user by email
     */
    public function findByEmail(string $email): ?array
    {
        try {
            $stmt = $this->db->prepare(
                'SELECT id, user_code, email, user_name, user_phone, user_address, password_hash, created_at, updated_at FROM users WHERE email = ?'
            );
            $stmt->execute([$email]);
            
            $user = $stmt->fetch();
            return $user ?: null;
        } catch (PDOException $e) {
            throw new \Exception('ERR_GET_USER_FAILED');
        }
    }

    /**
     * Find user by ID
     */
    public function findById(int $userId): array
    {
        try {
            $stmt = $this->db->prepare(
                'SELECT id, user_code, email, user_name, user_phone, user_address, created_at, updated_at FROM users WHERE id = ?'
            );
            $stmt->execute([$userId]);
            
            $user = $stmt->fetch();
            
            if (!$user) {
                throw new \Exception('ERR_USER_NOT_FOUND');
            }
            
            return $user;
        } catch (\PDOException $e) {
            throw new \Exception('ERR_GET_USER_FAILED');
        }
    }

    /**
     * Update user password
     */
    public function updatePassword(int $userId, string $newPasswordHash): bool
    {
        try {
            $stmt = $this->db->prepare(
                'UPDATE users SET password_hash = ? WHERE id = ?'
            );
            return $stmt->execute([$newPasswordHash, $userId]);
        } catch (PDOException $e) {
            throw new \Exception('ERR_PASSWORD_CHANGE_FAILED');
        }
    }

    /**
     * Verify password against hash
     */
    public function verifyPassword(string $password, string $hash): bool
    {
        return password_verify($password, $hash);
    }

    /**
     * Hash password using bcrypt
     */
    public function hashPassword(string $password): string
    {
        return password_hash($password, PASSWORD_BCRYPT, ['cost' => 10]);
    }
}
