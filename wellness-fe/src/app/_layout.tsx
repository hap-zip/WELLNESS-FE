import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';

import { DailyCheckProvider } from '@/context/daily-check-context';

void SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  useEffect(() => {
    void SplashScreen.hideAsync();
  }, []);

  return (
    <DailyCheckProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </DailyCheckProvider>
  );
}
