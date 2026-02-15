import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/client';

export async function GET(request: NextRequest) {
  const userId = request.nextUrl.searchParams.get('userId');
  if (!userId) {
    return NextResponse.json({ error: 'userId required' }, { status: 400 });
  }

  try {
    const supabase = createClient();

    // Get proposals stats
    const { data: proposals } = await supabase
      .from('proposals')
      .select('id, status')
      .eq('user_id', userId);

    const allProposals = proposals || [];
    const active = allProposals.filter(p => p.status === 'in_progress' || p.status === 'draft');
    const submitted = allProposals.filter(p => p.status === 'submitted');
    const won = allProposals.filter(p => p.status === 'won');

    // Get saved opportunities count
    const { count: savedCount } = await supabase
      .from('saved_opportunities')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId);

    // Get recent activity
    const { data: events } = await supabase
      .from('analytics_events')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(10);

    return NextResponse.json({
      totalProposals: allProposals.length,
      activeProposals: active.length,
      submittedProposals: submitted.length,
      successRate: allProposals.length > 0 ? Math.round((won.length / allProposals.length) * 100) : 0,
      opportunitiesViewed: 0,
      savedOpportunities: savedCount || 0,
      avgResponseTime: 0,
      recentActivity: (events || []).map(e => ({
        id: e.id,
        type: e.event_type,
        description: e.event_type,
        timestamp: e.created_at,
      })),
    });
  } catch (error) {
    return NextResponse.json({
      totalProposals: 0,
      activeProposals: 0,
      submittedProposals: 0,
      successRate: 0,
      opportunitiesViewed: 0,
      savedOpportunities: 0,
      avgResponseTime: 0,
      recentActivity: [],
    });
  }
}
