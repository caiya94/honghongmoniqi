import { NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

export async function GET() {
  try {
    const client = getSupabaseClient();
    
    const { data, error } = await client
      .from('blog_posts')
      .select('id, title, summary, created_at')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch articles' },
        { status: 500 }
      );
    }
    
    // 计算阅读时间（按每300字约1分钟计算）
    const articles = (data || []).map((article: { id: number; title: string; summary: string; created_at: string }) => {
      const wordCount = article.summary.length + 300; // 估算正文长度
      const readTime = Math.max(2, Math.ceil(wordCount / 300));
      return {
        id: article.id.toString(),
        title: article.title,
        description: article.summary,
        readTime: `约${readTime}分钟`,
      };
    });
    
    return NextResponse.json(articles);
  } catch (err) {
    console.error('Server error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
