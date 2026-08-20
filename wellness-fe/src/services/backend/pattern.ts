import { httpClient } from '@/services/http-client';
import type { PatternResponse } from '@/types/api';

export function getPatterns() {
  return httpClient.get<PatternResponse[]>('/api/patterns');
}

export function getPatternDetail(patternId: number) {
  return httpClient.get<PatternResponse>(`/api/patterns/${patternId}`);
}
