<?php

namespace App\Controllers;

use App\Services\UserService;
use App\Middleware\AuthMiddleware;

class UserController
{
    private UserService $userService;

    public function __construct()
    {
        $this->userService = new UserService();
    }

    /**
     * Register new user
     * POST /api/php/users/register
     * Body: { "email": "user@example.com", "password": "password123" }
     */
    public function register(): void
    {
        try {
            $input = json_decode(file_get_contents('php://input'), true);
            error_log('[PHP] /api/php/users/register body: ' . json_encode($input));
            
            // Validate required fields
            if (!isset($input['email']) || !isset($input['password'])) {
                $this->sendErrorResponse(400, 'ERR_VALIDATION_FAILED', 'Email and password are required');
                return;
            }

            $email = trim($input['email']);
            $password = $input['password'];

            // Validate email format
            if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
                $this->sendErrorResponse(400, 'ERR_VALIDATION_FAILED', 'Invalid email format');
                return;
            }

            // Validate password length
            if (strlen($password) < 6) {
                $this->sendErrorResponse(400, 'ERR_VALIDATION_FAILED', 'Password must be at least 6 characters');
                return;
            }

            $result = $this->userService->register($email, $password);
            
            $this->sendSuccessResponse(201, 'User registered successfully', $result);
        } catch (\Exception $e) {
            if ($e->getMessage() === 'ERR_EMAIL_EXISTS') {
                $this->sendErrorResponse(409, 'ERR_EMAIL_EXISTS', 'Email already exists');
            } else {
                $this->sendErrorResponse(500, 'ERR_REGISTRATION_FAILED', 'Registration failed: ' . $e->getMessage());
            }
        }
    }

    /**
     * Login user
     * POST /api/php/users/login
     * Body: { "email": "user@example.com", "password": "password123" }
     */
    public function login(): void
    {
        try {
            $input = json_decode(file_get_contents('php://input'), true);
            error_log('[PHP] /api/php/users/login body: ' . json_encode($input));
            
            // Validate required fields
            if (!isset($input['email']) || !isset($input['password'])) {
                $this->sendErrorResponse(400, 'ERR_VALIDATION_FAILED', 'Email and password are required');
                return;
            }

            $email = trim($input['email']);
            $password = $input['password'];

            $result = $this->userService->login($email, $password);
            
            $this->sendSuccessResponse(200, 'Login successful', $result);
        } catch (\Exception $e) {
            if ($e->getMessage() === 'ERR_INVALID_CREDENTIALS') {
                $this->sendErrorResponse(401, 'ERR_INVALID_CREDENTIALS', 'Invalid email or password');
            } else {
                $this->sendErrorResponse(500, 'ERR_LOGIN_FAILED', 'Login failed: ' . $e->getMessage());
            }
        }
    }

    /**
     * Change password (requires authentication)
     * PUT /api/php/users/change-password
     * Headers: Authorization: Bearer {token}
     * Body: { "currentPassword": "old123", "newPassword": "new123" }
     */
    public function changePassword(): void
    {
        try {
            // Authenticate user
            $user = AuthMiddleware::authenticate();
            
            $input = json_decode(file_get_contents('php://input'), true);
            
            // Validate required fields
            if (!isset($input['currentPassword']) || !isset($input['newPassword'])) {
                $this->sendErrorResponse(400, 'ERR_VALIDATION_FAILED', 'Current password and new password are required');
                return;
            }

            $currentPassword = $input['currentPassword'];
            $newPassword = $input['newPassword'];

            // Validate new password length
            if (strlen($newPassword) < 6) {
                $this->sendErrorResponse(400, 'ERR_VALIDATION_FAILED', 'New password must be at least 6 characters');
                return;
            }

            $result = $this->userService->changePassword($user['userId'], $currentPassword, $newPassword);
            
            $this->sendSuccessResponse(200, 'Password changed successfully', $result);
        } catch (\Exception $e) {
            if ($e->getMessage() === 'ERR_INVALID_CURRENT_PASSWORD') {
                $this->sendErrorResponse(400, 'ERR_INVALID_CURRENT_PASSWORD', 'Current password is incorrect');
            } else {
                $this->sendErrorResponse(500, 'ERR_PASSWORD_CHANGE_FAILED', 'Password change failed');
            }
        }
    }

    /**
     * Get profile
     * GET /api/php/users/profile
     */
    public function getProfile(): void
    {
        try {
            $user = AuthMiddleware::authenticate();
            $service = new UserService();
            $data = $service->getProfile($user['userId']);
            $this->sendSuccessResponse(200, 'Profile retrieved successfully', $data);
        } catch (\Exception $e) {
            $this->sendErrorResponse(500, 'ERR_GET_PROFILE_FAILED', 'Get profile failed');
        }
    }

    /**
     * Update profile
     * PUT /api/php/users/profile
     * Body: { user_name?, user_phone?, user_address? }
     */
    public function updateProfile(): void
    {
        try {
            $user = AuthMiddleware::authenticate();
            $input = json_decode(file_get_contents('php://input'), true);
            $service = new UserService();
            $data = $service->updateProfile($user['userId'], [
                'user_name' => $input['user_name'] ?? null,
                'user_phone' => $input['user_phone'] ?? null,
                'user_address' => $input['user_address'] ?? null,
            ]);
            $this->sendSuccessResponse(200, 'Profile updated successfully', $data);
        } catch (\Exception $e) {
            $this->sendErrorResponse(500, 'ERR_UPDATE_PROFILE_FAILED', 'Update profile failed');
        }
    }

    /**
     * Send success response
     */
    private function sendSuccessResponse(int $statusCode, string $message, array $data = []): void
    {
        http_response_code($statusCode);
        header('Content-Type: application/json');
        echo json_encode([
            'success' => true,
            'message' => $message,
            'data' => $data
        ]);
    }

    /**
     * Forgot password - request reset token
     * POST /api/php/users/forgot-password
     * Body: { "email": "user@example.com" }
     */
    public function forgotPassword(): void
    {
        try {
            $input = json_decode(file_get_contents('php://input'), true);
            $email = $input['email'] ?? null;

            // Validate required fields
            if (!$email) {
                $this->sendErrorResponse(400, 'ERR_VALIDATION_FAILED', 'Email is required');
                return;
            }

            // Validate email format
            if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
                $this->sendErrorResponse(400, 'ERR_VALIDATION_FAILED', 'Invalid email format');
                return;
            }

            $result = $this->userService->forgotPassword($email);

            $this->sendSuccessResponse(200, $result['message'], ['email' => $result['email']]);
        } catch (\Exception $e) {
            error_log('[PHP] Forgot password error: ' . $e->getMessage());
            if ($e->getMessage() === 'ERR_USER_NOT_FOUND') {
                $this->sendErrorResponse(404, 'ERR_USER_NOT_FOUND', 'No user found with this email address');
                return;
            }
            $this->sendErrorResponse(500, 'ERR_FORGOT_PASSWORD_FAILED', 'Failed to process password reset request');
        }
    }

    /**
     * Reset password with token
     * POST /api/php/users/reset-password
     * Body: { "token": "abc123...", "newPassword": "newpass123" }
     */
    public function resetPassword(): void
    {
        try {
            $input = json_decode(file_get_contents('php://input'), true);
            $token = $input['token'] ?? null;
            $newPassword = $input['newPassword'] ?? null;

            // Validate required fields
            if (!$token || !$newPassword) {
                $this->sendErrorResponse(400, 'ERR_VALIDATION_FAILED', 'Token and new password are required');
                return;
            }

            // Validate password length
            if (strlen($newPassword) < 6) {
                $this->sendErrorResponse(400, 'ERR_VALIDATION_FAILED', 'Password must be at least 6 characters');
                return;
            }

            $result = $this->userService->resetPassword($token, $newPassword);

            $this->sendSuccessResponse(200, $result['message'], ['email' => $result['email']]);
        } catch (\Exception $e) {
            error_log('[PHP] Reset password error: ' . $e->getMessage());
            if ($e->getMessage() === 'ERR_INVALID_OR_EXPIRED_TOKEN') {
                $this->sendErrorResponse(400, 'ERR_INVALID_OR_EXPIRED_TOKEN', 'Invalid or expired reset token. Please request a new one.');
                return;
            }
            $this->sendErrorResponse(500, 'ERR_RESET_PASSWORD_FAILED', 'Failed to reset password');
        }
    }

    /**
     * Verify email with token
     * POST /api/php/users/verify-email
     * Body: { "token": "abc123..." }
     */
    public function verifyEmail(): void
    {
        try {
            $input = json_decode(file_get_contents('php://input'), true);
            $token = $input['token'] ?? null;

            // Validate required fields
            if (!$token) {
                $this->sendErrorResponse(400, 'ERR_VALIDATION_FAILED', 'Verification token is required');
                return;
            }

            $result = $this->userService->verifyEmail($token);

            $this->sendSuccessResponse(200, $result['message'], ['email' => $result['email']]);
        } catch (\Exception $e) {
            error_log('[PHP] Verify email error: ' . $e->getMessage());
            if ($e->getMessage() === 'ERR_INVALID_VERIFICATION_TOKEN') {
                $this->sendErrorResponse(400, 'ERR_INVALID_VERIFICATION_TOKEN', 'Invalid verification token');
                return;
            }
            $this->sendErrorResponse(500, 'ERR_VERIFY_EMAIL_FAILED', 'Failed to verify email');
        }
    }

    /**
     * Resend verification email
     * POST /api/php/users/resend-verification
     * Body: { "email": "user@example.com" }
     */
    public function resendVerification(): void
    {
        try {
            $input = json_decode(file_get_contents('php://input'), true);
            $email = $input['email'] ?? null;

            // Validate required fields
            if (!$email) {
                $this->sendErrorResponse(400, 'ERR_VALIDATION_FAILED', 'Email is required');
                return;
            }

            // Validate email format
            if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
                $this->sendErrorResponse(400, 'ERR_VALIDATION_FAILED', 'Invalid email format');
                return;
            }

            $result = $this->userService->resendVerification($email);

            $this->sendSuccessResponse(200, $result['message'], ['email' => $result['email']]);
        } catch (\Exception $e) {
            error_log('[PHP] Resend verification error: ' . $e->getMessage());
            if ($e->getMessage() === 'ERR_USER_NOT_FOUND') {
                $this->sendErrorResponse(404, 'ERR_USER_NOT_FOUND', 'No user found with this email address');
                return;
            }
            if ($e->getMessage() === 'ERR_EMAIL_ALREADY_VERIFIED') {
                $this->sendErrorResponse(400, 'ERR_EMAIL_ALREADY_VERIFIED', 'Email is already verified');
                return;
            }
            $this->sendErrorResponse(500, 'ERR_RESEND_VERIFICATION_FAILED', 'Failed to resend verification email');
        }
    }

    /**
     * Send error response
     */
    private function sendErrorResponse(int $statusCode, string $error, string $message): void
    {
        http_response_code($statusCode);
        header('Content-Type: application/json');
        echo json_encode([
            'error' => $error,
            'message' => $message
        ]);
    }
}
