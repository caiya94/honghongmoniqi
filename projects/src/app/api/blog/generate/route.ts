import { NextResponse } from 'next/server';
import { LLMClient, Config } from 'coze-coding-dev-sdk';
import { getSupabaseClient } from '@/storage/database/supabase-client';

export async function POST() {
  try {
    // 调用 LLM 生成文章
    const config = new Config();
    const client = new LLMClient(config);

    const prompt = `你是一个恋爱沟通专家。请为"哄哄模拟器"（一个教用户如何哄对象的游戏）生成一篇恋爱沟通技巧文章。

要求：
1. 标题要有吸引力，让人想点进来
2. 风格轻松幽默，像朋友聊天
3. 包含具体的技巧或方法，不要空泛
4. 正文字数300-500字
5. 使用Markdown格式，但不要使用代码块

文章主题建议（选择一个或自己发挥）：
- 冷战时如何破冰
- 另一半心情不好时的正确回应
- 制造小惊喜的技巧
- 有效沟通的黄金法则
- 如何正确表达不满

请直接输出文章内容，格式如下：
---
TITLE: 你的标题
SUMMARY: 一句话概括文章内容（用于列表页展示）
---
正文内容`;

    const messages: { role: 'user'; content: string }[] = [
      { role: 'user', content: prompt },
    ];

    let fullContent = '';
    const response = await client.invoke(messages, {
      temperature: 0.8,
    });

    fullContent = response.content;

    // 解析 LLM 返回的内容
    const titleMatch = fullContent.match(/TITLE:\s*(.+)/);
    const summaryMatch = fullContent.match(/SUMMARY:\s*(.+)/);

    if (!titleMatch || !summaryMatch) {
      throw new Error('Failed to parse LLM response');
    }

    const title = titleMatch[1].trim();
    const summary = summaryMatch[1].trim();
    // 去掉 SUMMARY 行之后的内容作为正文
    const content = fullContent
      .replace(/^---[\s\S]*?---\n/, '')
      .trim();

    // 保存到数据库
    const dbClient = getSupabaseClient();
    const { data, error } = await dbClient
      .from('blog_posts')
      .insert({
        title,
        summary,
        content,
      })
      .select('id, title, summary, created_at')
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to save article' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      article: {
        id: data.id.toString(),
        title: data.title,
        summary: data.summary,
        createdAt: data.created_at,
      },
    });
  } catch (err) {
    console.error('Server error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
