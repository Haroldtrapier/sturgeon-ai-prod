import { NextRequest, NextResponse } from 'next/server';
import { getOpportunities } from '../store';

export async function GET(request: NextRequest) {
  try {
    const opportunities = getOpportunities();
    return NextResponse.json({
      success: true,
      opportunities: opportunities,
    });
  } catch (error) {
    console.error('Error fetching opportunities:', error);
    return NextResponse.json(
      { error: 'Failed to fetch opportunities' },
      { status: 500 }
    );
  }
}
