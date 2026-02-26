# 📊 ANALYTICS TRACKING SYSTEM

## Overview

Privacy-friendly analytics system that tracks:
- ✅ Page views
- ✅ Feature usage
- ✅ Session tracking
- ✅ Time on page
- ✅ User flows

**NO personal data collected** - completely GDPR compliant!

---

## Files Added

1. **app/api/analytics/route.ts** - Analytics API endpoint
2. **hooks/useAnalytics.ts** - React hook for tracking
3. **app/analytics/page.tsx** - Analytics dashboard
4. **components/AnalyticsDashboard.tsx** - Dashboard component

---

## Usage Examples

### Track Page Views (Automatic)

```tsx
'use client';
import { useAnalytics } from '@/hooks/useAnalytics';

export default function MyPage() {
  useAnalytics(); // Automatically tracks page view

  return <div>My Page</div>;
}
```

### Track Feature Usage

```tsx
import { useAnalytics } from '@/hooks/useAnalytics';

export default function MyComponent() {
  const { trackFeature } = useAnalytics();

  const handleButtonClick = () => {
    trackFeature('button_clicked', { 
      buttonName: 'Generate Content' 
    });
  };

  return <button onClick={handleButtonClick}>Click Me</button>;
}
```

### Track Duration

```tsx
import { useAnalytics } from '@/hooks/useAnalytics';
import { useEffect, useState } from 'react';

export default function MyComponent() {
  const { trackDuration } = useAnalytics();
  const [startTime] = useState(Date.now());

  useEffect(() => {
    return () => {
      trackDuration('time_on_component', startTime);
    };
  }, []);

  return <div>Component</div>;
}
```

---

## Analytics Dashboard

Visit `/analytics` to see:

- **Real-time stats**: Page views, feature usage, sessions
- **Top pages**: Most visited pages
- **Top features**: Most used features
- **Timeline**: Activity over time (hourly buckets)
- **Time range selector**: 1h, 24h, 7d, 30d

---

## API Endpoints

### POST /api/analytics

Track an event:

```bash
curl -X POST https://your-domain.com/api/analytics \
  -H "Content-Type: application/json" \
  -d '{
    "event": "feature_use",
    "feature": "ai_chat",
    "page": "/chat",
    "metadata": { "model": "claude" }
  }'
```

### GET /api/analytics?range=24h

Get analytics data:

```bash
curl https://your-domain.com/api/analytics?range=24h
```

Response:
```json
{
  "totalEvents": 1234,
  "pageViews": 567,
  "featureUsage": 321,
  "uniqueSessions": 89,
  "topPages": [
    { "page": "/chat", "count": 150 },
    { "page": "/marketing", "count": 120 }
  ],
  "topFeatures": [
    { "feature": "ai_chat", "count": 200 },
    { "feature": "marketing_generator", "count": 150 }
  ],
  "avgDuration": 45000,
  "timeline": [...]
}
```

---

## Production Setup

### Option 1: Current Setup (In-Memory)

- ✅ Works immediately
- ✅ No database needed
- ❌ Data lost on server restart
- ❌ Limited to 10,000 events

**Good for:** MVP, testing, low-traffic sites

### Option 2: Database Storage (Recommended for Production)

Replace in-memory storage with database:

```typescript
// Use Vercel Postgres, Supabase, or MongoDB
import { sql } from '@vercel/postgres';

export async function POST(request: Request) {
  const event = await request.json();

  await sql`
    INSERT INTO analytics_events (event, page, feature, timestamp, session_id)
    VALUES (${event.event}, ${event.page}, ${event.feature}, NOW(), ${event.sessionId})
  `;

  return NextResponse.json({ success: true });
}
```

### Option 3: Vercel Analytics (Easiest)

```bash
npm install @vercel/analytics

# Add to app/layout.tsx
import { Analytics } from '@vercel/analytics/react';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
```

---

## Privacy & GDPR

### What We Track:

- ✅ Page URLs
- ✅ Feature names
- ✅ Session IDs (random, not linked to users)
- ✅ Timestamps
- ✅ User agent (browser info)

### What We DON'T Track:

- ❌ Personal information
- ❌ IP addresses
- ❌ Email addresses
- ❌ Names
- ❌ Cookies (except session ID in sessionStorage)

**Fully GDPR compliant** - no consent banner needed!

---

## Integration Examples

### AIChat Component

```tsx
import { useAnalytics } from '@/hooks/useAnalytics';

export default function AIChat() {
  const { trackFeature } = useAnalytics();

  const sendMessage = async (message: string, model: string) => {
    trackFeature('ai_chat_send', { model, messageLength: message.length });
    // ... send message
  };

  return <div>...</div>;
}
```

### Marketing Agent

```tsx
import { useAnalytics } from '@/hooks/useAnalytics';

export default function MarketingAgent() {
  const { trackFeature } = useAnalytics();

  const generateContent = async (type: string, tone: string) => {
    trackFeature('marketing_generate', { contentType: type, tone });
    // ... generate content
  };

  return <div>...</div>;
}
```

---

## Monitoring & Alerts

### Set Up Alerts (Optional)

Monitor your analytics API for unusual patterns:

```typescript
// Add to analytics route
if (stats.uniqueSessions > 1000) {
  // Send alert (email, Slack, etc.)
  await sendAlert('High traffic detected!');
}
```

---

## Next Steps

1. **Add analytics to existing components:**
   - AIChat: Track message sends, model switches
   - MarketingAgent: Track content generation, downloads
   - Dashboard: Track page visits

2. **Create custom dashboards:**
   - User journey analysis
   - Conversion funnels
   - A/B test results

3. **Upgrade to database storage:**
   - For production scale
   - Historical data retention
   - Advanced queries

---

**Analytics System Ready!** 📊
