import { httpClient } from '@/services/http-client';
import type { FeedbackCreateRequest, FeedbackSummaryResponse, PendingFeedbackResponse } from '@/types/api';

export function saveFeedback(payload: FeedbackCreateRequest) {
  return httpClient.post<void>('/api/routine-feedbacks', payload);
}

export function getFeedbackSummary() {
  return httpClient.get<FeedbackSummaryResponse[]>('/api/routine-feedbacks/summary');
}

export function getPendingFeedbacks() {
  return httpClient.get<PendingFeedbackResponse[]>('/api/routine-feedbacks/pending');
}
