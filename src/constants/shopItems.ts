import type { ShopItem } from '@/types';

export const SHOP_ITEMS: ShopItem[] = [
  {
    id: 'prop_hint_1',
    category: 'prop',
    type: 'powerup',
    name: '提示卡',
    description: '使用后可以看到题目的提示信息',
    price: 20,
    icon: '💡',
    effect: {
      type: 'hint',
      value: 1
    },
    purchased: false
  },
  {
    id: 'prop_hint_5',
    category: 'prop',
    type: 'powerup',
    name: '提示卡×5',
    description: '5张提示卡，更划算！',
    price: 80,
    icon: '💡',
    effect: {
      type: 'hint',
      value: 5
    },
    purchased: false
  },
  {
    id: 'prop_skip_1',
    category: 'prop',
    type: 'powerup',
    name: '跳过卡',
    description: '使用后可以跳过当前题目，不扣分',
    price: 30,
    icon: '⏭️',
    effect: {
      type: 'skip',
      value: 1
    },
    purchased: false
  },
  {
    id: 'prop_skip_5',
    category: 'prop',
    type: 'powerup',
    name: '跳过卡×5',
    description: '5张跳过卡，超值优惠！',
    price: 120,
    icon: '⏭️',
    effect: {
      type: 'skip',
      value: 5
    },
    purchased: false
  },
  {
    id: 'prop_double_coin',
    category: 'prop',
    type: 'powerup',
    name: '双倍金币',
    description: '下一局游戏获得的金币翻倍',
    price: 50,
    icon: '💰',
    effect: {
      type: 'double_coin',
      value: 1
    },
    purchased: false
  },
  {
    id: 'prop_time_extend',
    category: 'prop',
    type: 'powerup',
    name: '时间延长',
    description: '下一局游戏时间延长30秒',
    price: 40,
    icon: '⏰',
    effect: {
      type: 'time_extend',
      value: 30
    },
    purchased: false
  },
  {
    id: 'outfit_default',
    category: 'outfit',
    type: 'outfit',
    name: '小达人',
    description: '默认装扮，清新可爱',
    price: 0,
    icon: '👦',
    outfitData: {
      avatar: '👦',
      color: '#4A90D9'
    },
    purchased: true
  },
  {
    id: 'outfit_princess',
    category: 'outfit',
    type: 'outfit',
    name: '小公主',
    description: '优雅的公主装扮',
    price: 200,
    icon: '👸',
    outfitData: {
      avatar: '👸',
      color: '#FF69B4',
      accessories: ['👑']
    },
    purchased: false
  },
  {
    id: 'outfit_prince',
    category: 'outfit',
    type: 'outfit',
    name: '小王子',
    description: '帅气的王子装扮',
    price: 200,
    icon: '🤴',
    outfitData: {
      avatar: '🤴',
      color: '#9C27B0',
      accessories: ['👑']
    },
    purchased: false
  },
  {
    id: 'outfit_astronaut',
    category: 'outfit',
    type: 'outfit',
    name: '宇航员',
    description: '探索宇宙的宇航员',
    price: 300,
    icon: '🧑‍🚀',
    outfitData: {
      avatar: '🧑‍🚀',
      color: '#607D8B',
      accessories: ['🚀']
    },
    purchased: false
  },
  {
    id: 'outfit_wizard',
    category: 'outfit',
    type: 'outfit',
    name: '魔法师',
    description: '拥有神奇力量的魔法师',
    price: 350,
    icon: '🧙',
    outfitData: {
      avatar: '🧙',
      color: '#7C4DFF',
      accessories: ['🎩', '✨']
    },
    purchased: false
  },
  {
    id: 'outfit_ninja',
    category: 'outfit',
    type: 'outfit',
    name: '忍者',
    description: '神秘的忍者装扮',
    price: 400,
    icon: '🥷',
    outfitData: {
      avatar: '🥷',
      color: '#37474F',
      accessories: ['⚔️']
    },
    purchased: false
  },
  {
    id: 'outfit_robot',
    category: 'outfit',
    type: 'outfit',
    name: '机器人',
    description: '酷酷的机器人装扮',
    price: 500,
    icon: '🤖',
    outfitData: {
      avatar: '🤖',
      color: '#607D8B',
      accessories: ['🔧']
    },
    purchased: false
  },
  {
    id: 'outfit_unicorn',
    category: 'outfit',
    type: 'outfit',
    name: '独角兽',
    description: '梦幻般的独角兽装扮',
    price: 600,
    icon: '🦄',
    outfitData: {
      avatar: '🦄',
      color: '#E91E63',
      accessories: ['🌈', '⭐']
    },
    purchased: false
  }
];

export const getShopItemById = (itemId: string): ShopItem | undefined => {
  return SHOP_ITEMS.find(item => item.id === itemId);
};

export const getProps = (): ShopItem[] => {
  return SHOP_ITEMS.filter(item => item.category === 'prop');
};

export const getOutfits = (): ShopItem[] => {
  return SHOP_ITEMS.filter(item => item.category === 'outfit');
};
