import type { QuestionType, DifficultyLevel } from '@/types';

export const QUESTION_TYPE_CONFIG: Record<QuestionType, {
  name: string;
  icon: string;
  description: string;
  baseScore: number;
}> = {
  addition: {
    name: '加法',
    icon: '➕',
    description: '两个数相加',
    baseScore: 10
  },
  subtraction: {
    name: '减法',
    icon: '➖',
    description: '两个数相减',
    baseScore: 10
  },
  multiplication: {
    name: '乘法',
    icon: '✖️',
    description: '两个数相乘',
    baseScore: 15
  },
  division: {
    name: '除法',
    icon: '➗',
    description: '两个数相除',
    baseScore: 15
  },
  comparison: {
    name: '大小比较',
    icon: '🔍',
    description: '比较两个数的大小',
    baseScore: 8
  },
  pattern: {
    name: '找规律',
    icon: '🔮',
    description: '找出数列的规律',
    baseScore: 20
  },
  completion: {
    name: '补全算式',
    icon: '🧩',
    description: '填入正确的数字或符号',
    baseScore: 18
  }
};

export const DIFFICULTY_CONFIG: Record<DifficultyLevel, {
  name: string;
  numberRange: [number, number];
  description: string;
}> = {
  1: {
    name: '入门',
    numberRange: [1, 10],
    description: '10以内的加减法'
  },
  2: {
    name: '简单',
    numberRange: [1, 20],
    description: '20以内的加减法'
  },
  3: {
    name: '初级',
    numberRange: [1, 50],
    description: '50以内的加减法，表内乘法'
  },
  4: {
    name: '中级',
    numberRange: [1, 100],
    description: '100以内的四则运算'
  },
  5: {
    name: '进阶',
    numberRange: [1, 200],
    description: '200以内的四则运算'
  },
  6: {
    name: '高级',
    numberRange: [10, 500],
    description: '三位数的四则运算'
  },
  7: {
    name: '挑战',
    numberRange: [10, 1000],
    description: '四位数的四则运算'
  },
  8: {
    name: '困难',
    numberRange: [50, 2000],
    description: '复杂的四则运算和逻辑题'
  },
  9: {
    name: '专家',
    numberRange: [100, 5000],
    description: '高难度的数学题'
  },
  10: {
    name: '大师',
    numberRange: [100, 10000],
    description: '终极挑战'
  }
};

export const GAME_CONFIG = {
  BASE_SCORE: 10,
  DIFFICULTY_MULTIPLIER: 0.2,
  COMBO_MULTIPLIER: 0.1,
  MAX_COMBO_MULTIPLIER: 2.0,
  CORRECT_COIN_REWARD: 5,
  COMBO_COIN_BONUS: 2,
  LEVEL_COMPLETE_BONUS: 20,
  STAR_BONUS: 10,
  HINT_COST: 1,
  SKIP_COST: 1,
  MAX_RESPONSE_TIME: 30,
  ADAPTIVE_THRESHOLD: {
    ACCURACY_UP: 0.85,
    ACCURACY_DOWN: 0.5,
    RESPONSE_TIME_UP: 3,
    RESPONSE_TIME_DOWN: 10
  },
  PRACTICE_QUESTION_COUNT: 20,
  CHALLENGE_TIME_LIMIT: 120,
  CHALLENGE_MAX_QUESTIONS: 50
} as const;

export const QUESTION_TYPE_NAMES: Record<QuestionType, string> = {
  addition: '加法',
  subtraction: '减法',
  multiplication: '乘法',
  division: '除法',
  comparison: '大小比较',
  pattern: '找规律',
  completion: '补全算式'
};

export const DIFFICULTY_NAMES: Record<DifficultyLevel, string> = {
  1: '入门',
  2: '简单',
  3: '初级',
  4: '中级',
  5: '进阶',
  6: '高级',
  7: '挑战',
  8: '困难',
  9: '专家',
  10: '大师'
};
