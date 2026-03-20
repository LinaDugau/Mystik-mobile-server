// Веб-совместимая база данных на основе localStorage
// Имитирует SQLite для веб-версии приложения

interface User {
  id: string;
  email: string;
  name: string;
  password_hash: string;
  is_guest: number;
  created_at: string;
  last_login: string;
}

interface DatabaseData {
  users: User[];
}

const DB_KEY = 'mystic_web_db';

// Инициализация базы данных
const initDatabase = (): DatabaseData => {
  if (typeof window === 'undefined') {
    return { users: [] };
  }

  try {
    const stored = localStorage.getItem(DB_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error loading database from localStorage:', error);
  }

  return { users: [] };
};

// Сохранение базы данных
const saveDatabase = (data: DatabaseData): void => {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(DB_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Error saving database to localStorage:', error);
  }
};

// Получение текущей базы данных
const getDatabase = (): DatabaseData => {
  return initDatabase();
};

export const webDatabase = {
  // Регистрация пользователя
  async registerUser(email: string, password: string, name: string): Promise<boolean> {
    try {
      const db = getDatabase();

      // Проверяем, существует ли уже пользователь с таким email
      const existingUser = db.users.find(u => u.email === email && u.is_guest === 0);
      if (existingUser) {
        console.error('User with this email already exists');
        return false;
      }

      const passwordHash = hashPassword(password);
      const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const now = new Date().toISOString();

      const newUser: User = {
        id: userId,
        email,
        name,
        password_hash: passwordHash,
        is_guest: 0,
        created_at: now,
        last_login: now,
      };

      db.users.push(newUser);
      saveDatabase(db);

      return true;
    } catch (error) {
      console.error('Error registering user:', error);
      return false;
    }
  },

  // Вход пользователя
  async loginUser(email: string, password: string): Promise<{ id: string; email: string; name: string } | null> {
    try {
      const db = getDatabase();
      const passwordHash = hashPassword(password);
      const now = new Date().toISOString();

      const user = db.users.find(
        u => u.email === email && u.password_hash === passwordHash && u.is_guest === 0
      );

      if (user) {
        // Обновляем время последнего входа
        user.last_login = now;
        saveDatabase(db);

        return {
          id: user.id,
          email: user.email,
          name: user.name,
        };
      }

      return null;
    } catch (error) {
      console.error('Error logging in user:', error);
      return null;
    }
  },

  // Получение пользователя по email
  async getUserByEmail(email: string): Promise<{ id: string; email: string; name: string } | null> {
    try {
      const db = getDatabase();
      const user = db.users.find(u => u.email === email && u.is_guest === 0);

      if (user) {
        return {
          id: user.id,
          email: user.email,
          name: user.name,
        };
      }

      return null;
    } catch (error) {
      console.error('Error getting user by email:', error);
      return null;
    }
  },

  // Обновление профиля пользователя
  async updateUserProfile(userId: string, name: string): Promise<boolean> {
    try {
      const db = getDatabase();
      const user = db.users.find(u => u.id === userId);

      if (user) {
        user.name = name;
        saveDatabase(db);
        return true;
      }

      return false;
    } catch (error) {
      console.error('Error updating user profile:', error);
      return false;
    }
  },

  // Удаление аккаунта пользователя
  async deleteUserAccount(userId: string): Promise<boolean> {
    try {
      const db = getDatabase();
      const index = db.users.findIndex(u => u.id === userId);

      if (index !== -1) {
        db.users.splice(index, 1);
        saveDatabase(db);
        return true;
      }

      return false;
    } catch (error) {
      console.error('Error deleting user account:', error);
      return false;
    }
  },

  // Получение статистики пользователя
  async getUserStats(userId: string): Promise<{
    totalActions: number;
    registrationDate: string;
    lastLogin: string;
  } | null> {
    try {
      const db = getDatabase();
      const user = db.users.find(u => u.id === userId);

      if (user) {
        return {
          totalActions: 0, // В веб-версии пока не отслеживаем действия
          registrationDate: user.created_at,
          lastLogin: user.last_login,
        };
      }

      return null;
    } catch (error) {
      console.error('Error getting user stats:', error);
      return null;
    }
  },
};

// Простая хеш-функция для паролей (такая же, как в authDatabase.ts)
const hashPassword = (password: string): string => {
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Преобразование в 32-bit integer
  }
  return Math.abs(hash).toString(16) + 'mystic_salt';
};
