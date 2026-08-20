import { createContext, type PropsWithChildren, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { themeStore, type ThemePreference } from '@/services/theme-store';

type ThemeContextValue = {
  scheme: ThemePreference;
  setScheme: (scheme: ThemePreference) => Promise<void>;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

/**
 * 화면 모드는 설정에서 고른다 — 기기 시스템 설정을 따라가지 않는다.
 * 기본값은 라이트, 마이 > 화면 모드에서 바꾸면 즉시 앱 전체에 반영되고 저장된다.
 */
export function ThemeProvider({ children }: PropsWithChildren) {
  const [scheme, setSchemeState] = useState<ThemePreference>('light');

  useEffect(() => {
    let active = true;
    void themeStore.read().then((stored) => { if (active) setSchemeState(stored); });
    return () => { active = false; };
  }, []);

  const setScheme = useCallback(async (next: ThemePreference) => {
    setSchemeState(next);
    await themeStore.write(next);
  }, []);

  const value = useMemo(() => ({ scheme, setScheme }), [scheme, setScheme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useThemePreference() {
  const value = useContext(ThemeContext);
  if (!value) throw new Error('useThemePreference must be used inside ThemeProvider.');
  return value;
}
