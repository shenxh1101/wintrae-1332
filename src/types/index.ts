export type QuestionType =
  | 'addition'
  | 'subtraction'
  | 'multiplication'
  | 'division'
  | 'comparison'
  | 'pattern'
  | 'completion';

export type DifficultyLevel = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

export type GameMode = 'adventure' | 'practice' | 'challenge';

export type AnswerInputType = 'click' | 'drag' | 'keyboard';

export interface QuestionData {
  num1?: number;
  num2?: number;
  dividend?: number;
  divisor?: number;
  pattern?: number[];
  missingIndex?: number;
  result?: number;
  operator?: string;
  [key: string]: any;
}

export interface Question {
  id: string;
  type: QuestionType;
  difficulty: DifficultyLevel;
  content: string;
  answer: string | number;
  options?: (string | number)[];
  hint?: string;
  inputType: AnswerInputType;
  data?: QuestionData;
  displayData?: {
    expression?: string;
    numbers?: number[];
    operators?: string[];
    blanks?: number[];
    pattern?: number[];
    comparison?: {
      left: number;
      right: number;
    };
  };
}

export interface QuestionDisplayData {
  expression?: string;
  numbers?: number[];
  operators?: string[];
  blanks?: number[];
  pattern?: number[];
  comparison?: {
    left: number;
    right: number;
  };
}

export interface Level {
  levelId: number;
  name: string;
  difficulty: DifficultyLevel;
  questionTypes: QuestionType[];
  questionCount: number;
  timeLimit: number;
  starThresholds: [number, number, number];
  coinReward: number;
  rewardCoins: number;
  unlocked: boolean;
  completed: boolean;
  stars: number;
  bestScore: number;
  bestAccuracy?: number;
  description: string;
  icon: string;
}

export interface GameRecord {
  id: string;
  date: string;
  mode: GameMode;
  levelId?: number;
  score: number;
  correctCount: number;
  totalCount: number;
  accuracy: number;
  avgResponseTime: number;
  maxCombo: number;
  playTime: number;
  createdAt: number;
}

export interface WrongQuestion {
  id: string;
  type: QuestionType;
  content: string;
  userAnswer: string | number;
  correctAnswer: string | number;
  wrongCount: number;
  lastWrongDate: string;
  createdAt: number;
}

export interface PlayerData {
  coins: number;
  currentLevel: number;
  streakDays: number;
  lastPlayDate: string;
  totalPlayTime: number;
  currentOutfit: string;
  unlockedOutfits: string[];
  inventory: Record<string, number>;
}

export interface UserSettings {
  parentPassword: string;
  dailyTimeLimit: number;
  enabledQuestionTypes: QuestionType[];
  maxDifficulty: DifficultyLevel;
  soundEnabled: boolean;
  voiceEnabled: boolean;
  fontSize: 'normal' | 'large' | 'xlarge';
}

export type PropType = 'hint' | 'skip' | 'double_coin' | 'time_extend';

export type ShopItemCategory = 'prop' | 'outfit';
export type ShopItemType = 'powerup' | 'outfit';

export interface ShopItem {
  id: string;
  category: ShopItemCategory;
  type: ShopItemType;
  name: string;
  description: string;
  price: number;
  icon: string;
  effect?: {
    type: PropType;
    value: number;
  };
  outfitData?: {
    avatar: string;
    color: string;
    accessories?: string[];
  };
  purchased: boolean;
}

export interface GameState {
  mode: GameMode | null;
  currentQuestion: Question | null;
  questionIndex: number;
  currentQuestionIndex: number;
  totalQuestions: number;
  score: number;
  combo: number;
  maxCombo: number;
  correctCount: number;
  wrongCount: number;
  timeRemaining: number;
  timeLeft?: number;
  responseTimes: number[];
  usedHints: number;
  activeEffects: PropType[];
  questionStartTime: number;
  isPaused: boolean;
  isGameOver: boolean;
  currentLevelId?: number;
  selectedQuestionTypes: QuestionType[];
  difficulty: DifficultyLevel;
  enableAdaptive: boolean;
}

export interface GameResult {
  score: number;
  totalScore: number;
  correctCount: number;
  totalCount: number;
  totalQuestions: number;
  accuracy: number;
  avgResponseTime: number;
  avgTime: number;
  maxCombo: number;
  coinsEarned: number;
  starsEarned: number;
  newRecord: boolean;
  wrongQuestions: WrongQuestion[];
  passed: boolean;
}

export interface VoiceEncouragement {
  id: string;
  text: string;
  condition: 'correct' | 'combo' | 'level_complete' | 'encouragement';
  minCombo?: number;
}

export interface DailyStats {
  date: string;
  playTime: number;
  questionsAnswered: number;
  totalQuestions: number;
  correctAnswers: number;
  correctCount: number;
  accuracy: number;
}

export interface OverallStats {
  totalScore: number;
  totalQuestions: number;
  correctAnswers: number;
  totalTime: number;
  typeStats: Partial<Record<QuestionType, { total: number; correct: number }>>;
}

export interface QuestionTypeStats {
  type: QuestionType;
  total: number;
  correct: number;
  accuracy: number;
  avgResponseTime: number;
}

declare global {
  interface Window {
    electronAPI?: {
      store: {
        get: (key: string) => Promise<any>;
        set: (key: string, value: any) => Promise<boolean>;
        delete: (key: string) => Promise<boolean>;
        clear: () => Promise<boolean>;
      };
      app: {
        openExternal: (url: string) => Promise<boolean>;
        getPath: (name: string) => Promise<string>;
      };
      window: {
        minimize: () => Promise<boolean>;
        maximize: () => Promise<boolean>;
        close: () => Promise<boolean>;
      };
    };
    isElectron?: boolean;
  }
}
