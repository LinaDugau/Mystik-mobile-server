import * as SQLite from 'expo-sqlite';
import { Platform } from 'react-native';

const DB_NAME = 'mystic.db';

type UserRow = {
  id: string;
  email: string;
  username: string;
  name: string;
  birthDate?: string;
};

type RegisterResult = { ok: true; user: UserRow } | { ok: false; error: string };

type WebUserRecord = {
  id: string;
  email: string;
  username: string;
  name: string;
  birthDate?: string;
  passwordHash: string;
  createdAt: string;
  lastLogin: string;
};

const WEB_USERS_KEY = 'mystic_users_v1';

const getStorage = (): Storage | null => {
  try {
    if (typeof window !== 'undefined' && window.localStorage) return window.localStorage;
  } catch {
    // ignore
  }
  return null;
};

const getWebUsers = (): WebUserRecord[] => {
  const storage = getStorage();
  if (!storage) return [];
  try {
    const raw = storage.getItem(WEB_USERS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed as WebUserRecord[];
  } catch {
    return [];
  }
};

const setWebUsers = (users: WebUserRecord[]) => {
  const storage = getStorage();
  if (!storage) return;
  storage.setItem(WEB_USERS_KEY, JSON.stringify(users));
};

async function ensureUsersTable(db: SQLite.SQLiteDatabase): Promise<void> {
  await db.runAsync(
    'CREATE TABLE IF NOT EXISTS users (id TEXT PRIMARY KEY, email TEXT NOT NULL, username TEXT, name TEXT NOT NULL, birth_date TEXT, password_hash TEXT NOT NULL, is_guest INTEGER NOT NULL DEFAULT 0, created_at TEXT NOT NULL, last_login TEXT NOT NULL)'
  );
  try {
    await db.runAsync('CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)');
  } catch (_) {
    // индекс уже может существовать
  }
  try {
    await db.runAsync('CREATE INDEX IF NOT EXISTS idx_users_username ON users(username)');
  } catch (_) {
    // индекс уже может существовать
  }

  // Миграция старых БД: добавляем недостающие колонки, если таблица уже существовала
  try {
    const columns = await db.getAllAsync<{ name: string }>('PRAGMA table_info(users)');
    const names = new Set(columns.map(c => c.name));
    if (!names.has('username')) {
      await db.runAsync('ALTER TABLE users ADD COLUMN username TEXT');
    }
    if (!names.has('birth_date')) {
      await db.runAsync('ALTER TABLE users ADD COLUMN birth_date TEXT');
    }
  } catch (e) {
    console.warn('Users table migration skipped:', e);
  }
}

const getDatabase = async (): Promise<SQLite.SQLiteDatabase> => {
  const db = await SQLite.openDatabaseAsync(DB_NAME);
  await ensureUsersTable(db);
  return db;
};

const hashPassword = (password: string): string => {
  // Простая хеш-функция для демонстрации
  // В реальном приложении используйте bcrypt или подобное
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Преобразование в 32-bit integer
  }
  return Math.abs(hash).toString(16) + 'mystic_salt';
};

