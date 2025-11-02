<?php

namespace Tests;

use PHPUnit\Framework\TestCase;
use App\Services\UserService;
use App\Models\User;

class UserTest extends TestCase
{
    private UserService $userService;
    private User $userModel;

    protected function setUp(): void
    {
        parent::setUp();
        $this->userService = new UserService();
        $this->userModel = new User();
    }

    public function testRegisterUserSuccessfully()
    {
        $email = 'testphp@example.com';
        $password = 'password123';

        try {
            $result = $this->userService->register($email, $password);

            $this->assertIsArray($result);
            $this->assertArrayHasKey('user', $result);
            $this->assertArrayHasKey('token', $result);

            $user = $result['user'];
            $this->assertArrayHasKey('id', $user);
            $this->assertArrayHasKey('user_code', $user);
            $this->assertArrayHasKey('email', $user);
            $this->assertArrayHasKey('created_at', $user);

            $this->assertEquals($email, $user['email']);
            $this->assertMatchesRegularExpression('/^UID\d{5}$/', $user['user_code']);
            $this->assertIsString($result['token']);

            return $result;
        } catch (\Exception $e) {
            $this->fail('Registration failed: ' . $e->getMessage());
        }
    }

    public function testRegisterUserWithExistingEmail()
    {
        $email = 'existing@example.com';
        $password = 'password123';

        // First registration should succeed
        $this->userService->register($email, $password);

        // Second registration should fail
        $this->expectException(\Exception::class);
        $this->expectExceptionMessage('ERR_EMAIL_EXISTS');
        $this->userService->register($email, $password);
    }

    public function testLoginUserSuccessfully()
    {
        $email = 'logintest@example.com';
        $password = 'password123';

        // Register user first
        $this->userService->register($email, $password);

        // Login should succeed
        $result = $this->userService->login($email, $password);

        $this->assertIsArray($result);
        $this->assertArrayHasKey('user', $result);
        $this->assertArrayHasKey('token', $result);

        $user = $result['user'];
        $this->assertEquals($email, $user['email']);
        $this->assertArrayHasKey('user_code', $user);
        $this->assertIsString($result['token']);

        return $result;
    }

    public function testLoginUserWithInvalidEmail()
    {
        $this->expectException(\Exception::class);
        $this->expectExceptionMessage('ERR_INVALID_CREDENTIALS');
        $this->userService->login('nonexistent@example.com', 'password123');
    }

    public function testLoginUserWithInvalidPassword()
    {
        $email = 'invalidpasstest@example.com';
        $password = 'password123';

        // Register user first
        $this->userService->register($email, $password);

        // Login with wrong password should fail
        $this->expectException(\Exception::class);
        $this->expectExceptionMessage('ERR_INVALID_CREDENTIALS');
        $this->userService->login($email, 'wrongpassword');
    }

    public function testChangePasswordSuccessfully()
    {
        $email = 'changepasstest@example.com';
        $password = 'password123';
        $newPassword = 'newpassword123';

        // Register user first
        $result = $this->userService->register($email, $password);
        $userId = $result['user']['id'];

        // Change password should succeed
        $changeResult = $this->userService->changePassword($userId, $password, $newPassword);

        $this->assertIsArray($changeResult);
        $this->assertArrayHasKey('message', $changeResult);
        $this->assertEquals('Password changed successfully', $changeResult['message']);

        // Login with new password should succeed
        $loginResult = $this->userService->login($email, $newPassword);
        $this->assertIsArray($loginResult);
        $this->assertEquals($email, $loginResult['user']['email']);
    }

    public function testChangePasswordWithWrongCurrentPassword()
    {
        $email = 'wrongpasstest@example.com';
        $password = 'password123';
        $newPassword = 'newpassword123';

        // Register user first
        $result = $this->userService->register($email, $password);
        $userId = $result['user']['id'];

        // Change password with wrong current password should fail
        $this->expectException(\Exception::class);
        $this->expectExceptionMessage('ERR_INVALID_CURRENT_PASSWORD');
        $this->userService->changePassword($userId, 'wrongpassword', $newPassword);
    }

    public function testGetUserProfile()
    {
        $email = 'profiletest@example.com';
        $password = 'password123';

        // Register user first
        $result = $this->userService->register($email, $password);
        $userId = $result['user']['id'];

        // Get profile should succeed
        $profile = $this->userService->getProfile($userId);

        $this->assertIsArray($profile);
        $this->assertArrayHasKey('id', $profile);
        $this->assertArrayHasKey('user_code', $profile);
        $this->assertArrayHasKey('email', $profile);
        $this->assertArrayHasKey('created_at', $profile);

        $this->assertEquals($userId, $profile['id']);
        $this->assertEquals($email, $profile['email']);
        $this->assertMatchesRegularExpression('/^UID\d{5}$/', $profile['user_code']);
    }

    public function testGetUserProfileWithInvalidId()
    {
        $this->expectException(\Exception::class);
        $this->expectExceptionMessage('ERR_USER_NOT_FOUND');
        $this->userService->getProfile(99999);
    }

    public function testPasswordHashing()
    {
        $password = 'testpassword123';
        $hash = $this->userModel->hashPassword($password);

        $this->assertIsString($hash);
        $this->assertNotEquals($password, $hash);
        $this->assertTrue($this->userModel->verifyPassword($password, $hash));
        $this->assertFalse($this->userModel->verifyPassword('wrongpassword', $hash));
    }

    public function testUserCodeGeneration()
    {
        $email1 = 'usercode1@example.com';
        $email2 = 'usercode2@example.com';
        $password = 'password123';

        // Register two users
        $result1 = $this->userService->register($email1, $password);
        $result2 = $this->userService->register($email2, $password);

        $userCode1 = $result1['user']['user_code'];
        $userCode2 = $result2['user']['user_code'];

        // User codes should be different and follow the pattern
        $this->assertNotEquals($userCode1, $userCode2);
        $this->assertMatchesRegularExpression('/^UID\d{5}$/', $userCode1);
        $this->assertMatchesRegularExpression('/^UID\d{5}$/', $userCode2);

        // User codes should be sequential
        $id1 = (int) substr($userCode1, 3);
        $id2 = (int) substr($userCode2, 3);
        $this->assertEquals($id2, $id1 + 1);
    }
}
