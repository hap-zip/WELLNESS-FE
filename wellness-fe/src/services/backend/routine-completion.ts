import { httpClient } from '@/services/http-client';
import type { CompletionResponse } from '@/types/api';

export function getCompletionsByPeriod(startDate: string, endDate: string) {
  return httpClient.get<CompletionResponse[]>('/api/routine-completions', { startDate, endDate });
}

export function completeRoutine(dailyRoutineId: number) {
  return httpClient.post<void>('/api/routine-completions', undefined, { dailyRoutineId });
}

export function getCompletionDetail(completionId: number) {
  return httpClient.get<CompletionResponse>(`/api/routine-completions/${completionId}`);
}
