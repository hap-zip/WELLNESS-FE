import { getConnections } from '@/services/backend/connection';
import { getPatterns } from '@/services/backend/pattern';
import { getCompletionsByPeriod } from '@/services/backend/routine-completion';
import { wellnessApi } from '@/services/wellness-api';
import { addDays, toLocalDateId, toMonthDayLabel } from '@/utils/date';

export const PERIODS = ['30일', '60일', '90일'] as const;
export type Period = (typeof PERIODS)[number];

/** 백엔드 커넥션 응답에 수면 자세 필드가 없어 벌크로 가져올 방법이 없다 — 그래서 이 기준은 뺐다. */
export type CriterionId = 'sleep' | 'ache' | 'steps' | 'skin' | 'routine';

export type CriterionMeta = {
  id: CriterionId;
  label: string;
  /** #93C90F 등 리터럴은 팔레트의 pri/danger 와 같은 값이라 화면에서 c.pri/c.danger 로 대응한다. */
  colorToken: 'pri' | 'danger' | 'literal';
  color: string;
  dashPattern: string;
};

export const CRITERIA_META: CriterionMeta[] = [
  { id: 'sleep', label: '수면', colorToken: 'pri', color: '#93C90F', dashPattern: '0' },
  { id: 'ache', label: '불편 강도', colorToken: 'danger', color: '#FF3B3B', dashPattern: '2 5' },
  { id: 'steps', label: '활동', colorToken: 'literal', color: '#0A84FF', dashPattern: '6 4' },
  { id: 'skin', label: '피부', colorToken: 'literal', color: '#F5A623', dashPattern: '6 4' },
  { id: 'routine', label: '루틴', colorToken: 'literal', color: '#00A98F', dashPattern: '6 4' },
];

export const DEFAULT_CRITERIA: CriterionId[] = ['sleep', 'ache'];
export const MAX_CRITERIA = 3;

function periodDays(period: Period): number {
  return period === '30일' ? 30 : period === '60일' ? 60 : 90;
}

function formatHours(hours: number) {
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  return m ? `${h}시간 ${m}분` : `${h}시간`;
}

export type ConnectionSeries = {
  dates: string[];
  labels: string[];
  criteria: Record<CriterionId, number[]>;
  stats: Record<CriterionId, { stat: string; statLabel: string }>;
};

/** 기간(30/60/90일)에 대응하는 실제 연결 데이터 — /api/connections + 루틴 완료 기록을 합쳐 만든다. */
export async function loadConnectionSeries(period: Period): Promise<ConnectionSeries> {
  const days = periodDays(period);
  const todayId = toLocalDateId();
  const startId = addDays(todayId, -(days - 1));
  const dates = Array.from({ length: days }, (_, i) => addDays(startId, i));

  const [connections, completions] = await Promise.all([
    getConnections(startId, todayId).catch(() => []),
    getCompletionsByPeriod(startId, todayId).catch(() => []),
  ]);
  const byDate = new Map(connections.map((entry) => [entry.checkDate, entry]));
  const completedDates = new Set(completions.map((c) => c.targetDate).filter((d): d is string => Boolean(d)));

  const sleep: number[] = [];
  const ache: number[] = [];
  const steps: number[] = [];
  const skin: number[] = [];
  const routine: number[] = [];

  for (const date of dates) {
    const entry = byDate.get(date);
    sleep.push(entry?.autoSleepDurationMinutes ? Math.round((entry.autoSleepDurationMinutes / 60) * 10) / 10 : 0);
    const maxIntensity = entry?.painAreas?.length ? Math.max(...entry.painAreas.map((a) => a.intensity ?? 0)) : 0;
    ache.push(maxIntensity);
    steps.push(entry?.autoSteps ? Math.round((entry.autoSteps / 1000) * 10) / 10 : 0);
    skin.push(Math.min(3, entry?.skinStates?.length ?? 0));
    routine.push(completedDates.has(date) ? 1 : 0);
  }

  const recordedSleepDays = sleep.filter((v) => v > 0).length;
  const avgSleep = recordedSleepDays ? sleep.reduce((a, b) => a + b, 0) / recordedSleepDays : 0;
  const recordedStepsDays = steps.filter((v) => v > 0).length;
  const avgSteps = recordedStepsDays ? steps.reduce((a, b) => a + b, 0) / recordedStepsDays : 0;

  const labelCount = 4;
  const labels = Array.from({ length: labelCount }, (_, i) => {
    const index = Math.round((i / (labelCount - 1)) * (dates.length - 1));
    return toMonthDayLabel(dates[index]);
  });

  return {
    dates,
    labels,
    criteria: { sleep, ache, steps, skin, routine },
    stats: {
      sleep: { stat: recordedSleepDays ? formatHours(avgSleep) : '기록 없음', statLabel: '평균 수면' },
      ache: { stat: `${ache.filter((v) => v > 0).length}일`, statLabel: '불편 기록' },
      steps: { stat: recordedStepsDays ? `${Math.round(avgSteps * 1000).toLocaleString('ko-KR')}보` : '기록 없음', statLabel: '평균 걸음' },
      skin: { stat: `${skin.filter((v) => v > 0).length}일`, statLabel: '피부 변화 기록' },
      routine: { stat: `${routine.filter((v) => v > 0).length}일`, statLabel: '실행한 날' },
    },
  };
}

/** 홈과 같은 방식(월별 기록 조회 두 달치)으로 최근 30일 중 실제 기록된 날짜 수를 센다. */
export async function loadRecordedDayCount(): Promise<number> {
  const todayId = toLocalDateId();
  const today = new Date();
  const previousMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
  try {
    const [current, previous] = await Promise.all([
      wellnessApi.getRecordsMonth(today.getFullYear(), today.getMonth() + 1),
      wellnessApi.getRecordsMonth(previousMonth.getFullYear(), previousMonth.getMonth() + 1),
    ]);
    const dates = new Set([...current.records, ...previous.records].map((r) => r.date));
    const last30 = Array.from({ length: 30 }, (_, i) => addDays(todayId, -i));
    return last30.filter((id) => dates.has(id)).length;
  } catch {
    return 0;
  }
}

export type DiscoverPatternView = {
  id: string;
  title: string;
  subtitle: string;
  periodLabel: string;
};

/** 발견된 패턴 목록 — 대응하는 것은 존재/미존재뿐이라, 근거 문장·매칭 날짜 같은 서술은 만들지 않는다. */
export async function loadPatterns(): Promise<DiscoverPatternView[]> {
  try {
    const patterns = await getPatterns();
    return patterns.map((p) => ({
      id: String(p.id ?? ''),
      title: p.patternName ?? '패턴',
      subtitle: [p.sourceMetric, p.targetMetric].filter(Boolean).join(' → ') || (p.patternType ?? ''),
      periodLabel: p.analysisStartDate && p.analysisEndDate ? `${p.analysisStartDate} – ${p.analysisEndDate}` : '',
    }));
  } catch {
    return [];
  }
}
