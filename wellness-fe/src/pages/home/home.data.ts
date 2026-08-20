import { wellnessApi } from '@/services/wellness-api';
import { addDays, toLocalDateId, toMonthDayLabel } from '@/utils/date';
import type { WellnessRecordSummary } from '@/domain/wellness';

export type HomeState = 'done' | 'empty' | 'syncing' | 'error';

export type HomeView = {
  /**
   * 이번 주 기록 — recordedByDay는 일(0)~토(6) 순서로, 실제 그 요일에 기록이 있었는지를 담는다.
   * percent는 "기록한 비율"이 아니라 "이번 주가 얼마나 지났는지"(오늘 위치, 0~100)다 —
   * 초록 바/숫자 pill이 오늘 자리에 서고, 그 위의 점들이 어느 요일에 기록했는지 보여준다.
   */
  week: { recorded: number; total: number; percent: number; pillLabel: string; todayIndex: number; recordedByDay: boolean[] };

  /** 오늘의 몸 */
  parts: { id: string; name: string; meta: string; trend: number[] }[];
  facts: { key: string; label: string; value: string; source: string; tone: boolean }[];

  /** 최근 변화 — 30일 게이트 */
  gateDays: number;

  /** 기록 전 히어로에 쓰는, 어제까지 며칠 연속으로 기록했는지 (0이면 문구 자체를 숨긴다). */
  streakDaysBeforeToday: number;

  /** 오늘의 루틴 */
  routine: {
    badge: string;
    title: string;
    /** GIF를 고를 때 부위 키워드로 쓴다 (예: "목·어깨"). */
    targetArea: string;
    meta: string[];
    moves: { n: string; name: string; sec: string }[];
  };

  /** 최근 기록 */
  recent: {
    key: string; title: string; time: string; date: string;
    sleep: string; pain: string; tag: string; tone: 'ok' | 'mid' | 'bad';
  }[];
};

export const WEEK_LABELS = ['일', '월', '화', '수', '목', '금', '토'];

/** 데이터를 불러오기 전/실패했을 때 쓰는 빈 상태. 홈 화면은 이 값으로 먼저 그려진다. */
export const EMPTY_HOME_VIEW: HomeView = {
  week: { recorded: 0, total: 7, percent: Math.round((new Date().getDay() / 6) * 100), pillLabel: '오늘까지 0일', todayIndex: new Date().getDay(), recordedByDay: Array(7).fill(false) },
  parts: [],
  facts: [
    { key: 'a', label: '수면', value: '불러오는 중…', source: '건강 데이터', tone: false },
    { key: 'b', label: '걸음', value: '불러오는 중…', source: '건강 데이터', tone: false },
    { key: 'c', label: '불편 강도', value: '기록 없음', source: '직접 입력', tone: false },
  ],
  gateDays: 0,
  streakDaysBeforeToday: 0,
  routine: { badge: '오늘의 추천', title: '오늘 추천된 루틴이 없어요', targetArea: '', meta: [], moves: [] },
  recent: [],
};

function conditionToneToUi(tone: WellnessRecordSummary['conditionTone']): 'ok' | 'mid' | 'bad' {
  return tone === 'danger' ? 'bad' : tone === 'caution' ? 'mid' : 'ok';
}

/** 정확한 기록 시각은 백엔드가 주지 않아, 상대적인 날짜 표현으로만 안내한다. */
function relativeDayLabel(dateId: string, todayId: string): string {
  if (dateId === todayId) return '오늘';
  if (dateId === addDays(todayId, -1)) return '어제';
  return toMonthDayLabel(dateId);
}

async function loadMonthRecords(year: number, month: number): Promise<Map<string, WellnessRecordSummary>> {
  try {
    const response = await wellnessApi.getRecordsMonth(year, month);
    return new Map(response.records.map((record) => [record.date, record]));
  } catch {
    return new Map();
  }
}

/**
 * 홈 화면 데이터를 백엔드에서 조합한다. 홈 요약을 한 번에 내려주는 엔드포인트가 없어서,
 * 월별 기록·오늘 기록 상세·오늘의 루틴·최근 기록 상세를 여러 번 호출해 화면이 쓰는
 * 모양으로 맞춘다. 각 호출은 실패해도 전체가 죽지 않도록 빈 값으로 넘어간다.
 */
