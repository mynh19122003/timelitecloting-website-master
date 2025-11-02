<?php

namespace App\Config;

use PDO;
use PDOException;

class Database
{
    private static ?PDO $instance = null;
    private static array $config = [];

    public static function getInstance(): PDO
    {
        if (self::$instance === null) {
            self::loadConfig();
            self::$instance = self::createConnection();
        }
        
        return self::$instance;
    }

    private static function loadConfig(): void
    {
        self::$config = [
            'host' => $_ENV['DB_HOST'] ?? 'mysql',
            'port' => $_ENV['DB_PORT'] ?? '3306',
            'dbname' => $_ENV['DB_NAME'] ?? 'ecommerce_db',
            'username' => $_ENV['DB_USER'] ?? 'root',
            'password' => $_ENV['DB_PASSWORD'] ?? 'rootpassword',
            'charset' => 'utf8mb4'
        ];
    }

    private static function createConnection(): PDO
    {
        $dsn = sprintf(
            'mysql:host=%s;port=%s;dbname=%s;charset=%s',
            self::$config['host'],
            self::$config['port'],
            self::$config['dbname'],
            self::$config['charset']
        );

        $options = [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
            PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci"
        ];

        try {
            $pdo = new PDO($dsn, self::$config['username'], self::$config['password'], $options);
            return $pdo;
        } catch (PDOException $e) {
            error_log("Database connection failed: " . $e->getMessage());
            throw new PDOException("Database connection failed", 0, $e);
        }
    }

    public static function testConnection(): bool
    {
        try {
            $pdo = self::getInstance();
            $pdo->query('SELECT 1');
            return true;
        } catch (PDOException $e) {
            error_log("Database test connection failed: " . $e->getMessage());
            return false;
        }
    }
}
