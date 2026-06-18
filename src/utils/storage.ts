import type { PlayerData, UserSettings, Level, ShopItem } from '@/types';
import { LEVELS } from '@/constants/levels';
import { SHOP_ITEMS } from '@/constants/shopItems';

const STORAGE_KEYS = {
  PLAYER_DATA: 'playerData',
  USER_SETTINGS: 'userSettings',
  LEVELS: 'levels',
  SHOP_ITEMS: 'shopItems',
  TODAY_PLAY_TIME: 'todayPlayTime'
} as const;

const isElectron = typeof window !== 'undefined' && window.isElectron;

const electronStore = {
  get: async (key: string): Promise<any> => {
    if (isElectron && window.electronAPI) {
      return window.electronAPI.store.get(key);
    }
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : null;
  },
  set: async (key: string, value: any): Promise<boolean> => {
    if (isElectron && window.electronAPI) {
      return window.electronAPI.store.set(key, value);
    }
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  },
  delete: async (key: string): Promise<boolean> => {
    if (isElectron && window.electronAPI) {
      return window.electronAPI.store.delete(key);
    }
    localStorage.removeItem(key);
    return true;
  },
  clear: async (): Promise<boolean> => {
    if (isElectron && window.electronAPI) {
      return window.electronAPI.store.clear();
    }
    localStorage.clear();
    return true;
  }
};

