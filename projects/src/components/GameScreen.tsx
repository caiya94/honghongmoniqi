'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useGame } from '@/context/GameContext';
import { Option, MAX_ROUNDS } from '@/types/game';
import { LoadingAnimation } from '@/components/LoadingAnimation';
import { ChevronLeft, MoreHorizontal, Volume2, VolumeX } from 'lucide-react';

interface ChatResponse {
  partnerMessage: string;
  options: Option[];
  isEnd: boolean;
}

interface TTSResponse {
  audioUri: string | null;
  audioData: string | null;
  error?: string;
}

export const GameScreen: React.FC = () => {
  const {
    gameState,
    selectOption,
    addUserMessage,
    addPartnerMessage,
    getVoiceConfig,
    isGeneratingRef,
    lastGeneratedStepRef,
  } = useGame();

  const [audioUri, setAudioUri] = useState<string | undefined>();
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentAudioMessageId, setCurrentAudioMessageId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const cleanTextForSpeech = (text: string): string => {
    return text
      .replace(/（[^）]*）/g, '')
      .replace(/\([^)]*\)/g, '')
      .replace(/\[[^\]]*\]/g, '')
      .replace(/[「」『』]/g, '')
      .trim();
  };

  const lastPartnerMessage = gameState.messages
    .filter((m) => m.role === 'partner')
    .pop();

  const messageId = lastPartnerMessage
    ? `${lastPartnerMessage.id}-${gameState.messages.filter((m) => m.role === 'partner').length}`
    : null;

  const generateNextRound = useCallback(async () => {
    if (isGeneratingRef.current) return;
    if (lastGeneratedStepRef.current === gameState.step && gameState.messages.length > 0 && !gameState.gameOver) return;

    isGeneratingRef.current = true;
    setError(null);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gender: gameState.gender,
          scenario: gameState.scenario?.title,
          messages: gameState.messages,
          affection: gameState.affection,
          step: gameState.step,
          isGameOver: gameState.gameOver,
          won: gameState.won,
        }),
      });

      if (!response.ok) throw new Error('Failed to generate response');

      const data: ChatResponse = await response.json();
      addPartnerMessage(data.partnerMessage, data.options);
      lastGeneratedStepRef.current = gameState.step;

      if (!data.isEnd && data.partnerMessage) {
        setCurrentAudioMessageId(`${data.partnerMessage}-${Date.now()}`);
      }
    } catch (err) {
      console.error('Generate round error:', err);
      setError('生成对话失败');
      addPartnerMessage(
        gameState.affection < 0 ? '你怎么还不说话？' : '哼...',
        [
          { id: 'opt-1', content: '真诚道歉', score: 10 },
          { id: 'opt-2', content: '解释原因', score: 5 },
          { id: 'opt-3', content: '撒娇求原谅', score: 15 },
          { id: 'opt-4', content: '转移话题', score: -5 },
          { id: 'opt-5', content: '说都是别人的错', score: -15 },
          { id: 'opt-6', content: '发个表情包敷衍', score: -10 },
        ]
      );
      lastGeneratedStepRef.current = gameState.step;
    } finally {
      isGeneratingRef.current = false;
    }
  }, [
    gameState.gender, gameState.scenario, gameState.messages,
    gameState.affection, gameState.step, gameState.gameOver, gameState.won,
    isGeneratingRef, lastGeneratedStepRef, addPartnerMessage,
  ]);

  useEffect(() => {
    const generateAudio = async () => {
      if (!gameState.voiceType || !lastPartnerMessage || !messageId) return;
      if (currentAudioMessageId !== messageId) {
        setAudioUri(undefined);
        setCurrentAudioMessageId(messageId);

        const voiceConfig = getVoiceConfig(gameState.voiceType);
        if (!voiceConfig) return;

        const cleanText = cleanTextForSpeech(lastPartnerMessage.content);
        if (!cleanText) return;

        try {
          const response = await fetch('/api/tts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              text: cleanText,
              speaker: voiceConfig.speaker,
              uid: `game-${Date.now()}`,
            }),
          });

          if (response.ok) {
            const data: TTSResponse = await response.json();
            if (data.audioUri || data.audioData) {
              setAudioUri(data.audioUri || data.audioData || undefined);
            }
          }
        } catch (err) {
          console.error('TTS error:', err);
        }
      }
    };

    generateAudio();
  }, [gameState.messages, gameState.voiceType, messageId, currentAudioMessageId, getVoiceConfig, lastPartnerMessage]);

  useEffect(() => {
    if (gameState.step > 0 && !gameState.gameOver) {
      generateNextRound();
    }
  }, [gameState.step, gameState.gameOver, generateNextRound]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [gameState.messages]);

  const handlePlayAudio = () => {
    if (!audioUri) return;
    if (audioRef.current) audioRef.current.pause();
    const audio = new Audio(audioUri);
    audioRef.current = audio;
    audio.play().catch(console.error);
    setIsPlaying(true);
    audio.onended = () => setIsPlaying(false);
  };

  const handleSelectOption = async (option: Option) => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
    setAudioUri(undefined);
    setCurrentAudioMessageId(null);
    addUserMessage(option.content);
    selectOption(option);
  };

  const handleRetry = () => {
    setError(null);
    generateNextRound();
  };

  const partnerAvatar = gameState.gender === 'female' ? '👩' : '👨';
  const partnerName = gameState.gender === 'female' ? '女朋友' : '男朋友';
  const displayStep = Math.min(gameState.step, MAX_ROUNDS);

  // 好感度颜色
  const getAffectionColor = () => {
    if (gameState.affection < 0) return '#FF3B30';
    if (gameState.affection < 30) return '#FF9500';
    if (gameState.affection < 60) return '#007AFF';
    return '#34C759';
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#F2F2F7' }}>
      {/* 顶部导航栏 */}
      <div className="bg-white border-b border-[#E5E5EA]">
        <div className="pt-14 pb-3 px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-[#007AFF]">
              <ChevronLeft className="w-6 h-6" />
              <span className="text-sm">返回</span>
            </div>
            <div className="text-center">
              <p className="font-semibold text-[#000]">{partnerName}</p>
              <p className="text-xs text-[#8E8E93]">第{displayStep}轮</p>
            </div>
            <MoreHorizontal className="w-6 h-6 text-[#8E8E93]" />
          </div>
          
          {/* 好感度条 */}
          <div className="mt-3">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="text-[#8E8E93]">好感度</span>
              <span style={{ color: getAffectionColor() }}>
                {gameState.affection > 0 ? '+' : ''}{gameState.affection}
              </span>
            </div>
            <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: '#E5E5EA' }}>
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${Math.max(0, Math.min(100, ((gameState.affection + 50) / 150) * 100))}%`,
                  backgroundColor: getAffectionColor(),
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 聊天消息区域 */}
      <div className="flex-1 overflow-auto px-3 py-4">
        <div className="max-w-lg mx-auto space-y-4 pb-4">
          
          {/* 加载动画 */}
          {gameState.isGenerating && gameState.messages.length === 0 && (
            <div className="flex items-start gap-3 mt-4">
              <div className="w-10 h-10 rounded-full bg-[#F5F5F5] flex items-center justify-center text-xl flex-shrink-0">
                {partnerAvatar}
              </div>
              <div className="bg-white rounded-2xl rounded-tl-md px-4 py-3 shadow-sm">
                <LoadingAnimation gender={gameState.gender} />
              </div>
            </div>
          )}

          {/* 错误提示 */}
          {error && (
            <div className="text-center py-3">
              <button
                onClick={handleRetry}
                className="px-4 py-2 bg-[#007AFF] text-white text-sm rounded-full"
              >
                {error} 点击重试
              </button>
            </div>
          )}

          {/* 消息列表 */}
          {gameState.messages.map((message, index) => {
            const isUser = message.role === 'user';
            const showAvatar = index === 0 || gameState.messages[index - 1]?.role !== message.role;
            
            return (
              <div
                key={message.id}
                className={`flex items-end gap-2 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
              >
                {showAvatar ? (
                  <div className={`w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center text-xl ${
                    isUser ? 'bg-gradient-to-br from-cyan-400 to-blue-500' : 'bg-[#F5F5F5]'
                  }`}>
                    {isUser ? '😎' : partnerAvatar}
                  </div>
                ) : (
                  <div className="w-10 flex-shrink-0" />
                )}

                <div className={`max-w-[75%] ${isUser ? 'order-1' : 'order-2'}`}>
                  {isUser ? (
                    <div className="bg-gradient-to-r from-cyan-500 to-blue-500 rounded-2xl rounded-tr-md px-4 py-2.5 shadow-sm">
                      <p className="text-white text-[15px] leading-relaxed">{message.content}</p>
                    </div>
                  ) : (
                    <div className="bg-white rounded-2xl rounded-tl-md px-4 py-2.5 shadow-sm">
                      <p className="text-[#000] text-[15px] leading-relaxed whitespace-pre-wrap">{message.content}</p>
                      {lastPartnerMessage?.id === message.id && audioUri && (
                        <button
                          onClick={handlePlayAudio}
                          disabled={isPlaying}
                          className="mt-2 flex items-center gap-1.5 text-xs text-[#007AFF]"
                        >
                          {isPlaying ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                          <span>{isPlaying ? '播放中' : '点击播放'}</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* 加载中 */}
          {gameState.isGenerating && gameState.messages.length > 0 && (
            <div className="flex items-end gap-2">
              <div className="w-10 h-10 rounded-full bg-[#F5F5F5] flex items-center justify-center text-xl">
                {partnerAvatar}
              </div>
              <div className="bg-white rounded-2xl rounded-tl-md px-4 py-3 shadow-sm">
                <LoadingAnimation gender={gameState.gender} />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* 底部选项区域 */}
      <div className="bg-white border-t border-[#E5E5EA]">
        <div className="px-4 py-4 pb-8">
          {gameState.currentOptions.length > 0 && !gameState.isGenerating ? (
            <div className="grid grid-cols-1 gap-2">
              {gameState.currentOptions.map((option) => (
                <button
                  key={option.id}
                  onClick={() => handleSelectOption(option)}
                  className="bg-[#F2F2F7] rounded-xl px-4 py-3.5 text-left text-[#000] text-[15px] hover:bg-[#E8E8EA] active:bg-[#DDD] transition-colors"
                >
                  {option.content}
                </button>
              ))}
            </div>
          ) : gameState.isGenerating ? (
            <div className="text-center py-2 text-sm text-[#8E8E93]">
              {partnerName}正在输入...
            </div>
          ) : (
            <div className="text-center py-2 text-sm text-[#8E8E93]">
              等待回复...
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
