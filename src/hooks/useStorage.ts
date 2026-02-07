import { useState, useEffect, useCallback } from 'react';
import localforage from 'localforage';
import type { AppConfig, Bubble, RestaurantInfo } from '@/types/bubble';

const DEFAULT_CONFIG: AppConfig = {
  restaurant: {
    name: '',
    description: '',
    logo: undefined,
    centralContent: { type: 'text-image' },
    primaryColor: '#FFD700',
    socialLinks: {},
  },
  bubbles: [],
  isInitialized: false,
  lastUpdated: new Date().toISOString(),
};

export function useStorage() {
  const [config, setConfig] = useState<AppConfig>(DEFAULT_CONFIG);
  const [isLoading, setIsLoading] = useState(true);

  // Load config from localStorage on mount
  useEffect(() => {
    const loadConfig = async () => {
      try {
        const savedConfig = await localforage.getItem<AppConfig>('restohub_config');
        if (savedConfig) {
          setConfig(savedConfig);
        }
      } catch (error) {
        console.error('Error loading config:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadConfig();
  }, []);

  // Save config to localStorage whenever it changes
  const saveConfig = useCallback(async (newConfig: AppConfig) => {
    try {
      const configToSave = {
        ...newConfig,
        lastUpdated: new Date().toISOString(),
      };
      await localforage.setItem('restohub_config', configToSave);
      setConfig(configToSave);
      return true;
    } catch (error) {
      console.error('Error saving config:', error);
      return false;
    }
  }, []);

  const updateRestaurant = useCallback((restaurant: RestaurantInfo) => {
    const newConfig = { ...config, restaurant };
    return saveConfig(newConfig);
  }, [config, saveConfig]);

  const updateBubbles = useCallback((bubbles: Bubble[]) => {
    const newConfig = { ...config, bubbles };
    return saveConfig(newConfig);
  }, [config, saveConfig]);

  const addBubble = useCallback((bubble: Bubble) => {
    const newBubbles = [...config.bubbles, bubble];
    return updateBubbles(newBubbles);
  }, [config.bubbles, updateBubbles]);

  const updateBubble = useCallback((bubbleId: string, updates: Partial<Bubble>) => {
    const newBubbles = config.bubbles.map(b => 
      b.id === bubbleId ? { ...b, ...updates } : b
    );
    return updateBubbles(newBubbles);
  }, [config.bubbles, updateBubbles]);

  const deleteBubble = useCallback((bubbleId: string) => {
    const newBubbles = config.bubbles.filter(b => b.id !== bubbleId);
    return updateBubbles(newBubbles);
  }, [config.bubbles, updateBubbles]);

  const reorderBubbles = useCallback((bubbleIds: string[]) => {
    const newBubbles = bubbleIds
      .map(id => config.bubbles.find(b => b.id === id))
      .filter((b): b is Bubble => b !== undefined)
      .map((b, index) => ({ ...b, order: index }));
    return updateBubbles(newBubbles);
  }, [config.bubbles, updateBubbles]);

  const initializeApp = useCallback(async (restaurant: RestaurantInfo) => {
    const newConfig: AppConfig = {
      restaurant,
      bubbles: [],
      isInitialized: true,
      lastUpdated: new Date().toISOString(),
    };
    return saveConfig(newConfig);
  }, [saveConfig]);

  const resetApp = useCallback(async () => {
    await localforage.removeItem('restohub_config');
    setConfig(DEFAULT_CONFIG);
    return true;
  }, []);

  const exportConfig = useCallback(() => {
    return JSON.stringify(config, null, 2);
  }, [config]);

  const importConfig = useCallback(async (jsonString: string) => {
    try {
      const importedConfig = JSON.parse(jsonString) as AppConfig;
      return saveConfig(importedConfig);
    } catch (error) {
      console.error('Error importing config:', error);
      return false;
    }
  }, [saveConfig]);

  return {
    config,
    isLoading,
    saveConfig,
    updateRestaurant,
    updateBubbles,
    addBubble,
    updateBubble,
    deleteBubble,
    reorderBubbles,
    initializeApp,
    resetApp,
    exportConfig,
    importConfig,
  };
}
