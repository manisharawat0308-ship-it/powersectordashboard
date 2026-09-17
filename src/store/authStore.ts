import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type UserRole = 'admin' | 'user' | null;

interface AuthStore {
  isLoggedIn: boolean;
  role: UserRole;
  username: string;
  login: (username: string, password: string) => boolean;
  logout: () => void;
}

const CREDENTIALS = {
  admin: { password: 'admin123', role: 'admin' as UserRole },
  user: { password: 'user123', role: 'user' as UserRole },
};

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      isLoggedIn: false,
      role: null,
      username: '',

      login: (username: string, password: string) => {
        const cred = CREDENTIALS[username as keyof typeof CREDENTIALS];
        if (cred && cred.password === password) {
          set({ isLoggedIn: true, role: cred.role, username });
          return true;
        }
        return false;
      },

      logout: () => {
        set({ isLoggedIn: false, role: null, username: '' });
      },
    }),
    {
      name: 'power-dashboard-auth',
    }
  )
);
