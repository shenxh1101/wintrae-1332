import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { usePlayerStore } from '@/store/usePlayerStore';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import type { Level } from '@/types';

const LEVEL_EMOJIS = ['🌱', '🌿', '🌳', '🌸', '🌺', '🌻', '🍀', '🌈', '⭐', '🌟', '💫', '🏆'];

const MapPage: React.FC = () => {
  const navigate = useNavigate();
  const { levels, playerData, loadAllData, updateLevel, unlockNextLevel } = usePlayerStore();

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  const handleStartLevel = (level: Level) => {
    navigate('/game', { state: { mode: 'adventure' as const, level } });
  };

  const getDifficultyColor = (difficulty: number) => {
    if (difficulty <= 3) return 'from-green-400 to-green-600';
    if (difficulty <= 6) return 'from-yellow-400 to-yellow-600';
    return 'from-red-400 to-red-600';
  };

  const getDifficultyText = (difficulty: number) => {
    if (difficulty <= 3) return '简单';
    if (difficulty <= 6) return '中等';
    return '困难';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-100 via-green-50 to-accent-100 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <Button variant="ghost" onClick={() => navigate('/')} size="sm">
            ← 返回
          </Button>
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-display font-bold text-primary-700">
              🗺️ 闯关地图
            </h1>
            <p className="text-gray-600 mt-1">选择关卡开始冒险！</p>
          </div>
          <div className="bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-md flex items-center gap-2">
            <span className="text-2xl">💰</span>
            <span className="font-display font-bold text-accent-600 text-xl">
              {playerData.coins}
            </span>
          </div>
        </div>

        <div className="relative">
          <div className="absolute left-1/2 top-0 bottom-0 w-2 bg-gradient-to-b from-primary-300 via-accent-300 to-reward-300 transform -translate-x-1/2 rounded-full" />

          <div className="space-y-8">
            {levels.map((level, index) => {
              const isUnlocked = level.unlocked || level.levelId === 1;
              const isCompleted = level.completed;
              const isCurrent = playerData.currentLevel === level.levelId;
              const isLeft = index % 2 === 0;

              return (
                <motion.div
                  key={level.levelId}
                  initial={{ opacity: 0, x: isLeft ? -50 : 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1, type: 'spring' }}
                  className={`relative flex items-center ${isLeft ? 'justify-start' : 'justify-end'}`}
                >
                  <div className={`w-5/12 ${isLeft ? 'pr-8' : 'pl-8'}`}>
                    <Card
                      hoverable={isUnlocked}
                      onClick={() => isUnlocked && handleStartLevel(level)}
                      className={`relative overflow-hidden ${
                        !isUnlocked ? 'opacity-60 cursor-not-allowed' : ''
                      } ${isCurrent ? 'ring-4 ring-accent-400 ring-opacity-75' : ''}`}
                    >
                      <div className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="text-5xl">
                              {isUnlocked ? LEVEL_EMOJIS[index % LEVEL_EMOJIS.length] : '🔒'}
                            </div>
                            <div>
                              <h3 className="text-2xl font-display font-bold text-primary-700">
                                第{level.levelId}关
                              </h3>
                              <p className="text-lg text-gray-700 font-display">
                                {level.name}
                              </p>
                            </div>
                          </div>
                          {isCompleted && (
                            <div className="text-4xl animate-bounce">✅</div>
                          )}
                        </div>

                        <div className="flex flex-wrap gap-2 mb-4">
                          {level.questionTypes.map((type) => (
                            <span
                              key={type}
                              className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-display"
                            >
                              {type === 'addition' && '加法'}
                              {type === 'subtraction' && '减法'}
                              {type === 'multiplication' && '乘法'}
                              {type === 'division' && '除法'}
                              {type === 'comparison' && '比较'}
                              {type === 'pattern' && '找规律'}
                              {type === 'completion' && '补全'}
                            </span>
                          ))}
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className={`px-3 py-1 rounded-full text-white text-sm font-display bg-gradient-to-r ${getDifficultyColor(level.difficulty)}`}>
                              {getDifficultyText(level.difficulty)}
                            </span>
                            <span className="text-gray-500 text-sm">
                              {level.questionCount} 题
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-accent-600 font-display font-bold">
                            <span className="text-xl">💰</span>
                            <span>{level.coinReward}</span>
                          </div>
                        </div>

                        {isCurrent && (
                          <div className="absolute -top-2 -right-2 bg-accent-500 text-white px-3 py-1 rounded-full text-sm font-display font-bold animate-pulse">
                            当前关卡
                          </div>
                        )}

                        {level.bestScore !== undefined && level.bestScore > 0 && (
                          <div className="mt-3 pt-3 border-t border-gray-200">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-500">最高分</span>
                              <span className="font-display font-bold text-primary-600">
                                {level.bestScore}
                              </span>
                            </div>
                            <div className="flex items-center justify-between text-sm mt-1">
                              <span className="text-gray-500">最佳正确率</span>
                              <span className="font-display font-bold text-success-600">
                                {level.bestAccuracy ? Math.round(level.bestAccuracy * 100) : 0}%
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    </Card>
                  </div>

                  <div className="absolute left-1/2 transform -translate-x-1/2 z-10">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: index * 0.1 + 0.3, type: 'spring' }}
                      className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl font-display font-bold border-4 shadow-lg ${
                        isCompleted
                          ? 'bg-success-500 text-white border-success-300'
                          : isUnlocked
                          ? 'bg-primary-500 text-white border-primary-300'
                          : 'bg-gray-300 text-gray-500 border-gray-200'
                      }`}
                    >
                      {isCompleted ? '✓' : level.levelId}
                    </motion.div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapPage;
