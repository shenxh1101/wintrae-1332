import React, { useEffect, useCallback, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import { useGameStore } from '@/store/useGameStore';
import { usePlayerStore } from '@/store/usePlayerStore';
import { GameQuestionRenderer } from '@/components/game/GameQuestionRenderer';
import { Button } from '@/components/ui/Button';
import { formatTime } from '@/lib/utils';
import storage from '@/utils/storage';
import type { Level, GameMode, QuestionType, DifficultyLevel, Question } from '@/types';

interface LocationState {
  mode: GameMode;
  level?: Level;
  questionTypes?: QuestionType[];
  difficulty?: DifficultyLevel;
  questionCount?: number;
  timeLimit?: number;
  enableAdaptive?: boolean;
  customQuestions?: Question[];
  isWrongQuestionPractice?: boolean;
}

const GamePage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as LocationState;

  const [dailyLimitInfo, setDailyLimitInfo] = useState<{ canPlay: boolean; remaining: number; used: number } | null>(null);
  const [showLimitWarning, setShowLimitWarning] = useState(false);

  const {
    engineState,
    gameResult,
    isLoading,
    feedback,
    showHint,
    hintText,
    showResult,
    initGame,
    submitAnswer,
    useHint,
    skipQuestion,
    pauseGame,
    resumeGame,
    resetGame,
    tick,
    closeResult,
    closeHint
  } = useGameStore();

  const { playerData, loadPlayerData } = usePlayerStore();
  const hintCount = playerData.inventory['prop_hint_1'] || 0;
  const skipCount = playerData.inventory['prop_skip_1'] || 0;

  const { currentQuestion, score, combo, timeRemaining, timeLeft, totalQuestions, questionIndex, currentQuestionIndex, isPaused, difficulty } = engineState;
  const actualTimeLeft = timeLeft ?? timeRemaining;
  const actualQuestionIndex = currentQuestionIndex ?? questionIndex;

  useEffect(() => {
    const checkAndStart = async () => {
      if (!state?.mode) return;
      
      loadPlayerData();
      
      const limitInfo = await storage.checkDailyLimit();
      setDailyLimitInfo(limitInfo);
      
      if (!limitInfo.canPlay && !state?.isWrongQuestionPractice) {
        setShowLimitWarning(true);
        return;
      }
      
      initGame(
        state.mode,
        state.level,
        state.questionTypes,
        state.difficulty,
        state.questionCount,
        state.timeLimit,
        state.enableAdaptive,
        state.customQuestions
      );
    };
    
    checkAndStart();
    
    return () => {
      resetGame();
    };
  }, [state, initGame, resetGame, loadPlayerData]);

  useEffect(() => {
    if (state?.mode === 'challenge' && !isPaused && actualTimeLeft !== undefined && actualTimeLeft > 0) {
      const timer = setInterval(() => {
        tick();
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [state?.mode, isPaused, actualTimeLeft, tick]);

  const handleBack = useCallback(() => {
    if (state?.isWrongQuestionPractice) {
      navigate('/parent');
    } else {
      navigate(-1);
    }
  }, [navigate, state]);

  const handlePlayAgain = useCallback(() => {
    closeResult();
    const checkAndRestart = async () => {
      if (!state?.isWrongQuestionPractice) {
        const limitInfo = await storage.checkDailyLimit();
        setDailyLimitInfo(limitInfo);
        
        if (!limitInfo.canPlay) {
          setShowLimitWarning(true);
          return;
        }
      }
      
      if (state?.mode) {
        initGame(
          state.mode,
          state.level,
          state.questionTypes,
          state.difficulty,
          state.questionCount,
          state.timeLimit,
          state.enableAdaptive,
          state.isWrongQuestionPractice ? state.customQuestions : undefined
        );
      }
    };
    checkAndRestart();
  }, [state, initGame, closeResult]);

  if (isLoading && !currentQuestion) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-100 via-accent-50 to-reward-100 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
          className="w-20 h-20 border-8 border-primary-200 border-t-primary-500 rounded-full"
        />
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-100 via-accent-50 to-reward-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-2xl text-gray-600 mb-4">没有题目了</p>
          <Button onClick={handleBack}>返回</Button>
        </div>
      </div>
    );
  }

  const progress = ((actualQuestionIndex + 1) / totalQuestions) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-100 via-accent-50 to-reward-100 py-6 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <Button variant="ghost" onClick={handleBack} size="sm">
            ← 返回
          </Button>

          <div className="flex flex-wrap items-center gap-4">
            <div className="bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-md flex items-center gap-2">
              <span className="text-2xl">🏆</span>
              <span className="font-display font-bold text-primary-600 text-xl">{score}</span>
            </div>

            {combo > 1 && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, repeatType: 'reverse', duration: 0.5 }}
                className="bg-gradient-to-r from-accent-400 to-accent-500 text-white px-4 py-2 rounded-full shadow-md flex items-center gap-2"
              >
                <span className="text-2xl">🔥</span>
                <span className="font-display font-bold text-xl">{combo} 连击!</span>
              </motion.div>
            )}

            {state?.mode === 'challenge' && actualTimeLeft !== undefined && (
              <div className={`px-4 py-2 rounded-full shadow-md flex items-center gap-2 ${
                actualTimeLeft <= 10 ? 'bg-error-500 text-white animate-pulse' : 'bg-white/80 backdrop-blur-sm'
              }`}>
                <span className="text-2xl">⏱️</span>
                <span className={`font-display font-bold text-xl ${actualTimeLeft <= 10 ? 'text-white' : 'text-error-600'}`}>
                  {formatTime(actualTimeLeft)}
                </span>
              </div>
            )}

            {state?.isWrongQuestionPractice && (
              <div className="bg-error-100 border-2 border-error-300 px-4 py-2 rounded-full shadow-md">
                <span className="font-display font-bold text-error-600">
                  📝 错题重练
                </span>
              </div>
            )}

            <div className="bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-md">
              <span className="font-display font-bold text-gray-600">
                {actualQuestionIndex + 1} / {totalQuestions}
              </span>
            </div>

            {state?.mode === 'practice' && (
              <div className="bg-reward-100 px-4 py-2 rounded-full shadow-md">
                <span className="font-display font-bold text-reward-600">
                  难度 Lv.{difficulty}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="w-full h-4 bg-white/50 rounded-full overflow-hidden mb-8 shadow-inner">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5 }}
            className="h-full bg-gradient-to-r from-primary-400 via-accent-400 to-reward-400 rounded-full"
          />
        </div>

        <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-8 shadow-xl border-4 border-white mb-6">
          <GameQuestionRenderer
            question={currentQuestion}
            onSubmit={submitAnswer}
            disabled={feedback.type !== null}
          />
        </div>

        <div className="flex flex-wrap justify-center gap-4">
          <Button
            variant="secondary"
            onClick={useHint}
            disabled={feedback.type !== null || hintCount <= 0}
            icon={<span className="text-2xl">💡</span>}
          >
            提示 ({hintCount})
          </Button>
          <Button
            variant="warning"
            onClick={skipQuestion}
            disabled={feedback.type !== null || skipCount <= 0}
            icon={<span className="text-2xl">⏭️</span>}
          >
            跳过 ({skipCount})
          </Button>
          {state?.mode === 'challenge' && (
            <Button
              variant={isPaused ? 'success' : 'error'}
              onClick={isPaused ? resumeGame : pauseGame}
              icon={<span className="text-2xl">{isPaused ? '▶️' : '⏸️'}</span>}
            >
              {isPaused ? '继续' : '暂停'}
            </Button>
          )}
        </div>
      </div>

      <AnimatePresence>
        {feedback.type && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            className="fixed inset-0 flex items-center justify-center pointer-events-none z-50"
          >
            <motion.div
              animate={{
                y: [0, -20, 0],
                scale: [1, 1.1, 1]
              }}
              transition={{ duration: 0.5, repeat: Infinity, repeatType: 'reverse' }}
              className={`text-center p-8 rounded-3xl shadow-2xl ${
                feedback.type === 'correct'
                  ? 'bg-gradient-to-br from-success-400 to-success-600 text-white'
                  : 'bg-gradient-to-br from-error-400 to-error-600 text-white'
              }`}
            >
              <div className="text-8xl mb-4">
                {feedback.type === 'correct' ? '🎉' : '😅'}
              </div>
              <div className="text-4xl font-display font-bold mb-2">
                {feedback.type === 'correct' ? '答对了!' : '再试试!'}
              </div>
              {feedback.scoreGained > 0 && (
                <div className="text-2xl">+{feedback.scoreGained} 分</div>
              )}
              {feedback.message && (
                <div className="text-xl mt-2 opacity-90">{feedback.message}</div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showHint && hintText && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={closeHint}
          >
            <motion.div
              initial={{ scale: 0.8, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 20 }}
              className="bg-gradient-to-br from-accent-100 to-accent-200 rounded-3xl p-8 max-w-md w-full text-center border-4 border-accent-300 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-6xl mb-4">💡</div>
              <h3 className="text-3xl font-display font-bold text-accent-700 mb-4">小提示</h3>
              <p className="text-2xl text-gray-700 mb-6">{hintText}</p>
              <Button variant="secondary" onClick={closeHint} fullWidth>
                我知道了
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showResult && gameResult && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.5, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.5, y: 50 }}
              className="bg-white rounded-3xl p-8 max-w-lg w-full text-center border-4 border-primary-200 shadow-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="text-8xl mb-4">
                {gameResult.passed ? '🏆' : '💪'}
              </div>
              <h2 className="text-4xl font-display font-bold text-primary-600 mb-6">
                {gameResult.passed ? '挑战成功!' : '挑战完成!'}
              </h2>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-primary-50 rounded-2xl p-4">
                  <div className="text-4xl mb-1">🏆</div>
                  <div className="text-3xl font-display font-bold text-primary-600">{gameResult.totalScore}</div>
                  <div className="text-sm text-gray-500">总得分</div>
                </div>
                <div className="bg-success-50 rounded-2xl p-4">
                  <div className="text-4xl mb-1">✅</div>
                  <div className="text-3xl font-display font-bold text-success-600">
                    {Math.round(gameResult.accuracy * 100)}%
                  </div>
                  <div className="text-sm text-gray-500">正确率</div>
                </div>
                <div className="bg-accent-50 rounded-2xl p-4">
                  <div className="text-4xl mb-1">🔥</div>
                  <div className="text-3xl font-display font-bold text-accent-600">{gameResult.maxCombo}</div>
                  <div className="text-sm text-gray-500">最大连击</div>
                </div>
                <div className="bg-reward-50 rounded-2xl p-4">
                  <div className="text-4xl mb-1">💰</div>
                  <div className="text-3xl font-display font-bold text-reward-600">{gameResult.coinsEarned}</div>
                  <div className="text-sm text-gray-500">获得金币</div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-2xl p-4 mb-6">
                <div className="text-lg text-gray-600">
                  共 {gameResult.totalQuestions} 题，
                  答对 {gameResult.correctCount} 题，
                  平均用时 {gameResult.avgTime.toFixed(1)} 秒
                </div>
              </div>

              <div className="flex flex-col gap-3">
                {state?.isWrongQuestionPractice && (
                  <>
                    <div className="bg-success-100 border-2 border-success-300 rounded-2xl p-3 mb-2">
                      <p className="text-success-700 font-display text-sm">
                        ✅ 完成练习！返回家长中心查看更新后的统计和错题次数
                      </p>
                    </div>
                    <Button variant="success" onClick={handleBack} fullWidth size="lg">
                      📊 返回家长中心
                    </Button>
                  </>
                )}
                {!state?.isWrongQuestionPractice && (
                  <Button variant="primary" onClick={handlePlayAgain} fullWidth size="lg">
                    🔄 再来一局
                  </Button>
                )}
                {!state?.isWrongQuestionPractice && (
                  <Button variant="secondary" onClick={handleBack} fullWidth>
                    返回
                  </Button>
                )}
                {state?.isWrongQuestionPractice && (state?.customQuestions?.length ?? 0) > 1 && (
                  <Button variant="secondary" onClick={handlePlayAgain} fullWidth>
                    🔄 再练一遍
                  </Button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {isPaused && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-40">
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            className="text-center"
          >
            <div className="text-8xl mb-4">⏸️</div>
            <h3 className="text-4xl font-display font-bold text-white mb-4">游戏暂停</h3>
            <Button variant="success" onClick={resumeGame} size="lg">
              ▶️ 继续游戏
            </Button>
          </motion.div>
        </div>
      )}

      <AnimatePresence>
        {showLimitWarning && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.5, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.5, y: 50 }}
              className="bg-white rounded-3xl p-8 max-w-md w-full text-center border-4 border-error-200 shadow-2xl"
            >
              <div className="text-7xl mb-4">⏰</div>
              <h2 className="text-3xl font-display font-bold text-error-600 mb-4">
                今日游戏时间已用完
              </h2>
              <p className="text-lg text-gray-600 mb-2">
                今日已游戏 <span className="font-bold text-error-600">{dailyLimitInfo?.used || 0}</span> 分钟
              </p>
              <p className="text-lg text-gray-600 mb-6">
                每日限制 <span className="font-bold text-primary-600">{(dailyLimitInfo?.used || 0) + (dailyLimitInfo?.remaining || 0)}</span> 分钟
              </p>
              <p className="text-gray-500 mb-6">
                休息一下眼睛，明天再来挑战吧！👀
              </p>
              <Button variant="primary" onClick={handleBack} fullWidth size="lg">
                返回主页
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default GamePage;
