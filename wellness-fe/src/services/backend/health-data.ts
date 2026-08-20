import { httpClient } from '@/services/http-client';
import type { AutoHealthRecordResponse, HealthDataSyncRequest } from '@/types/api';

export function syncHealthData(payload: HealthDataSyncRequest) {
  return httpClient.post<AutoHealthRecordResponse>('/api/v1/health-data/sync', payload);
}

export function getHealthDataByDate(date: string) {
  return httpClient.get<AutoHealthRecordResponse>(`/api/v1/health-data/daily/${date}`);
}
