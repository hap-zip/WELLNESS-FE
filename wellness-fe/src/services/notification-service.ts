import * as Notifications from 'expo-notifications';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

import type { NotificationSettings } from '@/domain/wellness';
import { wellnessApi } from '@/services/wellness-api';
import { colors } from '@/theme/tokens';

const CHANNEL_ID = 'wellness-reminders';
const SETTINGS_KEY = 'wellness.notification-settings.v1';
const DAILY_NOTIFICATION_KEY = 'wellness.daily-notification-id.v1';

const storage = {
  async get(key: string) { if (Platform.OS === 'web') return typeof window === 'undefined' ? null : window.localStorage.getItem(key); return SecureStore.getItemAsync(key); },
  async set(key: string, value: string) { if (Platform.OS === 'web') { if (typeof window !== 'undefined') window.localStorage.setItem(key, value); return; } await SecureStore.setItemAsync(key, value); },
  async remove(key: string) { if (Platform.OS === 'web') { if (typeof window !== 'undefined') window.localStorage.removeItem(key); return; } await SecureStore.deleteItemAsync(key); },
};

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: false,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

function permissionFrom(status: Notifications.NotificationPermissionsStatus): NotificationSettings['osPermission'] {
  if (Platform.OS === 'ios' && status.ios) {
    const allowed = [
      Notifications.IosAuthorizationStatus.AUTHORIZED,
      Notifications.IosAuthorizationStatus.PROVISIONAL,
      Notifications.IosAuthorizationStatus.EPHEMERAL,
    ];
    if (allowed.includes(status.ios.status)) return 'granted';
    return status.ios.status === Notifications.IosAuthorizationStatus.DENIED ? 'denied' : 'not-determined';
  }
  if (status.granted) return 'granted';
  return status.canAskAgain ? 'not-determined' : 'denied';
}

async function ensureAndroidChannel() {
  if (Platform.OS !== 'android') return;
  await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
    name: '웰니스 기록 알림',
    description: '오늘의 몸 상태를 기록할 시간을 알려드려요.',
    importance: Notifications.AndroidImportance.DEFAULT,
    vibrationPattern: [0, 180],
    lightColor: colors.brand,
  });
}

async function cancelDailyReminder() {
  const identifier = await storage.get(DAILY_NOTIFICATION_KEY);
  if (!identifier) return;
  await Notifications.cancelScheduledNotificationAsync(identifier).catch(() => undefined);
  await storage.remove(DAILY_NOTIFICATION_KEY);
}

async function scheduleDailyReminder(time: string) {
  const [hourText, minuteText] = time.split(':');
  const hour = Number(hourText);
  const minute = Number(minuteText);
  if (!Number.isInteger(hour) || !Number.isInteger(minute)) throw new Error('알림 시간을 확인해 주세요.');

  await ensureAndroidChannel();
  await cancelDailyReminder();
  const identifier = await Notifications.scheduleNotificationAsync({
    content: {
      title: '오늘 몸 상태를 기록할 시간이에요',
      body: '잠과 활동, 불편한 부위를 짧게 남겨보세요.',
      data: { url: '/check/auto', kind: 'daily-check' },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      channelId: CHANNEL_ID,
      hour,
      minute,
    },
  });
  await storage.set(DAILY_NOTIFICATION_KEY, identifier);
}

async function getNotificationPermission(): Promise<NotificationSettings['osPermission']> {
  if (Platform.OS === 'web') return 'denied';
  await ensureAndroidChannel();
  return permissionFrom(await Notifications.getPermissionsAsync());
}

export const notificationService = {
  async getPermission(): Promise<NotificationSettings['osPermission']> {
    return getNotificationPermission();
  },

  async requestPermission(): Promise<NotificationSettings['osPermission']> {
    if (Platform.OS === 'web') return 'denied';
    await ensureAndroidChannel();
    const current = await Notifications.getPermissionsAsync();
    if (permissionFrom(current) === 'granted') return 'granted';
    return permissionFrom(await Notifications.requestPermissionsAsync({ ios: { allowAlert: true, allowBadge: false, allowSound: false } }));
  },

  async getSettings(): Promise<NotificationSettings> {
    const fallback = await wellnessApi.getNotificationSettings();
    const stored = await storage.get(SETTINGS_KEY);
    let settings = fallback;
    if (stored) {
      try { settings = { ...fallback, ...(JSON.parse(stored) as NotificationSettings) }; }
      catch { await storage.remove(SETTINGS_KEY); }
    }
    return { ...settings, osPermission: await getNotificationPermission() };
  },

  async saveSettings(settings: NotificationSettings): Promise<void> {
    const permission = await getNotificationPermission();
    const next = { ...settings, osPermission: permission };
    if (next.enabled && next.dailyCheck && permission === 'granted') await scheduleDailyReminder(next.reminderTime);
    else await cancelDailyReminder();
    await storage.set(SETTINGS_KEY, JSON.stringify(next));
    await wellnessApi.saveNotificationSettings(next);
  },

  async scheduleTestNotification(): Promise<void> {
    const permission = await this.requestPermission();
    if (permission !== 'granted') throw new Error('알림 권한이 필요해요.');
    await ensureAndroidChannel();
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '알림이 정상적으로 연결됐어요',
        body: '웰니스 기록 알림을 이 기기에서 받을 수 있어요.',
        data: { url: '/settings/notifications', kind: 'notification-test' },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        channelId: CHANNEL_ID,
        seconds: 3,
      },
    });
  },
};
