import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

// GET: Fetch user's chat conversations
export async function GET() {
  try {
    const supabase = await createServerSupabaseClient();
    if (!supabase) {
      return NextResponse.json({ conversations: [] });
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ conversations: [] });
    }

    const { data, error } = await supabase
      .from('chat_conversations')
      .select('*')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false });

    if (error) throw error;
    return NextResponse.json({ conversations: data || [] });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error fetching conversations';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// POST: Create a new conversation
export async function POST(req: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    if (!supabase) {
      return NextResponse.json({ error: 'Supabase unconfigured' }, { status: 400 });
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { title = 'New Farming Chat', language = 'en' } = await req.json();

    const { data, error } = await supabase
      .from('chat_conversations')
      .insert({
        user_id: user.id,
        title,
        language,
      })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ conversation: data });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error creating conversation';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// DELETE: Delete a conversation
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    const supabase = await createServerSupabaseClient();
    if (!supabase) {
      return NextResponse.json({ error: 'Supabase unconfigured' }, { status: 400 });
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { error } = await supabase
      .from('chat_conversations')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error deleting conversation';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
