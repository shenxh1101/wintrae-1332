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
  isEnding: false,

  initGame: async (mode, level, questionTypes, difficulty, questionCount, timeLimit, enableAdaptive, customQuestions) => {
    set({ isLoading: true, error: null, showResult: false, gameResult: null, isEnding: false });
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
    if (get().isEnding) return;
    
    const hasNext = gameEngine.nextQuestion();
    set({ engineState: gameEngine.getState() });
    
    if (!hasNext && !get().isEnding) {
      get().endGame();
    }
  },

  useHint: async () => {
    try {
      const playerStore = usePlayerStore.getState();
      if (!playerStore?.playerData?.inventory) {
        console.error('玩家数据未加载');
        return false;
      }
      
      const inventory = playerStore.playerData.inventory;
      const hintCount = inventory['prop_hint_1'] || 0;
      
      if (hintCount <= 0) {
        return false;
      }
      
      const hint = gameEngine.useHint();
      if (!hint) {
        return false;
      }
      
      const useSuccess = await playerStore.useItem('prop_hint_1');
      if (!useSuccess) {
        return false;
      }
      
      set({ 
        showHint: true, 
        hintText: hint, 
        engineState: gameEngine.getState() 
      });
      return true;
    } catch (error) {
      console.error('使用提示卡失败:', error);
      return false;
    }
  },

  skipQuestion: async () => {
    try {
      const playerStore = usePlayerStore.getState();
      if (!playerStore?.playerData?.inventory) {
        console.error('玩家数据未加载');
        return false;
      }
      
      const inventory = playerStore.playerData.inventory;
      const skipCount = inventory['prop_skip_1'] || 0;
      
      if (skipCount <= 0) {
        return false;
      }
      
      const success = gameEngine.skipQuestion();
      if (!success) {
        return false;
      }
      
      const useSuccess = await playerStore.useItem('prop_skip_1');
      if (!useSuccess) {
        return false;
      }
      
      set({ engineState: gameEngine.getState() });
      
      if (!gameEngine.getState().currentQuestion) {
        await get().endGame();
      }
      return true;
    } catch (error) {
      console.error('使用跳过卡失败:', error);
      return false;
    }
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
    if (get().isEnding) return;
    
    set({ isEnding: true, isLoading: true });
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
        isLoading: false,
        isEnding: false
      });
    }
  },

  resetGame: () => {
    gameEngine.resetGame();
    set({
      engineState: gameEngine.getState(),
      gameResult: null,
      showResult: false,
      isEnding: false,
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
    if (get().isEnding) return;
    
    const prevGameOver = gameEngine.getState().isGameOver;
    gameEngine.tick();
    const newState = gameEngine.getState();
    set({ engineState: newState });
    
    if (!prevGameOver && newState.isGameOver && !get().isEnding) {
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
