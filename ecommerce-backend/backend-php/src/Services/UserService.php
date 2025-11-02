<?php

namespace App\Services;

use App\Models\User;
use App\Config\JWTConfig;

class UserService
{
    private User $userModel;

    public function __construct()
    {
        $this->userModel = new User();
    }

    /**
     * Register new user
     * @param string $email User email
     * @param string $password Plain text password
     * @return array ['user' => user data, 'token' => JWT token]
     */
    public function register(string $email, string $password): array
    {
        // Check if user already exists
        $existingUser = $this->userModel->findByEmail($email);
        if ($existingUser) {
            throw new \Exception('ERR_EMAIL_EXISTS');
        }

        // Hash password with bcrypt
        $passwordHash = $this->userModel->hashPassword($password);

        // Create user
        $user = $this->userModel->create($email, $passwordHash);

        // Generate JWT token (8 hours expiration)
        $token = JWTConfig::generateToken([
            'userId' => $user['id'],
            'userCode' => $user['user_code'],
            'email' => $user['email']
        ]);

        return [
            'user' => $user,
            'token' => $token
        ];
    }

    /**
     * Login user
     * @param string $email User email
     * @param string $password Plain text password
     * @return array ['user' => user data, 'token' => JWT token]
     */
    public function login(string $email, string $password): array
    {
        // Find user by email
        $user = $this->userModel->findByEmail($email);
        if (!$user) {
            throw new \Exception('ERR_INVALID_CREDENTIALS');
        }

        // Verify password
        if (!$this->userModel->verifyPassword($password, $user['password_hash'])) {
            throw new \Exception('ERR_INVALID_CREDENTIALS');
        }

        // Remove password hash from response
        unset($user['password_hash']);

        // Generate JWT token (8 hours expiration)
        $token = JWTConfig::generateToken([
            'userId' => $user['id'],
            'userCode' => $user['user_code'],
            'email' => $user['email']
        ]);

        return [
            'user' => $user,
            'token' => $token
        ];
    }

    /**
     * Change user password
     * @param int $userId User ID
     * @param string $currentPassword Current plain text password
     * @param string $newPassword New plain text password
     * @return array Success message
     */
    public function changePassword(int $userId, string $currentPassword, string $newPassword): array
    {
        // Get user
        $user = $this->userModel->findById($userId);

        // Get user with password to verify current password
        $userWithPassword = $this->userModel->findByEmail($user['email']);
        
        // Verify current password
        if (!$this->userModel->verifyPassword($currentPassword, $userWithPassword['password_hash'])) {
            throw new \Exception('ERR_INVALID_CURRENT_PASSWORD');
        }

        // Hash new password with bcrypt
        $newPasswordHash = $this->userModel->hashPassword($newPassword);

        // Update password
        $this->userModel->updatePassword($userId, $newPasswordHash);

        return ['message' => 'Password changed successfully'];
    }

  public function getProfile(int $userId): array
  {
    $user = $this->userModel->findById($userId);
    return $user;
  }

  public function updateProfile(int $userId, array $data): array
  {
    $fields = [];
    $params = [];
    if (isset($data['user_name'])) { $fields[] = 'user_name = ?'; $params[] = $data['user_name']; }
    if (isset($data['user_phone'])) { $fields[] = 'user_phone = ?'; $params[] = $data['user_phone']; }
    if (isset($data['user_address'])) { $fields[] = 'user_address = ?'; $params[] = $data['user_address']; }
    if (!empty($fields)) {
      $sql = 'UPDATE users SET ' . implode(', ', $fields) . ' WHERE id = ?';
      $params[] = $userId;
      $db = \App\Config\Database::getInstance();
      $stmt = $db->prepare($sql);
      $stmt->execute($params);
    }
    return $this->userModel->findById($userId);
  }

