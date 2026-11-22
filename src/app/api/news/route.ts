import { NextRequest, NextResponse } from 'next/server';
import { fetchAgricultureNews } from '@/lib/news/aggregator';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category') || undefined;
    const query = searchParams.get('q') || undefined;

    const articles = await fetchAgricultureNews(category, query);
    return NextResponse.json({ success: true, articles });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error fetching news';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

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

    const { articleUrl, title, source, publishedAt, imageUrl } = await req.json();

    const { error } = await supabase.from('news_bookmarks').insert({
      user_id: user.id,
      article_url: articleUrl,
      title,
      source,
      published_at: publishedAt,
      image_url: imageUrl,
    });

    if (error) {
      // If already bookmarked, delete (toggle)
      if (error.code === '23505') {
        await supabase
          .from('news_bookmarks')
          .delete()
          .eq('user_id', user.id)
          .eq('article_url', articleUrl);
        return NextResponse.json({ bookmarked: false });
      }
      throw error;
    }

    return NextResponse.json({ bookmarked: true });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Bookmark operation failed';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
