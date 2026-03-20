import * as SQLite from "expo-sqlite";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";

const DB_NAME = "mystic.db";
const DEVICE_ID_KEY = "device_id";

// Простая функция для генерации UUID, совместимая с React Native
const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

export const useDatabase = () => {
  const [db, setDb] = useState<SQLite.SQLiteDatabase | null>(null);
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    let isMounted = true;
    
    async function initDb() {
      try {
        // Проверяем что база уже инициализирована
        if (isInitialized) {
          console.log("Database already initialized, skipping...");
          return;
        }
        
        console.log("Starting database initialization...");
        
        // Сначала получаем deviceId
        let storedDeviceId = await AsyncStorage.getItem(DEVICE_ID_KEY);
        if (!storedDeviceId) {
          storedDeviceId = generateUUID();
          await AsyncStorage.setItem(DEVICE_ID_KEY, storedDeviceId);
        }
        
        if (!isMounted) return;
        setDeviceId(storedDeviceId);
        console.log("Device ID ready:", storedDeviceId);
        
        // Затем инициализируем базу данных
        const database = await SQLite.openDatabaseAsync(DB_NAME);
        
        if (!isMounted) return;
        
        console.log("Database opened successfully");
        setDb(database);

        // Просто проверяем что база готова к использованию
        if (db && typeof db.runAsync === 'function') {
          console.log("Database is ready for operations");
          return;
        }
      } catch (error) {
        console.error("Error initializing database:", error);
        // Не устанавливаем состояние в случае ошибки
      }
    }
    
    initDb();
    
    return () => {
      isMounted = false;
    };
  }, [isInitialized]);

  const logTarotClick = async (spreadId: string) => {
    if (!isInitialized || !db || !deviceId) {
      console.log("Database not ready for tarot click logging");
      return;
    }
    try {
      await db.runAsync(`
        INSERT INTO tarot_clicks (spread_id, timestamp, device_id)
        VALUES (?, ?, ?)
      `, [spreadId, new Date().toISOString(), deviceId]);
    } catch (error) {
      console.error("Error logging tarot click:", error);
    }
  };

  const logHoroscopeClick = async (type: string) => {
    if (!isInitialized || !db || !deviceId) {
      console.log("Database not ready for horoscope click logging");
      return;
    }
    try {
      await db.runAsync(`
        INSERT INTO horoscope_clicks (type, timestamp, device_id)
        VALUES (?, ?, ?)
      `, [type, new Date().toISOString(), deviceId]);
    } catch (error) {
      console.error("Error logging horoscope click:", error);
    }
  };

  const logTestClick = async (testId: string) => {
    if (!isInitialized || !db || !deviceId) {
      console.log("Database not ready for test click logging");
      return;
    }
    try {
      await db.runAsync(`
        INSERT INTO test_clicks (test_id, timestamp, device_id)
        VALUES (?, ?, ?)
      `, [testId, new Date().toISOString(), deviceId]);
    } catch (error) {
      console.error("Error logging test click:", error);
    }
  };

  const logSubscription = async (amount: number) => {
    if (!isInitialized || !db || !deviceId) {
      console.log("Database not ready for subscription logging");
      return;
    }
    try {
      await db.runAsync(`
        INSERT INTO subscriptions (amount, timestamp, device_id)
        VALUES (?, ?, ?)
      `, [amount, new Date().toISOString(), deviceId]);
    } catch (error) {
      console.error("Error logging subscription:", error);
    }
  };

  const logTabClick = async (section: string) => {
    if (!isInitialized || !db || !deviceId) {
      console.log("Database not ready for tab click logging");
      return;
    }
    try {
      await db.runAsync(`
        INSERT INTO section_clicks (section, timestamp, device_id)
        VALUES (?, ?, ?)
      `, [section, new Date().toISOString(), deviceId]);
    } catch (error) {
      console.error("Error logging tab click:", error);
    }
  };

  const logAction = async (action: string) => {
    if (!isInitialized || !db || !deviceId) {
      console.log("Database not ready for action logging");
      return;
    }
    try {
      await db.runAsync(`
        INSERT INTO actions (action, timestamp, device_id)
        VALUES (?, ?, ?)
      `, [action, new Date().toISOString(), deviceId]);
    } catch (error) {
      console.error("Error logging action:", error);
    }
  };

  const getStats = async () => {
    if (!isInitialized || !db) {
      console.log("Database not ready for stats");
      return null;
    }
    
    try {
      // Получаем общую выручку
      const revenueResult = await db.getFirstAsync(`
        SELECT SUM(amount) as total FROM subscriptions
      `) as { total: number } | null;
      const totalRevenue = revenueResult?.total || 0;

      // Получаем количество пользователей
      const usersResult = await db.getFirstAsync(`
        SELECT COUNT(DISTINCT device_id) as total FROM (
          SELECT device_id FROM tarot_clicks
          UNION
          SELECT device_id FROM horoscope_clicks
          UNION
          SELECT device_id FROM test_clicks
          UNION
          SELECT device_id FROM subscriptions
        )
      `) as { total: number } | null;
      const totalUsers = usersResult?.total || 0;

      // Получаем количество премиум пользователей
      const premiumResult = await db.getFirstAsync(`
        SELECT COUNT(DISTINCT device_id) as count FROM subscriptions
      `) as { count: number } | null;
      const premiumCount = premiumResult?.count || 0;
      const freeCount = totalUsers - premiumCount;

      // Получаем клики по разделам
      const tabClicksResult = await db.getAllAsync(`
        SELECT section, COUNT(*) as count FROM section_clicks GROUP BY section
      `) as Array<{ section: string; count: number }>;
      const tabClicks: Record<string, number> = {};
      tabClicksResult.forEach((row) => {
        tabClicks[row.section] = row.count;
      });

      // Получаем клики по тестам
      const testClicksResult = await db.getAllAsync(`
        SELECT test_id, COUNT(*) as count FROM test_clicks GROUP BY test_id
      `) as Array<{ test_id: string; count: number }>;
      const testClicks: Record<string, number> = {};
      testClicksResult.forEach((row) => {
        testClicks[row.test_id] = row.count;
      });

      // Получаем клики по таро
      const tarotClicksResult = await db.getAllAsync(`
        SELECT spread_id, COUNT(*) as count FROM tarot_clicks GROUP BY spread_id
      `) as Array<{ spread_id: string; count: number }>;
      const tarotClicks: Record<string, number> = {};
      tarotClicksResult.forEach((row) => {
        tarotClicks[row.spread_id] = row.count;
      });

      // Получаем клики по гороскопу
      const horoscopeClicksResult = await db.getAllAsync(`
        SELECT type, COUNT(*) as count FROM horoscope_clicks GROUP BY type
      `) as Array<{ type: string; count: number }>;
      const horoscopeClicks: Record<string, number> = {};
      horoscopeClicksResult.forEach((row) => {
        horoscopeClicks[row.type] = row.count;
      });

      return {
        totalRevenue,
        totalUsers,
        premiumCount,
        freeCount,
        tabClicks,
        testClicks,
        tarotClicks,
        horoscopeClicks,
      };
    } catch (error) {
      console.error("Error getting stats:", error);
      return null;
    }
  };

  return {
    logTarotClick,
    logHoroscopeClick,
    logTestClick,
    logSubscription,
    logTabClick,
    logAction,
    getStats,
    deviceId,
    isInitialized,
  };
};