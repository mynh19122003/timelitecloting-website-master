# Profile Feature - Testing Guide

## ✅ Backend API Status

### PHP Backend Profile API - **WORKING**
- ✅ **GET** `/api/php/users/profile` - Retrieve user profile
- ✅ **PUT** `/api/php/users/profile` - Update user profile (name, phone, address)
- ✅ JWT Authentication - Token-based authentication
- ✅ Data Persistence - All data saved to MySQL database

### Test Results
```
=== COMPLETE PROFILE API TEST ===

[1/4] Login...
OK Login successful

[2/4] Get initial profile...
OK Profile retrieved
  Email: testprofile@example.com
  Name: John Doe Updated
  Phone: +84987654321
  Address: 123 Main Street, Hanoi, Vietnam

[3/4] Update profile...
OK Profile updated successfully

[4/4] Verify updated profile...
OK Verification successful
OK Data persistence verified!

=== ALL TESTS PASSED ===
Backend PHP Profile API is working correctly!
```

## 🧪 How to Test Backend API

### Prerequisites
- Docker containers running (MySQL, PHP backend, Gateway)
- Test user account created

### Running Backend Tests

1. **Quick Test:**
```powershell
powershell -ExecutionPolicy Bypass -File test-complete-flow.ps1
```

2. **Manual API Testing:**

**Login:**
```powershell
curl.exe -X POST "http://localhost/api/php/users/login" `
  -H "Content-Type: application/json" `
  --data-binary "@login-data.json"
```

**Get Profile:**
```powershell
curl.exe -X GET "http://localhost/api/php/users/profile" `
  -H "Authorization: Bearer YOUR_TOKEN" `
  -H "Content-Type: application/json"
```

**Update Profile:**
```powershell
curl.exe -X PUT "http://localhost/api/php/users/profile" `
  -H "Authorization: Bearer YOUR_TOKEN" `
  -H "Content-Type: application/json" `
  --data-binary "@update-profile.json"
```

## 🌐 Testing Frontend

### Test Account
- **Email:** `testprofile@example.com`
- **Password:** `password123`

### Steps to Test Frontend

1. **Start Frontend** (if not running):
```powershell
npm run dev
```

2. **Open Browser:**
   - Navigate to: `http://localhost:3000`

3. **Login:**
   - Click "Login" or navigate to `/login`
   - Enter test credentials:
     - Email: `testprofile@example.com`
     - Password: `password123`
   - Click "Login"

4. **Access Profile Page:**
   - After login, navigate to `/profile` or click Profile menu
   - You should see your profile information

5. **Test Profile Viewing:**
   - ✅ Check that email is displayed correctly
   - ✅ Check that name is displayed: "John Doe Updated"
   - ✅ Check that phone is displayed: "+84987654321"
   - ✅ Check that address is displayed: "123 Main Street, Hanoi, Vietnam"

6. **Test Profile Editing:**
   - Click "Edit Profile" button
   - Edit form should appear with current values
   - Modify the following fields:
     - **Name:** Change to "Jane Smith"
     - **Phone:** Change to "+1234567890"
     - **Address:** Change to "456 New Avenue, NYC, USA"
   - Click "Save changes"

7. **Verify Update:**
   - ✅ Success message should appear
   - ✅ Profile should show updated values
   - ✅ Refresh page - data should persist
   - ✅ Logout and login again - data should still be there

8. **Test Phone Input Component:**
   - Click "Edit Profile"
   - Click on phone number field
   - ✅ Country selector dropdown should appear
   - ✅ Can search for countries
   - ✅ Can select different country codes
   - ✅ Phone number formats correctly

## 📊 Database Verification

Check data in MySQL database:

```powershell
docker exec ecommerce-mysql mysql -u root -prootpassword ecommerce_db -e "SELECT user_code, email, name, phone, address FROM users WHERE email = 'testprofile@example.com';"
```

Expected output:
```
user_code    email                       name               phone            address
UID00020     testprofile@example.com     John Doe Updated   +84987654321     123 Main Street, Hanoi, Vietnam
```

## 🐛 Troubleshooting

### Backend Issues

1. **"Email and password are required" error:**
   - Use `--data-binary "@file.json"` instead of inline JSON strings
   - PowerShell has issues with JSON string escaping

2. **"Invalid token" error:**
   - Token expires after 8 hours
   - Login again to get new token

3. **"No valid fields to update" error:**
   - Check JSON file encoding (should be UTF-8 without BOM)
   - Ensure at least one of: name, phone, or address is provided

### Frontend Issues

1. **Profile not loading:**
   - Check browser console for errors
   - Verify token exists in localStorage
   - Check Network tab for API calls

2. **Update not saving:**
   - Check browser console for errors
   - Verify API response in Network tab
   - Check backend logs: `docker logs ecommerce-backend-php --tail 50`

3. **Phone input not working:**
   - Ensure `react-country-phone-input` is installed
   - Check CSS is loaded correctly
   - Verify no console errors

## 📁 Test Files

- `login-data.json` - Login credentials
- `register-data.json` - Registration data
- `update-profile.json` - Profile update data
- `test-complete-flow.ps1` - Complete API test script

## 🔒 Security Notes

- ✅ JWT authentication implemented
- ✅ Password hashing with bcrypt
- ✅ Token-based authorization
- ✅ CORS headers configured
- ✅ SQL injection prevention (prepared statements)
- ✅ Input validation

## ✨ Features Implemented

### Backend (PHP)
- ✅ User registration with auto-generated user_code
- ✅ User login with JWT token generation
- ✅ Get profile (authenticated)
- ✅ Update profile (name, phone, address)
- ✅ Error handling and logging
- ✅ Database triggers for user_code generation

### Frontend (React)
- ✅ ProfilePage component
- ✅ Profile view/edit toggle
- ✅ Form validation
- ✅ Country phone input component
- ✅ API integration with ApiService
- ✅ Token management
- ✅ Error handling
- ✅ Success messages
- ✅ Responsive design

## 🎯 Next Steps

If all tests pass:
1. ✅ Backend API working
2. ✅ Database persistence working
3. Test frontend integration manually
4. Test edge cases (empty fields, invalid data)
5. Clean up temporary test files

## 📝 Notes

- Profile fields (name, phone, address) are optional
- Email cannot be changed through profile update
- User code is auto-generated on registration
- Token expires in 8 hours (configurable in JWT_EXPIRES_IN)

