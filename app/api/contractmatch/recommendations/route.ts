import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ message: 'Contract match recommendations API endpoint' });
}
