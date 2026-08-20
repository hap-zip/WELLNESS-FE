import { getCompletionsByPeriod } from '@/services/backend/routine-completion';
import { wellnessApi } from '@/services/wellness-api';
import { addDays, toLocalDateId } from '@/utils/date';

export const ME_CARE = [
  { key: 'health', label: '건강 데이터', value: '', to: '/settings/health' },
  { key: 'notify', label: '알림 설정', value: '', to: '/settings/notifications' },
] as const;

export const ME_MENU = [
  { key: 'summary', label: '기록 요약 만들기', to: '/reports/setup' },
  { key: 'cards', label: '내가 만든 카드', to: '/reports/cards' },
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

/** 백엔드 ExpertCardRequest.period는 '3days'|'7days'|'14days'|'custom'만 받는다 (ReportPeriod.java 기준). */
export const SUM_PERIODS = ['최근 3일', '최근 7일', '최근 14일'] as const;
/** 백엔드가 받는 항목은 수면·활동·불편·루틴 4가지뿐이라 자세·베개, 피부·사진은 뺐다. */
export const SUM_FIELDS = ['수면', '불편 부위', '활동', '루틴'];
export const DEFAULT_SUM_SELECTION = ['수면', '불편 부위'];

export type MeStats = { streakDays: number; recordedDays: number; completedRoutines: number };

export const EMPTY_ME_STATS: MeStats = { streakDays: 0, recordedDays: 0, completedRoutines: 0 };

async function loadMonthRecordDates(year: number, month: number): Promise<Set<string>> {
  try {
    const response = await wellnessApi.getRecordsMonth(year, month);
    return new Set(response.records.map((record) => record.date));
  } catch {
    return new Set();
  }
}

/** 마이 화면 상단 통계 — 전체 기록 이력을 한 번에 주는 엔드포인트가 없어서
 * 이번 달·지난달 기록과 최근 30일 루틴 완료 기록을 조합해 계산한다. */
export async function loadMeStats(): Promise<MeStats> {
  const todayId = toLocalDateId();
  const today = new Date();
  const previousMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
  const [current, previous, completions] = await Promise.all([
    loadMonthRecordDates(today.getFullYear(), today.getMonth() + 1),
    loadMonthRecordDates(previousMonth.getFullYear(), previousMonth.getMonth() + 1),
    getCompletionsByPeriod(addDays(todayId, -29), todayId).catch(() => []),
  ]);
  const dates = new Set([...current, ...previous]);

  let streakDays = 0;
  let cursor = dates.has(todayId) ? todayId : addDays(todayId, -1);
  while (dates.has(cursor)) {
    streakDays += 1;
    cursor = addDays(cursor, -1);
  }

  const last30 = Array.from({ length: 30 }, (_, i) => addDays(todayId, -i));
  const recordedDays = last30.filter((id) => dates.has(id)).length;

  return { streakDays, recordedDays, completedRoutines: completions.length };
}
