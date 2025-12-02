import { NextResponse } from 'next/server';

export async function GET() {
  // Mock data for wins
  const wins = {
    wins: [
      { id: 1, title: 'Contract Award #1', value: 50000 },
      { id: 2, title: 'Contract Award #2', value: 75000 },
    ]
  };
  
  return NextResponse.json(wins);
}
