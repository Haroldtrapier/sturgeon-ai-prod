// lib/usage-tracker.ts
// Adapted from GovCon Command Center for Sturgeon AI
import { createClient } from '@/lib/supabase/server'

interface UsageEvent {
  user_id: string
  event_type: 'search' | 'alert' | 'report' | 'chat' | 'api_call' | 'proposal' | 'analysis'
  metadata?: Record<string, any>
}

interface UsageLimits {
  free: {
    searches: 10
    alerts: 5
    reports: 2
    proposals: 1
  }
  professional: {
    searches: 500
    alerts: 100
    reports: 50
    proposals: 25
  }
  enterprise: {
    searches: -1 // unlimited
    alerts: -1
    reports: -1
    proposals: -1
  }
}

const USAGE_LIMITS: UsageLimits = {
  free: { searches: 10, alerts: 5, reports: 2, proposals: 1 },
  professional: { searches: 500, alerts: 100, reports: 50, proposals: 25 },
  enterprise: { searches: -1, alerts: -1, reports: -1, proposals: -1 }
}

export async function trackUsage(event: UsageEvent) {
  const supabase = createClient()

  try {
    const { data, error } = await supabase
      .from('usage_events')
      .insert({
        user_id: event.user_id,
        event_type: event.event_type,
        metadata: event.metadata || {},
        created_at: new Date().toISOString()
      })

    if (error) throw error
    return { success: true }
  } catch (error) {
    console.error('Failed to track usage:', error)
    return { success: false, error }
  }
}

export async function checkUsageLimit(
  userId: string,
  eventType: UsageEvent['event_type'],
  subscriptionTier: keyof UsageLimits = 'free'
): Promise<{ allowed: boolean; remaining: number }> {
  const supabase = createClient()

  // Check if unlimited
  const limit = USAGE_LIMITS[subscriptionTier][`${eventType}s` as keyof typeof USAGE_LIMITS.free]
  if (limit === -1) {
    return { allowed: true, remaining: -1 }
  }

  // Count usage this month
  const startOfMonth = new Date()
  startOfMonth.setDate(1)
  startOfMonth.setHours(0, 0, 0, 0)

  const { count } = await supabase
    .from('usage_events')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('event_type', eventType)
    .gte('created_at', startOfMonth.toISOString())

  const used = count || 0
  const remaining = Math.max(0, limit - used)

  return {
    allowed: used < limit,
    remaining
  }
}

export async function getUserUsageSummary(userId: string) {
  const supabase = createClient()

  const startOfMonth = new Date()
  startOfMonth.setDate(1)
  startOfMonth.setHours(0, 0, 0, 0)

  const { data: events } = await supabase
    .from('usage_events')
    .select('event_type')
    .eq('user_id', userId)
    .gte('created_at', startOfMonth.toISOString())

  const summary = events?.reduce((acc, event) => {
    acc[event.event_type] = (acc[event.event_type] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  return summary || {}
}
