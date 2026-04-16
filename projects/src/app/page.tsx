'use client';

import { GameProvider, useGame } from '@/context/GameContext';
import { StartScreen } from '@/components/StartScreen';
import { GameScreen } from '@/components/GameScreen';
import { GameOverScreen } from '@/components/GameOverScreen';

function GameContent() {
  const { gameState } = useGame();

  // 游戏结束显示结束界面
  if (gameState.gameOver) {
    return <GameOverScreen />;
  }

  // 开始游戏后显示游戏界面
  if (gameState.step > 0) {
    return <GameScreen />;
  }

  // 默认显示开始界面
  return <StartScreen />;
}

export default function Home() {
  return (
    <GameProvider>
      <GameContent />
    </GameProvider>
  );
}
