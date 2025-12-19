# Opportunities Feature

The Opportunities feature allows users to track and save opportunities from various sources including SAM, Unison, GovWin, GovSpend, and manual entries.

## Features

- **Add New Opportunities**: Save opportunities with title, agency, source, and notes
- **View Saved Opportunities**: Display all saved opportunities in a clean, organized list
- **Multiple Sources**: Track opportunities from SAM, Unison, GovWin, GovSpend, or manual sources
- **Status Tracking**: All opportunities default to "watchlist" status

## Usage

### Accessing the Page

Navigate to `/opportunities` to access the opportunities tracking page.

### Adding an Opportunity

1. Fill in the opportunity details:
   - **Title** (required): The name of the opportunity
   - **Agency**: The government agency associated with the opportunity
   - **Source**: The source of the opportunity (sam, unison, govwin, govspend, manual)
   - **Notes**: Additional notes, URLs, or quick summaries

2. Click "Save opportunity" to add it to your saved list

### Viewing Opportunities

All saved opportunities appear in the "Saved list" section below the form. Each opportunity displays:
- Title and status
- Source (in uppercase)
- Agency name
- Associated notes

## API Endpoints

### GET `/api/opportunities/list`

Retrieves all saved opportunities for the current user.

**Response:**
```json
{
  "opportunities": [
    {
      "id": "uuid",
      "title": "Opportunity Title",
      "agency": "Agency Name",
      "source": "sam",
      "status": "watchlist",
      "metadata": {
        "notes": "Additional notes"
      },
      "created_at": "2025-12-03T19:00:00.000Z",
      "updated_at": "2025-12-03T19:00:00.000Z"
    }
  ]
}
```

### POST `/api/opportunities/save`

Saves a new opportunity.

**Request Body:**
```json
{
  "title": "Opportunity Title",
  "agency": "Agency Name",
  "source": "sam",
  "status": "watchlist",
  "metadata": {
    "notes": "Additional notes"
  }
}
```

**Response:**
```json
{
  "opportunity": {
    "id": "uuid",
    "title": "Opportunity Title",
    "agency": "Agency Name",
    "source": "sam",
    "status": "watchlist",
    "metadata": {
      "notes": "Additional notes"
    }
  },
  "success": true
}
```

## Database Setup

The opportunities feature requires a database table. Run the migration SQL file to create the table:

```sql
-- See migrations/create_opportunities_table.sql
```

The table includes:
- `id`: UUID primary key
- `user_id`: Reference to the user who created the opportunity
- `title`: Opportunity title (required)
- `agency`: Associated agency
- `source`: Source of the opportunity (required)
- `status`: Current status (default: "watchlist")
- `metadata`: Additional JSON data including notes
- `created_at`, `updated_at`: Timestamps

## Environment Variables

Required environment variables (see `.env.example`):

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## Components

### UI Components

Located in `components/ui/`:
- **Card**: Container component with consistent styling
- **Input**: Text input field with dark theme
- **TextArea**: Multi-line text input
- **Button**: Primary action button

### Page Component

Located at `app/(app)/opportunities/page.tsx`:
- Client-side rendered React component
- Manages form state and API interactions
- Displays saved opportunities list

## Future Enhancements

Potential improvements for the opportunities feature:
- Edit and delete existing opportunities
- Filter opportunities by source or status
- Search functionality
- Status updates (e.g., "applied", "awarded", "closed")
- Integration with external APIs to auto-populate opportunity details
- Email notifications for new opportunities
