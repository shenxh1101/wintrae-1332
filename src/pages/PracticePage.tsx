import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { usePlayerStore } from '@/store/usePlayerStore';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import type { QuestionType, DifficultyLevel } from '@/types';

const QUESTION_TYPE_OPTIONS: { value: QuestionType; label: string; emoji: string }[] = [
  { value: 'addition', label: '加法', emoji: '➕' },
  { value: 'subtraction', label: '减法', emoji: '➖' },
  { value: 'multiplication', label: '乘法', emoji: '✖️' },
  { value: 'division', label: '除法', emoji: '➗' },
  { value: 'comparison', label: '大小比较', emoji: '⚖️' },
  { value: 'pattern', label: '找规律', emoji: '🔍' },
  { value: 'completion', label: '补全算式', emoji: '🧩' }
];

const DIFFICULTY_OPTIONS: { value: DifficultyLevel; label: string; color: string }[] = [
  { value: 1, label: '入门', color: 'from-green-400 to-green-600' },
  { value: 3, label: '简单', color: 'from-green-500 to-green-700' },
  { value: 5, label: '中等', color: 'from-yellow-400 to-yellow-600' },
  { value: 7, label: '困难', color: 'from-orange-400 to-orange-600' },
  { value: 10, label: '挑战', color: 'from-red-400 to-red-600' }
];

