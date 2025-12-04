# Authentication Setup Guide

This guide explains how to set up the authentication flow for Sturgeon AI, including login and password reset functionality.

## Features

- ✅ Email/password login
- ✅ Password reset via email
- ✅ Secure password update flow
- ✅ Session management with HTTP-only cookies
- ✅ Integration with Supabase Auth

## Pages

### 1. Login Page (`/login`)
- Email and password input
- Links to password reset
- Handles authentication via `/api/auth/login`

### 2. Reset Password Page (`/reset-password`)
- Email input for password reset request
- Sends reset email via `/api/auth/reset-password`
- Success confirmation message

### 3. Update Password Page (`/update-password`)
- Accepts reset token from email link
- New password and confirmation input
- Updates password via `/api/auth/update-password`
- Auto-redirects to login on success

## API Endpoints

### POST `/api/auth/login`
Authenticates user with email and password.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "userpassword"
}
```

**Response:**
```json
{
  "success": true,
  "user": { ... }
}
```

### POST `/api/auth/reset-password`
Sends password reset email to user.

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Password reset email sent successfully"
}
```

### POST `/api/auth/update-password`
Updates user password using reset token.

**Request Body:**
```json
{
  "password": "newpassword",
  "accessToken": "reset-token-from-email"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Password updated successfully"
}
```

## Supabase Configuration

### 1. Environment Variables

Add these to your `.env.local` file:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

Get these values from:
https://supabase.com/dashboard/project/YOUR_PROJECT_ID/settings/api

### 2. URL Configuration

**CRITICAL:** Configure the redirect URLs in Supabase for password reset to work properly.

Go to: https://supabase.com/dashboard/project/iigtguxrqhcfyrvyunpb/auth/url-configuration

Add these URLs to **Redirect URLs**:

```
https://sturgeon-ai-prod.vercel.app/update-password
https://sturgeon-ai.vercel.app/update-password
http://localhost:3000/update-password
```

### 3. Email Templates (Optional)

You can customize the password reset email template in:
https://supabase.com/dashboard/project/YOUR_PROJECT_ID/auth/templates

The default template includes a link with the format:
```
{{ .SiteURL }}/update-password#access_token={{ .Token }}
```

## Testing Locally

1. Set up environment variables:
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your Supabase credentials
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Navigate to http://localhost:3000/login

## Deployment

1. Add environment variables to Vercel:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

2. Deploy to Vercel:
   ```bash
   git push origin main
   ```

3. **Wait 2 minutes** for Vercel to auto-deploy

4. **Configure Supabase redirect URLs** (see section above)

## Security Notes

- Passwords are never stored in plain text
- Session tokens are stored in HTTP-only cookies
- All authentication requests go through Supabase's secure API
- Password reset tokens expire after 1 hour
- Minimum password length is 6 characters

## Troubleshooting

### "Authentication service not configured" error
- Ensure `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are set
- Restart the development server after adding environment variables

### "Invalid or expired reset link" error
- Check that the redirect URL is configured in Supabase
- Ensure the reset link hasn't expired (valid for 1 hour)
- Try requesting a new reset link

### Reset email not received
- Check spam folder
- Verify email settings in Supabase dashboard
- Ensure SMTP is properly configured in Supabase

## Next Steps

After completing this setup:
1. Test the login flow with a test user
2. Test the password reset flow
3. Implement role-based access control if needed
4. Add protected routes/pages
5. Consider adding social authentication (Google, GitHub, etc.)
