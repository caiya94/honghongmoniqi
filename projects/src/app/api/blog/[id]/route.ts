import { NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const client = getSupabaseClient();
    
    const { data, error } = await client
      .from('blog_posts')
      .select('id, title, summary, content, created_at')
      .eq('id', parseInt(id))
      .maybeSingle();
    
    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch article' },
        { status: 500 }
      );
    }
    
    if (!data) {
      return NextResponse.json(
        { error: 'Article not found' },
        { status: 404 }
      );
    }
    
    // 计算阅读时间
    const wordCount = data.content.length;
    const readTime = Math.max(2, Math.ceil(wordCount / 300));
    
    return NextResponse.json({
      id: data.id.toString(),
      title: data.title,
      summary: data.summary,
      content: data.content,
      readTime: `约${readTime}分钟`,
      createdAt: data.created_at,
    });
  } catch (err) {
    console.error('Server error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
