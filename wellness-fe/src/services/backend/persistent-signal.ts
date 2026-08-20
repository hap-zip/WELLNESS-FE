import { httpClient } from '@/services/http-client';
import type { PersistentSignalResponse } from '@/types/api';

/** 최근 7일 기록 기반 지속(반복) 신호 검사 — 조건 충족 시 새 신호를 저장한다. */
export function checkPersistentSignals() {
  return httpClient.get<PersistentSignalResponse[]>('/api/v1/persistent-signals/check');
}

/** 최근 7일을 앞/뒤로 나눠 평균 통증 강도 상승폭을 비교하는 악화 신호 검사. */
export function checkWorseningSignals() {
  return httpClient.get<PersistentSignalResponse[]>('/api/v1/persistent-signals/check-worsening');
}

/** 같은 부위 루틴을 3회 이상 완료했지만 개선 피드백이 없을 때의 무개선 신호 검사. */
export function checkNoImprovementSignals() {
  return httpClient.get<PersistentSignalResponse[]>('/api/v1/persistent-signals/check-no-improvement');
}
