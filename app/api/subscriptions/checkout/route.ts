import { NextResponse } from 'next/server';

export async function POST() {
  return NextResponse.json({ message: 'Subscriptions checkout API endpoint' });
}
