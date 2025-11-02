<?php

namespace App\Middleware;

use App\Config\JWTConfig;

class AuthMiddleware
{
    public static function authenticate(): array
    {
        error_log('[AuthMiddleware] authenticate - Start');
        $token = self::extractToken();
        error_log('[AuthMiddleware] authenticate - Token extracted: ' . ($token ? substr($token, 0, 20) . '...' : 'null'));
        
        if (!$token) {
            error_log('[AuthMiddleware] authenticate - No token found');
            self::sendErrorResponse(401, 'ERR_MISSING_TOKEN', 'Token is required');
        }

        try {
            $decoded = JWTConfig::verifyToken($token);
            error_log('[AuthMiddleware] authenticate - Token verified: ' . json_encode($decoded));
            return $decoded;
        } catch (\Exception $e) {
            error_log('[AuthMiddleware] authenticate - Token verification failed: ' . $e->getMessage());
            self::sendErrorResponse(401, 'ERR_INVALID_TOKEN', 'Invalid or expired token: ' . $e->getMessage());
        }
    }

    private static function extractToken(): ?string
    {
        // Check Authorization header first
        $headers = getallheaders();
        if (isset($headers['Authorization'])) {
            $authHeader = $headers['Authorization'];
            if (preg_match('/Bearer\s+(.*)$/i', $authHeader, $matches)) {
                return $matches[1];
            }
        }

        // Fallback: check body field (not recommended)
        $input = json_decode(file_get_contents('php://input'), true);
        if (isset($input['token'])) {
            return $input['token'];
        }

        return null;
    }

    private static function sendErrorResponse(int $statusCode, string $error, string $message): void
    {
        http_response_code($statusCode);
        header('Content-Type: application/json');
        echo json_encode([
            'error' => $error,
            'message' => $message
        ]);
        exit;
    }
}
