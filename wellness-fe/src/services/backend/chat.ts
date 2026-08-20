import { httpClient } from '@/services/http-client';
import type { ChatRequest, ChatResponse } from '@/types/api';

/**
 * 400(요청 검증 실패)과 401(토큰 무효)도 ChatResponse 스키마로 응답 바디를 내려주므로
 * 일반 에러 throw 대신 상태와 무관하게 바디를 그대로 반환한다.
 */
export function sendChatMessage(payload: ChatRequest) {
  return httpClient.postAllowError<ChatResponse>('/api/chat', payload);
}
