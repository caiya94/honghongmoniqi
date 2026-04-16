'use client';

import React from 'react';
import { Gender } from '@/types/game';
import { Heart } from 'lucide-react';

interface LoadingAnimationProps {
  gender: Gender | null;
}

export const LoadingAnimation: React.FC<LoadingAnimationProps> = ({ gender }) => {
  const pronoun = gender === 'female' ? '她' : '他';

  return (
    <div className="flex flex-col items-center justify-center py-8 space-y-4">
      <div className="relative">
        <Heart className="w-12 h-12 text-pink-400 animate-pulse" />
        <div className="absolute inset-0 flex items-center justify-center">
          <Heart className="w-8 h-8 text-pink-500 animate-bounce animation-delay-150" />
        </div>
      </div>
      <div className="flex items-center gap-2 text-gray-500">
        <span className="inline-block animate-bounce" style={{ animationDelay: '0ms' }}>.</span>
        <span className="inline-block animate-bounce" style={{ animationDelay: '150ms' }}>.</span>
        <span className="inline-block animate-bounce" style={{ animationDelay: '300ms' }}>.</span>
        <span className="ml-2">
          {pronoun}正在思考...
        </span>
      </div>
    </div>
  );
};
