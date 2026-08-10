import Constants, { ExecutionEnvironment } from 'expo-constants';
import { Platform } from 'react-native';

import type { AutoHealthRecord } from '@/domain/wellness';

const STEP_COUNT = 'HKQuantityTypeIdentifierStepCount' as const;
const SLEEP_ANALYSIS = 'HKCategoryTypeIdentifierSleepAnalysis' as const;
const ASLEEP_VALUES = new Set([1, 3, 4, 5]);

type HealthKitModule = typeof import('@kingstinct/react-native-healthkit');

export type AppleHealthDiagnostic = {
  checkedAt: string;
  dateId: string;
  requestStatus: 'authorization-required' | 'requested' | 'unknown';
  result: 'readable' | 'empty-or-denied' | 'query-error';
  sleep: { dailySamples: number; asleepSamples: number; latestSampleAt: string | null; error: string | null };
  steps: { dailyValue: number | null; latestSampleAt: string | null; error: string | null };
};

export type AppleHealthErrorCode =
  | 'UNSUPPORTED_PLATFORM'
  | 'EXPO_GO_UNSUPPORTED'
  | 'HEALTH_DATA_UNAVAILABLE'
  | 'AUTHORIZATION_REQUIRED'
  | 'AUTHORIZATION_FAILED'
  | 'NO_HEALTH_DATA'
  | 'QUERY_FAILED';

export class AppleHealthError extends Error {
  constructor(readonly code: AppleHealthErrorCode, message: string, readonly cause?: unknown) {
    super(message);
    this.name = 'AppleHealthError';
  }
}

async function loadHealthKit(): Promise<HealthKitModule> {
  if (Platform.OS !== 'ios') {
    throw new AppleHealthError('UNSUPPORTED_PLATFORM', 'Apple 건강 연결은 iPhone에서 사용할 수 있어요.');
  }
  if (Constants.executionEnvironment === ExecutionEnvironment.StoreClient) {
    throw new AppleHealthError('EXPO_GO_UNSUPPORTED', 'Apple 건강 연결은 개발용 앱 빌드에서 확인할 수 있어요.');
  }
  try {
    return await import('@kingstinct/react-native-healthkit');
  } catch (error) {
    throw new AppleHealthError('HEALTH_DATA_UNAVAILABLE', 'HealthKit이 포함된 최신 앱 빌드가 필요해요.', error);
  }
}

async function requireAvailableHealthKit() {
  const healthKit = await loadHealthKit();
  try {
    if (!healthKit.isHealthDataAvailable()) {
      throw new AppleHealthError('HEALTH_DATA_UNAVAILABLE', '이 기기에서는 Apple 건강 데이터를 사용할 수 없어요.');
    }
    return healthKit;
  } catch (error) {
    if (error instanceof AppleHealthError) throw error;
    throw new AppleHealthError('HEALTH_DATA_UNAVAILABLE', 'Apple 건강 사용 가능 여부를 확인하지 못했어요.', error);
  }
}

function parseLocalDate(dateId: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateId)) {
    throw new AppleHealthError('QUERY_FAILED', '조회할 날짜가 올바르지 않아요.');
  }
  const [year, month, day] = dateId.split('-').map(Number);
  return new Date(year, month - 1, day);
}

function dayRange(dateId: string) {
  const startDate = parseLocalDate(dateId);
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + 1);
  return { startDate, endDate };
}

function sleepRange(dateId: string) {
  const target = parseLocalDate(dateId);
  const endDate = new Date(target);
  endDate.setHours(12, 0, 0, 0);
  const startDate = new Date(endDate);
  startDate.setDate(startDate.getDate() - 1);
  return { startDate, endDate };
}

function mergeIntervals(intervals: { start: Date; end: Date }[]) {
  const sorted = intervals
    .filter(({ start, end }) => end.getTime() > start.getTime())
    .sort((a, b) => a.start.getTime() - b.start.getTime());
  const merged: { start: Date; end: Date }[] = [];
  for (const interval of sorted) {
    const previous = merged.at(-1);
    if (!previous || interval.start.getTime() > previous.end.getTime()) {
      merged.push({ ...interval });
    } else if (interval.end.getTime() > previous.end.getTime()) {
      previous.end = interval.end;
    }
  }
  return merged;
}

