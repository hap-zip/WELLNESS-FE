import { httpClient } from '@/services/http-client';
import type { ExpertCardRequest, ExpertCardResponse } from '@/types/api';

export function listExpertCards() {
  return httpClient.get<ExpertCardResponse[]>('/api/v1/expert-cards');
}

export function createExpertCard(payload: ExpertCardRequest) {
  return httpClient.post<ExpertCardResponse>('/api/v1/expert-cards', payload);
}

export function getExpertCard(cardId: number) {
  return httpClient.get<ExpertCardResponse>(`/api/v1/expert-cards/${cardId}`);
}

export function deleteExpertCard(cardId: number) {
  return httpClient.delete<void>(`/api/v1/expert-cards/${cardId}`);
}
