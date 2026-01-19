# Login Debugging Guide

## Current Error
```
AuthApiError: Invalid login credentials
Status: 400
Code: invalid_credentials
```

## What This Means

The error indicates either:
1. ❌ **User doesn't exist** in Supabase Auth table
2. ❌ **Password is incorrect**
3. ✅ **Supabase credentials are valid** (connection succeeded)

## Solution

### Option 1: Create a Test User in Supabase

1. Go to **Supabase Dashboard**
2. Select your project
3. Click **Authentication** → **Users**
4. Click **Invite** or **Add user**
5. Create a test user:
   - Email: `test@example.com`
   - Password: `TestPassword123!`
6. **Confirm email** (mark as verified)
7. Try login with those credentials

### Option 2: Check Existing Users

1. Go to **Supabase Dashboard**
2. **Authentication** → **Users**
3. Look for any existing users
4. Try their email and password
5. Make sure their email is **verified** (green checkmark)

### Option 3: Reset Your Supabase Auth

If you want to start fresh:

1. **Supabase Dashboard** → **Authentication** → **Users**
2. Delete all users
3. Create new test user with known credentials
4. Mark email as verified

## API Response Details

The login flow works correctly:
```
✅ Frontend sends email/password to /api/auth/login
✅ Backend connects to Supabase
❌ Supabase says: "User not found or password wrong"
```

## Testing Checklist

- [ ] User exists in Supabase Auth
- [ ] User email is **verified** (not pending confirmation)
- [ ] Password is correct
- [ ] Email matches exactly (case-sensitive)

## Next Steps

1. **Check Supabase users** (go to Authentication → Users)
2. **Create test user** if none exist
3. **Verify email** for the user
4. **Test login** with correct credentials
5. Should see redirect to `/dashboard`

## Common Issues

### "Invalid login credentials" but user exists
- → User email is not verified (orange/yellow badge)
- → Solution: Mark email as verified in Supabase dashboard

### User doesn't appear in Auth table
- → Account wasn't created yet
- → Solution: Create test user from Supabase dashboard invite

### Password works but email doesn't match
- → Check email spelling (case matters)
- → Clear browser cache/cookies
- → Try incognito window
