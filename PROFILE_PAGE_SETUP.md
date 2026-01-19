# 👤 Profile Page Setup

## What Was Created

### 1. Profile Page (`app/profile/page.tsx`)
A comprehensive profile page with:
- ✅ Supabase authentication integration
- ✅ Profile data display and editing
- ✅ Integration with `user_profiles` table
- ✅ Backend API integration (optional)
- ✅ Modern, responsive UI with Tailwind CSS

### 2. Backend Endpoint (`backend/main.py`)
- ✅ Added `/me` endpoint for user profile data
- ⚠️ Note: Currently returns placeholder data - needs authentication integration

---

## Features

### Profile Display
- **Email Address** - Shows verified/unverified status
- **Full Name** - Editable
- **Phone Number** - Editable
- **Company Name** - Editable
- **Account Created Date** - Read-only
- **Subscription Plan** - Shows current plan
- **NAICS Codes** - Displays as badges (if available)

### Profile Editing
- Click "Edit Profile" to enter edit mode
- Update: Full Name, Phone, Company Name
- Changes saved to both:
  - Supabase Auth user metadata
  - `user_profiles` table
- Cancel button to discard changes

### Authentication
- Automatically redirects to `/login` if not authenticated
- Uses Supabase Auth to verify user
- Sign out functionality

---

## How It Works

### 1. Data Flow

```
User visits /profile
  ↓
Supabase Auth check
  ↓
Load from Supabase:
  - auth.users (email, created_at)
  - user_profiles table (full_name, phone, company_name, etc.)
  ↓
Optionally load from backend:
  - /me endpoint (if available)
  ↓
Display combined profile data
```

### 2. Profile Loading

The page loads data from multiple sources:

1. **Supabase Auth** (`auth.users`)
   - Email
   - Created date
   - Email verification status

2. **User Profiles Table** (`user_profiles`)
   - Full name
   - Phone number
   - Company name
   - Subscription plan
   - NAICS codes
   - Credits, searches, proposals counts

3. **Backend API** (`/me` endpoint)
   - Optional additional data
   - Currently returns placeholder

### 3. Profile Updates

When user saves changes:
1. Updates Supabase Auth user metadata
2. Upserts to `user_profiles` table
3. Reloads profile data
4. Shows success/error messages

---

## Database Schema

The profile uses the `user_profiles` table from `backend/schema.sql`:

```sql
CREATE TABLE user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id),
    full_name TEXT,
    company_name TEXT,
    phone TEXT,
    subscription_plan TEXT DEFAULT 'free',
    credits INT DEFAULT 100,
    total_searches INT DEFAULT 0,
    total_proposals INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## Usage

### Access the Page
- **URL**: `/profile`
- **Requires**: Authentication (redirects to login if not logged in)

### Edit Profile
1. Click "Edit Profile" button
2. Update fields (Full Name, Phone, Company Name)
3. Click "Save Changes"
4. Changes are saved immediately

### Sign Out
- Click "Sign Out" button at bottom
- Redirects to login page

---

## Environment Variables

Same as other pages:
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
NEXT_PUBLIC_API_URL=https://your-app.railway.app  # Optional, for backend profile
```

---

## Backend Integration

### Current Status
The `/me` endpoint exists but returns placeholder data:
```json
{
  "email": "user@example.com",
  "name": "User",
  "message": "Profile endpoint - authentication integration pending"
}
```

### Future Enhancement
To make `/me` return real user data:

1. **Add Authentication Middleware**
   ```python
   from fastapi import Depends, Header
   from supabase import create_client
   
   async def get_current_user(authorization: str = Header(None)):
       # Verify JWT token from Supabase
       # Extract user ID
       # Return user data
   ```

2. **Connect to Database**
   ```python
   @app.get("/me")
   async def get_current_user(user = Depends(get_current_user)):
       # Query user_profiles table
       # Return combined data
   ```

3. **Update Frontend**
   - The frontend already handles the `/me` endpoint
   - Will automatically display data when backend is ready

---

## UI Components

### Profile Card
- Clean, card-based layout
- Responsive grid for field display
- Badges for status (verified, subscription plan)
- Edit mode with form inputs

### Error Handling
- Displays error messages in red alert boxes
- Graceful fallback if profile data unavailable
- Loading states during data fetch

### Actions
- Edit/Save/Cancel buttons
- Sign out button
- Responsive design for mobile/desktop

---

## Testing

### Local Testing
```bash
# Make sure environment variables are set
npm run dev

# Visit http://localhost:3000/profile
# Should redirect to login if not authenticated
```

### Expected Behavior
1. ✅ Redirects to login if not authenticated
2. ✅ Shows loading spinner while fetching data
3. ✅ Displays profile information
4. ✅ Allows editing and saving
5. ✅ Shows error messages if save fails
6. ✅ Sign out works correctly

---

## Troubleshooting

### "Failed to load profile"
- ✅ Check Supabase environment variables are set
- ✅ Verify user is logged in
- ✅ Check browser console for errors

### "Failed to save profile"
- ✅ Check Supabase RLS policies allow updates
- ✅ Verify user_profiles table exists
- ✅ Check network tab for API errors

### Backend profile not showing
- ✅ This is expected - `/me` endpoint returns placeholder
- ✅ Will work once backend authentication is integrated
- ✅ Frontend handles missing backend data gracefully

### "Cannot read property 'email' of null"
- ✅ User might not be authenticated
- ✅ Check Supabase connection
- ✅ Verify environment variables

---

## Next Steps

### Immediate
1. ✅ Test profile page locally
2. ✅ Verify Supabase connection
3. ✅ Test edit functionality

### Future Enhancements
1. **Avatar Upload**
   - Add image upload to `avatar_url` field
   - Use Supabase Storage

2. **Password Change**
   - Add password update form
   - Use Supabase Auth password update

3. **Email Verification**
   - Add resend verification email button
   - Show verification status

4. **Backend Integration**
   - Add JWT authentication to `/me` endpoint
   - Connect to database for full profile data

5. **Additional Fields**
   - Add more profile fields (address, bio, etc.)
   - Update schema as needed

---

## File Structure

```
sturgeon-ai-prod/
├── app/
│   └── profile/
│       └── page.tsx              # ✅ Profile page
├── backend/
│   └── main.py                   # ✅ Added /me endpoint
└── lib/
    └── api.ts                    # ✅ API client (used by profile page)
```

---

Done! 🎉 Your profile page is ready to use.
