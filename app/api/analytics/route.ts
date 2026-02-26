import { NextResponse } from 'next/server';

// Simple privacy-friendly analytics (no personal data)
// Tracks: page views, feature usage, performance

interface AnalyticsEvent {
  event: string;
  page?: string;
  feature?: string;
  duration?: number;
  metadata?: Record<string, any>;
  timestamp: string;
  sessionId: string;
  userAgent: string;
}

// In-memory storage (use database in production)
const events: AnalyticsEvent[] = [];
const MAX_EVENTS = 10000; // Keep last 10k events

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const userAgent = request.headers.get('user-agent') || 'unknown';

    const event: AnalyticsEvent = {
      ...body,
      timestamp: new Date().toISOString(),
      userAgent,
      sessionId: body.sessionId || 'anonymous',
    };

    // Store event
    events.push(event);

    // Keep only last MAX_EVENTS
    if (events.length > MAX_EVENTS) {
      events.shift();
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Analytics error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const timeRange = searchParams.get('range') || '24h';

    // Calculate time threshold
    const now = new Date();
    const threshold = new Date();

    switch (timeRange) {
      case '1h':
        threshold.setHours(now.getHours() - 1);
        break;
      case '24h':
        threshold.setHours(now.getHours() - 24);
        break;
      case '7d':
        threshold.setDate(now.getDate() - 7);
        break;
      case '30d':
        threshold.setDate(now.getDate() - 30);
        break;
      default:
        threshold.setHours(now.getHours() - 24);
    }

    // Filter events by time range
    const filteredEvents = events.filter(
      e => new Date(e.timestamp) >= threshold
    );

    // Calculate statistics
    const stats = {
      totalEvents: filteredEvents.length,
      pageViews: filteredEvents.filter(e => e.event === 'page_view').length,
      featureUsage: filteredEvents.filter(e => e.event === 'feature_use').length,
      uniqueSessions: new Set(filteredEvents.map(e => e.sessionId)).size,

      // Page views breakdown
      topPages: Object.entries(
        filteredEvents
          .filter(e => e.event === 'page_view' && e.page)
          .reduce((acc, e) => {
            acc[e.page!] = (acc[e.page!] || 0) + 1;
            return acc;
          }, {} as Record<string, number>)
      )
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([page, count]) => ({ page, count })),

      // Feature usage breakdown
      topFeatures: Object.entries(
        filteredEvents
          .filter(e => e.event === 'feature_use' && e.feature)
          .reduce((acc, e) => {
            acc[e.feature!] = (acc[e.feature!] || 0) + 1;
            return acc;
          }, {} as Record<string, number>)
      )
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([feature, count]) => ({ feature, count })),

      // Average durations
      avgDuration: filteredEvents
        .filter(e => e.duration)
        .reduce((sum, e, _, arr) => sum + (e.duration || 0) / arr.length, 0),

      // Timeline (hourly buckets)
      timeline: generateTimeline(filteredEvents, timeRange),
    };

    return NextResponse.json(stats);
  } catch (error: any) {
    console.error('Analytics fetch error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

function generateTimeline(events: AnalyticsEvent[], range: string) {
  const buckets: Record<string, number> = {};
  const bucketSize = range === '1h' ? 5 : range === '24h' ? 60 : 1440; // minutes

  events.forEach(event => {
    const time = new Date(event.timestamp);
    const bucket = new Date(
      Math.floor(time.getTime() / (bucketSize * 60 * 1000)) * (bucketSize * 60 * 1000)
    ).toISOString();

    buckets[bucket] = (buckets[bucket] || 0) + 1;
  });

  return Object.entries(buckets)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([time, count]) => ({ time, count }));
}
