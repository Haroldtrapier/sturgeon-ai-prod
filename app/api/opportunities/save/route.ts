import { NextRequest, NextResponse } from 'next/server';
import { addOpportunity } from '../store';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.title || !body.source || !body.status) {
      return NextResponse.json(
        { error: 'Missing required fields: title, source, or status' },
        { status: 400 }
      );
    }

    // Create new opportunity
    const newOpportunity = {
      id: Date.now().toString(), // Simple ID generation
      title: body.title,
      agency: body.agency || null,
      source: body.source,
      status: body.status,
      metadata: body.metadata || {},
      createdAt: new Date().toISOString(),
    };

    addOpportunity(newOpportunity);

    return NextResponse.json({
      success: true,
      opportunity: newOpportunity,
    });
  } catch (error) {
    console.error('Error saving opportunity:', error);
    return NextResponse.json(
      { error: 'Failed to save opportunity' },
      { status: 500 }
    );
  }
}
