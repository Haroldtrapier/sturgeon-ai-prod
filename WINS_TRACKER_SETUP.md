# Wins Tracker Setup Guide

This guide explains how to set up the Wins Tracker feature in Sturgeon AI.

## Overview

The Wins Tracker allows users to log contract awards, building past performance records and tracking revenue. Each win includes:
- Opportunity title
- Agency
- Contract amount
- Contract number
- Win date
- Description

## Database Setup

### Step 1: Run the Migration

In your Supabase dashboard:

1. Navigate to **SQL Editor**
2. Click **"New Query"**
3. Copy the contents of `supabase/migrations/create_wins_table.sql`
4. Click **"Run"** to execute the migration

This will create:
- A `wins` table with all necessary fields
- An index on `dateWon` for efficient sorting
- A trigger to automatically update the `updatedAt` timestamp

### Step 2: Verify Table Creation

Run this query in the SQL Editor to verify:

```sql
SELECT * FROM wins LIMIT 1;
```

You should see the table structure with no errors.

## Environment Variables

Add the following to your `.env.local` file (for local development) and Vercel/deployment environment:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

Get these values from:
- Supabase Dashboard → Settings → API
- Copy the "Project URL" and "anon public" key

## Testing the Feature

### Local Development

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Navigate to `/wins` in your browser

3. Test creating a win:
   - Fill in the opportunity title (required)
   - Add optional fields (agency, amount, contract number, date, description)
   - Click "Log win"

4. Verify the win appears in the "Logged wins" section below

### Production

The feature is automatically deployed when you push to the main branch. Make sure:
- Supabase environment variables are set in Vercel
- The database migration has been run in your production Supabase instance

## API Endpoints

### GET /api/wins
Fetch all wins, ordered by date (newest first)

**Response:**
```json
{
  "wins": [
    {
      "id": "uuid",
      "opportunityTitle": "Contract Title",
      "agency": "Department of Defense",
      "amount": 500000,
      "contractNumber": "W123456",
      "description": "Project description",
      "dateWon": "2024-01-15",
      "createdAt": "2024-01-15T10:00:00Z",
      "updatedAt": "2024-01-15T10:00:00Z"
    }
  ]
}
```

### POST /api/wins
Create a new win record

**Request:**
```json
{
  "opportunityTitle": "Contract Title",
  "agency": "Department of Defense",
  "amount": 500000,
  "contractNumber": "W123456",
  "description": "Project description",
  "dateWon": "2024-01-15"
}
```

**Response:**
```json
{
  "win": {
    "id": "uuid",
    "opportunityTitle": "Contract Title",
    ...
  }
}
```

## Troubleshooting

### "Failed to fetch wins" error
- Check that Supabase environment variables are set correctly
- Verify the database migration has been run
- Check browser console for detailed error messages

### "Failed to create win" error
- Ensure opportunity title is provided (required field)
- Check Supabase logs in the dashboard for detailed errors
- Verify database permissions allow inserts

## Future Enhancements

Potential improvements for the wins tracker:
- Edit and delete functionality
- Export to PDF/CSV
- Filtering and search
- Win statistics and analytics
- File attachments for contracts
- Collaboration features
