'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Heart, ChevronLeft, Eye, EyeOff, LogIn } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isHovering, setIsHovering] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    setLoading(true);
    try {
      await login(username, password);
      router.push('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : '登录失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FFF8F5' }}>
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
            <h1 className="flex-1 text-center font-semibold text-[#000] text-lg pr-10">登录</h1>
          </div>
        </div>
      </div>

      {/* 内容区域 */}
      <div className="px-6 pt-10 max-w-md mx-auto">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <div className="w-20 h-20 rounded-[1.5rem] bg-gradient-to-br from-rose-400 via-pink-500 to-rose-600 flex items-center justify-center shadow-xl shadow-rose-200/50">
            <LogIn className="w-10 h-10 text-white" />
          </div>
        </div>

        {/* 标题 */}
        <h2 className="text-2xl font-bold text-center text-[#1C1C1E] mb-2">
          欢迎回来
        </h2>
        <p className="text-[#8E8E93] text-center mb-8">
          登录后继续哄TA之旅
        </p>

        {/* 表单 */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 用户名 */}
          <div>
            <label className="block text-sm font-semibold text-[#1C1C1E] mb-2">
              用户名
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="请输入用户名"
              className="w-full px-4 py-3.5 bg-white border border-[#E5E5EA] rounded-2xl text-[#1C1C1E] placeholder:text-[#C7C7CC] focus:outline-none focus:ring-2 focus:ring-[#007AFF] focus:border-transparent transition-all"
              required
            />
          </div>

          {/* 密码 */}
          <div>
            <label className="block text-sm font-semibold text-[#1C1C1E] mb-2">
              密码
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="请输入密码"
                className="w-full px-4 py-3.5 bg-white border border-[#E5E5EA] rounded-2xl text-[#1C1C1E] placeholder:text-[#C7C7CC] focus:outline-none focus:ring-2 focus:ring-[#007AFF] focus:border-transparent transition-all pr-12"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#8E8E93] hover:text-[#1C1C1E] transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* 错误提示 */}
          {error && (
            <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-2xl">
              <p className="text-sm text-red-500">{error}</p>
            </div>
          )}

          {/* 登录按钮 */}
          <button
            type="submit"
            disabled={loading}
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
            className={`w-full mt-6 py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 transition-all duration-300 ${
              loading
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : isHovering
                  ? 'bg-gradient-to-r from-rose-500 to-pink-600 text-white shadow-xl shadow-rose-300/50 transform scale-[1.02]'
                  : 'bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-xl shadow-rose-200/50'
            }`}
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                登录中...
              </>
            ) : (
              <>
                <Heart className={`w-5 h-5 ${isHovering ? 'animate-pulse' : ''}`} />
                登录
              </>
            )}
          </button>
        </form>

        {/* 注册链接 */}
        <div className="mt-8 text-center">
          <p className="text-[#8E8E93]">
            还没有账号？{' '}
            <button
              onClick={() => router.push('/auth/register')}
              className="text-[#007AFF] font-semibold hover:underline"
            >
              立即注册
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
