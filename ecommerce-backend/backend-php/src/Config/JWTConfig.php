<?php

namespace App\Config;

use Firebase\JWT\JWT;
use Firebase\JWT\Key;
use Firebase\JWT\ExpiredException;
use Firebase\JWT\SignatureInvalidException;

class JWTConfig
{
    private static string $secret;
    private static string $algorithm = 'HS256';
    private static string $expiresIn = '8h';

    public static function init(): void
    {
        self::$secret = $_ENV['JWT_SECRET'] ?? 'your-super-secret-jwt-key-change-this-in-production';
    }

    public static function generateToken(array $payload): string
    {
        self::init();
        
        $now = time();
        $expiresIn = self::parseExpiresIn(self::$expiresIn);
        
        $payload = array_merge($payload, [
            'iat' => $now,
            'exp' => $now + $expiresIn
        ]);

        return JWT::encode($payload, self::$secret, self::$algorithm);
    }

    public static function verifyToken(string $token): array
    {
        self::init();
        
        try {
            $decoded = JWT::decode($token, new Key(self::$secret, self::$algorithm));
            return (array) $decoded;
        } catch (ExpiredException $e) {
            throw new \Exception('Token has expired');
        } catch (SignatureInvalidException $e) {
            throw new \Exception('Invalid token signature');
        } catch (\Exception $e) {
            throw new \Exception('Invalid token');
        }
    }

    public static function decodeToken(string $token): array
    {
        return (array) JWT::decode($token, new Key('', self::$algorithm), true);
    }

    private static function parseExpiresIn(string $expiresIn): int
    {
        $unit = substr($expiresIn, -1);
        $value = (int) substr($expiresIn, 0, -1);

        switch ($unit) {
            case 'h':
                return $value * 3600;
            case 'm':
                return $value * 60;
            case 'd':
                return $value * 86400;
            default:
                return 3600; // Default 1 hour
        }
    }
}
