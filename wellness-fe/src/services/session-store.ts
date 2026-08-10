import * as SecureStore from 'expo-secure-store';

const SESSION_KEY = 'wellness.auth-session.v2';
const LEGACY_SESSION_KEY = 'wellness.auth-session.v1';

export type AuthSession = {
  accessToken: string;
  userId: string;
  mode: 'authenticated' | 'demo';
  onboardingComplete?: boolean;
};

export const sessionStore = {
  async read(): Promise<AuthSession | null> {
    await SecureStore.deleteItemAsync(LEGACY_SESSION_KEY).catch(() => undefined);
    const raw = await SecureStore.getItemAsync(SESSION_KEY);
    if (!raw) return null;
    try {
      const session = JSON.parse(raw) as Partial<AuthSession>;
      // 체험 모드를 중단했으므로 과거에 저장된 체험 세션은 로그인 세션으로 복원하지 않는다.
      if (session.mode === 'demo') {
        await SecureStore.deleteItemAsync(SESSION_KEY);
        return null;
      }
      if (!session.userId || !session.mode || (session.mode === 'authenticated' && !session.accessToken)) {
        await SecureStore.deleteItemAsync(SESSION_KEY);
        return null;
      }
      return session as AuthSession;
    } catch {
      await SecureStore.deleteItemAsync(SESSION_KEY);
      return null;
    }
  },
  write(session: AuthSession) {
    return SecureStore.setItemAsync(SESSION_KEY, JSON.stringify(session));
  },
  clear() {
    return SecureStore.deleteItemAsync(SESSION_KEY);
  },
};
