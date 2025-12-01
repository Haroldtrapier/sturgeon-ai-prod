import { NextResponse } from 'next/server';

export async function POST() {
  return NextResponse.json({ message: 'Save proposals API endpoint' });
}