export async function loadHomeView(): Promise<{ view: HomeView; state: HomeState }> {
  const today = new Date();
  const todayId = toLocalDateId(today);
  const previousMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);

  const [currentMonthRecords, previousMonthRecords] = await Promise.all([
    loadMonthRecords(today.getFullYear(), today.getMonth() + 1),
    loadMonthRecords(previousMonth.getFullYear(), previousMonth.getMonth() + 1),
  ]);
  const allRecords = new Map([...previousMonthRecords, ...currentMonthRecords]);

  // "이번 주"는 오늘 기준 최근 7일이 아니라, 오늘이 속한 일~토 달력 주 전체를 뜻한다.
  const weekStart = addDays(todayId, -today.getDay());
  const weekDates = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const recordedByDay = weekDates.map((id) => allRecords.has(id));
  const recordedThisWeek = recordedByDay.filter(Boolean).length;
  const last30 = Array.from({ length: 30 }, (_, i) => addDays(todayId, -i));
  const gateDays = last30.filter((id) => allRecords.has(id)).length;

  // 기록 전 히어로의 "어제까지 N일 연속" — 어제부터 거슬러 올라가며 끊길 때까지 센다.
  let streakDaysBeforeToday = 0;
  for (let cursor = addDays(todayId, -1); allRecords.has(cursor); cursor = addDays(cursor, -1)) {
    streakDaysBeforeToday += 1;
  }

  const todayCheck = await wellnessApi.getDailyCheck(todayId).catch(() => null);
  const hasToday = todayCheck !== null;

  let parts: HomeView['parts'] = [];
  if (todayCheck && todayCheck.discomfort.areas.length > 0) {
    const windowIds = [addDays(todayId, -3), addDays(todayId, -2), addDays(todayId, -1), todayId];
    const windowChecks = await Promise.all(
      windowIds.map((id) => (id === todayId ? Promise.resolve(todayCheck) : wellnessApi.getDailyCheck(id).catch(() => null))),
    );
    parts = todayCheck.discomfort.areas.map((area) => {
      const trend = windowChecks.map((check) => check?.discomfort.areas.find((a) => a.id === area.id)?.intensity ?? 0);
      let streak = 0;
      for (let i = trend.length - 1; i >= 0 && trend[i] > 0; i -= 1) streak += 1;
      const feeling = todayCheck.discomfort.feelings[0] ?? '';
      return {
        id: area.id,
        name: area.label,
        meta: [`${streak}일째`, `${area.intensity}단계`, feeling].filter(Boolean).join(' · '),
        trend,
      };
    });
  }

  const todayIntensity = todayCheck?.discomfort.intensity ?? null;
  const facts: HomeView['facts'] = [
    { key: 'a', label: '수면', value: '불러오는 중…', source: '건강 데이터', tone: false },
    { key: 'b', label: '걸음', value: '불러오는 중…', source: '건강 데이터', tone: false },
    { key: 'c', label: '불편 강도', value: todayIntensity !== null ? `${todayIntensity}단계` : '기록 없음', source: '직접 입력', tone: (todayIntensity ?? 0) >= 2 },
  ];

  const recentDates = [...allRecords.keys()].sort((a, b) => b.localeCompare(a)).slice(0, 3);
  const recentDetails = await Promise.all(recentDates.map((date) => wellnessApi.getRecordDetail(date).catch(() => null)));
  const recent: HomeView['recent'] = recentDates.map((date, index) => {
    const summary = allRecords.get(date)!;
    const detail = recentDetails[index];
    const topArea = summary.bodyParts[0];
    const title = topArea ? `${topArea} 불편이 있었어요` : summary.conditionTone === 'good' ? '몸이 가벼운 날이었어요' : '오늘 상태를 기록했어요';
    return {
      key: date,
      title,
      time: relativeDayLabel(date, todayId),
      date: toMonthDayLabel(date),
      sleep: detail?.sleepDuration ?? '기록 없음',
      pain: summary.intensity ? `${summary.intensity}단계` : '없음',
      tag: summary.conditionTone === 'danger' ? '주의' : summary.conditionTone === 'caution' ? '기록됨' : '좋음',
      tone: conditionToneToUi(summary.conditionTone),
    };
  });

  let routine = EMPTY_HOME_VIEW.routine;
  try {
    const plan = await wellnessApi.getTodayRoutine();
    routine = {
      badge: '오늘의 추천',
      title: plan.title,
      targetArea: plan.targetArea,
      meta: [`${Math.round(plan.totalSeconds / 60)}분`, `강도 ${plan.intensity}`, plan.targetArea, '준비물 없음'].filter(Boolean),
      moves: plan.steps.map((step, index) => ({ n: String(index + 1), name: step.title, sec: `${step.durationSeconds}초` })),
    };
  } catch {
    // 루틴을 불러오지 못해도 나머지 홈 화면은 그대로 보여준다.
  }

  // 초록 바/숫자 pill은 "며칠 기록했는지"가 아니라 "이번 주가 얼마나 지났는지"(오늘 위치)를
  // 가리켜야 한다 — 그래야 각 점(recordedByDay)이 서 있는 자리와 어긋나지 않는다.
  const weekElapsedPercent = Math.round((today.getDay() / 6) * 100);

  const view: HomeView = {
    week: { recorded: recordedThisWeek, total: 7, percent: weekElapsedPercent, pillLabel: `오늘까지 ${recordedThisWeek}일`, todayIndex: today.getDay(), recordedByDay },
    parts,
    facts,
    gateDays,
    streakDaysBeforeToday,
    routine,
    recent,
  };

  return { view, state: hasToday ? 'done' : 'empty' };
}
