import { httpClient } from '@/services/http-client';
import type { RoutineDetailResponse, TodayRoutineResponse } from '@/types/api';

export function getTodayRoutine() {
  return httpClient.get<TodayRoutineResponse>('/api/routines/today');
}

export function getRoutineDetail(routineId: number) {
  return httpClient.get<RoutineDetailResponse>(`/api/routines/${routineId}`);
}
