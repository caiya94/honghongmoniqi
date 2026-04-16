'use client';

import React, { useEffect, useState } from 'react';
import { useGame } from '@/context/GameContext';
import { Heart, HeartOff, Volume2, RotateCcw, Share2 } from 'lucide-react';

interface ConfettiPiece {
  id: number;
  x: number;
  delay: number;
  color: string;
  rotation: number;
}

export const GameOverScreen: React.FC = () => {
  const { gameState, resetGame, getVoiceConfig } = useGame();
  const [confetti, setConfetti] = useState<ConfettiPiece[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [endMessage, setEndMessage] = useState<string>('');

  const successMessages = [
    '哼，看在你这么努力哄我的份上...我就原谅你这一次吧！下次不许再犯了哦~',
    '好吧好吧，我承认你是有点本事的...这次就算了，但是你要请我吃大餐！',
    '算你过关了！下次要是再这样，我绝对不会这么容易原谅你的！',
  ];

  const failMessages = [
    '我们...先冷静一下吧。我需要一个人静静。',
    '你真的在乎我的感受吗？我现在真的很失望...',
    '我不想说话了，我觉得我们之间可能需要一些空间。',
  ];

  useEffect(() => {
    const messages = gameState.won ? successMessages : failMessages;
    const lastMessage = gameState.messages.filter((m) => m.role === 'partner').pop();
    setEndMessage(lastMessage?.content || messages[Math.floor(Math.random() * messages.length)]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameState.messages, gameState.won]);

  useEffect(() => {
    if (gameState.won) {
      const colors = ['#FF6B6B', '#FF8E53', '#FFD93D', '#6BCB77', '#4D96FF', '#9B59B6'];
      const pieces: ConfettiPiece[] = [];
      for (let i = 0; i < 40; i++) {
        pieces.push({
          id: i,
          x: Math.random() * 100,
          delay: Math.random() * 2,
          color: colors[Math.floor(Math.random() * colors.length)],
          rotation: Math.random() * 360,
        });
      }
      setConfetti(pieces);
    }
  }, [gameState.won]);

  const handlePlayAudio = async () => {
    if (!gameState.voiceType || !endMessage) return;

    const voiceConfig = getVoiceConfig(gameState.voiceType);
    if (!voiceConfig) return;

    const cleanText = endMessage
      .replace(/（[^）]*）/g, '')
      .replace(/\([^)]*\)/g, '')
      .replace(/\[[^\]]*\]/g, '')
      .replace(/[「」『』]/g, '')
      .replace(/[💕🎉✨🥰😘💖💗]/g, '')
      .trim();

    try {
      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: cleanText,
          speaker: voiceConfig.speaker,
          uid: `end-${Date.now()}`,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.audioUri || data.audioData) {
          const audioUri = data.audioUri || data.audioData;
          const audio = new Audio(audioUri);
          audio.play().catch(console.error);
          setIsPlaying(true);
          audio.onended = () => setIsPlaying(false);
        }
      }
    } catch (err) {
      console.error('TTS error:', err);
    }
  };

  const handleShare = async () => {
    const text = gameState.won
      ? `🎉 我在哄哄模拟器中成功哄好了TA！你也来试试？`
      : `😢 我在哄哄模拟器中失败了...你也来挑战一下？`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: '哄哄模拟器',
          text,
          url: window.location.href,
        });
      } catch {}
    } else {
      navigator.clipboard.writeText(text + ' ' + window.location.href);
    }
  };

  const handleReplay = () => {
    resetGame();
  };

  const partnerAvatar = gameState.gender === 'female' ? '👩' : '👨';

  // 成功界面
  if (gameState.won) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: '#F2F2F7' }}>
        {/* 撒花动画 */}
        {confetti.map((piece) => (
          <div
            key={piece.id}
            className="absolute top-0 animate-fall"
            style={{
              left: `${piece.x}%`,
              animationDelay: `${piece.delay}s`,
            }}
          >
            <div
              className="w-2.5 h-2.5 rounded-sm"
              style={{
                backgroundColor: piece.color,
                transform: `rotate(${piece.rotation}deg)`,
              }}
            />
          </div>
        ))}

        {/* 成功标识 */}
        <div className="bg-gradient-to-b from-green-400 to-green-500 pt-20 pb-16 px-6 text-center relative overflow-hidden">
          <div className="w-24 h-24 mx-auto bg-white rounded-full flex items-center justify-center shadow-2xl mb-4">
            <Heart className="w-12 h-12 text-green-500" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">通关成功！</h1>
          <p className="text-white/80">
            用了 {(gameState.step - 1) || gameState.step} 轮成功哄好了TA
          </p>
        </div>

        {/* 消息卡片 */}
        <div className="px-4 py-6 max-w-lg mx-auto">
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-[#F5F5F5] flex items-center justify-center text-2xl flex-shrink-0">
                {partnerAvatar}
              </div>
              <div className="flex-1">
                <p className="text-[#000] text-[15px] leading-relaxed">{endMessage}</p>
                <button
                  onClick={handlePlayAudio}
                  disabled={isPlaying}
                  className="mt-3 flex items-center gap-1.5 text-sm text-[#007AFF]"
                >
                  <Volume2 className="w-4 h-4" />
                  {isPlaying ? '播放中...' : '点击播放语音'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 按钮 */}
        <div className="px-4 pb-10 max-w-lg mx-auto space-y-3">
          <button
            onClick={handleShare}
            className="w-full py-4 bg-[#007AFF] text-white rounded-2xl font-semibold text-lg flex items-center justify-center gap-2 shadow-lg active:scale-[0.98] transition-transform"
          >
            <Share2 className="w-5 h-5" />
            分享给朋友试试
          </button>
          <button
            onClick={handleReplay}
            className="w-full py-4 bg-white text-[#007AFF] rounded-2xl font-semibold text-lg flex items-center justify-center gap-2 border border-[#E5E5EA] active:scale-[0.98] transition-transform"
          >
            <RotateCcw className="w-5 h-5" />
            再玩一次
          </button>
        </div>

        <style jsx>{`
          @keyframes fall {
            0% { transform: translateY(-10vh) rotate(0deg); opacity: 1; }
            100% { transform: translateY(110vh) rotate(720deg); opacity: 0; }
          }
          .animate-fall { animation: fall 3s linear forwards; }
        `}</style>
      </div>
    );
  }

  // 失败界面
  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F2F2F7' }}>
      {/* 失败标识 */}
      <div className="bg-gradient-to-b from-gray-400 to-gray-500 pt-20 pb-16 px-6 text-center">
        <div className="w-24 h-24 mx-auto bg-white rounded-full flex items-center justify-center shadow-2xl mb-4">
          <HeartOff className="w-12 h-12 text-gray-400" />
        </div>
        <h1 className="text-3xl font-bold text-white mb-2">游戏结束</h1>
        <p className="text-white/80">这次没能哄好TA...</p>
      </div>

      {/* 消息卡片 */}
      <div className="px-4 py-6 max-w-lg mx-auto">
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-[#F5F5F5] flex items-center justify-center text-2xl flex-shrink-0">
              {partnerAvatar}
            </div>
            <div className="flex-1">
              <p className="text-[#8E8E93] text-[15px] leading-relaxed">{endMessage}</p>
              <button
                onClick={handlePlayAudio}
                disabled={isPlaying}
                className="mt-3 flex items-center gap-1.5 text-sm text-[#007AFF]"
              >
                <Volume2 className="w-4 h-4" />
                {isPlaying ? '播放中...' : '点击播放语音'}
              </button>
            </div>
          </div>
        </div>

        {/* 好感度说明 */}
        <div className="mt-4 text-center text-sm text-[#8E8E93]">
          最终好感度：{gameState.affection}（需要达到80以上才能通关）
        </div>
      </div>

      {/* 按钮 */}
      <div className="px-4 pb-10 max-w-lg mx-auto">
        <button
          onClick={handleReplay}
          className="w-full py-4 bg-[#007AFF] text-white rounded-2xl font-semibold text-lg flex items-center justify-center gap-2 shadow-lg active:scale-[0.98] transition-transform"
        >
          <RotateCcw className="w-5 h-5" />
          再试一次
        </button>
      </div>
    </div>
  );
};