export const authDatabase = {
  async registerUser(email: string, username: string, password: string, name: string, birthDate?: string): Promise<RegisterResult> {
    try {
      // Web fallback: localStorage
      if (Platform.OS === 'web') {
        const now = new Date().toISOString();
        const emailNorm = email.trim().toLowerCase();
        const usernameNorm = username.trim();
        const users = getWebUsers();
        const exists = users.some(u => u.email === emailNorm || u.username === usernameNorm);
        if (exists) return { ok: false, error: 'Пользователь с таким email или логином уже существует' };

        const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const passwordHash = hashPassword(password);
        const record: WebUserRecord = {
          id: userId,
          email: emailNorm,
          username: usernameNorm,
          name: name.trim(),
          ...(birthDate ? { birthDate } : {}),
          passwordHash,
          createdAt: now,
          lastLogin: now,
        };
        setWebUsers([...users, record]);
        const user: UserRow = {
          id: record.id,
          email: record.email,
          username: record.username,
          name: record.name,
          ...(record.birthDate ? { birthDate: record.birthDate } : {}),
        };
        return { ok: true, user };
      }

      const db = await getDatabase();
      
      // Дополнительная проверка на null и готовность
      if (!db) {
        console.error('Database is null in registerUser - cannot proceed');
        return { ok: false, error: 'База данных недоступна' };
      }

      // Проверяем что таблица users существует
      try {
        await db.getFirstAsync("SELECT 1 FROM users LIMIT 1");
      } catch (tableError) {
        console.error('Users table not ready in registerUser:', tableError);
        return { ok: false, error: 'База данных недоступна' };
      }
      
      const emailNorm = email.trim().toLowerCase();
      const usernameNorm = username.trim();
      const existing = await db.getFirstAsync<{ id: string }>(
        'SELECT id FROM users WHERE (email = ? OR username = ?) AND is_guest = 0',
        [emailNorm, usernameNorm]
      );
      if (existing) {
        return { ok: false, error: 'Пользователь с таким email или логином уже существует' };
      }

      const passwordHash = hashPassword(password);
      const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const now = new Date().toISOString();

      await db.runAsync(
        `INSERT INTO users (id, email, username, name, birth_date, password_hash, is_guest, created_at, last_login)
         VALUES (?, ?, ?, ?, ?, ?, 0, ?, ?)`,
        [userId, emailNorm, usernameNorm, name.trim(), birthDate ?? null, passwordHash, now, now]
      );

      return { ok: true, user: { id: userId, email: emailNorm, username: usernameNorm, name: name.trim(), ...(birthDate ? { birthDate } : {}) } };
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : String(error);
      if (msg.includes('UNIQUE') || msg.includes('constraint')) {
        return { ok: false, error: 'Пользователь с таким email или логином уже существует' };
      }
      console.error('Error registering user:', error);
      return { ok: false, error: 'Ошибка регистрации' };
    }
  },

  async loginUser(login: string, password: string): Promise<UserRow | null> {
    try {
      // Web fallback: localStorage
      if (Platform.OS === 'web') {
        const users = getWebUsers();
        const loginNorm = login.trim().toLowerCase();
        const passwordHash = hashPassword(password);
        const found = users.find(u => (u.email === loginNorm || u.username === login.trim()) && u.passwordHash === passwordHash);
        if (!found) return null;
        const now = new Date().toISOString();
        setWebUsers(users.map(u => (u.id === found.id ? { ...u, lastLogin: now } : u)));
        return {
          id: found.id,
          email: found.email,
          username: found.username,
          name: found.name,
          ...(found.birthDate ? { birthDate: found.birthDate } : {}),
        };
      }

      const db = await getDatabase();
      
      // Дополнительная проверка на null и готовность
      if (!db) {
        console.error('Database is null in loginUser - cannot proceed');
        return null;
      }

      // Проверяем что таблица users существует
      try {
        await db.getFirstAsync("SELECT 1 FROM users LIMIT 1");
      } catch (tableError) {
        console.error('Users table not ready in loginUser:', tableError);
        return null;
      }
      
      const passwordHash = hashPassword(password);
      const now = new Date().toISOString();
      const loginNorm = login.trim().toLowerCase();

      const result = await db.getFirstAsync<{
        id: string;
        email: string;
        username: string | null;
        name: string;
        birth_date: string | null;
      }>(
        `SELECT id, email, username, name, birth_date FROM users 
         WHERE (email = ? OR username = ?) AND password_hash = ? AND is_guest = 0`,
        [loginNorm, login.trim(), passwordHash]
      );

      if (result) {
        // Обновляем время последнего входа
        await db.runAsync(
          `UPDATE users SET last_login = ? WHERE id = ?`,
          [now, result.id]
        );
      }

      if (!result) return null;
      return {
        id: result.id,
        email: result.email,
        username: result.username ?? result.email,
        name: result.name,
        ...(result.birth_date ? { birthDate: result.birth_date } : {}),
      };
    } catch (error) {
      console.error('Error logging in user:', error);
      return null;
    }
  },

  async getUserByEmail(email: string): Promise<UserRow | null> {
    try {
      if (Platform.OS === 'web') {
        const emailNorm = email.trim().toLowerCase();
        const users = getWebUsers();
        const found = users.find(u => u.email === emailNorm);
        if (!found) return null;
        return {
          id: found.id,
          email: found.email,
          username: found.username,
          name: found.name,
          ...(found.birthDate ? { birthDate: found.birthDate } : {}),
        };
      }

      const db = await getDatabase();
      
      // Дополнительная проверка на null
      if (!db) {
        console.error('Database is null in getUserByEmail - cannot proceed');
        return null;
      }
      
      const result = await db.getFirstAsync<{
        id: string;
        email: string;
        username: string | null;
        name: string;
        birth_date: string | null;
      }>(
        `SELECT id, email, username, name, birth_date FROM users WHERE email = ? AND is_guest = 0`,
        [email.trim().toLowerCase()]
      );

      if (!result) return null;
      return {
        id: result.id,
        email: result.email,
        username: result.username ?? result.email,
        name: result.name,
        ...(result.birth_date ? { birthDate: result.birth_date } : {}),
      };
    } catch (error) {
      console.error('Error getting user by email:', error);
      return null;
    }
  },

  async updateUserProfile(userId: string, name: string, birthDate?: string): Promise<boolean> {
    try {
      if (Platform.OS === 'web') {
        const users = getWebUsers();
        const idx = users.findIndex(u => u.id === userId);
        if (idx === -1) return false;
        const updated: WebUserRecord = {
          ...users[idx],
          name,
          ...(birthDate !== undefined ? { birthDate: birthDate || undefined } : {}),
        };
        const next = [...users];
        next[idx] = updated;
        setWebUsers(next);
        return true;
      }

      const db = await getDatabase();
      
      // Дополнительная проверка на null
      if (!db) {
        console.error('Database is null in updateUserProfile - cannot proceed');
        return false;
      }
      
      if (birthDate !== undefined) {
        await db.runAsync(
          `UPDATE users SET name = ?, birth_date = ? WHERE id = ?`,
          [name, birthDate || null, userId]
        );
      } else {
        await db.runAsync(
          `UPDATE users SET name = ? WHERE id = ?`,
          [name, userId]
        );
      }

      return true;
    } catch (error) {
      console.error('Error updating user profile:', error);
      return false;
    }
  },

  async changeUserPassword(userId: string, oldPassword: string, newPassword: string): Promise<boolean> {
    try {
      if (Platform.OS === 'web') {
        const users = getWebUsers();
        const idx = users.findIndex(u => u.id === userId);
        if (idx === -1) return false;
        const oldHash = hashPassword(oldPassword);
        if (users[idx].passwordHash !== oldHash) return false;
        const newHash = hashPassword(newPassword);
        const next = [...users];
        next[idx] = { ...users[idx], passwordHash: newHash };
        setWebUsers(next);
        return true;
      }

      const db = await getDatabase();

      if (!db) {
        console.error('Database is null in changeUserPassword - cannot proceed');
        return false;
      }

      const oldHash = hashPassword(oldPassword);
      const existing = await db.getFirstAsync<{ id: string }>(
        'SELECT id FROM users WHERE id = ? AND password_hash = ? AND is_guest = 0',
        [userId, oldHash]
      );

      if (!existing) {
        return false;
      }

      const newHash = hashPassword(newPassword);
      await db.runAsync(
        'UPDATE users SET password_hash = ? WHERE id = ?',
        [newHash, userId]
      );

      return true;
    } catch (error) {
      console.error('Error changing user password:', error);
      return false;
    }
  },

  async deleteUserAccount(userId: string): Promise<boolean> {
    try {
      if (Platform.OS === 'web') {
        const users = getWebUsers();
        const next = users.filter(u => u.id !== userId);
        setWebUsers(next);
        return true;
      }

      const db = await getDatabase();
      
      // Дополнительная проверка на null
      if (!db) {
        console.error('Database is null in deleteUserAccount - cannot proceed');
        return false;
      }
      
      // Удаляем все связанные данные пользователя
      await db.runAsync(`DELETE FROM user_actions WHERE user_id = ?`, [userId]);
      await db.runAsync(`DELETE FROM users WHERE id = ?`, [userId]);

      return true;
    } catch (error) {
      console.error('Error deleting user account:', error);
      return false;
    }
  },

  async getUserStats(userId: string): Promise<{
    totalActions: number;
    registrationDate: string;
    lastLogin: string;
  } | null> {
    try {
      if (Platform.OS === 'web') {
        const users = getWebUsers();
        const found = users.find(u => u.id === userId);
        if (!found) return null;
        return {
          totalActions: 0,
          registrationDate: found.createdAt,
          lastLogin: found.lastLogin,
        };
      }

      const db = await getDatabase();
      
      // Дополнительная проверка на null
      if (!db) {
        console.error('Database is null in getUserStats - cannot proceed');
        return null;
      }
      
      const statsResult = await db.getFirstAsync<{
        totalActions: number;
        registrationDate: string;
        lastLogin: string;
      }>(
        `SELECT 
           COUNT(*) as totalActions,
           created_at as registrationDate,
           last_login as lastLogin
         FROM users u
         LEFT JOIN user_actions ua ON u.id = ua.user_id
         WHERE u.id = ?
         GROUP BY u.id`,
        [userId]
      );

      return statsResult;
    } catch (error) {
      console.error('Error getting user stats:', error);
      return null;
    }
  }
};
