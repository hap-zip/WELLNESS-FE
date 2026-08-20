import { Stack, type ErrorBoundaryProps, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import * as Notifications from 'expo-notifications';
import { useFonts } from 'expo-font';
import { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppState, Platform, StyleSheet, View } from 'react-native';

import { DailyCheckProvider } from '@/context/daily-check-context';
import { AuthProvider, useAuth } from '@/context/auth-context';
import { ThemeProvider } from '@/context/theme-context';
import { NotificationsProvider } from '@/context/notifications-context';
import StateNotice from '@/components/state-notice';
import { colors, layout } from '@/theme/tokens';
import { fontAssets } from '@/theme/typography';
import { healthSyncService } from '@/services/health-sync-service';
import { wellnessApi } from '@/services/wellness-api';
import { useAppColorScheme } from '@/hooks/use-app-color-scheme';
import { usePalette } from '@/theme/use-palette';

void SplashScreen.preventAutoHideAsync();
SplashScreen.setOptions({ duration: 280, fade: true });

export default function RootLayout() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <DailyCheckProvider>
          <NotificationsProvider>
            <View style={styles.app}>
              <AppStatusBar />
              <HealthSyncBootstrap />
              <RootNavigator />
              <GlobalTopSafeArea />
            </View>
          </NotificationsProvider>
        </DailyCheckProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

function AppStatusBar() {
  const scheme = useAppColorScheme();
  const c = usePalette();
  return <StatusBar backgroundColor={c.card} style={scheme === 'dark' ? 'light' : 'dark'} translucent={false} />;
}

function GlobalTopSafeArea() {
  const insets = useSafeAreaInsets();
  const c = usePalette();
  if (insets.top <= 0) return null;
  return <View pointerEvents="none" style={[styles.topSafeArea, { height: insets.top, backgroundColor: c.card }]} />;
}

function HealthSyncBootstrap() {
  const { session } = useAuth();

  useEffect(() => {
    if (!session || session.mode === 'demo') return;
    let active = true;
    let starting = false;
    let removeObservers: (() => void) | undefined;

    const start = async () => {
      if (starting) return;
      starting = true;
      try {
        const settings = await wellnessApi.getHealthConnection();
        if (!active || !settings.connected || settings.provider !== 'apple-health') return;
        if (removeObservers) {
          await healthSyncService.syncRecent(settings);
          return;
        }
        const remove = await healthSyncService.start(settings);
        if (!active) remove();
        else removeObservers = remove;
      } catch {
        // 권한 철회나 일시적인 HealthKit 지연은 다음 포그라운드 복귀 때 다시 확인한다.
      } finally {
        starting = false;
      }
    };

    void start();
    const appStateSubscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') void start();
    });
    return () => {
      active = false;
      removeObservers?.();
      appStateSubscription.remove();
    };
  }, [session]);

  return null;
}

function RootNavigator() {
  const router = useRouter();
  const segments = useSegments();
  const { isRestoring, session } = useAuth();
  // Pretendard 가 붙기 전에 그리면 시스템 폰트로 한 프레임 나갔다가 글자폭이 바뀐다.
  const [fontsLoaded, fontError] = useFonts(fontAssets);
  const fontsReady = fontsLoaded || Boolean(fontError);

  useEffect(() => {
    if (!isRestoring && fontsReady) void SplashScreen.hideAsync();
  }, [isRestoring, fontsReady]);

  useEffect(() => {
    const firstSegment = segments[0];
    const isSplashRoute = firstSegment === '(auth)' && segments[1] === 'splash';
    const isAuthRoute = !firstSegment || firstSegment === '(auth)';
    const isOnboardingRoute = firstSegment === '(onboarding)';
    if (isRestoring) return;
    if (isSplashRoute) return;
    if (!session && !isAuthRoute) router.replace('/(auth)/login');
    else if (session?.onboardingComplete === false && !isOnboardingRoute) router.replace('/(onboarding)/intro');
  }, [isRestoring, router, segments, session]);

  useEffect(() => {
    if (Platform.OS === 'web') return;
    const openNotification = (notification: Notifications.Notification) => {
      const url = notification.request.content.data?.url;
      if (url === '/check/auto') router.navigate('/check/auto');
      if (url === '/notifications') router.navigate('/notifications');
    };
    const initialResponse = Notifications.getLastNotificationResponse();
    if (initialResponse?.notification) openNotification(initialResponse.notification);
    const subscription = Notifications.addNotificationResponseReceivedListener((response) => openNotification(response.notification));
    return () => subscription.remove();
  }, [router]);

  if (isRestoring || !fontsReady) return null;
  return <Stack screenOptions={{ headerShown: false }} />;
}

export function ErrorBoundary({ retry }: ErrorBoundaryProps) {
  return <SafeAreaView edges={['top','bottom']} style={styles.errorScreen}><StateNotice actionLabel="화면 다시 열기" description="작성 중인 내용은 가능한 한 유지됩니다. 같은 문제가 반복되면 앱을 다시 실행해 주세요." icon="!" onAction={()=>void retry()} title="화면을 표시하지 못했어요" tone="error"/></SafeAreaView>;
}

const styles=StyleSheet.create({
  app:{flex:1},
  topSafeArea:{position:'absolute',top:0,right:0,left:0,zIndex:10000},
  errorScreen:{flex:1,justifyContent:'center',paddingHorizontal:layout.horizontalPadding,backgroundColor:colors.canvas},
});
