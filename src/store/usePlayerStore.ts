import { create } from 'zustand';
import type { PlayerData, UserSettings, Level, ShopItem } from '@/types';
import storage from '@/utils/storage';
import { LEVELS } from '@/constants/levels';
import { SHOP_ITEMS } from '@/constants/shopItems';

interface PlayerStore {
  playerData: PlayerData;
  userSettings: UserSettings;
  levels: Level[];
  shopItems: ShopItem[];
  isLoading: boolean;
  error: string | null;
  isParentLoggedIn: boolean;

  loadAllData: () => Promise<void>;
  loadPlayerData: () => Promise<void>;
  loadUserSettings: () => Promise<void>;
  loadLevels: () => Promise<void>;
  loadShopItems: () => Promise<void>;
  
  addCoins: (amount: number) => Promise<boolean>;
  spendCoins: (amount: number) => Promise<boolean>;
  
  unlockOutfit: (outfitId: string) => Promise<boolean>;
  setCurrentOutfit: (outfitId: string) => Promise<boolean>;
  
  purchaseItem: (itemId: string) => Promise<boolean>;
  useItem: (itemId: string) => Promise<boolean>;
  
  updateUserSettings: (settings: Partial<UserSettings>) => Promise<boolean>;
  setParentPassword: (password: string) => Promise<boolean>;
  verifyParentPassword: (password: string) => Promise<boolean>;
  loginParent: (password: string) => Promise<boolean>;
  logoutParent: () => void;
  
  updateLevel: (levelId: number, updates: Partial<Level>) => Promise<boolean>;
  unlockNextLevel: (currentLevelId: number) => Promise<boolean>;
  
  resetAllData: () => Promise<boolean>;
  
  clearError: () => void;
}

export const usePlayerStore = create<PlayerStore>((set, get) => ({
  playerData: {
    coins: 0,
    currentLevel: 1,
    streakDays: 0,
    lastPlayDate: '',
    totalPlayTime: 0,
    currentOutfit: 'outfit_default',
    unlockedOutfits: ['outfit_default'],
    inventory: {}
  },
  userSettings: {
    parentPassword: '',
    dailyTimeLimit: 30,
    enabledQuestionTypes: ['addition', 'subtraction', 'multiplication', 'division', 'comparison', 'pattern', 'completion'],
    maxDifficulty: 10,
    soundEnabled: true,
    voiceEnabled: true,
    fontSize: 'normal'
  },
  levels: LEVELS,
  shopItems: SHOP_ITEMS,
  isLoading: false,
  error: null,
  isParentLoggedIn: false,

  loadAllData: async () => {
    set({ isLoading: true, error: null });
    try {
      await Promise.all([
        get().loadPlayerData(),
        get().loadUserSettings(),
        get().loadLevels(),
        get().loadShopItems()
      ]);
      set({ isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : '加载数据失败',
        isLoading: false
      });
    }
  },

  loadPlayerData: async () => {
    try {
      const data = await storage.getPlayerData();
      set({ playerData: data });
    } catch (error) {
      console.error('加载玩家数据失败:', error);
    }
  },

  loadUserSettings: async () => {
    try {
      const settings = await storage.getUserSettings();
      set({ userSettings: settings });
    } catch (error) {
      console.error('加载用户设置失败:', error);
    }
  },

  loadLevels: async () => {
    try {
      const levels = await storage.getLevels();
      set({ levels });
    } catch (error) {
      console.error('加载关卡数据失败:', error);
    }
  },

  loadShopItems: async () => {
    try {
      const items = await storage.getShopItems();
      set({ shopItems: items });
    } catch (error) {
      console.error('加载商店数据失败:', error);
    }
  },

  addCoins: async (amount) => {
    try {
      const newCoins = await storage.addCoins(amount);
      set(state => ({
        playerData: { ...state.playerData, coins: newCoins }
      }));
      return true;
    } catch (error) {
      set({ error: '添加金币失败' });
      return false;
    }
  },

  spendCoins: async (amount) => {
    try {
      const success = await storage.spendCoins(amount);
      if (success) {
        await get().loadPlayerData();
      }
      return success;
    } catch (error) {
      set({ error: '消费金币失败' });
      return false;
    }
  },

  unlockOutfit: async (outfitId) => {
    try {
      const success = await storage.unlockOutfit(outfitId);
      if (success) {
        await get().loadPlayerData();
      }
      return success;
    } catch (error) {
      set({ error: '解锁装扮失败' });
      return false;
    }
  },

  setCurrentOutfit: async (outfitId) => {
    try {
      const success = await storage.setCurrentOutfit(outfitId);
      if (success) {
        await get().loadPlayerData();
      }
      return success;
    } catch (error) {
      set({ error: '设置装扮失败' });
      return false;
    }
  },

  purchaseItem: async (itemId) => {
    try {
      const success = await storage.purchaseItem(itemId);
      if (success) {
        await Promise.all([
          get().loadPlayerData(),
          get().loadShopItems()
        ]);
      }
      return success;
    } catch (error) {
      set({ error: '购买商品失败' });
      return false;
    }
  },

  useItem: async (itemId) => {
    try {
      const success = await storage.useItemFromInventory(itemId);
      if (success) {
        await get().loadPlayerData();
      }
      return success;
    } catch (error) {
      set({ error: '使用道具失败' });
      return false;
    }
  },

  updateUserSettings: async (settings) => {
    try {
      const success = await storage.setUserSettings(settings);
      if (success) {
        await get().loadUserSettings();
      }
      return success;
    } catch (error) {
      set({ error: '更新设置失败' });
      return false;
    }
  },

  setParentPassword: async (password) => {
    try {
      const success = await storage.setParentPassword(password);
      if (success) {
        await get().loadUserSettings();
      }
      return success;
    } catch (error) {
      set({ error: '设置密码失败' });
      return false;
    }
  },

  verifyParentPassword: async (password) => {
    try {
      return await storage.verifyParentPassword(password);
    } catch (error) {
      return false;
    }
  },

  loginParent: async (password) => {
    const isValid = await get().verifyParentPassword(password);
    if (isValid) {
      set({ isParentLoggedIn: true });
      return true;
    }
    return false;
  },

  logoutParent: () => {
    set({ isParentLoggedIn: false });
  },

  updateLevel: async (levelId, updates) => {
    try {
      const success = await storage.updateLevel(levelId, updates);
      if (success) {
        await get().loadLevels();
      }
      return success;
    } catch (error) {
      set({ error: '更新关卡失败' });
      return false;
    }
  },

  unlockNextLevel: async (currentLevelId) => {
    try {
      const success = await storage.unlockNextLevel(currentLevelId);
      if (success) {
        await get().loadLevels();
      }
      return success;
    } catch (error) {
      set({ error: '解锁关卡失败' });
      return false;
    }
  },

  resetAllData: async () => {
    try {
      await storage.resetAllData();
      await get().loadAllData();
      return true;
    } catch (error) {
      set({ error: '重置数据失败' });
      return false;
    }
  },

  clearError: () => {
    set({ error: null });
  }
}));

export default usePlayerStore;
