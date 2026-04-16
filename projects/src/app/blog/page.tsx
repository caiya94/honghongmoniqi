'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, BookOpen } from 'lucide-react';

interface ArticlePreview {
  id: string;
  title: string;
  description: string;
  readTime: string;
}

export default function BlogPage() {
  const router = useRouter();
  const [articles, setArticles] = useState<ArticlePreview[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/blog')
      .then((res) => res.json())
      .then((data) => {
        setArticles(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to fetch articles:', err);
        setLoading(false);
      });
  }, []);

  const articleIcons: Record<string, string> = {
    'golden-30-minutes': '⏰',
    'youre-right-sucks': '💀',
    'correct-apology': '🙏',
  };

  const articleColors: Record<string, { bg: string; text: string }> = {
    'golden-30-minutes': { bg: '#FFF9E6', text: '#FF9500' },
    'youre-right-sucks': { bg: '#F5F5F5', text: '#8E8E93' },
    'correct-apology': { bg: '#E8F5E9', text: '#34C759' },
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F2F2F7' }}>
      {/* 顶部导航 */}
      <div className="bg-white border-b border-[#E5E5EA]">
        <div className="pt-14 pb-4 px-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/')}
              className="flex items-center gap-1 text-[#007AFF]"
            >
              <ChevronLeft className="w-6 h-6" />
              <span className="text-sm">返回</span>
            </button>
            <h1 className="flex-1 text-center font-semibold text-[#000] text-lg pr-10">恋爱攻略</h1>
          </div>
        </div>
      </div>

      {/* 文章列表 */}
      <div className="px-4 py-6 max-w-lg mx-auto space-y-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-8 h-8 border-2 border-[#007AFF] border-t-transparent rounded-full animate-spin" />
            <p className="mt-4 text-[#8E8E93] text-sm">加载中...</p>
          </div>
        ) : (
          <>
            {articles.map((article) => (
              <button
                key={article.id}
                onClick={() => router.push(`/blog/${article.id}`)}
                className="w-full bg-white rounded-2xl p-5 text-left shadow-sm active:scale-[0.99] transition-transform"
              >
                <div className="flex items-start gap-4">
                  <div 
                    className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
                    style={{ backgroundColor: articleColors[article.id]?.bg || '#F5F5F5' }}
                  >
                    {articleIcons[article.id] || '📖'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-[#000] text-[17px] leading-tight mb-1">
                      {article.title}
                    </h3>
                    <p className="text-[#8E8E93] text-sm line-clamp-2 mb-2">
                      {article.description}
                    </p>
                    <div className="flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5 text-[#C7C7CC]" />
                      <span className="text-xs text-[#C7C7CC]">{article.readTime}阅读</span>
                    </div>
                  </div>
                  <ChevronLeft className="w-5 h-5 text-[#C7C7CC] flex-shrink-0 mt-5 -rotate-180" />
                </div>
              </button>
            ))}
          </>
        )}
      </div>

      {/* 底部提示 */}
      <div className="p-6 text-center text-xs text-[#C7C7CC]">
        更多攻略持续更新中...
      </div>
    </div>
  );
}
