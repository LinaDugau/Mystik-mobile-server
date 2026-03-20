// Веб-совместимая обертка для AsyncStorage, использующая localStorage
// Работает как в веб, так и в мобильных версиях

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Проверяем, работаем ли мы в веб-окружении
const isWeb = Platform.OS === 'web';

// Веб-совместимая обертка для AsyncStorage
export const webStorage = {
  async getItem(key: string): Promise<string | null> {
    if (isWeb) {
      try {
        return localStorage.getItem(key);
      } catch (error) {
        console.error('Error getting item from localStorage:', error);
        return null;
      }
    } else {
      return await AsyncStorage.getItem(key);
    }
  },

  async setItem(key: string, value: string): Promise<void> {
    if (isWeb) {
      try {
        localStorage.setItem(key, value);
      } catch (error) {
        console.error('Error setting item in localStorage:', error);
      }
    } else {
      await AsyncStorage.setItem(key, value);
    }
  },

  async removeItem(key: string): Promise<void> {
    if (isWeb) {
      try {
        localStorage.removeItem(key);
      } catch (error) {
        console.error('Error removing item from localStorage:', error);
      }
    } else {
      await AsyncStorage.removeItem(key);
    }
  },

  async getAllKeys(): Promise<string[]> {
    if (isWeb) {
      try {
        return Object.keys(localStorage);
      } catch (error) {
        console.error('Error getting keys from localStorage:', error);
        return [];
      }
    } else {
      return await AsyncStorage.getAllKeys();
    }
  },

  async clear(): Promise<void> {
    if (isWeb) {
      try {
        localStorage.clear();
      } catch (error) {
        console.error('Error clearing localStorage:', error);
      }
    } else {
      await AsyncStorage.clear();
    }
  },
};
