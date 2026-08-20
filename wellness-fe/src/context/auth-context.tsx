import { createContext, PropsWithChildren, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { AuthSession, sessionStore } from '@/services/session-store';

type AuthContextValue = {
  completeOnboarding: () => Promise<void>;
  session: AuthSession | null;
  isRestoring: boolean;
  startSession: (session: AuthSession) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [isRestoring, setIsRestoring] = useState(true);

  useEffect(() => {
    let active = true;
    void sessionStore.read().then((stored) => {
      if (active) setSession(stored);
    }).finally(() => {
      if (active) setIsRestoring(false);
    });
    return () => { active = false; };
  }, []);

  const startSession = useCallback(async (next: AuthSession) => {
    await sessionStore.write(next);
    setSession(next);
  }, []);
  const completeOnboarding = useCallback(async () => {
    if (!session) return;
    const next = { ...session, onboardingComplete: true };
    await sessionStore.write(next);
    setSession(next);
  }, [session]);
  const signOut = useCallback(async () => {
    await sessionStore.clear();
    setSession(null);
  }, []);
  const value = useMemo(() => ({ completeOnboarding, session, isRestoring, startSession, signOut }), [completeOnboarding, isRestoring, session, signOut, startSession]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useAuth must be used inside AuthProvider.');
  return value;
}
