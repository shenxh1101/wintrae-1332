import type {
  Question,
  GameState,
  GameResult,
  GameMode,
  Level,
  QuestionType,
  DifficultyLevel,
  WrongQuestion,
  PropType
} from '@/types';
import { generateQuestionBatch } from '@/generators/questionGenerators';
import {
  calculateScore,
  calculateCoins,
  calculateStars,
  compareAnswers,
  calculateAccuracy,
  calculateAvgResponseTime,
  formatDate,
  adjustDifficulty
} from '@/utils/helpers';
import { QUESTION_TYPE_CONFIG, GAME_CONFIG } from '@/constants/gameConfig';
import { getRandomEncouragement, speakText, speakQuestion } from '@/constants/voiceEncouragements';
import storage from '@/utils/storage';
import db from '@/db';

class GameEngine {
  private state: GameState;
  private questions: Question[] = [];
  private currentDifficulty: DifficultyLevel = 1;
  private wrongQuestions: WrongQuestion[] = [];
  private voiceEnabled: boolean = true;
  private soundEnabled: boolean = true;
  private gameStartTime: number = 0;
  private listeners: Set<() => void> = new Set();

  constructor() {
    this.state = this.getInitialState();
  }

  private getInitialState(): GameState {
    return {
      mode: null,
      currentQuestion: null,
      questionIndex: 0,
      currentQuestionIndex: 0,
      totalQuestions: 0,
      score: 0,
      combo: 0,
      maxCombo: 0,
      correctCount: 0,
      wrongCount: 0,
      timeRemaining: 0,
      timeLeft: 0,
      responseTimes: [],
      usedHints: 0,
      activeEffects: [],
      questionStartTime: 0,
      isPaused: false,
      isGameOver: false,
      selectedQuestionTypes: [],
      difficulty: 1,
      enableAdaptive: false
    };
  }

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify(): void {
    this.listeners.forEach(listener => listener());
  }

  getState(): GameState {
    return { ...this.state };
  }

  getQuestions(): Question[] {
    return [...this.questions];
  }

  getCurrentDifficulty(): DifficultyLevel {
    return this.currentDifficulty;
  }

  async initGame(
    mode: GameMode,
    level?: Level,
    questionTypes?: QuestionType[],
    difficulty?: DifficultyLevel,
    questionCount?: number,
    timeLimit?: number,
    enableAdaptive?: boolean
  ): Promise<void> {
    const settings = await storage.getUserSettings();
    this.voiceEnabled = settings.voiceEnabled;
    this.soundEnabled = settings.soundEnabled;

    let types: QuestionType[];
    let diff: DifficultyLevel;
    let qCount: number;
    let tLimit: number;
    let adaptive: boolean;

    if (mode === 'adventure' && level) {
      types = level.questionTypes.filter(t => settings.enabledQuestionTypes.includes(t));
      diff = Math.min(level.difficulty, settings.maxDifficulty) as DifficultyLevel;
      qCount = level.questionCount;
      tLimit = level.timeLimit;
      adaptive = false;
      this.state.currentLevelId = level.levelId;
    } else if (mode === 'practice') {
      types = questionTypes?.filter(t => settings.enabledQuestionTypes.includes(t)) ||
              settings.enabledQuestionTypes;
      diff = (difficulty || 3) as DifficultyLevel;
      qCount = questionCount || GAME_CONFIG.PRACTICE_QUESTION_COUNT;
      tLimit = 0;
      adaptive = enableAdaptive ?? true;
    } else {
      types = settings.enabledQuestionTypes;
      diff = (difficulty || 5) as DifficultyLevel;
      qCount = GAME_CONFIG.CHALLENGE_MAX_QUESTIONS;
      tLimit = timeLimit || GAME_CONFIG.CHALLENGE_TIME_LIMIT;
      adaptive = false;
    }

    if (types.length === 0) {
      throw new Error('没有可用的题目类型，请在家长设置中启用至少一种题型');
    }

    this.currentDifficulty = diff;
    this.questions = generateQuestionBatch(types, diff, qCount);
    this.wrongQuestions = [];
    this.gameStartTime = Date.now();

    this.state = {
      ...this.getInitialState(),
      mode,
      totalQuestions: qCount,
      timeRemaining: tLimit,
      timeLeft: tLimit,
      selectedQuestionTypes: types,
      questionStartTime: Date.now(),
      difficulty: diff,
      enableAdaptive: adaptive
    };

    if (qCount > 0) {
      this.state.currentQuestion = this.questions[0];
      if (this.voiceEnabled) {
        setTimeout(() => speakQuestion(this.questions[0].content, this.voiceEnabled), 500);
      }
    }

    this.notify();
  }

