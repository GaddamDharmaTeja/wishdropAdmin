import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { api, getStoredTokens, type AdminUser } from './lib/api';

type AuthCtx = {
  user: AdminUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshMe: () => Promise<void>;
};

const Ctx = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshMe = async () => {
    const { accessToken } = getStoredTokens();
    if (!accessToken) {
      setUser(null);
      return;
    }
    const { user: me } = await api.me();
    setUser(me);
  };

  useEffect(() => {
    refreshMe()
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const value = useMemo<AuthCtx>(
    () => ({
      user,
      loading,
      login: async (email, password) => {
        const result = await api.login(email, password);
        setUser(result.user);
      },
      logout: async () => {
        await api.logout();
        setUser(null);
      },
      refreshMe,
    }),
    [user, loading],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useAuth outside provider');
  return ctx;
}
