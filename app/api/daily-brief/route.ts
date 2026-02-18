// app/api/daily-brief/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's opportunities from last 24 hours
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)

    const { data: opportunities, error: oppError } = await supabase
      .from('opportunities')
      .select('*')
      .gte('created_at', yesterday.toISOString())
      .order('created_at', { ascending: false })
      .limit(10)

    if (oppError) throw oppError

    // Generate AI summary
    const summary = {
      totalOpportunities: opportunities?.length || 0,
      opportunities: opportunities || [],
      generatedAt: new Date().toISOString()
    }

    // In production, you'd send this via email using Resend/SendGrid
    // For now, just return the data

    return NextResponse.json({
      success: true,
      summary
    })
  } catch (error) {
    console.error('Daily brief error:', error)
    return NextResponse.json(
      { error: 'Failed to generate daily brief' },
      { status: 500 }
    )
  }
}
