import { getCompletionsByPeriod } from '@/services/backend/routine-completion';
import { wellnessApi } from '@/services/wellness-api';
import { SLEEP_QUALITY_LABELS } from '@/pages/check/check.data';

export type DayTone = 'ok' | 'mid' | 'bad';

/** 기기의 현재 날짜를 기준으로 미래 날짜만 탭 불가 처리한다. */
const now = new Date();
export const TODAY = { year: now.getFullYear(), month: now.getMonth() + 1, day: now.getDate() };

export const FILTERS = ['전체', '불편 있음', '루틴 완료'] as const;
export type RecordFilter = (typeof FILTERS)[number];

export const LEGEND: { tone: DayTone; label: string }[] = [
  { tone: 'ok', label: '불편 없음' },
  { tone: 'mid', label: '가벼움' },
  { tone: 'bad', label: '뚜렷함' },
];

export const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

export type HkIconId = 'health' | 'ache' | 'sleep' | 'skin' | 'routine';

function toDateId(year: number, month: number, day: number) {
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function toneFromIntensity(intensity: number | null): DayTone {
  if (intensity === null) return 'ok';
  if (intensity >= 4) return 'bad';
  if (intensity >= 2) return 'mid';
  return 'ok';
}

/** 백엔드 satisfaction(1~5)을 체크 플로우와 같은 문구로 보여준다. */
function satisfactionLabel(value: number | null): string | null {
  if (value === null) return null;
  return SLEEP_QUALITY_LABELS[SLEEP_QUALITY_LABELS.length - value] ?? `${value}/5`;
}

/** 달력에 찍을 날짜별 상태 — 월별 기록 조회 하나로 계산한다. */
export async function loadMonthTones(year: number, month: number): Promise<Record<number, DayTone>> {
  try {
    const response = await wellnessApi.getRecordsMonth(year, month);
    const tones: Record<number, DayTone> = {};
    for (const record of response.records) {
      const day = Number(record.date.split('-')[2]);
      if (Number.isInteger(day)) tones[day] = toneFromIntensity(record.intensity);
    }
    return tones;
  } catch {
    return {};
  }
}

/** "루틴 완료" 필터용 — 이 달에 실제로 루틴을 완료 처리한 날짜들. */
export async function loadRoutineDoneDays(year: number, month: number): Promise<number[]> {
  try {
    const start = toDateId(year, month, 1);
    const end = toDateId(year, month, new Date(year, month, 0).getDate());
    const completions = await getCompletionsByPeriod(start, end);
    const days = new Set<number>();
    for (const completion of completions) {
      if (!completion.targetDate) continue;
      const day = Number(completion.targetDate.split('-')[2]);
      if (Number.isInteger(day)) days.add(day);
    }
    return [...days];
  } catch {
    return [];
  }
}

export type DayRecordView = {
  tone: DayTone;
  memo: string;
  autoRecords: { sleepDuration: string; bedtime: string; steps: string; activityEnergy: string };
  sleepSatisfactionLabel: string | null;
  posture: string | null;
  pillow: string | null;
  activity: string | null;
  skinStates: string[];
  feelings: string[];
  areas: { id: string; name: string; intensity: number }[];
  routineCompleted: boolean;
};

/** 선택한 날짜의 실제 기록 상세 — daily-check 조회 + 그 날의 루틴 완료 여부를 합친다. */
export async function loadDayRecord(dateId: string): Promise<DayRecordView | null> {
  const check = await wellnessApi.getDailyCheck(dateId).catch(() => null);
  if (!check) return null;
  const completions = await getCompletionsByPeriod(dateId, dateId).catch(() => []);
  return {
    tone: toneFromIntensity(check.discomfort.intensity),
    memo: check.activitySkin.memo,
    autoRecords: check.autoRecords,
    sleepSatisfactionLabel: satisfactionLabel(check.sleep.satisfaction),
    posture: check.sleep.posture,
    pillow: check.sleep.pillow,
    activity: check.activitySkin.activity,
    skinStates: check.activitySkin.skinStates,
    feelings: check.discomfort.feelings,
    areas: check.discomfort.areas.map((area) => ({ id: area.id, name: area.label, intensity: area.intensity })),
    routineCompleted: completions.length > 0,
  };
}
