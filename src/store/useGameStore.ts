import { create } from 'zustand';
import type { GameState, GameResult, GameMode, Level, QuestionType, DifficultyLevel, Question } from '@/types';
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
    difficulty?: DifficultyLevel,
    questionCount?: number,
    timeLimit?: number,
    enableAdaptive?: boolean,
    customQuestions?: Question[]
  ) => Promise<void>;
  submitAnswer: (answer: string | number) => void;
  nextQuestion: () => void;
  useHint: () => Promise<boolean>;
  skipQuestion: () => Promise<boolean>;
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

  initGame: async (mode, level, questionTypes, difficulty, questionCount, timeLimit, enableAdaptive, customQuestions) => {
    set({ isLoading: true, error: null, showResult: false, gameResult: null });
    try {
      await gameEngine.initGame(mode, level, questionTypes, difficulty, questionCount, timeLimit, enableAdaptive, customQuestions);
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

  useHint: async () => {
    const playerStore = usePlayerStore.getState();
    const inventory = playerStore.playerData.inventory;
    const hintCount = inventory['prop_hint_1'] || 0;
    
    if (hintCount <= 0) {
      return false;
    }
    
    const hint = gameEngine.useHint();
    if (hint) {
      await playerStore.useItem('prop_hint_1');
      set({ showHint: true, hintText: hint, engineState: gameEngine.getState() });
      return true;
    }
    return false;
  },

  skipQuestion: async () => {
    const playerStore = usePlayerStore.getState();
    const inventory = playerStore.playerData.inventory;
    const skipCount = inventory['prop_skip_1'] || 0;
    
    if (skipCount <= 0) {
      return false;
    }
    
    const success = gameEngine.skipQuestion();
    if (success) {
      await playerStore.useItem('prop_skip_1');
      set({ engineState: gameEngine.getState() });
      
      if (!gameEngine.getState().currentQuestion) {
        await get().endGame();
      }
      return true;
    }
    return false;
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
    const prevGameOver = gameEngine.getState().isGameOver;
    gameEngine.tick();
    const newState = gameEngine.getState();
    set({ engineState: newState });
    
    if (!prevGameOver && newState.isGameOver) {
      setTimeout(() => {
        get().endGame();
      }, 0);
    }
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