export const storage = {
  async getPlayerData(): Promise<PlayerData> {
    const data = await electronStore.get(STORAGE_KEYS.PLAYER_DATA);
    if (data) return data;
    
    const defaultData: PlayerData = {
      coins: 100,
      currentLevel: 1,
      streakDays: 0,
      lastPlayDate: '',
      totalPlayTime: 0,
      currentOutfit: 'outfit_default',
      unlockedOutfits: ['outfit_default'],
      inventory: {
        'prop_hint_1': 3,
        'prop_skip_1': 1
      }
    };
    
    await electronStore.set(STORAGE_KEYS.PLAYER_DATA, defaultData);
    return defaultData;
  },

  async setPlayerData(data: Partial<PlayerData>): Promise<boolean> {
    const current = await this.getPlayerData();
    const updated = { ...current, ...data };
    return electronStore.set(STORAGE_KEYS.PLAYER_DATA, updated);
  },

  async addCoins(amount: number): Promise<number> {
    const playerData = await this.getPlayerData();
    const newCoins = playerData.coins + amount;
    await this.setPlayerData({ coins: newCoins });
    return newCoins;
  },

  async spendCoins(amount: number): Promise<boolean> {
    const playerData = await this.getPlayerData();
    if (playerData.coins < amount) return false;
    
    const newCoins = playerData.coins - amount;
    await this.setPlayerData({ coins: newCoins });
    return true;
  },

  async addItemToInventory(itemId: string, quantity: number = 1): Promise<boolean> {
    const playerData = await this.getPlayerData();
    const currentQuantity = playerData.inventory[itemId] || 0;
    
    const updatedInventory = {
      ...playerData.inventory,
      [itemId]: currentQuantity + quantity
    };
    
    await this.setPlayerData({ inventory: updatedInventory });
    return true;
  },

  async useItemFromInventory(itemId: string): Promise<boolean> {
    const playerData = await this.getPlayerData();
    const currentQuantity = playerData.inventory[itemId] || 0;
    
    if (currentQuantity <= 0) return false;
    
    const updatedInventory = {
      ...playerData.inventory,
      [itemId]: currentQuantity - 1
    };
    
    await this.setPlayerData({ inventory: updatedInventory });
    return true;
  },

  async unlockOutfit(outfitId: string): Promise<boolean> {
    const playerData = await this.getPlayerData();
    if (playerData.unlockedOutfits.includes(outfitId)) return false;
    
    const updatedOutfits = [...playerData.unlockedOutfits, outfitId];
    await this.setPlayerData({ unlockedOutfits: updatedOutfits });
    return true;
  },

  async setCurrentOutfit(outfitId: string): Promise<boolean> {
    const playerData = await this.getPlayerData();
    if (!playerData.unlockedOutfits.includes(outfitId)) return false;
    
    await this.setPlayerData({ currentOutfit: outfitId });
    return true;
  },

  async getUserSettings(): Promise<UserSettings> {
    const data = await electronStore.get(STORAGE_KEYS.USER_SETTINGS);
    if (data) return data;
    
    const defaultSettings: UserSettings = {
      parentPassword: '',
      dailyTimeLimit: 30,
      enabledQuestionTypes: ['addition', 'subtraction', 'multiplication', 'division', 'comparison', 'pattern', 'completion'],
      maxDifficulty: 10,
      soundEnabled: true,
      voiceEnabled: true,
      fontSize: 'normal'
    };
    
    await electronStore.set(STORAGE_KEYS.USER_SETTINGS, defaultSettings);
    return defaultSettings;
  },

  async setUserSettings(settings: Partial<UserSettings>): Promise<boolean> {
    const current = await this.getUserSettings();
    const updated = { ...current, ...settings };
    return electronStore.set(STORAGE_KEYS.USER_SETTINGS, updated);
  },

  async setParentPassword(password: string): Promise<boolean> {
    return this.setUserSettings({ parentPassword: password });
  },

  async verifyParentPassword(password: string): Promise<boolean> {
    const settings = await this.getUserSettings();
    if (!settings.parentPassword) return password === '';
    return settings.parentPassword === password;
  },

  async getLevels(): Promise<Level[]> {
    const data = await electronStore.get(STORAGE_KEYS.LEVELS);
    if (data) return data;
    
    await electronStore.set(STORAGE_KEYS.LEVELS, LEVELS);
    return LEVELS;
  },

  async setLevels(levels: Level[]): Promise<boolean> {
    return electronStore.set(STORAGE_KEYS.LEVELS, levels);
  },

  async updateLevel(levelId: number, updates: Partial<Level>): Promise<boolean> {
    const levels = await this.getLevels();
    const index = levels.findIndex(l => l.levelId === levelId);
    if (index === -1) return false;
    
    levels[index] = { ...levels[index], ...updates };
    return this.setLevels(levels);
  },

  async unlockNextLevel(currentLevelId: number): Promise<boolean> {
    const levels = await this.getLevels();
    const nextLevel = levels.find(l => l.levelId === currentLevelId + 1);
    if (!nextLevel) return false;
    
    return this.updateLevel(nextLevel.levelId, { unlocked: true });
  },

  async getShopItems(): Promise<ShopItem[]> {
    const data = await electronStore.get(STORAGE_KEYS.SHOP_ITEMS);
    if (data) return data;
    
    await electronStore.set(STORAGE_KEYS.SHOP_ITEMS, SHOP_ITEMS);
    return SHOP_ITEMS;
  },

  async setShopItems(items: ShopItem[]): Promise<boolean> {
    return electronStore.set(STORAGE_KEYS.SHOP_ITEMS, items);
  },

  async purchaseItem(itemId: string): Promise<boolean> {
    const items = await this.getShopItems();
    const item = items.find(i => i.id === itemId);
    if (!item || item.purchased) return false;
    
    const success = await this.spendCoins(item.price);
    if (!success) return false;
    
    if (item.category === 'prop' && item.effect) {
      let inventoryKey = itemId;
      if (item.effect.type === 'hint') {
        inventoryKey = 'prop_hint_1';
      } else if (item.effect.type === 'skip') {
        inventoryKey = 'prop_skip_1';
      } else if (item.effect.type === 'double_coin') {
        inventoryKey = 'prop_double_coin';
      } else if (item.effect.type === 'time_extend') {
        inventoryKey = 'prop_time_extend';
      }
      await this.addItemToInventory(inventoryKey, item.effect.value);
    } else if (item.category === 'outfit') {
      await this.unlockOutfit(itemId);
      const updatedItems = items.map(i => 
        i.id === itemId ? { ...i, purchased: true } : i
      );
      await this.setShopItems(updatedItems);
    }
    
    return true;
  },

  async getTodayPlayTime(): Promise<number> {
    const key = `${STORAGE_KEYS.TODAY_PLAY_TIME}_${new Date().toISOString().split('T')[0]}`;
    const data = await electronStore.get(key);
    return data || 0;
  },

  async addTodayPlayTime(minutes: number): Promise<number> {
    const key = `${STORAGE_KEYS.TODAY_PLAY_TIME}_${new Date().toISOString().split('T')[0]}`;
    const current = await this.getTodayPlayTime();
    const updated = current + minutes;
    await electronStore.set(key, updated);
    
    const playerData = await this.getPlayerData();
    await this.setPlayerData({
      totalPlayTime: playerData.totalPlayTime + minutes
    });
    
    return updated;
  },

  async checkDailyLimit(): Promise<{ canPlay: boolean; remaining: number; used: number }> {
    const settings = await this.getUserSettings();
    const used = await this.getTodayPlayTime();
    const remaining = Math.max(0, settings.dailyTimeLimit - used);
    
    return {
      canPlay: remaining > 0,
      remaining,
      used
    };
  },

  async resetAllData(): Promise<boolean> {
    await electronStore.clear();
    return true;
  }
};

export default storage;
