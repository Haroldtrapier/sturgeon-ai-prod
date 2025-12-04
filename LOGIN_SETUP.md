# Login System Setup Guide

## Overview
The Sturgeon AI application now includes a complete authentication system using Supabase. Users can register, login, and access protected pages like the chat interface.

## Features Implemented
- ✅ User registration page (`/register`)
- ✅ User login page (`/login`)
- ✅ Protected chat page (`/chat`) - requires authentication
- ✅ Session management with Supabase Auth
- ✅ Logout functionality
- ✅ Automatic redirects based on authentication state
- ✅ User email display in navigation

## Required Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```bash
# Supabase Configuration (Required for authentication)
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# AI Configuration (Optional - for chat functionality)
ANTHROPIC_API_KEY=your-anthropic-api-key
OPENAI_API_KEY=your-openai-api-key
```

## Setting Up Supabase

### 1. Create a Supabase Project

1. Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Click "New Project"
3. Enter project details:
   - **Name**: `sturgeon-ai`
   - **Database Password**: Choose a strong password
   - **Region**: Select closest to your users (e.g., `us-east-1`)
4. Click "Create new project"
5. Wait 5-10 minutes for project initialization

### 2. Configure Authentication

1. In your Supabase dashboard, go to **Authentication** → **Providers**
2. Enable **Email** provider (it should be enabled by default)
3. Configure email templates (optional but recommended):
   - Go to **Authentication** → **Email Templates**
   - Customize confirmation and password reset emails

### 3. Get Your API Keys

1. Go to **Settings** → **API**
2. Copy the following:
   - **Project URL** → Use as `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → Use as `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 4. Set Up Database (Optional)

If you want to store additional user data, you can set up the users table:

1. Go to **SQL Editor** in the left sidebar
2. Click "New Query"
3. Run the following SQL:

```sql
-- Enable Row Level Security
ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

-- Create a public profiles table (optional, for extended user data)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE,
  email TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (id)
);

-- Enable RLS for profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policy for profiles (users can read their own profile)
CREATE POLICY "Users can view own profile" 
ON public.profiles FOR SELECT 
USING (auth.uid() = id);

-- Create policy for profiles (users can update their own profile)
CREATE POLICY "Users can update own profile" 
ON public.profiles FOR UPDATE 
USING (auth.uid() = id);
```

## Local Development

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Environment Variables
Create `.env.local` file with your Supabase credentials (see above)

### 3. Run Development Server
```bash
npm run dev
```

### 4. Access the Application
- Homepage: [http://localhost:3000](http://localhost:3000) (redirects to login)
- Login: [http://localhost:3000/login](http://localhost:3000/login)
- Register: [http://localhost:3000/register](http://localhost:3000/register)
- Chat (protected): [http://localhost:3000/chat](http://localhost:3000/chat)

## How It Works

### Authentication Flow

1. **Unauthenticated Users**:
   - Homepage (`/`) redirects to `/login`
   - Protected pages (`/chat`) redirect to `/login`

2. **Registration** (`/register`):
   - Users enter email and password
   - Supabase creates a new user account
   - User is automatically logged in after registration
   - Redirected to `/chat`

3. **Login** (`/login`):
   - Users enter email and password
   - Supabase validates credentials
   - Session is created and stored
   - Redirected to `/chat`

4. **Authenticated Users**:
   - Can access protected pages
   - Session persists across page refreshes
   - See their email in the navigation bar
   - Can logout from any page

5. **Logout**:
   - Clears session from Supabase
   - Redirects to `/login`

### Key Files

- `lib/supabase.ts` - Supabase client initialization
- `lib/AuthContext.tsx` - React context for authentication state
- `pages/_app.tsx` - Wraps app with AuthProvider
- `pages/login.tsx` - Login page
- `pages/register.tsx` - Registration page
- `pages/chat.tsx` - Protected chat page with logout
- `pages/index.tsx` - Homepage with authentication-based redirects

## Deployment

### Vercel Deployment

1. Push your code to GitHub
2. In Vercel dashboard, go to your project settings
3. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `ANTHROPIC_API_KEY` (optional)
   - `OPENAI_API_KEY` (optional)
4. Redeploy

### Other Platforms

For other platforms, ensure environment variables are set before building:
```bash
export NEXT_PUBLIC_SUPABASE_URL="your-url"
export NEXT_PUBLIC_SUPABASE_ANON_KEY="your-key"
npm run build
npm start
```

## Security Notes

1. **Never commit** your `.env.local` file to version control
2. The `NEXT_PUBLIC_*` variables are exposed to the browser (safe for public keys)
3. Supabase handles password hashing and security
4. Row Level Security (RLS) policies protect user data in the database
5. Session tokens are stored securely by Supabase client

## Troubleshooting

### "supabaseUrl is required" Error
- Make sure `.env.local` file exists
- Verify environment variable names start with `NEXT_PUBLIC_`
- Restart the development server after adding environment variables

### Login/Registration Not Working
- Check Supabase dashboard for authentication logs
- Verify email provider is enabled in Supabase
- Check browser console for error messages
- Ensure Supabase project is active and not paused

### Redirects Not Working
- Clear browser cache and cookies
- Check that `AuthProvider` wraps your app in `_app.tsx`
- Verify Supabase session is being created

## Next Steps

To enhance the authentication system, consider:
- [ ] Add password reset functionality
- [ ] Implement email verification
- [ ] Add social login (Google, GitHub, etc.)
- [ ] Create user profile management page
- [ ] Add "Remember me" functionality
- [ ] Implement session timeout warnings
- [ ] Add multi-factor authentication (MFA)

## Support

For issues or questions:
1. Check Supabase documentation: [https://supabase.com/docs](https://supabase.com/docs)
2. Review Next.js documentation: [https://nextjs.org/docs](https://nextjs.org/docs)
3. Check the application logs for error messages
