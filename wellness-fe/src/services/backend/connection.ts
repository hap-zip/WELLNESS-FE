import { httpClient } from '@/services/http-client';
import type { PainConnectionResponse } from '@/types/api';

export function getConnections(startDate: string, endDate: string) {
  return httpClient.get<PainConnectionResponse[]>('/api/connections', { startDate, endDate });
}

export function getDailySummary(date: string) {
  return httpClient.get<PainConnectionResponse>(`/api/connections/daily/${date}`);
}
