import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { usePlayerStore } from '@/store/usePlayerStore';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

const OUTFIT_EMOJIS: Record<string, string> = {
  'outfit_default': '🧒',
  'outfit_princess': '👸',
  'outfit_prince': '🤴',
  'outfit_astronaut': '👨‍🚀',
  'outfit_wizard': '🧙',
  'outfit_ninja': '🥷',
  'outfit_robot': '🤖',
  'outfit_unicorn': '🦄'
};

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { playerData, loadAllData } = usePlayerStore();

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  const outfitEmoji = OUTFIT_EMOJIS[playerData.currentOutfit] || '🧒';

  const menuItems = [
    {
      title: '闯关地图',
      description: '按关卡学习，循序渐进',
      emoji: '🗺️',
      gradient: 'from-primary-400 to-primary-600',
      path: '/map'
    },
    {
      title: '练习模式',
      description: '自由练习，查漏补缺',
      emoji: '📚',
      gradient: 'from-success-400 to-success-600',
      path: '/practice'
    },
    {
      title: '限时挑战',
      description: '速度比拼，突破自我',
      emoji: '⏱️',
      gradient: 'from-accent-400 to-accent-600',
      path: '/challenge'
    },
    {
      title: '奖励商店',
      description: '金币兑换，装扮角色',
      emoji: '🛒',
      gradient: 'from-reward-400 to-reward-600',
      path: '/shop'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-100 via-accent-50 to-reward-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <motion.div
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: 'spring', duration: 0.8 }}
          >
            <h1 className="text-5xl md:text-7xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary-600 via-accent-500 to-reward-500 mb-4">
              算术小达人
            </h1>
            <p className="text-xl text-gray-600 font-display">快乐学习，轻松掌握算术！</p>
          </motion.div>
        </div>

        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.3, type: 'spring' }}
          className="mb-8"
        >
          <Card className="bg-gradient-to-br from-white to-primary-50 border-4 border-primary-200 overflow-hidden">
            <div className="p-6 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ repeat: Infinity, repeatType: 'reverse', duration: 2 }}
                  className="text-7xl"
                >
                  {outfitEmoji}
                </motion.div>
                <div>
                  <h2 className="text-2xl font-display font-bold text-primary-700">
                    欢迎回来，小达人！
                  </h2>
                  <p className="text-gray-600">
                    连续学习 {playerData.streakDays} 天，继续加油！
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="bg-gradient-to-br from-accent-100 to-accent-200 px-6 py-3 rounded-2xl text-center border-2 border-accent-300">
                  <div className="text-3xl">💰</div>
                  <div className="text-2xl font-display font-bold text-accent-600">
                    {playerData.coins}
                  </div>
                  <div className="text-xs text-gray-500">金币</div>
                </div>
                <div className="bg-gradient-to-br from-primary-100 to-primary-200 px-6 py-3 rounded-2xl text-center border-2 border-primary-300">
                  <div className="text-3xl">🎯</div>
                  <div className="text-2xl font-display font-bold text-primary-600">
                    {playerData.currentLevel}
                  </div>
                  <div className="text-xs text-gray-500">当前关卡</div>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {menuItems.map((item, index) => (
            <motion.div
              key={item.path}
              initial={{ x: index % 2 === 0 ? -50 : 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.5 + index * 0.1, type: 'spring' }}
            >
              <Card
                hoverable
                onClick={() => navigate(item.path)}
                className="overflow-hidden h-full"
              >
                <div className={`bg-gradient-to-r ${item.gradient} p-6 text-white`}>
                  <div className="text-6xl mb-4">{item.emoji}</div>
                  <h3 className="text-3xl font-display font-bold mb-2">{item.title}</h3>
                  <p className="opacity-90">{item.description}</p>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.9, type: 'spring' }}
          className="text-center"
        >
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/parent-login')}
            className="text-gray-500 hover:text-gray-700"
          >
            👨‍👩‍👧 家长中心
          </Button>
        </motion.div>

        <div className="fixed top-10 left-10 text-6xl opacity-20 animate-float pointer-events-none">
          ⭐
        </div>
        <div className="fixed top-20 right-20 text-5xl opacity-20 animate-float pointer-events-none" style={{ animationDelay: '0.5s' }}>
          🌟
        </div>
        <div className="fixed bottom-20 left-20 text-4xl opacity-20 animate-float pointer-events-none" style={{ animationDelay: '1s' }}>
          ✨
        </div>
        <div className="fixed bottom-10 right-10 text-6xl opacity-20 animate-float pointer-events-none" style={{ animationDelay: '1.5s' }}>
          💫
        </div>
      </div>
    </div>
  );
};

export default HomePage;
