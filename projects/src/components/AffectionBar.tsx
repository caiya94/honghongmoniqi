'use client';

import React from 'react';
import { MAX_AFFECTION, MIN_AFFECTION } from '@/types/game';

interface AffectionBarProps {
  affection: number;
}

export const AffectionBar: React.FC<AffectionBarProps> = ({ affection }) => {
  // 计算百分比 (将 -50 ~ 100 映射到 0 ~ 100%)
  const percentage = Math.max(0, Math.min(100, ((affection - MIN_AFFECTION) / (MAX_AFFECTION - MIN_AFFECTION)) * 100));

  // 根据好感度获取颜色
  const getColor = () => {
    if (affection < 0) return '#ef4444'; // 红色 - 生气
    if (affection < 50) return '#eab308'; // 黄色 - 一般
    if (affection < 80) return '#3b82f6'; // 蓝色 - 好转
    return '#22c55e'; // 绿色 - 快成功了
  };

  // 获取状态文字
  const getStatusText = () => {
    if (affection < -30) return '非常生气 💢';
    if (affection < 0) return '有点生气 😤';
    if (affection < 30) return '还在生气 🤔';
    if (affection < 60) return '渐渐缓和 😊';
    if (affection < 80) return '快哄好了 🥰';
    return '成功了！💕';
  };

  return (
    <div className="w-full space-y-2">
      <div className="flex justify-between items-center text-sm">
        <span className="text-gray-600 font-medium">好感度</span>
        <span className="text-gray-500">{getStatusText()}</span>
      </div>
      <div className="flex items-center gap-3">
        <div className="flex-1 bg-gray-200 rounded-full h-4 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500 ease-out"
            style={{
              width: `${percentage}%`,
              backgroundColor: getColor(),
            }}
          />
        </div>
        <span className="text-xs text-gray-400 w-8 text-right">
          {affection > 0 ? '+' : ''}{affection}
        </span>
      </div>
    </div>
  );
};
