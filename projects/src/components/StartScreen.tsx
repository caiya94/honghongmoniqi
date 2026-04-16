'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useGame } from '@/context/GameContext';
import { useAuth } from '@/context/AuthContext';
import { Gender, VoiceType, SCENARIOS, getVoicesByGender } from '@/types/game';
import { Heart, BookOpen, Check, Sparkles, User, LogOut } from 'lucide-react';

export const StartScreen: React.FC = () => {
  const router = useRouter();
  const { setGender, setScenario, setVoiceType, startGame } = useGame();
  const { user, logout } = useAuth();
  
  const [selectedGender, setSelectedGender] = useState<Gender | null>(null);
  const [selectedScenario, setSelectedScenario] = useState<string | null>(null);
  const [selectedVoice, setSelectedVoice] = useState<VoiceType | null>(null);
  const [isHovering, setIsHovering] = useState(false);

  const handleGenderChange = (gender: Gender) => {
    setSelectedGender(gender);
    setGender(gender);
    setSelectedVoice(null);
    setVoiceType(null as unknown as VoiceType);
  };

  const handleScenarioChange = (scenarioId: string) => {
    setSelectedScenario(scenarioId);
    const scenario = SCENARIOS.find((s) => s.id === scenarioId);
    if (scenario) {
      setScenario(scenario);
    }
  };

  const handleVoiceChange = (voiceType: VoiceType) => {
    setSelectedVoice(voiceType);
    setVoiceType(voiceType);
  };

  const handleStart = () => {
    if (!selectedGender || !selectedScenario || !selectedVoice) return;
    startGame();
  };

  const voices = selectedGender ? getVoicesByGender(selectedGender) : [];
  const canStart = selectedGender && selectedScenario && selectedVoice;

  const scenarioIcons: Record<string, string> = {
    anniversary: '💕',
    'late-night': '📱',
    'flirty-chat': '💬',
    'lost-cat': '🐱',
    'public-joke': '😅',
  };

  return (
    <div className="min-h-screen overflow-auto" style={{ backgroundColor: '#FFF8F5' }}>
      {/* 顶部 Hero 区域 */}
      <div className="relative overflow-hidden">
        {/* 背景装饰 */}
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-pink-200/40 to-rose-200/40 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-orange-200/40 to-yellow-200/40 rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2" />
        </div>

        {/* 内容 */}
        <div className="relative pt-16 pb-8 px-6 text-center">
          {/* 动效 Logo */}
          <div className="relative inline-block mb-6">
            <div className="w-24 h-24 rounded-[2rem] bg-gradient-to-br from-rose-400 via-pink-500 to-rose-600 flex items-center justify-center shadow-xl shadow-rose-200/50 transform rotate-3 hover:rotate-0 transition-transform duration-500">
              <Heart className="w-12 h-12 text-white drop-shadow-lg" />
            </div>
            {/* 闪光效果 */}
            <div className="absolute -top-1 -right-1 w-6 h-6 bg-white/80 rounded-full flex items-center justify-center">
              <Sparkles className="w-3 h-3 text-rose-400" />
            </div>
          </div>

          {/* 标题 */}
          <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-rose-500 to-pink-600 tracking-tight mb-2">
            哄哄模拟器
          </h1>
          <p className="text-base text-gray-500 font-medium">
            10轮内把TA哄好，你能做到吗？
          </p>

          {/* 用户信息 / 登录按钮 */}
          {user ? (
            <div className="mt-4 flex items-center justify-center gap-3">
              <div className="flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full shadow-md">
                <User className="w-4 h-4 text-rose-500" />
                <span className="text-sm font-semibold text-gray-700">{user.username}</span>
              </div>
              <button
                onClick={() => { logout(); router.push('/'); }}
                className="flex items-center gap-1 px-3 py-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                退出
              </button>
            </div>
          ) : (
            <div className="mt-4 flex items-center justify-center gap-3">
              <button
                onClick={() => router.push('/auth/login')}
                className="px-5 py-2 bg-white/80 backdrop-blur-sm rounded-full shadow-md hover:shadow-lg hover:bg-white transition-all duration-300 border border-gray-200"
              >
                <span className="text-sm font-semibold text-gray-700">登录</span>
              </button>
              <button
                onClick={() => router.push('/auth/register')}
                className="px-5 py-2 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-full shadow-md hover:shadow-lg hover:shadow-rose-200/50 transition-all duration-300"
              >
                <span className="text-sm font-semibold">注册</span>
              </button>
            </div>
          )}

          {/* 攻略入口 */}
          <button
            onClick={() => router.push('/blog')}
            className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 bg-white/80 backdrop-blur-sm rounded-full shadow-md hover:shadow-lg hover:bg-white transition-all duration-300 border border-rose-100"
          >
            <BookOpen className="w-4 h-4 text-rose-500" />
            <span className="text-sm font-semibold text-rose-600">恋爱攻略</span>
          </button>
        </div>
      </div>

      {/* 表单区域 */}
      <div className="px-4 pb-40 max-w-lg mx-auto space-y-5">
        
        {/* 性别选择 */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 px-1">
            <div className="w-1.5 h-1.5 rounded-full bg-rose-400" />
            <p className="text-sm font-bold text-gray-700 tracking-wide">选择TA的性别</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => handleGenderChange('female')}
              className={`flex-1 relative overflow-hidden rounded-2xl p-5 transition-all duration-300 ${
                selectedGender === 'female'
                  ? 'bg-gradient-to-br from-pink-50 to-rose-50 ring-2 ring-rose-400 shadow-lg shadow-rose-200/50'
                  : 'bg-white shadow-md hover:shadow-lg'
              }`}
            >
              {selectedGender === 'female' && (
                <div className="absolute top-3 right-3 w-6 h-6 bg-rose-400 rounded-full flex items-center justify-center">
                  <Check className="w-3.5 h-3.5 text-white" />
                </div>
              )}
              <div className="text-center">
                <div className={`text-5xl mb-3 transition-transform duration-300 ${selectedGender === 'female' ? 'scale-110' : ''}`}>
                  👩‍♀️
                </div>
                <p className={`font-bold text-lg ${selectedGender === 'female' ? 'text-rose-500' : 'text-gray-800'}`}>
                  女朋友
                </p>
                <p className="text-xs text-gray-400 mt-1">她正在生气中...</p>
              </div>
            </button>
            
            <button
              onClick={() => handleGenderChange('male')}
              className={`flex-1 relative overflow-hidden rounded-2xl p-5 transition-all duration-300 ${
                selectedGender === 'male'
                  ? 'bg-gradient-to-br from-blue-50 to-indigo-50 ring-2 ring-blue-400 shadow-lg shadow-blue-200/50'
                  : 'bg-white shadow-md hover:shadow-lg'
              }`}
            >
              {selectedGender === 'male' && (
                <div className="absolute top-3 right-3 w-6 h-6 bg-blue-400 rounded-full flex items-center justify-center">
                  <Check className="w-3.5 h-3.5 text-white" />
                </div>
              )}
              <div className="text-center">
                <div className={`text-5xl mb-3 transition-transform duration-300 ${selectedGender === 'male' ? 'scale-110' : ''}`}>
                  👨
                </div>
                <p className={`font-bold text-lg ${selectedGender === 'male' ? 'text-blue-500' : 'text-gray-800'}`}>
                  男朋友
                </p>
                <p className="text-xs text-gray-400 mt-1">他正在生气中...</p>
              </div>
            </button>
          </div>
        </div>

        {/* 场景选择 */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 px-1">
            <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            <p className="text-sm font-bold text-gray-700 tracking-wide">选择吵架场景</p>
          </div>
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            {SCENARIOS.map((scenario, index) => (
              <button
                key={scenario.id}
                onClick={() => handleScenarioChange(scenario.id)}
                className={`w-full px-5 py-4 flex items-center gap-4 transition-all duration-200 ${
                  selectedScenario === scenario.id
                    ? 'bg-gradient-to-r from-amber-50 to-orange-50'
                    : index !== SCENARIOS.length - 1 ? 'border-b border-gray-100' : ''
                } hover:bg-gray-50`}
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl transition-all duration-300 ${
                  selectedScenario === scenario.id
                    ? 'bg-white shadow-md scale-110'
                    : 'bg-gray-100'
                }`}>
                  {scenarioIcons[scenario.id]}
                </div>
                <div className="flex-1 text-left">
                  <p className={`font-bold ${selectedScenario === scenario.id ? 'text-amber-600' : 'text-gray-800'}`}>
                    {scenario.title}
                  </p>
                </div>
                {selectedScenario === scenario.id && (
                  <div className="w-7 h-7 bg-amber-400 rounded-full flex items-center justify-center shadow-md">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* 声音选择 */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 px-1">
            <div className="w-1.5 h-1.5 rounded-full bg-purple-400" />
            <p className="text-sm font-bold text-gray-700 tracking-wide">选择声音类型</p>
          </div>
          {!selectedGender ? (
            <div className="bg-white rounded-2xl shadow-lg px-5 py-8 text-center">
              <div className="text-4xl mb-3 opacity-50">🎙️</div>
              <p className="text-gray-400 font-medium">先选择性别再来选声音~</p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              {voices.map((voice, index) => (
                <button
                  key={voice.type}
                  onClick={() => handleVoiceChange(voice.type)}
                  className={`w-full px-5 py-4 flex items-center gap-4 transition-all duration-200 ${
                    selectedVoice === voice.type
                      ? 'bg-gradient-to-r from-purple-50 to-fuchsia-50'
                      : index !== voices.length - 1 ? 'border-b border-gray-100' : ''
                  } hover:bg-gray-50`}
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl transition-all duration-300 ${
                    selectedVoice === voice.type
                      ? 'bg-white shadow-md scale-110'
                      : 'bg-gray-100'
                  }`}>
                    🎙️
                  </div>
                  <div className="flex-1 text-left">
                    <p className={`font-bold ${selectedVoice === voice.type ? 'text-purple-600' : 'text-gray-800'}`}>
                      {voice.label}
                    </p>
                  </div>
                  {selectedVoice === voice.type && (
                    <div className="w-7 h-7 bg-purple-400 rounded-full flex items-center justify-center shadow-md">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 底部开始按钮 */}
      <div className="fixed bottom-0 left-0 right-0 p-6 pb-10" style={{ background: 'linear-gradient(to top, rgba(255,248,245,1) 70%, rgba(255,248,245,0))' }}>
        <div className="max-w-lg mx-auto">
          <button
            onClick={handleStart}
            disabled={!canStart}
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
            className={`w-full py-4.5 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 transition-all duration-300 ${
              canStart
                ? isHovering
                  ? 'bg-gradient-to-r from-rose-500 to-pink-600 text-white shadow-xl shadow-rose-300/50 transform scale-[1.02]'
                  : 'bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-xl shadow-rose-200/50'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            <Heart className={`w-6 h-6 transition-transform duration-300 ${canStart && isHovering ? 'scale-125 animate-pulse' : ''}`} />
            {canStart ? '开始哄TA' : '请完成所有选择'}
          </button>
        </div>
      </div>
    </div>
  );
};
