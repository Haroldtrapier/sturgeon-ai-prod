# Backend API Integration

## Setup

1. Configure `.env.local`:
```
NEXT_PUBLIC_API_URL=https://sturgeonai.org/api
```

2. Import API client:
```typescript
import { apiClient } from '@/lib/api-client';
```

## Usage

### Opportunities
```typescript
const { data } = await apiClient.getOpportunities({ search: 'IT', limit: 10 });
```

### Proposals
```typescript
const { success } = await apiClient.createProposal({ title: 'My Proposal' });
```

### AI Chat
```typescript
const { data } = await apiClient.sendMessage('Show me contracts');
```

## Endpoints

- `GET /opportunities` - List opportunities
- `GET /opportunities/:id` - Get opportunity
- `POST /proposals` - Create proposal
- `GET /proposals` - List proposals
- `POST /chat` - AI chat
- `GET /analytics` - Analytics
- `GET /market-intelligence` - Market data