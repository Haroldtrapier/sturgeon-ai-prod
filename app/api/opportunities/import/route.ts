import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { source, sourceUrl, title, agency, solicitationId, dueDate, rawText, parsedJson } = body;

    if (!source) {
      return NextResponse.json({ error: 'Missing source field' }, { status: 400 });
    }

    // Get authenticated user
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Insert into opportunities table
    const { data, error } = await supabase
      .from('opportunities')
      .insert([{
        user_id: user.id,
        source,
        source_url: sourceUrl ?? null,
        title: title ?? null,
        agency: agency ?? null,
        solicitation_id: solicitationId ?? null,
        due_date: dueDate ?? null,
        raw_text: rawText ?? null,
        parsed_json: parsedJson ?? null,
      }])
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ error: `Failed to save: ${error.message}` }, { status: 500 });
    }

    return NextResponse.json({
      ok: true,
      saved: data,
      message: 'Opportunity saved successfully'
    });

  } catch (err: any) {
    console.error('Import error:', err);
    return NextResponse.json({ error: err?.message ?? 'Import failed' }, { status: 500 });
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
    const limit = parseInt(searchParams.get('limit') ?? '50');

    let query = supabase
      .from('opportunities')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (source) {
      query = query.eq('source', source);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ opportunities: data ?? [] });

  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? 'Failed to fetch' }, { status: 500 });
  }
}
