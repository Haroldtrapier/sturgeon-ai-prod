import { NextResponse } from 'next/server';

export async function GET() {
  // Mock data for saved opportunities
  const opportunities = {
    opportunities: [
      { id: 1, title: 'Opportunity #1', agency: 'DOD' },
      { id: 2, title: 'Opportunity #2', agency: 'GSA' },
      { id: 3, title: 'Opportunity #3', agency: 'NASA' },
    ]
  };
  
  return NextResponse.json(opportunities);
}
