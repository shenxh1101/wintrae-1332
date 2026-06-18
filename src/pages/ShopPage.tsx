import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { usePlayerStore } from '@/store/usePlayerStore';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import type { ShopItem } from '@/types';

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

const ShopPage: React.FC = () => {
  const navigate = useNavigate();
  const { playerData, shopItems, loadAllData, purchaseItem, setCurrentOutfit } = usePlayerStore();
  const [activeTab, setActiveTab] = useState<'items' | 'outfits'>('items');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  const handlePurchase = async (item: ShopItem) => {
    if (playerData.coins < item.price) {
      setMessage({ type: 'error', text: '金币不足！继续努力赚取金币吧~' });
      setTimeout(() => setMessage(null), 2000);
      return;
    }

    if (item.type === 'outfit' && playerData.unlockedOutfits.includes(item.id)) {
      await setCurrentOutfit(item.id);
      setMessage({ type: 'success', text: `已换装为「${item.name}」！` });
      setTimeout(() => setMessage(null), 2000);
      return;
    }

    const success = await purchaseItem(item.id);
    if (success) {
      setMessage({ type: 'success', text: `成功购买「${item.name}」！` });
      setTimeout(() => setMessage(null), 2000);
    }
  };

  const items = shopItems.filter(item => item.type === 'powerup' || item.category === 'prop');
  const outfits = shopItems.filter(item => item.type === 'outfit' || item.category === 'outfit');
  const currentOutfitEmoji = OUTFIT_EMOJIS[playerData.currentOutfit] || '🧒';

  return (
    <div className="min-h-screen bg-gradient-to-br from-reward-100 via-accent-50 to-primary-100 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <Button variant="ghost" onClick={() => navigate('/')} size="sm">
            ← 返回
          </Button>
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-display font-bold text-reward-700">
              🛒 奖励商店
            </h1>
            <p className="text-gray-600 mt-1">用金币兑换道具和装扮</p>
          </div>
          <div className="bg-gradient-to-r from-accent-400 to-accent-500 text-white px-4 py-2 rounded-full shadow-md flex items-center gap-2">
            <span className="text-2xl">💰</span>
            <span className="font-display font-bold text-xl">{playerData.coins}</span>
          </div>
        </div>

        <Card className="mb-6 overflow-hidden">
          <div className="p-6 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <motion.div
                animate={{ y: [0, -10, 0], rotate: [0, 5, -5, 0] }}
                transition={{ repeat: Infinity, repeatType: 'reverse', duration: 2 }}
                className="text-7xl"
              >
                {currentOutfitEmoji}
              </motion.div>
              <div>
                <h3 className="text-2xl font-display font-bold text-reward-700">
                  当前装扮
                </h3>
                <p className="text-gray-600">
                  {outfits.find(o => o.id === playerData.currentOutfit)?.name || '小达人'}
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="bg-reward-100 px-5 py-3 rounded-2xl text-center">
                <div className="text-3xl">🎒</div>
                <div className="font-display font-bold text-reward-600">
                  {Object.values(playerData.inventory).reduce((a, b) => a + b, 0)}
                </div>
                <div className="text-xs text-gray-500">道具</div>
              </div>
              <div className="bg-primary-100 px-5 py-3 rounded-2xl text-center">
                <div className="text-3xl">👕</div>
                <div className="font-display font-bold text-primary-600">
                  {playerData.unlockedOutfits.length}
                </div>
                <div className="text-xs text-gray-500">装扮</div>
              </div>
            </div>
          </div>
        </Card>

        <div className="flex gap-2 mb-6 justify-center">
          <button
            onClick={() => setActiveTab('items')}
            className={`px-8 py-3 rounded-full font-display font-bold text-lg transition-all ${
              activeTab === 'items'
                ? 'bg-reward-500 text-white shadow-lg'
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            🎁 道具
          </button>
          <button
            onClick={() => setActiveTab('outfits')}
            className={`px-8 py-3 rounded-full font-display font-bold text-lg transition-all ${
              activeTab === 'outfits'
                ? 'bg-reward-500 text-white shadow-lg'
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            👕 装扮
          </button>
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'items' ? (
            <motion.div
              key="items"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {items.map((item, index) => {
                const owned = playerData.inventory[item.id] || 0;
                const canAfford = playerData.coins >= item.price;

                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1, type: 'spring' }}
                  >
                    <Card hoverable className="h-full overflow-hidden">
                      <div className="bg-gradient-to-br from-accent-100 to-accent-200 p-6 text-center">
                        <div className="text-7xl mb-2">{item.icon}</div>
                        {owned > 0 && (
                          <div className="inline-block bg-accent-500 text-white px-3 py-1 rounded-full text-sm font-display font-bold">
                            已拥有 {owned} 个
                          </div>
                        )}
                      </div>
                      <div className="p-6">
                        <h4 className="text-2xl font-display font-bold text-gray-800 mb-2">
                          {item.name}
                        </h4>
                        <p className="text-gray-600 mb-4">{item.description}</p>
                        <Button
                          variant={canAfford ? 'secondary' : 'ghost'}
                          fullWidth
                          onClick={() => handlePurchase(item)}
                          disabled={!canAfford}
                          icon={<span className="text-xl">💰</span>}
                        >
                          {item.price} 金币
                        </Button>
                      </div>
                    </Card>
                  </motion.div>
                );
              })}
            </motion.div>
          ) : (
            <motion.div
              key="outfits"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
            >
              {outfits.map((item, index) => {
                const isUnlocked = playerData.unlockedOutfits.includes(item.id);
                const isCurrent = playerData.currentOutfit === item.id;
                const canAfford = playerData.coins >= item.price;
                const emoji = OUTFIT_EMOJIS[item.id] || '🧒';

                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1, type: 'spring' }}
                  >
                    <Card
                      hoverable
                      onClick={() => handlePurchase(item)}
                      className={`h-full overflow-hidden text-center ${
                        isCurrent ? 'ring-4 ring-reward-400' : ''
                      }`}
                    >
                      <div className={`p-6 ${
                        isCurrent
                          ? 'bg-gradient-to-br from-reward-400 to-reward-500 text-white'
                          : isUnlocked
                          ? 'bg-gradient-to-br from-primary-100 to-primary-200'
                          : 'bg-gradient-to-br from-gray-100 to-gray-200'
                      }`}>
                        <div className="text-7xl mb-2">{emoji}</div>
                        {isCurrent && (
                          <div className="inline-block bg-white text-reward-500 px-3 py-1 rounded-full text-sm font-display font-bold">
                            ✨ 使用中
                          </div>
                        )}
                        {isUnlocked && !isCurrent && (
                          <div className="inline-block bg-primary-500 text-white px-3 py-1 rounded-full text-sm font-display font-bold">
                            点击换装
                          </div>
                        )}
                      </div>
                      <div className="p-4">
                        <h4 className="text-xl font-display font-bold text-gray-800 mb-2">
                          {item.name}
                        </h4>
                        {!isUnlocked && (
                          <Button
                            variant={canAfford ? 'reward' : 'ghost'}
                            fullWidth
                            size="sm"
                            onClick={(e) => { e.stopPropagation(); handlePurchase(item); }}
                            disabled={!canAfford}
                            icon={<span>💰</span>}
                          >
                            {item.price} 金币
                          </Button>
                        )}
                      </div>
                    </Card>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {message && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              className={`fixed bottom-8 left-1/2 transform -translate-x-1/2 px-8 py-4 rounded-full text-white font-display font-bold text-xl shadow-2xl z-50 ${
                message.type === 'success' ? 'bg-success-500' : 'bg-error-500'
              }`}
            >
              {message.text}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ShopPage;
