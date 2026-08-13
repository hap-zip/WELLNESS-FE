import { Stack, type ErrorBoundaryProps, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import * as Notifications from 'expo-notifications';
import { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppState, Platform, StyleSheet } from 'react-native';

import { DailyCheckProvider } from '@/context/daily-check-context';
import { AuthProvider, useAuth } from '@/context/auth-context';
import StateNotice from '@/components/state-notice';
import { colors, layout } from '@/theme/tokens';
import { healthSyncService } from '@/services/health-sync-service';
import { wellnessApi } from '@/services/wellness-api';

void SplashScreen.preventAutoHideAsync();
SplashScreen.setOptions({ duration: 280, fade: true });

export default function RootLayout() {
  return (
    <AuthProvider>
      <DailyCheckProvider>
        <StatusBar style="dark" />
        <HealthSyncBootstrap />
        <RootNavigator />
      </DailyCheckProvider>
    </AuthProvider>
  );
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

  useEffect(() => {
    if (!isRestoring) void SplashScreen.hideAsync();
  }, [isRestoring]);

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
      if (url === '/check/auto') router.push('/check/auto');
      if (url === '/settings/notifications') router.push('/settings/notifications');
    };
    const initialResponse = Notifications.getLastNotificationResponse();
    if (initialResponse?.notification) openNotification(initialResponse.notification);
    const subscription = Notifications.addNotificationResponseReceivedListener((response) => openNotification(response.notification));
    return () => subscription.remove();
  }, [router]);

  if (isRestoring) return null;
  return <Stack screenOptions={{ headerShown: false }} />;
}

export function ErrorBoundary({ retry }: ErrorBoundaryProps) {
  return <SafeAreaView edges={['top','bottom']} style={styles.errorScreen}><StateNotice actionLabel="화면 다시 열기" description="작성 중인 내용은 가능한 한 유지됩니다. 같은 문제가 반복되면 앱을 다시 실행해 주세요." icon="!" onAction={()=>void retry()} title="화면을 표시하지 못했어요" tone="error"/></SafeAreaView>;
}

const styles=StyleSheet.create({errorScreen:{flex:1,justifyContent:'center',paddingHorizontal:layout.horizontalPadding,backgroundColor:colors.canvas}});
