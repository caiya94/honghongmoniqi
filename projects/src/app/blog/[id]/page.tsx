'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ChevronLeft, BookOpen, Heart } from 'lucide-react';

interface Article {
  id: string;
  title: string;
  description: string;
  content: string;
  readTime: string;
}

export default function BlogDetailPage() {
  const router = useRouter();
  const params = useParams();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const articleId = params.id as string;
    if (!articleId) return;

    setLoading(true);
    setError(null);

    fetch(`/api/blog/${articleId}`)
      .then((res) => {
        if (!res.ok) throw new Error('Article not found');
        return res.json();
      })
      .then((data) => {
        setArticle(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to fetch article:', err);
        setError('文章加载失败');
        setLoading(false);
      });
  }, [params.id]);

  const articleIcons: Record<string, string> = {
    'golden-30-minutes': '⏰',
    'youre-right-sucks': '💀',
    'correct-apology': '🙏',
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F2F2F7' }}>
      {/* 顶部导航 */}
      <div className="bg-white border-b border-[#E5E5EA] sticky top-0 z-50">
        <div className="pt-14 pb-4 px-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/blog')}
              className="flex items-center gap-1 text-[#007AFF]"
            >
              <ChevronLeft className="w-6 h-6" />
              <span className="text-sm">返回</span>
            </button>
            <h1 className="flex-1 text-center font-semibold text-[#000] text-lg pr-10 truncate">
              {article?.title || '文章详情'}
            </h1>
          </div>
        </div>
      </div>

      {/* 文章内容 */}
      <div className="px-4 py-6 max-w-lg mx-auto">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-8 h-8 border-2 border-[#007AFF] border-t-transparent rounded-full animate-spin" />
            <p className="mt-4 text-[#8E8E93] text-sm">正在生成文章...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-16">
            <p className="text-[#FF3B30] text-sm">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-5 py-2.5 bg-[#007AFF] text-white rounded-full text-sm font-medium"
            >
              重试
            </button>
          </div>
        ) : article ? (
          <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
            {/* 文章头部 */}
            <div className="p-6 border-b border-[#F2F2F7]">
              <div className="flex items-center gap-4 mb-4">
                <div 
                  className="w-16 h-16 rounded-2xl flex items-center justify-center text-4xl"
                  style={{ backgroundColor: '#F5F5F5' }}
                >
                  {articleIcons[article.id] || '📖'}
                </div>
                <div className="flex-1">
                  <h1 className="text-xl font-bold text-[#000] leading-tight">
                    {article.title}
                  </h1>
                  <div className="flex items-center gap-2 mt-2">
                    <BookOpen className="w-3.5 h-3.5 text-[#C7C7CC]" />
                    <span className="text-xs text-[#C7C7CC]">{article.readTime}阅读</span>
                  </div>
                </div>
              </div>
              <p className="text-[#8E8E93] text-[15px]">{article.description}</p>
            </div>

            {/* 文章正文 */}
            <div className="p-6">
              <div className="text-[#1C1C1E] text-[16px] leading-relaxed">
                {article.content.split('\n').map((paragraph, index) => {
                  const trimmed = paragraph.trim();
                  if (!trimmed) return <div key={index} className="h-4" />;
                  
                  // 检测是否是标题
                  if (
                    trimmed.length < 25 && 
                    (trimmed.includes('：') || trimmed.includes(':') || trimmed.match(/^[一二三四五六七八九十]、/))
                  ) {
                    return (
                      <h2 key={index} className="text-[#007AFF] font-semibold text-[17px] mt-5 mb-2">
                        {trimmed}
                      </h2>
                    );
                  }
                  
                  return (
                    <p key={index} className="mb-4 text-[#1C1C1E]">
                      {trimmed}
                    </p>
                  );
                })}
              </div>
            </div>

            {/* 文章底部 */}
            <div className="p-6 bg-[#F9F9FB] border-t border-[#F2F2F7]">
              <div className="flex items-center justify-center gap-2 text-rose-500">
                <Heart className="w-5 h-5" fill="currentColor" />
                <span className="text-sm font-medium">希望这篇攻略对你有帮助</span>
              </div>
            </div>
          </div>
        ) : null}
      </div>

      {/* 底部按钮 */}
      <div className="px-4 pb-10 max-w-lg mx-auto">
        <button
          onClick={() => router.push('/')}
          className="w-full py-4 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-2xl font-semibold text-lg flex items-center justify-center gap-2 shadow-lg active:scale-[0.98] transition-transform"
        >
          <Heart className="w-5 h-5" />
          去哄哄模拟器练练手
        </button>
      </div>
    </div>
  );
}