  submitAnswer(answer: string | number): {
    isCorrect: boolean;
    scoreGained: number;
    comboGained: number;
    encouragement?: string;
  } {
    if (!this.state.currentQuestion || this.state.isGameOver || this.state.isPaused) {
      return { isCorrect: false, scoreGained: 0, comboGained: 0 };
    }

    const question = this.state.currentQuestion;
    const responseTime = (Date.now() - this.state.questionStartTime) / 1000;
    const isCorrect = compareAnswers(answer, question.answer);

    this.state.responseTimes.push(responseTime);

    let scoreGained = 0;
    let comboGained = 0;
    let encouragement: string | undefined;

    if (isCorrect) {
      const baseScore = QUESTION_TYPE_CONFIG[question.type].baseScore;
      this.state.combo += 1;
      this.state.maxCombo = Math.max(this.state.maxCombo, this.state.combo);
      this.state.correctCount += 1;
      comboGained = this.state.combo;

      scoreGained = calculateScore(
        baseScore,
        question.difficulty,
        this.state.combo,
        responseTime
      );
      this.state.score += scoreGained;

      if (this.voiceEnabled) {
        if (this.state.combo >= 3 && this.state.combo % 3 === 0) {
          const enc = getRandomEncouragement('combo', this.state.combo);
          encouragement = enc.text;
          speakText(enc.text, this.voiceEnabled);
        } else {
          const enc = getRandomEncouragement('correct');
          encouragement = enc.text;
          speakText(enc.text, this.voiceEnabled);
        }
      }
    } else {
      this.state.wrongCount += 1;
      this.state.combo = 0;

      const wrongQuestion: Omit<WrongQuestion, 'id' | 'wrongCount' | 'lastWrongDate' | 'createdAt'> = {
        type: question.type,
        content: question.content,
        userAnswer: answer,
        correctAnswer: question.answer
      };
      this.wrongQuestions.push({
        ...wrongQuestion,
        id: question.id,
        wrongCount: 1,
        lastWrongDate: formatDate(new Date()),
        createdAt: Date.now()
      });

      if (this.voiceEnabled) {
        const enc = getRandomEncouragement('encouragement');
        encouragement = enc.text;
        speakText(enc.text, this.voiceEnabled);
      }
    }

    this.notify();
    return { isCorrect, scoreGained, comboGained, encouragement };
  }

  nextQuestion(): boolean {
    if (this.state.questionIndex >= this.questions.length - 1) {
      this.endGame();
      return false;
    }

    this.state.questionIndex += 1;
    this.state.currentQuestion = this.questions[this.state.questionIndex];
    this.state.questionStartTime = Date.now();

    const recentAccuracy = calculateAccuracy(
      this.state.correctCount,
      this.state.questionIndex
    );
    const recentAvgTime = calculateAvgResponseTime(
      this.state.responseTimes.slice(-5)
    );
    
    if (this.state.mode === 'practice' && this.state.questionIndex % 5 === 0) {
      this.currentDifficulty = adjustDifficulty(
        this.currentDifficulty,
        recentAccuracy,
        recentAvgTime
      );
      this.state.difficulty = this.currentDifficulty;
      
      const newQuestions = generateQuestionBatch(
        this.state.selectedQuestionTypes,
        this.currentDifficulty,
        5
      );
      this.questions.splice(
        this.state.questionIndex + 1,
        0,
        ...newQuestions
      );
      this.state.totalQuestions = this.questions.length;
    }

    if (this.voiceEnabled && this.state.currentQuestion) {
      speakQuestion(this.state.currentQuestion.content, this.voiceEnabled);
    }

    this.notify();
    return true;
  }

  useHint(): string | null {
    if (!this.state.currentQuestion) return null;
    
    this.state.usedHints += 1;
    
    const hint = this.state.currentQuestion.hint || '仔细想想，你一定能做出来的！';
    this.notify();
    return hint;
  }

  skipQuestion(): boolean {
    if (this.state.currentQuestion) {
      this.wrongQuestions = this.wrongQuestions.filter(
        q => q.id !== this.state.currentQuestion!.id
      );
    }

    return this.nextQuestion();
  }

  activateEffect(effectType: PropType, value: number): void {
    if (effectType === 'double_coin') {
      this.state.activeEffects.push('double_coin');
    } else if (effectType === 'time_extend') {
      this.state.timeRemaining += value;
      this.state.timeLeft = this.state.timeRemaining;
    }
    this.notify();
  }

  pauseGame(): void {
    this.state.isPaused = true;
    this.notify();
  }

  resumeGame(): void {
    this.state.isPaused = false;
    this.state.questionStartTime = Date.now();
    this.notify();
  }

