# Marketplace Integrations

This directory contains integrations with government contracting marketplaces.

## SAM.gov Integration

The `searchSam` function provides TypeScript integration with the SAM.gov (System for Award Management) API to search for federal contract opportunities.

### Usage

```typescript
import { searchSam } from '@/lib/marketplaces';

// Basic search
const opportunities = await searchSam({
  query: 'IT services'
});

// Search with NAICS code filter
const itOpportunities = await searchSam({
  query: 'software development',
  naics: '541511'
});
```

### Configuration

Set the `SAM_GOV_API_KEY` or `NEXT_PUBLIC_SAM_GOV_API_KEY` environment variable with your SAM.gov API key.

Get your API key at: https://sam.gov/data-services/

### Features

- ✅ Search by keywords
- ✅ Filter by NAICS code
- ✅ Automatic date filtering (last 30 days)
- ✅ Error handling with empty array fallback
- ✅ Request timeout (10 seconds)
- ✅ Type-safe with TypeScript

### API Response

The function returns an array of `Opportunity` objects with the following structure:

- `noticeId`: Unique identifier for the opportunity
- `title`: Title of the opportunity
- `solicitationNumber`: Solicitation number
- `postedDate`: When the opportunity was posted
- `responseDeadLine`: Deadline for responses
- `naicsCode`: NAICS classification code
- `description`: Detailed description
- `organizationId`: Agency identifier
- And more...

See `types.ts` for the complete interface definition.
