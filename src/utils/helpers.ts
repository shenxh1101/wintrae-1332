import type { DifficultyLevel } from '@/types';
import { DIFFICULTY_CONFIG } from '@/constants/gameConfig';

export const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
};

export const getRandomInt = (min: number, max: number): number => {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

export const getRandomElement = <T>(array: T[]): T => {
  return array[Math.floor(Math.random() * array.length)];
};

export const shuffleArray = <T>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

export const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

export const formatDate = (date: Date | string | number): string => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  const day = d.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const formatNumber = (num: number): string => {
  return num.toLocaleString('zh-CN');
};

export const clamp = (value: number, min: number, max: number): number => {
  return Math.min(Math.max(value, min), max);
};

export const calculateStars = (
  score: number,
  thresholds: [number, number, number]
): number => {
  if (score >= thresholds[2]) return 3;
  if (score >= thresholds[1]) return 2;
  if (score >= thresholds[0]) return 1;
  return 0;
};

export const calculateScore = (
  baseScore: number,
  difficulty: DifficultyLevel,
  combo: number,
  responseTime: number
): number => {
  const difficultyMultiplier = 1 + (difficulty - 1) * 0.1;
  const comboMultiplier = Math.min(1 + combo * 0.1, 2.0);
  const timeBonus = Math.max(0, 1 - responseTime / 30);
  return Math.round(baseScore * difficultyMultiplier * comboMultiplier * (1 + timeBonus * 0.5));
};

export const calculateCoins = (
  correctCount: number,
  combo: number,
  stars: number,
  doubleCoin: boolean = false
): number => {
  const baseCoins = correctCount * 5;
  const comboBonus = Math.floor(combo / 3) * 2;
  const starBonus = stars * 10;
  const total = baseCoins + comboBonus + starBonus;
  return doubleCoin ? total * 2 : total;
};

export const getDifficultyNumberRange = (
  difficulty: DifficultyLevel
): [number, number] => {
  return DIFFICULTY_CONFIG[difficulty].numberRange;
};

export const adjustDifficulty = (
  currentDifficulty: DifficultyLevel,
  accuracy: number,
  avgResponseTime: number
): DifficultyLevel => {
  let newDifficulty = currentDifficulty;

  if (accuracy >= 0.85 && avgResponseTime < 5) {
    newDifficulty = Math.min(currentDifficulty + 1, 10) as DifficultyLevel;
  } else if (accuracy < 0.5 && avgResponseTime > 15) {
    newDifficulty = Math.max(currentDifficulty - 1, 1) as DifficultyLevel;
  }

  return newDifficulty;
};

export const checkStreakDays = (
  lastPlayDate: string,
  today: string = formatDate(new Date())
): { streakDays: number; isConsecutive: boolean } => {
  if (!lastPlayDate) {
    return { streakDays: 1, isConsecutive: true };
  }

  const last = new Date(lastPlayDate);
  const todayDate = new Date(today);

  const diffTime = todayDate.getTime() - last.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return { streakDays: 1, isConsecutive: true };
  } else if (diffDays === 1) {
    return { streakDays: 1, isConsecutive: true };
  } else {
    return { streakDays: 1, isConsecutive: false };
  }
};

export const isValidNumber = (value: any): value is number => {
  return typeof value === 'number' && !isNaN(value) && isFinite(value);
};

export const parseNumber = (value: string | number): number | null => {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  return isValidNumber(num) ? num : null;
};

export const deepClone = <T>(obj: T): T => {
  return JSON.parse(JSON.stringify(obj));
};

export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

export const compareAnswers = (
  userAnswer: string | number,
  correctAnswer: string | number
): boolean => {
  if (typeof userAnswer === 'number' && typeof correctAnswer === 'number') {
    return Math.abs(userAnswer - correctAnswer) < 0.001;
  }
  return String(userAnswer).trim() === String(correctAnswer).trim();
};

export const generateOptions = (
  correctAnswer: number,
  count: number = 4,
  range: [number, number] = [-10, 10]
): number[] => {
  const options = new Set<number>();
  options.add(correctAnswer);

  while (options.size < count) {
    const offset = getRandomInt(range[0], range[1]);
    const wrongAnswer = correctAnswer + offset;
    if (wrongAnswer !== correctAnswer && wrongAnswer >= 0) {
      options.add(wrongAnswer);
    }
  }

  return shuffleArray(Array.from(options));
};

export const getTodayPlayTimeKey = (): string => {
  return `playTime_${formatDate(new Date())}`;
};

export const calculateAccuracy = (
  correct: number,
  total: number
): number => {
  if (total === 0) return 0;
  return Math.round((correct / total) * 10000) / 10000;
};

export const calculateAvgResponseTime = (
  responseTimes: number[]
): number => {
  if (responseTimes.length === 0) return 0;
  const sum = responseTimes.reduce((a, b) => a + b, 0);
  return Math.round((sum / responseTimes.length) * 100) / 100;
};
