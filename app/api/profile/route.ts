import { NextResponse } from 'next/server';

export async function GET() {
  // Mock data for user profile
  const profile = {
    profile: {
      companyName: 'Acme Corporation',
      naics: ['541511', '541512'],
      psc: ['D301', 'R425'],
      certifications: ['8(a)', 'WOSB'],
    }
  };
  
  return NextResponse.json(profile);
}
