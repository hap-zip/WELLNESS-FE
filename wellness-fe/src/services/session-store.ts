import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const SESSION_KEY = 'wellness.auth-session.v2';
const LEGACY_SESSION_KEY = 'wellness.auth-session.v1';

export type AuthSession = {
  accessToken: string;
  userId: string;
  mode: 'authenticated' | 'demo';
  onboardingComplete?: boolean;
};

const storage = {
  async get(key: string) {
    if (Platform.OS === 'web') return typeof window === 'undefined' ? null : window.localStorage.getItem(key);
    return SecureStore.getItemAsync(key);
  },
  async set(key: string, value: string) {
    if (Platform.OS === 'web') { if (typeof window !== 'undefined') window.localStorage.setItem(key, value); return; }
    await SecureStore.setItemAsync(key, value);
  },
  async remove(key: string) {
    if (Platform.OS === 'web') { if (typeof window !== 'undefined') window.localStorage.removeItem(key); return; }
    await SecureStore.deleteItemAsync(key);
  },
};

export const sessionStore = {
  async read(): Promise<AuthSession | null> {
    await storage.remove(LEGACY_SESSION_KEY).catch(() => undefined);
    const raw = await storage.get(SESSION_KEY);
    if (!raw) return null;
    try {
      const session = JSON.parse(raw) as Partial<AuthSession>;
      // 체험 모드를 중단했으므로 과거에 저장된 체험 세션은 로그인 세션으로 복원하지 않는다.
      if (session.mode === 'demo') {
        await storage.remove(SESSION_KEY);
        return null;
      }
      if (!session.userId || !session.mode || (session.mode === 'authenticated' && !session.accessToken)) {
        await storage.remove(SESSION_KEY);
        return null;
      }
      return session as AuthSession;
    } catch {
      await storage.remove(SESSION_KEY);
      return null;
    }
  },
  write(session: AuthSession) {
    return storage.set(SESSION_KEY, JSON.stringify(session));
  },
  clear() {
    return storage.remove(SESSION_KEY);
  },
};
