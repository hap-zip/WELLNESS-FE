import * as SecureStore from 'expo-secure-store';

import type { AutoHealthRecord, HealthConnectionSettings } from '@/domain/wellness';
import { appleHealthService } from '@/services/apple-health-service';
import { toLocalDateId } from '@/utils/date';

const LEGACY_CACHE_KEY = 'wellness.apple-health-cache.v1';
const LEGACY_CACHE_INDEX_KEY = 'wellness.apple-health-cache-index.v2';
const CACHE_DAY_PREFIX = 'wellness.apple-health-day.v2.';

type CachedHealthRecord = {
  record: AutoHealthRecord;
  syncedAt: string;
};

let syncInFlight: Promise<number> | null = null;
let backgroundSyncEnabled = false;
let activeSettings: HealthConnectionSettings | null = null;

async function writeRecords(records: Record<string, CachedHealthRecord>) {
  if (!(await SecureStore.isAvailableAsync())) return;
  for (const [dateId, cachedRecord] of Object.entries(records)) {
    await SecureStore.setItemAsync(`${CACHE_DAY_PREFIX}${dateId}`, JSON.stringify(cachedRecord));
  }
  await Promise.all([
    SecureStore.deleteItemAsync(LEGACY_CACHE_KEY).catch(() => undefined),
    SecureStore.deleteItemAsync(LEGACY_CACHE_INDEX_KEY).catch(() => undefined),
  ]);
}

function recentDateIds() {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  return [toLocalDateId(today), toLocalDateId(yesterday)];
}

async function syncDates(settings: HealthConnectionSettings, dateIds: string[]) {
  const updates: Record<string, CachedHealthRecord> = {};
  let syncedCount = 0;
  for (const dateId of dateIds) {
    try {
      const record = await appleHealthService.readDailyRecord(dateId, settings.permissions);
      updates[dateId] = { record, syncedAt: new Date().toISOString() };
      syncedCount += 1;
    } catch {
      // 한 날짜의 기록이 없더라도 다른 날짜 동기화는 계속한다.
    }
  }
  if (syncedCount > 0) await writeRecords(updates);
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

  async syncAll(settings: HealthConnectionSettings) {
    activeSettings = settings;
    const records = await appleHealthService.readAllDailyRecords(settings.permissions);
    const syncedAt = new Date().toISOString();
    const updates = Object.fromEntries(
      Object.entries(records).map(([dateId, record]) => [dateId, { record, syncedAt }]),
    );
    await writeRecords(updates);
    return Object.keys(records).length;
  },

  async getDailyRecord(dateId: string, settings: HealthConnectionSettings) {
    const record = await appleHealthService.readDailyRecord(dateId, settings.permissions);
    await writeRecords({ [dateId]: { record, syncedAt: new Date().toISOString() } });
    return record;
  },
};
