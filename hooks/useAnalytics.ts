'use client';

import { useEffect, useCallback } from 'react';
import { usePathname } from 'next/navigation';

// Generate session ID (stored in sessionStorage)
function getSessionId(): string {
  if (typeof window === 'undefined') return 'server';

  let sessionId = sessionStorage.getItem('analytics_session_id');
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem('analytics_session_id', sessionId);
  }
  return sessionId;
}

// Track event
async function trackEvent(
  event: string,
  data?: {
    page?: string;
    feature?: string;
    duration?: number;
    metadata?: Record<string, any>;
  }
) {
  if (typeof window === 'undefined') return;

  try {
    await fetch('/api/analytics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event,
        ...data,
        sessionId: getSessionId(),
      }),
    });
  } catch (error) {
    console.error('Analytics tracking error:', error);
  }
}

// Main analytics hook
export function useAnalytics() {
  const pathname = usePathname();

  // Track page view on mount and route change
  useEffect(() => {
    trackEvent('page_view', { page: pathname });
  }, [pathname]);

  // Track feature usage
  const trackFeature = useCallback((feature: string, metadata?: Record<string, any>) => {
    trackEvent('feature_use', { feature, page: pathname, metadata });
  }, [pathname]);

  // Track timed events (e.g., how long spent on a page)
  const trackDuration = useCallback((feature: string, startTime: number) => {
    const duration = Date.now() - startTime;
    trackEvent('duration', { feature, page: pathname, duration });
  }, [pathname]);

  return {
    trackFeature,
    trackDuration,
  };
}

// HOC for automatic feature tracking
export function withAnalytics<P extends object>(
  Component: React.ComponentType<P>,
  featureName: string
) {
  return function AnalyticsWrapper(props: P) {
    const { trackFeature } = useAnalytics();

    useEffect(() => {
      trackFeature(featureName);
    }, [trackFeature]);

    return <Component {...props} />;
  };
}