  async endGame(): Promise<GameResult> {
    this.state.isGameOver = true;
    
    const playTime = Math.floor((Date.now() - this.gameStartTime) / 1000);
    const accuracy = calculateAccuracy(this.state.correctCount, this.state.totalQuestions);
    const avgResponseTime = calculateAvgResponseTime(this.state.responseTimes);
    
    let starsEarned = 0;
    let coinsEarned = 0;
    let newRecord = false;

    if (this.state.mode === 'adventure' && this.state.currentLevelId) {
      const level = await storage.getLevels().then(levels => 
        levels.find(l => l.levelId === this.state.currentLevelId)
      );
      
      if (level) {
        starsEarned = calculateStars(this.state.score, level.starThresholds);
        const hasDoubleCoin = this.state.activeEffects.includes('double_coin');
        coinsEarned = calculateCoins(
          this.state.correctCount,
          this.state.maxCombo,
          starsEarned,
          hasDoubleCoin
        );

        newRecord = this.state.score > level.bestScore;
        
        const updates: Partial<Level> = {
          bestScore: Math.max(level.bestScore, this.state.score),
          stars: Math.max(level.stars, starsEarned)
        };
        
        if (starsEarned > 0) {
          updates.unlocked = true;
        }
        
        await storage.updateLevel(level.levelId, updates);
        
        if (starsEarned > 0) {
          await storage.unlockNextLevel(level.levelId);
          await storage.setPlayerData({ currentLevel: level.levelId });
        }
      }
    } else {
      const hasDoubleCoin = this.state.activeEffects.includes('double_coin');
      coinsEarned = calculateCoins(
        this.state.correctCount,
        this.state.maxCombo,
        0,
        hasDoubleCoin
      );
    }

    if (coinsEarned > 0) {
      await storage.addCoins(coinsEarned);
    }

    for (const wrongQ of this.wrongQuestions) {
      await db.addWrongQuestion({
        type: wrongQ.type,
        content: wrongQ.content,
        userAnswer: wrongQ.userAnswer,
        correctAnswer: wrongQ.correctAnswer
      });
    }

    const gameRecord = {
      date: formatDate(new Date()),
      mode: this.state.mode!,
      levelId: this.state.currentLevelId,
      score: this.state.score,
      correctCount: this.state.correctCount,
      totalCount: this.state.totalQuestions,
      accuracy,
      avgResponseTime,
      maxCombo: this.state.maxCombo,
      playTime
    };
    await db.addGameRecord(gameRecord);

    const playMinutes = Math.ceil(playTime / 60);
    await storage.addTodayPlayTime(playMinutes);

    const today = formatDate(new Date());
    const playerData = await storage.getPlayerData();
    const lastDate = playerData.lastPlayDate;
    
    let streakDays = playerData.streakDays;
    if (lastDate !== today) {
      const lastDateObj = new Date(lastDate);
      const todayObj = new Date(today);
      const diffDays = Math.floor(
        (todayObj.getTime() - lastDateObj.getTime()) / (1000 * 60 * 60 * 24)
      );
      
      if (diffDays === 1 || diffDays === 0) {
        streakDays += 1;
      } else {
        streakDays = 1;
      }
    }
    
    await storage.setPlayerData({
      lastPlayDate: today,
      streakDays,
      totalPlayTime: playerData.totalPlayTime + playMinutes
    });

    if (this.voiceEnabled) {
      const enc = getRandomEncouragement('level_complete');
      speakText(enc.text, this.voiceEnabled);
    }

    const passed = accuracy >= 0.6;
    const result: GameResult = {
      score: this.state.score,
      totalScore: this.state.score,
      correctCount: this.state.correctCount,
      totalCount: this.state.totalQuestions,
      totalQuestions: this.state.totalQuestions,
      accuracy,
      avgResponseTime,
      avgTime: avgResponseTime,
      maxCombo: this.state.maxCombo,
      coinsEarned,
      starsEarned,
      newRecord,
      wrongQuestions: this.wrongQuestions,
      passed
    };

    this.notify();
    return result;
  }

  resetGame(): void {
    this.state = this.getInitialState();
    this.questions = [];
    this.wrongQuestions = [];
    this.currentDifficulty = 1;
    this.gameStartTime = 0;
    this.notify();
  }

  tick(): void {
    if (
      this.state.mode === 'challenge' &&
      this.state.timeRemaining > 0 &&
      !this.state.isPaused &&
      !this.state.isGameOver
    ) {
      this.state.timeRemaining -= 1;
      this.state.timeLeft = this.state.timeRemaining;
      if (this.state.timeRemaining <= 0) {
        this.endGame();
      }
      this.notify();
    }
  }

  getProgress(): number {
    if (this.state.totalQuestions === 0) return 0;
    return Math.round((this.state.questionIndex / this.state.totalQuestions) * 100);
  }
}

export const gameEngine = new GameEngine();

export default gameEngine;
