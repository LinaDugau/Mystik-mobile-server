import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";
import { authDatabase } from "@/utils/authDatabase";

function getApiBaseOrEmpty(): string {
  const raw =
    process.env.EXPO_PUBLIC_API_URL ||
    process.env.EXPO_PUBLIC_API_BASE ||
    process.env.EXPO_PUBLIC_BACKEND_URL ||
    "";
  return raw.trim().replace(/\/$/, "");
}

interface User {
  id: string;
  email: string;
  username: string;
  name: string;
  createdAt: string;
  birthDate?: string;
}

interface AuthContextType {
  user: User | null;
  login: (login: string, password: string) => Promise<boolean>;
  register: (email: string, username: string, password: string, name: string, birthDate?: string) => Promise<{ ok: boolean; error?: string }>;
  logout: () => Promise<void>;
  updateProfile: (name: string, birthDate?: string) => Promise<boolean>;
  changePassword: (oldPassword: string, newPassword: string, confirmPassword: string) => Promise<boolean>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = "mystic_user";
const COOKIE_KEY = "mystic_session";
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 7; // 7 days

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUser();
  }, []);

  const readCookie = (name: string): string | null => {
    if (Platform.OS !== "web") return null;
    try {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length !== 2) return null;
      return parts.pop()?.split(";").shift() ?? null;
    } catch {
      return null;
    }
  };

  const writeCookie = (name: string, value: string, ttlMs: number) => {
    if (Platform.OS !== "web") return;
    const expires = new Date(Date.now() + ttlMs).toUTCString();
    document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; samesite=lax`;
  };

  const clearCookie = (name: string) => {
    if (Platform.OS !== "web") return;
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; samesite=lax`;
  };

  const readSession = async (): Promise<User | null> => {
    // Web: cookie session (preferred)
    if (Platform.OS === "web") {
      const raw = readCookie(COOKIE_KEY);
      if (!raw) return null;
      try {
        const decoded = decodeURIComponent(raw);
        const parsed = JSON.parse(decoded) as { user: User; expiresAt: number };
        if (!parsed?.user || !parsed?.expiresAt) return null;
        if (Date.now() > parsed.expiresAt) {
          clearCookie(COOKIE_KEY);
          return null;
        }
        return parsed.user;
      } catch {
        clearCookie(COOKIE_KEY);
        return null;
      }
    }

    // Native: AsyncStorage session with expiresAt
    const saved = await AsyncStorage.getItem(STORAGE_KEY);
    if (!saved) return null;
    try {
      const parsed = JSON.parse(saved) as { user: User; expiresAt: number } | User;
      // Backward compatibility: old format stored plain user
      if ((parsed as any)?.email && (parsed as any)?.id && !(parsed as any)?.user) {
        return parsed as User;
      }
      const envelope = parsed as { user: User; expiresAt: number };
      if (!envelope?.user || !envelope?.expiresAt) return null;
      if (Date.now() > envelope.expiresAt) {
        await AsyncStorage.removeItem(STORAGE_KEY);
        return null;
      }
      return envelope.user;
    } catch {
      await AsyncStorage.removeItem(STORAGE_KEY);
      return null;
    }
  };

  const writeSession = async (u: User) => {
    const envelope = { user: u, expiresAt: Date.now() + SESSION_TTL_MS };
    if (Platform.OS === "web") {
      writeCookie(COOKIE_KEY, JSON.stringify(envelope), SESSION_TTL_MS);
      return;
    }
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(envelope));
  };

  const clearSession = async () => {
    if (Platform.OS === "web") {
      clearCookie(COOKIE_KEY);
      return;
    }
    await AsyncStorage.removeItem(STORAGE_KEY);
  };

  const loadUser = async () => {
    try {
      const savedUser = await readSession();
      if (!savedUser) {
        setUser(null);
        return;
      }

      const apiBase = getApiBaseOrEmpty();
      if (!apiBase) {
        setUser(savedUser);
        return;
      }

      // Если API включен, валидируем, что пользователь реально существует на сервере.
      const savedUserId = savedUser.id;
      const res = await fetch(`${apiBase}/api/user/${encodeURIComponent(savedUser.id)}`);
      const data = await res.json().catch(() => ({}));

      if (res.ok && data?.ok && data?.user) {
        setUser({
          ...savedUser,
          email: data.user.email ?? savedUser.email,
          username: data.user.username ?? savedUser.username,
          name: data.user.name ?? savedUser.name,
          birthDate: data.user.birthDate ?? savedUser.birthDate,
          createdAt: savedUser.createdAt ?? new Date().toISOString(),
        });
        return;
      }

      // Старые локальные аккаунты могут иметь id, которых нет на сервере.
      // Важно: если параллельно уже произошел login/register, не очищаем сессию.
      // Проверяем актуальный userId в AsyncStorage.
      const latestUser = await readSession();
      if (latestUser?.id && latestUser.id !== savedUserId) {
        setUser(latestUser);
        return;
      }

      await clearSession();
      setUser(null);
    } catch (error) {
      console.error("Error loading user:", error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (login: string, password: string): Promise<boolean> => {
    try {
      const apiBase = getApiBaseOrEmpty();

      if (apiBase) {
        console.log("[AUTH API DEBUG] login request:", { login });
        const res = await fetch(`${apiBase}/api/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ login, password }),
        });

        const data = await res.json().catch(() => ({}));
        if (res.ok && data?.ok && data?.user) {
          const loggedInUser: User = {
            id: data.user.id,
            email: data.user.email,
            username: data.user.username,
            name: data.user.name,
            createdAt: new Date().toISOString(),
            birthDate: data.user.birthDate ?? undefined,
          };
          setUser(loggedInUser);
          await writeSession(loggedInUser);
          console.log("[AUTH API DEBUG] login ok:", { userId: loggedInUser.id });
          return true;
        }

        console.warn("[AUTH API DEBUG] login failed:", { status: res.status, data });
        return false;
      }

      // Fallback: локальная БД
      const userData = await authDatabase.loginUser(login, password);
      if (!userData) return false;

      const loggedInUser: User = {
        id: userData.id,
        email: userData.email,
        username: userData.username,
        name: userData.name,
        createdAt: new Date().toISOString(),
        birthDate: userData.birthDate,
      };

      setUser(loggedInUser);
      await writeSession(loggedInUser);
      return true;
    } catch (error) {
      console.error("Login error:", error);
      return false;
    }
  };

  const register = async (email: string, username: string, password: string, name: string, birthDate?: string): Promise<{ ok: boolean; error?: string }> => {
    try {
      const apiBase = getApiBaseOrEmpty();

      if (apiBase) {
        console.log("[AUTH API DEBUG] register request:", { email, username });

        const res = await fetch(`${apiBase}/api/register`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, username, password, name, birthDate }),
        });

        const data = await res.json().catch(() => ({}));
        if (res.ok && data?.ok && data?.user) {
          const registeredUser: User = {
            id: data.user.id,
            email: data.user.email,
            username: data.user.username,
            name: data.user.name,
            createdAt: new Date().toISOString(),
            birthDate: data.user.birthDate ?? undefined,
          };

          setUser(registeredUser);
          await writeSession(registeredUser);
          console.log("[AUTH API DEBUG] register ok:", { userId: registeredUser.id });
          return { ok: true };
        }

        console.warn("[AUTH API DEBUG] register failed:", { status: res.status, data });
        return { ok: false, error: data?.error || "Ошибка регистрации" };
      }

      // Fallback: локальная БД
      const result = await authDatabase.registerUser(email, username, password, name, birthDate);
      if (!result.ok) return { ok: false, error: result.error };

      const userData = result.user;
      const registeredUser: User = {
        id: userData.id,
        email: userData.email,
        username: userData.username,
        name: userData.name,
        createdAt: new Date().toISOString(),
        birthDate: userData.birthDate,
      };

      setUser(registeredUser);
      await writeSession(registeredUser);
      return { ok: true };
    } catch (error) {
      console.error("Registration error:", error);
      return { ok: false, error: "Ошибка регистрации" };
    }
  };

  const logout = async () => {
    try {
      await clearSession();
      setUser(null);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const updateProfile = async (name: string, birthDate?: string): Promise<boolean> => {
    try {
      if (!user) {
        console.error("AuthProvider: user is null during updateProfile");
        return false;
      }

      const trimmedName = name.trim();
      if (!trimmedName) {
        return false;
      }

      const apiBase = getApiBaseOrEmpty();
      if (apiBase) {
        const res = await fetch(`${apiBase}/api/user/${encodeURIComponent(user.id)}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: trimmedName, birthDate }),
        });
        const data = await res.json().catch(() => ({}));
        if (!(res.ok && data?.ok && data?.user)) {
          console.warn("[AUTH API DEBUG] updateProfile failed:", { status: res.status, data });
          return false;
        }

        const updatedFromApi = data.user;
        const updatedUser: User = {
          ...user,
          name: updatedFromApi.name ?? trimmedName,
          birthDate: updatedFromApi.birthDate ?? undefined,
        };

        setUser(updatedUser);
        await writeSession(updatedUser);
        return true;
      }

      const success = await authDatabase.updateUserProfile(user.id, trimmedName, birthDate);
      if (!success) return false;

      const updatedUser: User = {
        ...user,
        name: trimmedName,
        ...(birthDate !== undefined ? { birthDate } : {}),
      };

      setUser(updatedUser);
      await writeSession(updatedUser);
      return true;
    } catch (error) {
      console.error("Update profile error:", error);
      return false;
    }
  };

  const changePassword = async (oldPassword: string, newPassword: string, confirmPassword: string): Promise<boolean> => {
    try {
      if (!user) {
        console.error("AuthProvider: changePassword called for null user");
        return false;
      }

      const apiBase = getApiBaseOrEmpty();
      if (apiBase) {
        const res = await fetch(
          `${apiBase}/api/user/${encodeURIComponent(user.id)}/change-password`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ oldPassword, newPassword, confirmPassword }),
          }
        );
        const data = await res.json().catch(() => ({}));
        return Boolean(res.ok && data?.ok);
      }

      return await authDatabase.changeUserPassword(user.id, oldPassword, newPassword);
    } catch (error) {
      console.error("Change password error:", error);
      return false;
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      login,
      register,
      logout,
      updateProfile,
      changePassword,
      isLoading,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
