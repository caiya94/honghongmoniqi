'use client';

import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import {
  GameState,
  Gender,
  Scenario,
  VoiceType,
  Option,
  Message,
  INITIAL_GAME_STATE,
  MAX_AFFECTION,
  MIN_AFFECTION,
  WIN_AFFECTION,
  MAX_ROUNDS,
  VOICE_CONFIGS,
} from '@/types/game';

// VoiceConfig 接口
interface VoiceConfig {
  type: VoiceType;
  speaker: string;
  label: string;
  gender: Gender;
}

// GameContextType 接口
interface GameContextType {
  gameState: GameState;
  setGender: (gender: Gender) => void;
  setScenario: (scenario: Scenario) => void;
  setVoiceType: (voiceType: VoiceType) => void;
  startGame: () => void;
  selectOption: (option: Option) => void;
  resetGame: () => void;
  addUserMessage: (content: string) => void;
  addPartnerMessage: (content: string, options: Option[]) => void;
  isGeneratingRef: React.MutableRefObject<boolean>;
  lastGeneratedStepRef: React.MutableRefObject<number>;
  getVoiceConfig: (voiceType: VoiceType) => VoiceConfig | undefined;
}

const GameContext = createContext<GameContextType | null>(null);

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};

interface GameProviderProps {
  children: React.ReactNode;
}

export const GameProvider: React.FC<GameProviderProps> = ({ children }) => {
  const [gameState, setGameState] = useState<GameState>(INITIAL_GAME_STATE);
  const isGeneratingRef = useRef(false);
  const lastGeneratedStepRef = useRef<number>(0);

  const setGender = useCallback((gender: Gender) => {
    setGameState((prev) => ({ ...prev, gender }));
  }, []);

  const setScenario = useCallback((scenario: Scenario) => {
    setGameState((prev) => ({ ...prev, scenario }));
  }, []);

  const setVoiceType = useCallback((voiceType: VoiceType) => {
    setGameState((prev) => ({ ...prev, voiceType }));
  }, []);

  const startGame = useCallback(() => {
    setGameState((prev) => {
      const gender = prev.gender;
      const scenario = prev.scenario;
      const voiceType = prev.voiceType;

      if (!gender || !scenario || !voiceType) {
        console.error('Missing game config:', { gender, scenario, voiceType });
        return prev;
      }

      return {
        ...prev,
        step: 1,
        messages: [],
        currentOptions: [],
        gameOver: false,
        won: false,
        isGenerating: true,
      };
    });
  }, []);

  const addUserMessage = useCallback((content: string) => {
    setGameState((prev) => ({
      ...prev,
      messages: [
        ...prev.messages,
        {
          id: `user-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
          role: 'user',
          content,
        },
      ],
    }));
  }, []);

  const addPartnerMessage = useCallback((content: string, options: Option[]) => {
    setGameState((prev) => {
      const newMessage: Message = {
        id: `partner-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
        role: 'partner',
        content,
      };

      const newAffection = Math.min(
        MAX_AFFECTION,
        Math.max(MIN_AFFECTION, prev.affection)
      );

      const isWin = newAffection >= WIN_AFFECTION;
      const isLose = newAffection < MIN_AFFECTION;

      const gameOver = isWin || isLose;
      const won = isWin;

      return {
        ...prev,
        messages: [...prev.messages, newMessage],
        currentOptions: options,
        affection: newAffection,
        step: prev.step,
        gameOver,
        won,
        isGenerating: false,
      };
    });
  }, []);

  const selectOption = useCallback((option: Option) => {
    setGameState((prev) => {
      const newAffection = Math.min(
        MAX_AFFECTION,
        Math.max(MIN_AFFECTION, prev.affection + option.score)
      );

      const isWin = newAffection >= WIN_AFFECTION;
      const isLose = newAffection < MIN_AFFECTION;
      const isMaxRounds = prev.step >= MAX_ROUNDS;

      let gameOver = false;
      let won = false;

      if (isWin) {
        gameOver = true;
        won = true;
      } else if (isLose) {
        gameOver = true;
        won = false;
      } else if (isMaxRounds) {
        gameOver = true;
        won = newAffection >= WIN_AFFECTION;
      }

      return {
        ...prev,
        affection: newAffection,
        step: prev.step + 1,
        currentOptions: [],
        gameOver,
        won,
        isGenerating: !gameOver,
      };
    });
  }, []);

  const resetGame = useCallback(() => {
    setGameState({
      ...INITIAL_GAME_STATE,
      gender: gameState.gender,
      scenario: gameState.scenario,
      voiceType: gameState.voiceType,
    });
    isGeneratingRef.current = false;
    lastGeneratedStepRef.current = 0;
  }, [gameState.gender, gameState.scenario, gameState.voiceType]);

  const getVoiceConfig = useCallback((voiceType: VoiceType) => {
    return VOICE_CONFIGS.find((v) => v.type === voiceType);
  }, []);

  const value: GameContextType = {
    gameState,
    setGender,
    setScenario,
    setVoiceType,
    startGame,
    selectOption,
    resetGame,
    addUserMessage,
    addPartnerMessage,
    isGeneratingRef,
    lastGeneratedStepRef,
    getVoiceConfig,
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
};
