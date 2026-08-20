import { httpClient } from '@/services/http-client';
import type { DailyCheckRequest, DailyCheckResponse, RecordsMonthResponse } from '@/types/api';

export function getDailyChecksMonth(year: number, month: number) {
  return httpClient.get<RecordsMonthResponse>('/api/v1/daily-checks', { year, month });
}

/** date를 생략하면 서버에서 오늘 날짜로 저장한다. */
export function saveDailyCheck(payload: DailyCheckRequest, date?: string) {
  return httpClient.post<DailyCheckResponse>('/api/v1/daily-checks', payload, { date });
}

export function getDailyCheckDetail(date: string) {
  return httpClient.get<DailyCheckResponse>(`/api/v1/daily-checks/${date}`);
}

export function updateDailyCheck(date: string, payload: DailyCheckRequest) {
  return httpClient.patch<DailyCheckResponse>(`/api/v1/daily-checks/${date}`, payload);
}

export function deleteDailyCheck(date: string) {
  return httpClient.delete<void>(`/api/v1/daily-checks/${date}`);
}
