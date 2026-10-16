// Powered by OnSpace.AI
import React, { createContext, ReactNode, useCallback, useEffect, useState } from 'react';
import { User, getCurrentUser, signIn as svcSignIn, signOut as svcSignOut, ensureUsers } from '@/services/authService';
import { seedLeadsIfEmpty } from '@/services/leadsService';

export type AuthContextType = {
  user: User | null;
  loading: boolean;
  signIn: (identifier: string, password: string) => Promise<User | null>;
  signOut: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      await ensureUsers();
      const u = await getCurrentUser();
      if (u) await seedLeadsIfEmpty(u.id);
      setUser(u);
      setLoading(false);
    })();
  }, []);

  const signIn = useCallback(async (identifier: string, password: string) => {
    const u = await svcSignIn(identifier, password);
    if (u) {
      await seedLeadsIfEmpty(u.id);
      setUser(u);
    }
    return u;
  }, []);

  const signOut = useCallback(async () => {
    await svcSignOut();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}
