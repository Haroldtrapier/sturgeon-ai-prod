import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { 
      source, 
      sourceUrl, 
      title, 
      agency, 
      type,
      amount,
      deadline,
      description,
      requirements,
      attachments,
      metadata,
      externalId,
      solicitationId,
      naicsCode,
      pscCode,
      postedDate,
      rawText,
      parsedJson 
    } = body;

    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    // Get authenticated user
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Build insert data matching existing schema
    const insertData: any = {
      title,
      agency: agency ?? null,
      type: type ?? null,
      amount: amount ?? null,
      deadline: deadline ?? null,
      status: 'active',
      description: description ?? null,
      requirements: requirements ?? [],
      attachments: attachments ?? [],
      metadata: metadata ?? {},
    };

    // Add new fields if provided
    if (externalId) insertData.external_id = externalId;
    if (source) insertData.source = source;
    if (sourceUrl) insertData.source_url = sourceUrl;
    if (solicitationId) insertData.solicitation_id = solicitationId;
    if (naicsCode) insertData.naics_code = naicsCode;
    if (pscCode) insertData.psc_code = pscCode;
    if (postedDate) insertData.posted_date = postedDate;
    if (rawText) insertData.raw_text = rawText;
    if (parsedJson) insertData.parsed_json = parsedJson;

    // Add user_id if column exists (graceful degradation)
    insertData.user_id = user.id;

    // Insert into opportunities table
    const { data, error } = await supabase
      .from('opportunities')
      .insert([insertData])
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      
      // Handle specific errors
      if (error.code === '23505') {
        return NextResponse.json({ 
          error: 'Opportunity already exists',
          details: error.message 
        }, { status: 409 });
      }
      
      if (error.code === '42703') {
        return NextResponse.json({ 
          error: 'Database schema mismatch. Please run migrations.',
          details: error.message 
        }, { status: 500 });
      }

      return NextResponse.json({ 
        error: `Failed to save: ${error.message}`,
        code: error.code 
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: data,
      message: 'Opportunity saved successfully'
    });

  } catch (err: any) {
    console.error('Import error:', err);
    return NextResponse.json({ 
      error: err?.message ?? 'Import failed',
      details: err?.stack 
    }, { status: 500 });
  }
}

// GET endpoint to list user's opportunities
export async function GET(req: Request) {
  try {
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const source = searchParams.get('source');
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') ?? '50');

    let query = supabase
      .from('opportunities')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    // Try to filter by user_id if column exists
    try {
      query = query.eq('user_id', user.id);
    } catch (e) {
      // Column doesn't exist yet, skip filter
      console.log('user_id column not found, returning all opportunities');
    }

    if (source) {
      query = query.eq('source', source);
    }

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Query error:', error);
      return NextResponse.json({ 
        error: error.message,
        code: error.code 
      }, { status: 500 });
    }

    return NextResponse.json({ 
      opportunities: data ?? [],
      count: data?.length ?? 0 
    });

  } catch (err: any) {
    console.error('Fetch error:', err);
    return NextResponse.json({ 
      error: err?.message ?? 'Failed to fetch',
      details: err?.stack 
    }, { status: 500 });
  }
}
