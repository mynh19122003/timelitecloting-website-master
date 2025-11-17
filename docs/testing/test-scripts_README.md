# Test Scripts for Profile API

This directory contains test scripts and data files for testing the Profile API functionality.

## 📁 Files

### Test Scripts
- `test-complete-flow.ps1` - Complete end-to-end test (Login → Get Profile → Update → Verify)
- `test-profile-curl.ps1` - Alternative test using curl with file-based JSON
- `test-profile-update.ps1` - Simple profile update test (deprecated, use test-complete-flow.ps1)

### Data Files
- `login-data.json` - Login credentials
- `register-data.json` - Registration data for new users
- `update-profile.json` - Profile update data
- `update-data.json` - Alternative update data

## 🚀 Quick Start

### Run Complete Test Suite
```powershell
cd test-scripts
powershell -ExecutionPolicy Bypass -File test-complete-flow.ps1
```

Expected output:
```
=== COMPLETE PROFILE API TEST ===

[1/4] Login...
OK Login successful

[2/4] Get initial profile...
OK Profile retrieved

[3/4] Update profile...
OK Profile updated successfully

[4/4] Verify updated profile...
OK Verification successful
OK Data persistence verified!

=== ALL TESTS PASSED ===
Backend PHP Profile API is working correctly!
```

## 📝 Test Account

Default test account (already registered):
- **Email:** `testprofile@example.com`
- **Password:** `password123`

## 🔧 Manual API Testing

### 1. Register New User
```powershell
curl.exe -X POST "http://localhost/api/php/users/register" `
  -H "Content-Type: application/json" `
  --data-binary "@register-data.json"
```

### 2. Login
```powershell
curl.exe -X POST "http://localhost/api/php/users/login" `
  -H "Content-Type: application/json" `
  --data-binary "@login-data.json"
```

### 3. Get Profile
```powershell
# Replace YOUR_TOKEN with the token from login response
curl.exe -X GET "http://localhost/api/php/users/profile" `
  -H "Authorization: Bearer YOUR_TOKEN" `
  -H "Content-Type: application/json"
```

### 4. Update Profile
```powershell
curl.exe -X PUT "http://localhost/api/php/users/profile" `
  -H "Authorization: Bearer YOUR_TOKEN" `
  -H "Content-Type: application/json" `
  --data-binary "@update-profile.json"
```

## 📊 Modify Test Data

### Change Login Credentials
Edit `login-data.json`:
```json
{
  "email": "your-email@example.com",
  "password": "your-password"
}
```

### Change Profile Update Data
Edit `update-profile.json`:
```json
{
  "name": "Your Name",
  "phone": "+1234567890",
  "address": "Your Address"
}
```

## 🐛 Troubleshooting

### Error: "Email and password are required"
- Make sure JSON files don't have BOM (Byte Order Mark)
- Use `--data-binary` flag instead of `-d` flag with curl

### Error: "Invalid token"
- Token expires after 8 hours
- Get a new token by logging in again

### Error: Connection refused
- Make sure Docker containers are running:
  ```powershell
  cd ..\ecommerce-backend
  docker-compose ps
  ```
- Start containers if not running:
  ```powershell
  docker-compose up -d
  ```

## 📖 Additional Documentation

- See `../PROFILE_TEST_GUIDE.md` for comprehensive testing guide
- See `../PROJECT_STATUS_SUMMARY.md` for project overview
- See `../API_INTEGRATION_GUIDE.md` for API integration details

## ✅ Test Coverage

- ✅ User registration
- ✅ User login
- ✅ JWT token generation
- ✅ Profile retrieval (authenticated)
- ✅ Profile update (authenticated)
- ✅ Data persistence verification
- ✅ Error handling
- ✅ Token validation

## 🔒 Security Notes

- Test credentials are for development only
- Never commit real user credentials
- Change JWT_SECRET before production deployment
- Use HTTPS in production

---

**Last Updated:** October 27, 2025
**Status:** All tests passing ✅

