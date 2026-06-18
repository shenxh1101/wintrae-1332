import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

const TIME_OPTIONS = [
  { value: 60, label: '1分钟', emoji: '⚡', color: 'from-red-400 to-red-600' },
  { value: 120, label: '2分钟', emoji: '🔥', color: 'from-orange-400 to-orange-600' },
  { value: 180, label: '3分钟', emoji: '🌟', color: 'from-yellow-400 to-yellow-600' },
  { value: 300, label: '5分钟', emoji: '🏆', color: 'from-green-400 to-green-600' }
];

const ChallengePage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedTime, setSelectedTime] = useState(120);

  const handleStart = () => {
    navigate('/game', {
      state: {
        mode: 'challenge' as const,
        timeLimit: selectedTime
      }
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-accent-100 via-orange-50 to-red-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <Button variant="ghost" onClick={() => navigate('/')} size="sm">
            ← 返回
          </Button>
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-display font-bold text-accent-700">
              ⏱️ 限时挑战
            </h1>
            <p className="text-gray-600 mt-1">在限定时间内答题越多，得分越高！</p>
          </div>
          <div className="w-20" />
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring' }}
          className="text-center mb-8"
        >
          <Card className="bg-gradient-to-br from-accent-500 to-orange-500 text-white overflow-hidden">
            <div className="p-8">
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ repeat: Infinity, repeatType: 'loop', duration: 2 }}
                className="text-8xl mb-4"
              >
                ⏱️
              </motion.div>
              <h2 className="text-3xl font-display font-bold mb-2">准备好挑战了吗？</h2>
              <p className="opacity-90 text-lg">
                答对得分，答错不扣分，连击加成！
              </p>
            </div>
          </Card>
        </motion.div>

        <Card className="mb-6 overflow-hidden">
          <div className="bg-gradient-to-r from-orange-500 to-red-500 p-6 text-white">
            <h3 className="text-2xl font-display font-bold flex items-center gap-2">
              <span className="text-3xl">⏰</span>
              选择挑战时长
            </h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {TIME_OPTIONS.map((option, index) => (
                <motion.button
                  key={option.value}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1, type: 'spring' }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedTime(option.value)}
                  className={`
                    p-6 rounded-2xl border-4 transition-all text-center
                    ${selectedTime === option.value
                      ? `bg-gradient-to-br ${option.color} text-white border-white shadow-2xl scale-105`
                      : 'bg-white text-gray-700 border-gray-200 hover:border-orange-300 cursor-pointer'
                    }
                  `}
                >
                  <div className="text-5xl mb-3">{option.emoji}</div>
                  <div className="font-display font-bold text-2xl">{option.label}</div>
                </motion.button>
              ))}
            </div>
          </div>
        </Card>

        <Card className="mb-6 overflow-hidden">
          <div className="bg-gradient-to-r from-primary-500 to-primary-600 p-6 text-white">
            <h3 className="text-2xl font-display font-bold flex items-center gap-2">
              <span className="text-3xl">📖</span>
              挑战规则
            </h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3 p-4 bg-primary-50 rounded-2xl">
                <span className="text-3xl">✅</span>
                <div>
                  <h4 className="font-display font-bold text-primary-700">答对得分</h4>
                  <p className="text-sm text-gray-600">答对一题得10分，难度越高分数越多</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 bg-success-50 rounded-2xl">
                <span className="text-3xl">🔥</span>
                <div>
                  <h4 className="font-display font-bold text-success-700">连击加成</h4>
                  <p className="text-sm text-gray-600">连续答对获得额外分数加成，最高2倍</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 bg-accent-50 rounded-2xl">
                <span className="text-3xl">💰</span>
                <div>
                  <h4 className="font-display font-bold text-accent-700">金币奖励</h4>
                  <p className="text-sm text-gray-600">答对每题获得5金币，连击额外奖励</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 bg-reward-50 rounded-2xl">
                <span className="text-3xl">💡</span>
                <div>
                  <h4 className="font-display font-bold text-reward-700">道具可用</h4>
                  <p className="text-sm text-gray-600">可以使用提示卡和跳过卡，不扣分</p>
                </div>
              </div>
            </div>
          </div>
        </Card>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, type: 'spring' }}
        >
          <Button
            variant="secondary"
            size="xl"
            fullWidth
            onClick={handleStart}
            icon={<span className="text-3xl">🚀</span>}
          >
            开始{selectedTime / 60}分钟挑战！
          </Button>
        </motion.div>
      </div>
    </div>
  );
};

export default ChallengePage;
