/**
 * `Momgirok v8.dc.html` → `isMe` / `isSub*` 블록의 시연 데이터를 그대로 옮긴 것.
 */

export const ME_STATS = [
  { key: '연속 기록', n: '7일', l: '연속 기록' },
  { key: '기록한 날', n: '23일', l: '기록한 날' },
  { key: '완료 루틴', n: '9회', l: '완료 루틴' },
];

export const ME_CARE = [
  { key: 'health', label: '건강 데이터', value: '', to: '/settings/health' },
  { key: 'notify', label: '알림 설정', value: '', to: '/settings/notifications' },
] as const;

export const ME_MENU = [
  { key: 'summary', label: '기록 요약 만들기', to: '/reports/setup' },
  { key: 'consent', label: '동의·데이터 관리', to: '/settings/data' },
  { key: 'account', label: '계정 관리', to: '/settings/account' },
  { key: 'support', label: '서비스 정보·문의', to: '/settings/info' },
] as const;

export type PermRow = { key: string; label: string; sub: string; tag: string; icon: 'sleep' | 'steps' | 'flame' | 'routine'; ok: boolean | null };
export const PERM_ROWS: PermRow[] = [
  { key: '수면 분석', label: '수면 분석', sub: '허용됨 · 오늘 오전 7:02', tag: '허용', icon: 'sleep', ok: true },
  { key: '걸음 수', label: '걸음 수', sub: '허용됨 · 오늘 오전 7:02', tag: '허용', icon: 'steps', ok: true },
  { key: '활동 에너지', label: '활동 에너지', sub: '건강 앱에서 꺼져 있어요', tag: '거부', icon: 'flame', ok: false },
  { key: '운동 기록', label: '운동 기록', sub: '측정된 데이터가 없어요', tag: '없음', icon: 'routine', ok: null },
];

export type NotifyRow = { id: string; k: string; sub: string };
export const NOTIFY_ROWS: NotifyRow[] = [
  { id: 'daily', k: '오늘 상태 기록', sub: '기록하지 않은 날 알림 시간에 한 번' },
  { id: 'routine', k: '추천 루틴', sub: '불편이 이어질 때 짧은 루틴 제안' },
  { id: 'weekly', k: '주간 기록 요약', sub: '월요일 오전에 지난주 정리' },
  { id: 'effect', k: '다음 날 효과 확인', sub: '루틴 다음 날 아침에 한 번' },
  { id: 'persist', k: '증상 지속 확인', sub: '같은 부위가 5일 이상 이어질 때' },
];
export const DEFAULT_NOTIFY_ON = ['daily', 'routine', 'weekly'];

export const TIME_WHEELS = [
  { key: 'ampm', width: 62, rows: ['오전', '오후', ''], sel: 1 },
  { key: 'h', width: 52, rows: ['8', '9', '10'], sel: 1 },
  { key: 'm', width: 52, rows: ['00', '30', ''], sel: 0 },
];

export type ConsentRow = { key: string; label: string; req: '필수' | '선택'; date: string };
export const CONSENT_ROWS: ConsentRow[] = [
  { key: '이용약관', label: '이용약관', req: '필수', date: '2026년 7월 2일 동의' },
  { key: '개인정보 처리방침', label: '개인정보 처리방침', req: '필수', date: '2026년 7월 2일 동의' },
  { key: '건강정보 처리 동의', label: '건강정보 처리 동의', req: '필수', date: '2026년 7월 2일 동의' },
  { key: '마케팅 정보 수신', label: '마케팅 정보 수신', req: '선택', date: '동의하지 않음' },
];

export const DELETE_ROWS = [
  { key: '기간별 기록 삭제', label: '기간별 기록 삭제', sub: '날짜 범위를 골라 삭제해요', danger: false },
  { key: '피부 사진만 삭제', label: '피부 사진만 삭제', sub: '기록은 남기고 사진만 지워요', danger: false },
  { key: '전체 데이터 삭제', label: '전체 데이터 삭제', sub: '모든 기록이 지워져요', danger: true },
];

export const SUM_PERIODS = ['최근 30일', '최근 90일', '직접 선택'] as const;
export const SUM_FIELDS = ['수면', '불편 부위', '강도·느낌', '자세·베개', '활동', '피부·사진', '루틴'];
export const DEFAULT_SUM_SELECTION = ['수면', '불편 부위', '강도·느낌'];

export function sumRangeFor(period: string) {
  return period === '최근 90일' ? '2026.05.16 – 08.13' : '2026.07.15 – 08.13';
}

export const SUM_PREVIEW_ROWS = [
  { key: '기록한 날', k: '기록한 날', v: '27 / 30일' },
  { key: '가장 많이 기록된 부위', k: '가장 많이 기록된 부위', v: '어깨 앞 (14일)' },
  { key: '평균 수면', k: '평균 수면', v: '6시간 22분' },
  { key: '불편 2단계 이상', k: '불편 2단계 이상', v: '9일' },
];
