import type { HkIconId } from '@/components/glyphs';

/**
 * 홈 화면 알림 벨을 눌렀을 때 보여줄 실제 알림 목록의 시연 데이터.
 * v8 프로토타입에는 이 화면이 없어 새로 설계했다 — 기존 디자인 토큰·아이콘만 재사용했다.
 */

export type NotificationKind = 'reminder' | 'insight' | 'routine' | 'system';

export type NotificationItem = {
  id: string;
  kind: NotificationKind;
  icon: HkIconId;
  title: string;
  body: string;
  timeLabel: string;
  read: boolean;
  route: string;
};

export const NOTIFICATIONS: NotificationItem[] = [
  { id: 'n1', kind: 'reminder', icon: 'health', title: '오늘 기록을 아직 안 남겼어요', body: '어젯밤 수면 데이터는 이미 가져왔어요. 1분이면 끝나요.', timeLabel: '2시간 전', read: false, route: '/check/auto' },
  { id: 'n2', kind: 'insight', icon: 'routine', title: '새 연결 패턴을 찾았어요', body: '수면이 6시간보다 짧았던 다음 날, 어깨가 아팠어요.', timeLabel: '5시간 전', read: false, route: '/(tabs)/discover' },
  { id: 'n3', kind: 'routine', icon: 'flame', title: '저녁 스트레칭 루틴 시간이에요', body: '어깨 결림 완화 루틴 · 4분 소요', timeLabel: '어제', read: false, route: '/routine' },
  { id: 'n4', kind: 'system', icon: 'skin', title: '피부 상태 기록이 9일째 비어 있어요', body: '조금만 더 채우면 패턴 해석이 더 정확해져요.', timeLabel: '어제', read: true, route: '/(tabs)/discover' },
  { id: 'n5', kind: 'reminder', icon: 'sleep', title: '8월 12일 기록을 저장했어요', body: '홈과 캘린더에 바로 반영됐어요.', timeLabel: '2일 전', read: true, route: '/(tabs)/records' },
  { id: 'n6', kind: 'system', icon: 'health', title: 'Apple 건강 동기화가 완료됐어요', body: '수면·걸음·활동 3개 항목을 가져왔어요.', timeLabel: '3일 전', read: true, route: '/(tabs)/home' },
];

export const KIND_LABEL: Record<NotificationKind, string> = {
  reminder: '기록 리마인드',
  insight: '커넥션 인사이트',
  routine: '루틴',
  system: '시스템',
};