  /**
   * Request password reset - generates token and logs it to console
   * @param string $email User email
   * @return array ['success' => true, 'message' => string, 'email' => string]
   */
  public function forgotPassword(string $email): array
  {
    // Check if user exists
    $user = $this->userModel->findByEmail($email);
    if (!$user) {
      throw new \Exception('ERR_USER_NOT_FOUND');
    }

    // Generate reset token (valid for 15 minutes)
    $resetToken = bin2hex(random_bytes(32));
    $expiryDate = date('Y-m-d H:i:s', time() + 15 * 60); // 15 minutes from now

    // Save token to database
    $db = \App\Config\Database::getInstance();
    $stmt = $db->prepare('UPDATE users SET reset_token = ?, reset_token_expiry = ? WHERE id = ?');
    $stmt->execute([$resetToken, $expiryDate, $user['id']]);

    // 🔍 LOG TOKEN TO CONSOLE (since no email service)
    error_log("\n=== PASSWORD RESET TOKEN ===");
    error_log("Email: {$email}");
    error_log("Token: {$resetToken}");
    error_log("Expires at: {$expiryDate}");
    error_log("Reset URL: http://localhost:3000/reset-password?token={$resetToken}");
    error_log("============================\n");

    return [
      'success' => true,
      'message' => 'Password reset token generated. Check console logs for token.',
      'email' => $user['email']
    ];
  }

  /**
   * Reset password using token
   * @param string $token Reset token
   * @param string $newPassword New plain text password
   * @return array ['success' => true, 'message' => string, 'email' => string]
   */
  public function resetPassword(string $token, string $newPassword): array
  {
    // Find user with valid token
    $db = \App\Config\Database::getInstance();
    $stmt = $db->prepare('SELECT id, email FROM users WHERE reset_token = ? AND reset_token_expiry > NOW()');
    $stmt->execute([$token]);
    $user = $stmt->fetch(\PDO::FETCH_ASSOC);

    if (!$user) {
      throw new \Exception('ERR_INVALID_OR_EXPIRED_TOKEN');
    }

    // Hash new password
    $passwordHash = password_hash($newPassword, PASSWORD_BCRYPT);

    // Update password and clear reset token
    $stmt = $db->prepare('UPDATE users SET password_hash = ?, reset_token = NULL, reset_token_expiry = NULL WHERE id = ?');
    $stmt->execute([$passwordHash, $user['id']]);

    error_log("\n✅ Password reset successful for user: {$user['email']}\n");

    return [
      'success' => true,
      'message' => 'Password has been reset successfully.',
      'email' => $user['email']
    ];
  }

  /**
   * Verify email with token
   * @param string $token Verification token
   * @return array ['success' => true, 'message' => string, 'email' => string]
   */
  public function verifyEmail(string $token): array
  {
    // Find user with valid verification token
    $db = \App\Config\Database::getInstance();
    $stmt = $db->prepare('SELECT id, email FROM users WHERE verification_token = ?');
    $stmt->execute([$token]);
    $user = $stmt->fetch(\PDO::FETCH_ASSOC);

    if (!$user) {
      throw new \Exception('ERR_INVALID_VERIFICATION_TOKEN');
    }

    // Mark email as verified and clear token
    $stmt = $db->prepare('UPDATE users SET email_verified = 1, verification_token = NULL WHERE id = ?');
    $stmt->execute([$user['id']]);

    error_log("\n✅ Email verified successfully for user: {$user['email']}\n");

    return [
      'success' => true,
      'message' => 'Email has been verified successfully.',
      'email' => $user['email']
    ];
  }

  /**
   * Resend verification email
   * @param string $email User email
   * @return array ['success' => true, 'message' => string, 'email' => string]
   */
  public function resendVerification(string $email): array
  {
    // Check if user exists
    $user = $this->userModel->findByEmail($email);
    if (!$user) {
      throw new \Exception('ERR_USER_NOT_FOUND');
    }

    // Check if already verified
    if ($user['email_verified'] == 1) {
      throw new \Exception('ERR_EMAIL_ALREADY_VERIFIED');
    }

    // Generate new verification token
    $verificationToken = bin2hex(random_bytes(32));

    // Save token to database
    $db = \App\Config\Database::getInstance();
    $stmt = $db->prepare('UPDATE users SET verification_token = ? WHERE id = ?');
    $stmt->execute([$verificationToken, $user['id']]);

    // 🔍 LOG TOKEN TO CONSOLE (since no email service)
    error_log("\n=== EMAIL VERIFICATION TOKEN ===");
    error_log("Email: {$email}");
    error_log("Token: {$verificationToken}");
    error_log("Verify URL: http://localhost:3000/verify-email?token={$verificationToken}");
    error_log("================================\n");

    return [
      'success' => true,
      'message' => 'Verification token generated. Check console logs for token.',
      'email' => $user['email']
    ];
  }
}
