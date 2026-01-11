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

    /**
     * Optional authentication - returns user data if token is valid, null if no token.
     * Use this for endpoints that support both authenticated and guest users.
     */
    public static function optionalAuth(): ?array
    {
        error_log('[AuthMiddleware] optionalAuth - Start');
        $token = self::extractToken();
        error_log('[AuthMiddleware] optionalAuth - Token extracted: ' . ($token ? substr($token, 0, 20) . '...' : 'null'));
        
        if (!$token) {
            error_log('[AuthMiddleware] optionalAuth - No token found, allowing guest');
            return null;
        }

        try {
            $decoded = JWTConfig::verifyToken($token);
            error_log('[AuthMiddleware] optionalAuth - Token verified: ' . json_encode($decoded));
            return $decoded;
        } catch (\Exception $e) {
            error_log('[AuthMiddleware] optionalAuth - Token verification failed: ' . $e->getMessage());
            // For optional auth, treat invalid token as guest instead of error
            return null;
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
