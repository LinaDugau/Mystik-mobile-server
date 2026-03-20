import { useAuth } from '@/providers/AuthProvider';
import { authDatabase } from '@/utils/authDatabase';

export function useAuthDatabase() {
  const { user } = useAuth();

  return {
    registerUser: async (email: string, password: string, name: string) => {
      if (!user) return false;
      return await authDatabase.registerUser(email, password, name);
    },
    loginUser: async (email: string, password: string) => {
      if (!user) return null;
      return await authDatabase.loginUser(email, password);
    },
    getUserByEmail: authDatabase.getUserByEmail,
    updateUserProfile: (name: string) => user ? authDatabase.updateUserProfile(user.id, name) : Promise.resolve(false),
    deleteUserAccount: () => user ? authDatabase.deleteUserAccount(user.id) : Promise.resolve(false),
    getUserStats: () => user ? authDatabase.getUserStats(user.id) : Promise.resolve(null),
  };
}
