/**
 * `Momgirok v8.dc.html` → `isDiscover` 블록의 `CRITERIA`·시연 데이터를 그대로 옮긴 것.
 * 색상·수치를 하나도 바꾸지 않았다. 실데이터로 바꿀 때는 이 모듈만 API 응답으로 교체한다.
 */

export const PERIODS = ['30일', '60일', '90일'] as const;
export type Period = (typeof PERIODS)[number];

export type CriterionId = 'sleep' | 'ache' | 'pose' | 'steps' | 'skin' | 'routine';

export type Criterion = {
  id: CriterionId;
  label: string;
  /** #93C90F 등 리터럴은 팔레트의 pri/danger 와 같은 값이라 화면에서 c.pri/c.danger 로 대응한다. */
  colorToken: 'pri' | 'danger' | 'literal';
  color: string;
  statLabel: string;
  stat: string;
  base: number;
  scale: number;
  dashPattern: string;
  vals: number[];
};

export const CRITERIA: Criterion[] = [
  { id: 'sleep', label: '수면', colorToken: 'pri', color: '#93C90F', statLabel: '평균 수면', stat: '6시간 22분', base: 4.5, scale: 33, dashPattern: '0',
    vals: [7.2, 5.4, 6.8, 5.1, 6.4, 7.0, 6.2, 5.8, 6.9, 6.1, 6.45, 5.9, 6.6] },
  { id: 'ache', label: '불편 강도', colorToken: 'danger', color: '#FF3B3B', statLabel: '불편 기록', stat: '9일', base: -3.4, scale: 30, dashPattern: '2 5',
    vals: [0, 2, 1, 3, 1, 0, 1, 2, 0, 2, 2, 3, 2] },
  { id: 'pose', label: '수면 자세', colorToken: 'literal', color: '#8B5CF6', statLabel: '옆으로 잔 날', stat: '21일', base: -1.6, scale: 26, dashPattern: '6 4',
    vals: [2, 1, 2, 1, 2, 2, 1, 1, 2, 2, 1, 1, 2] },
  { id: 'steps', label: '활동', colorToken: 'literal', color: '#0A84FF', statLabel: '평균 걸음', stat: '4,860보', base: 1.4, scale: 21, dashPattern: '6 4',
    vals: [5.2, 3.1, 6.4, 2.8, 4.9, 6.8, 4.1, 3.4, 5.8, 4.2, 4.9, 3.2, 5.4] },
  { id: 'skin', label: '피부', colorToken: 'literal', color: '#F5A623', statLabel: '건조했던 날', stat: '14일', base: -1.8, scale: 25, dashPattern: '6 4',
    vals: [1, 2, 1, 3, 2, 1, 2, 2, 1, 2, 3, 3, 2] },
  { id: 'routine', label: '루틴', colorToken: 'literal', color: '#00A98F', statLabel: '실행한 날', stat: '7일', base: -2.4, scale: 34, dashPattern: '6 4',
    vals: [1, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 0, 1] },
];

export const DEFAULT_CRITERIA: CriterionId[] = ['sleep', 'ache'];
export const MAX_CRITERIA = 3;

/** 기간 pill 은 30/60/90 이지만 60·90 모두 표본 개수는 13개다 — 프로토타입 그대로. */
export function pointCount(period: Period) {
  return period === '30일' ? 11 : 13;
}

export const CHART_LABELS: Record<Period, string[]> = {
  '30일': ['7/15', '7/24', '8/3', '8/13'],
  '60일': ['6/15', '7/5', '7/25', '8/13'],
  '90일': ['5/16', '6/15', '7/15', '8/13'],
};

export const GATE_GAPS: { key: string; label: string; count: string; icon: 'sleep' | 'skin' | 'routine' }[] = [
  { key: 'a', label: '수면 자세', count: '12일 누락', icon: 'sleep' },
  { key: 'b', label: '피부 상태', count: '9일 누락', icon: 'skin' },
  { key: 'c', label: '루틴 실행', count: '5회 기록', icon: 'routine' },
];

export const HERO_TITLE = '수면이 6시간보다 짧았던\n다음 날, 어깨가 아팠어요';
export const HERO_MATCH_COUNT = '3번';

export const INSIGHTS: { key: string; count: string; title: string; dates: string; tone: 'ok' | 'bad' }[] = [
  { key: 'a', count: '2회', title: '루틴을 한 날은 다음 날 불편 강도가 1단계 낮았어요', dates: '8월 7일 · 8월 9일', tone: 'ok' },
  { key: 'b', count: '4회', title: '오래 앉아 있던 날 어깨 불편이 함께 기록됐어요', dates: '8월 3일 · 6일 · 10일 · 11일', tone: 'bad' },
];

/** 실제 기록 일수를 아직 못 불러왔을 때 잠깐 보이는 초기값. */
export const DEFAULT_GATE_DAYS = 18;