const PracticePage: React.FC = () => {
  const navigate = useNavigate();
  const { userSettings, loadUserSettings } = usePlayerStore();
  const [selectedTypes, setSelectedTypes] = useState<QuestionType[]>([]);
  const [selectedDifficulty, setSelectedDifficulty] = useState<DifficultyLevel>(3);
  const [questionCount, setQuestionCount] = useState(10);
  const [enableAdaptive, setEnableAdaptive] = useState(true);

  useEffect(() => {
    loadUserSettings();
  }, [loadUserSettings]);

  useEffect(() => {
    if (userSettings?.enabledQuestionTypes?.length) {
      setSelectedTypes(userSettings.enabledQuestionTypes);
    }
  }, [userSettings]);

  const toggleType = (type: QuestionType) => {
    setSelectedTypes(prev =>
      prev.includes(type)
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
  };

  const handleStart = () => {
    if (selectedTypes.length === 0) {
      alert('请至少选择一种题型！');
      return;
    }
    navigate('/game', {
      state: {
        mode: 'practice' as const,
        questionTypes: selectedTypes,
        difficulty: selectedDifficulty,
        questionCount: questionCount,
        enableAdaptive: enableAdaptive
      }
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-success-100 via-primary-50 to-accent-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <Button variant="ghost" onClick={() => navigate('/')} size="sm">
            ← 返回
          </Button>
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-display font-bold text-success-700">
              📚 练习模式
            </h1>
            <p className="text-gray-600 mt-1">自由选择，轻松练习</p>
          </div>
          <div className="w-20" />
        </div>

        <Card className="mb-6 overflow-hidden">
          <div className="bg-gradient-to-r from-success-500 to-success-600 p-6 text-white">
            <h3 className="text-2xl font-display font-bold flex items-center gap-2">
              <span className="text-3xl">🎯</span>
              选择题型
            </h3>
            <p className="opacity-90 mt-1">选择你想练习的题型（可多选）</p>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {QUESTION_TYPE_OPTIONS.map((option, index) => {
                const isEnabled = userSettings?.enabledQuestionTypes?.includes(option.value);
                const isSelected = selectedTypes.includes(option.value);
                const isDisabled = !isEnabled;

                return (
                  <motion.button
                    key={option.value}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05, type: 'spring' }}
                    whileHover={!isDisabled ? { scale: 1.05 } : {}}
                    whileTap={!isDisabled ? { scale: 0.95 } : {}}
                    onClick={() => !isDisabled && toggleType(option.value)}
                    disabled={isDisabled}
                    className={`
                      p-4 rounded-2xl border-4 transition-all text-center
                      ${isDisabled
                        ? 'bg-gray-100 border-gray-200 opacity-50 cursor-not-allowed'
                        : isSelected
                        ? 'bg-success-500 text-white border-success-300 shadow-lg scale-105'
                        : 'bg-white text-gray-700 border-gray-200 hover:border-success-400 hover:bg-success-50 cursor-pointer'
                      }
                    `}
                  >
                    <div className="text-4xl mb-2">{option.emoji}</div>
                    <div className="font-display font-bold">{option.label}</div>
                  </motion.button>
                );
              })}
            </div>
            {selectedTypes.length === 0 && (
              <p className="text-error-500 text-center mt-4 font-display">
                ⚠️ 请至少选择一种题型
              </p>
            )}
          </div>
        </Card>

        <Card className="mb-6 overflow-hidden">
          <div className="bg-gradient-to-r from-primary-500 to-primary-600 p-6 text-white">
            <h3 className="text-2xl font-display font-bold flex items-center gap-2">
              <span className="text-3xl">📊</span>
              难度设置
            </h3>
            <p className="opacity-90 mt-1">选择合适的难度开始练习</p>
          </div>
          <div className="p-6">
            <div className="flex flex-wrap gap-4 mb-6">
              {DIFFICULTY_OPTIONS.map((option, index) => (
                <motion.button
                  key={option.value}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1, type: 'spring' }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedDifficulty(option.value)}
                  className={`
                    px-6 py-3 rounded-xl font-display font-bold text-lg transition-all
                    ${selectedDifficulty === option.value
                      ? `bg-gradient-to-r ${option.color} text-white shadow-lg scale-110`
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }
                  `}
                >
                  {option.label} Lv.{option.value}
                </motion.button>
              ))}
            </div>

            <div className="flex items-center justify-between p-4 bg-primary-50 rounded-2xl">
              <div>
                <h4 className="font-display font-bold text-primary-700 text-lg">
                  🎯 难度自适应
                </h4>
                <p className="text-sm text-gray-600">
                  根据你的答题情况自动调整难度
                </p>
              </div>
              <button
                onClick={() => setEnableAdaptive(!enableAdaptive)}
                className={`
                  w-16 h-8 rounded-full transition-all duration-300 relative
                  ${enableAdaptive ? 'bg-success-500' : 'bg-gray-300'}
                `}
              >
                <div className={`
                  absolute top-1 w-6 h-6 bg-white rounded-full shadow-md transition-all duration-300
                  ${enableAdaptive ? 'left-9' : 'left-1'}
                `} />
              </button>
            </div>
          </div>
        </Card>

        <Card className="mb-6 overflow-hidden">
          <div className="bg-gradient-to-r from-accent-500 to-accent-600 p-6 text-white">
            <h3 className="text-2xl font-display font-bold flex items-center gap-2">
              <span className="text-3xl">📝</span>
              题目数量
            </h3>
          </div>
          <div className="p-6">
            <div className="flex items-center justify-center gap-6">
              <Button
                variant="secondary"
                size="lg"
                onClick={() => setQuestionCount(Math.max(5, questionCount - 5))}
              >
                -
              </Button>
              <div className="text-center min-w-[120px]">
                <div className="text-5xl font-display font-bold text-accent-600">
                  {questionCount}
                </div>
                <div className="text-gray-500">道题</div>
              </div>
              <Button
                variant="secondary"
                size="lg"
                onClick={() => setQuestionCount(Math.min(50, questionCount + 5))}
              >
                +
              </Button>
            </div>
            <div className="flex justify-center gap-4 mt-4">
              {[5, 10, 15, 20].map(num => (
                <button
                  key={num}
                  onClick={() => setQuestionCount(num)}
                  className={`
                    px-4 py-2 rounded-xl font-display font-bold transition-all
                    ${questionCount === num
                      ? 'bg-accent-500 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }
                  `}
                >
                  {num}题
                </button>
              ))}
            </div>
          </div>
        </Card>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, type: 'spring' }}
        >
          <Button
            variant="primary"
            size="xl"
            fullWidth
            onClick={handleStart}
            disabled={selectedTypes.length === 0}
            icon={<span className="text-3xl">🚀</span>}
          >
            开始练习！
          </Button>
        </motion.div>
      </div>
    </div>
  );
};

export default PracticePage;
