import { create } from 'zustand';
import type { GameState, GameResult, GameMode, Level, QuestionType, DifficultyLevel } from '@/types';
import gameEngine from '@/engine/gameEngine';

interface GameStore {
  engineState: GameState;
  gameResult: GameResult | null;
  isLoading: boolean;
  error: string | null;
  feedback: {
    type: 'correct' | 'wrong' | null;
    message: string | null;
    scoreGained: number;
    comboGained: number;
  };
  showHint: boolean;
  hintText: string | null;
  showResult: boolean;

  initGame: (
    mode: GameMode,
    level?: Level,
    questionTypes?: QuestionType[],
    difficulty?: DifficultyLevel
  ) => Promise<void>;
  submitAnswer: (answer: string | number) => void;
  nextQuestion: () => void;
  useHint: () => void;
  skipQuestion: () => void;
  pauseGame: () => void;
  resumeGame: () => void;
  endGame: () => Promise<void>;
  resetGame: () => void;
  tick: () => void;
  closeResult: () => void;
  clearFeedback: () => void;
  closeHint: () => void;
}

export const useGameStore = create<GameStore>((set, get) => ({
  engineState: gameEngine.getState(),
  gameResult: null,
  isLoading: false,
  error: null,
  feedback: {
    type: null,
    message: null,
    scoreGained: 0,
    comboGained: 0
  },
  showHint: false,
  hintText: null,
  showResult: false,

  initGame: async (mode, level, questionTypes, difficulty) => {
    set({ isLoading: true, error: null, showResult: false, gameResult: null });
    try {
      await gameEngine.initGame(mode, level, questionTypes, difficulty);
      set({ engineState: gameEngine.getState(), isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : '初始化游戏失败',
        isLoading: false
      });
    }
  },

  submitAnswer: (answer) => {
    const result = gameEngine.submitAnswer(answer);
    set({
      engineState: gameEngine.getState(),
      feedback: {
        type: result.isCorrect ? 'correct' : 'wrong',
        message: result.encouragement || null,
        scoreGained: result.scoreGained,
        comboGained: result.comboGained
      }
    });

    setTimeout(() => {
      get().clearFeedback();
      get().nextQuestion();
    }, 1500);
  },

  nextQuestion: () => {
    const hasNext = gameEngine.nextQuestion();
    set({ engineState: gameEngine.getState() });
    
    if (!hasNext) {
      get().endGame();
    }
  },

  useHint: () => {
    const hint = gameEngine.useHint();
    if (hint) {
      set({ showHint: true, hintText: hint, engineState: gameEngine.getState() });
    }
  },

  skipQuestion: () => {
    gameEngine.skipQuestion();
    set({ engineState: gameEngine.getState() });
  },

  pauseGame: () => {
    gameEngine.pauseGame();
    set({ engineState: gameEngine.getState() });
  },

  resumeGame: () => {
    gameEngine.resumeGame();
    set({ engineState: gameEngine.getState() });
  },

  endGame: async () => {
    set({ isLoading: true });
    try {
      const result = await gameEngine.endGame();
      set({
        gameResult: result,
        showResult: true,
        isLoading: false,
        engineState: gameEngine.getState()
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : '游戏结束失败',
        isLoading: false
      });
    }
  },

  resetGame: () => {
    gameEngine.resetGame();
    set({
      engineState: gameEngine.getState(),
      gameResult: null,
      showResult: false,
      feedback: {
        type: null,
        message: null,
        scoreGained: 0,
        comboGained: 0
      },
      showHint: false,
      hintText: null
    });
  },

  tick: () => {
    gameEngine.tick();
    set({ engineState: gameEngine.getState() });
  },

  closeResult: () => {
    set({ showResult: false });
  },

  clearFeedback: () => {
    set({
      feedback: {
        type: null,
        message: null,
        scoreGained: 0,
        comboGained: 0
      }
    });
  },

  closeHint: () => {
    set({ showHint: false, hintText: null });
  }
}));

export default useGameStore;