function formatDuration(milliseconds: number) {
  const totalMinutes = Math.round(milliseconds / 60_000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return hours > 0 ? `${hours}시간 ${minutes}분` : `${minutes}분`;
}

function formatTime(date: Date) {
  return new Intl.DateTimeFormat('ko-KR', { hour: 'numeric', minute: '2-digit', hour12: true }).format(date);
}

function formatSteps(value: number) {
  return `${Math.max(0, Math.round(value)).toLocaleString('ko-KR')}보`;
}

function isoDate(value: Date | string | undefined) {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

export const appleHealthService = {
  async isAvailable() {
    try {
      await requireAvailableHealthKit();
      return true;
    } catch {
      return false;
    }
  },

  async requestReadAuthorization(permissions: { sleep: boolean; steps: boolean } = { sleep: true, steps: true }) {
    const healthKit = await requireAvailableHealthKit();
    const toRead = [permissions.steps ? STEP_COUNT : null, permissions.sleep ? SLEEP_ANALYSIS : null].filter((value): value is typeof STEP_COUNT | typeof SLEEP_ANALYSIS => value !== null);
    if (toRead.length === 0) return;
    try {
      const requested = await healthKit.requestAuthorization({ toRead });
      if (!requested) {
        throw new AppleHealthError('AUTHORIZATION_FAILED', 'Apple 건강 권한 요청을 완료하지 못했어요.');
      }
    } catch (error) {
      if (error instanceof AppleHealthError) throw error;
      throw new AppleHealthError('AUTHORIZATION_FAILED', 'Apple 건강 권한을 확인하지 못했어요.', error);
    }
  },

  async configureBackgroundSync(permissions: { sleep: boolean; steps: boolean }) {
    const healthKit = await requireAvailableHealthKit();
    const typeIdentifiers = [permissions.steps ? STEP_COUNT : null, permissions.sleep ? SLEEP_ANALYSIS : null].filter((value): value is typeof STEP_COUNT | typeof SLEEP_ANALYSIS => value !== null);
    if (typeIdentifiers.length === 0) {
      await healthKit.clearBackgroundTypes();
      return;
    }
    await healthKit.configureBackgroundTypes(typeIdentifiers, healthKit.UpdateFrequency.immediate);
  },

  async clearBackgroundSync() {
    const healthKit = await requireAvailableHealthKit();
    await healthKit.clearBackgroundTypes();
  },

  async subscribeToChanges(onChange: (errorMessage?: string) => void) {
    const healthKit = await requireAvailableHealthKit();
    const subscriptions = [
      healthKit.subscribeToChanges(STEP_COUNT, ({ errorMessage }) => onChange(errorMessage)),
      healthKit.subscribeToChanges(SLEEP_ANALYSIS, ({ errorMessage }) => onChange(errorMessage)),
    ];
    return () => subscriptions.forEach((subscription) => subscription.remove());
  },

  async diagnoseDailyRead(dateId: string, permissions: { sleep: boolean; steps: boolean }): Promise<AppleHealthDiagnostic> {
    const healthKit = await requireAvailableHealthKit();
    const day = dayRange(dateId);
    const sleep = sleepRange(dateId);
    const toRead = [permissions.steps ? STEP_COUNT : null, permissions.sleep ? SLEEP_ANALYSIS : null].filter((value): value is typeof STEP_COUNT | typeof SLEEP_ANALYSIS => value !== null);
    const authorization = toRead.length > 0 ? await healthKit.getRequestStatusForAuthorization({ toRead }) : 0;
    const diagnostic: AppleHealthDiagnostic = {
      checkedAt: new Date().toISOString(),
      dateId,
      requestStatus: authorization === 1 ? 'authorization-required' : authorization === 2 ? 'requested' : 'unknown',
      result: 'empty-or-denied',
      sleep: { dailySamples: 0, asleepSamples: 0, latestSampleAt: null, error: null },
      steps: { dailyValue: null, latestSampleAt: null, error: null },
    };

    if (permissions.steps) {
      try {
        const [statistics, latest] = await Promise.all([
          healthKit.queryStatisticsForQuantity(STEP_COUNT, ['cumulativeSum'], { filter: { date: { ...day, strictStartDate: true, strictEndDate: true } }, unit: 'count' }),
          healthKit.getMostRecentQuantitySample(STEP_COUNT, 'count'),
        ]);
        diagnostic.steps.dailyValue = statistics.sumQuantity?.quantity ?? null;
        diagnostic.steps.latestSampleAt = isoDate(latest?.endDate ?? latest?.startDate);
      } catch (error) {
        diagnostic.steps.error = error instanceof Error ? error.message : '걸음 수 쿼리 실패';
      }
    }

    if (permissions.sleep) {
      try {
        const [samples, latest] = await Promise.all([
          healthKit.queryCategorySamples(SLEEP_ANALYSIS, { filter: { date: { ...sleep, strictStartDate: false, strictEndDate: false } }, limit: 0, ascending: true }),
          healthKit.getMostRecentCategorySample(SLEEP_ANALYSIS),
        ]);
        diagnostic.sleep.dailySamples = samples.length;
        diagnostic.sleep.asleepSamples = samples.filter((sample) => ASLEEP_VALUES.has(sample.value)).length;
        diagnostic.sleep.latestSampleAt = isoDate(latest?.endDate ?? latest?.startDate);
      } catch (error) {
        diagnostic.sleep.error = error instanceof Error ? error.message : '수면 쿼리 실패';
      }
    }

    if (diagnostic.steps.error || diagnostic.sleep.error) diagnostic.result = 'query-error';
    else if (diagnostic.steps.dailyValue !== null || diagnostic.sleep.asleepSamples > 0 || diagnostic.steps.latestSampleAt || diagnostic.sleep.latestSampleAt) diagnostic.result = 'readable';
    return diagnostic;
  },

  async readDailyRecord(dateId: string, permissions: { sleep: boolean; steps: boolean } = { sleep: true, steps: true }): Promise<AutoHealthRecord> {
    const healthKit = await requireAvailableHealthKit();
    const day = dayRange(dateId);
    const sleep = sleepRange(dateId);
    try {
      const toRead = [permissions.steps ? STEP_COUNT : null, permissions.sleep ? SLEEP_ANALYSIS : null].filter((value): value is typeof STEP_COUNT | typeof SLEEP_ANALYSIS => value !== null);
      if (toRead.length === 0) {
        throw new AppleHealthError('NO_HEALTH_DATA', 'Apple 건강에서 가져오도록 선택한 항목이 없어요.');
      }
      const requestStatus = await healthKit.getRequestStatusForAuthorization({ toRead });
      if (requestStatus === 1) {
        throw new AppleHealthError('AUTHORIZATION_REQUIRED', '먼저 건강 데이터 설정에서 Apple 건강을 연결해 주세요.');
      }

      const stepStatistics = permissions.steps
        ? await healthKit.queryStatisticsForQuantity(STEP_COUNT, ['cumulativeSum'], {
          filter: { date: { ...day, strictStartDate: true, strictEndDate: true } },
          unit: 'count',
        })
        : null;
      const sleepSamples = permissions.sleep
        ? await healthKit.queryCategorySamples(SLEEP_ANALYSIS, {
          filter: { date: { ...sleep, strictStartDate: false, strictEndDate: false } },
          limit: 0,
          ascending: true,
        })
        : [];

      const asleepIntervals = mergeIntervals(
        sleepSamples
          .filter((sample) => ASLEEP_VALUES.has(sample.value))
          .map((sample) => ({ start: sample.startDate, end: sample.endDate })),
      );
      const sleepMilliseconds = asleepIntervals.reduce((total, interval) => total + interval.end.getTime() - interval.start.getTime(), 0);
      const steps = stepStatistics?.sumQuantity?.quantity;

      if (sleepMilliseconds === 0 && steps === undefined) {
        throw new AppleHealthError('NO_HEALTH_DATA', 'Apple 건강의 수면·걸음 수 읽기 권한이 꺼져 있거나, 이 날짜에 저장된 기록이 없어요.');
      }

      return {
        sleepDuration: sleepMilliseconds > 0 ? formatDuration(sleepMilliseconds) : '기록 없음',
        bedtime: asleepIntervals[0] ? formatTime(asleepIntervals[0].start) : '기록 없음',
        steps: steps !== undefined ? formatSteps(steps) : '기록 없음',
        source: 'apple-health',
      };
    } catch (error) {
      if (error instanceof AppleHealthError) throw error;
      throw new AppleHealthError('QUERY_FAILED', 'Apple 건강 데이터를 불러오지 못했어요. 건강 앱의 접근 권한을 확인해 주세요.', error);
    }
  },
};
