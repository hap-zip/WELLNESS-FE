import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const THEME_KEY = 'wellness.theme-preference.v1';

export type ThemePreference = 'light' | 'dark';

const storage = {
  async get(key: string) {
    if (Platform.OS === 'web') return typeof window === 'undefined' ? null : window.localStorage.getItem(key);
    return SecureStore.getItemAsync(key);
  },
  async set(key: string, value: string) {
    if (Platform.OS === 'web') { if (typeof window !== 'undefined') window.localStorage.setItem(key, value); return; }
    await SecureStore.setItemAsync(key, value);
  },
};

const isPreference = (value: string | null): value is ThemePreference => value === 'light' || value === 'dark';

export const themeStore = {
  async read(): Promise<ThemePreference> {
    const raw = await storage.get(THEME_KEY);
    return isPreference(raw) ? raw : 'light';
  },
  write(preference: ThemePreference) {
    return storage.set(THEME_KEY, preference);
  },
};
