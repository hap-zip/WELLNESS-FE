import { httpClient } from '@/services/http-client';
import type { HealthConnectionRequest, HealthConnectionResponse } from '@/types/api';

// userId 쿼리 파라미터는 httpClient가 로그인 세션에서 자동으로 붙여준다.
export function getHealthConnection() {
  return httpClient.get<HealthConnectionResponse>('/api/v1/health-connections');
}

export function saveHealthConnection(payload: HealthConnectionRequest) {
  return httpClient.put<HealthConnectionResponse>('/api/v1/health-connections', payload);
}
