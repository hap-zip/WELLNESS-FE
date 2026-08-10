import * as SecureStore from 'expo-secure-store';

import type { AutoHealthRecord, HealthConnectionSettings } from '@/domain/wellness';
import { appleHealthService } from '@/services/apple-health-service';
import { toLocalDateId } from '@/utils/date';

const CACHE_KEY = 'wellness.apple-health-cache.v1';

type CachedHealthRecord = {
  record: AutoHealthRecord;
  syncedAt: string;
};

type HealthCache = Record<string, CachedHealthRecord>;

let syncInFlight: Promise<number> | null = null;
let backgroundSyncEnabled = false;
let activeSettings: HealthConnectionSettings | null = null;

async function readCache(): Promise<HealthCache> {
  try {
    if (!(await SecureStore.isAvailableAsync())) return {};
    const stored = await SecureStore.getItemAsync(CACHE_KEY);
    return stored ? JSON.parse(stored) as HealthCache : {};
  } catch {
    return {};
  }
}

async function writeCache(cache: HealthCache) {
  if (await SecureStore.isAvailableAsync()) await SecureStore.setItemAsync(CACHE_KEY, JSON.stringify(cache));
}

function recentDateIds() {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  return [toLocalDateId(today), toLocalDateId(yesterday)];
}

async function syncDates(settings: HealthConnectionSettings, dateIds: string[]) {
  const cache = await readCache();
  let syncedCount = 0;
  for (const dateId of dateIds) {
    try {
      const record = await appleHealthService.readDailyRecord(dateId, settings.permissions);
      cache[dateId] = { record, syncedAt: new Date().toISOString() };
      syncedCount += 1;
    } catch {
      // 한 날짜의 기록이 없더라도 다른 날짜 동기화는 계속한다.
    }
  }
  if (syncedCount > 0) await writeCache(cache);
  return syncedCount;
}

function scheduleRecentSync(settings: HealthConnectionSettings) {
  if (!syncInFlight) {
    syncInFlight = syncDates(settings, recentDateIds()).finally(() => { syncInFlight = null; });
  }
  return syncInFlight;
}

export const healthSyncService = {
  async start(settings: HealthConnectionSettings) {
    backgroundSyncEnabled = true;
    activeSettings = settings;
    await appleHealthService.configureBackgroundSync(settings.permissions);
    await scheduleRecentSync(settings);
    return appleHealthService.subscribeToChanges((errorMessage) => {
      if (!errorMessage && backgroundSyncEnabled && activeSettings) void scheduleRecentSync(activeSettings);
    });
  },

  async stop() {
    backgroundSyncEnabled = false;
    activeSettings = null;
    await appleHealthService.clearBackgroundSync();
  },

  async syncRecent(settings: HealthConnectionSettings) {
    activeSettings = settings;
    return scheduleRecentSync(settings);
  },

  async getDailyRecord(dateId: string, settings: HealthConnectionSettings) {
    const record = await appleHealthService.readDailyRecord(dateId, settings.permissions);
    const cache = await readCache();
    cache[dateId] = { record, syncedAt: new Date().toISOString() };
    await writeCache(cache);
    return record;
  },
};
