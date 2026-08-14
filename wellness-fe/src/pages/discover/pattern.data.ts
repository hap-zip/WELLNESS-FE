/** `Momgirok v8.dc.html` → 패턴 상세(`isPattern`)의 시연 데이터를 그대로 옮긴 것. */

export type PatternId = 'a' | 'b';

export function isPatternId(v: string): v is PatternId {
  return v === 'a' || v === 'b';
}

export const PATTERN_TAG: Record<PatternId, string> = { a: '가장 뚜렷한 연결', b: '루틴 효과' };
export const PATTERN_TAG_TONE: Record<PatternId, 'danger' | 'primary'> = { a: 'danger', b: 'primary' };

export const PATTERN_TITLE: Record<PatternId, string> = {
  a: '수면이 6시간보다 짧았던 다음 날, 어깨 불편이 함께 기록됐어요',
  b: '루틴을 한 날은 다음 날 불편 강도가 1단계 낮았어요',
};

export const PATTERN_BODY: Record<PatternId, string> = {
  a: '최근 30일 중 수면이 6시간보다 짧았던 날은 9일이었고, 그중 6일은 다음 날 어깨 불편이 2단계 이상으로 기록됐어요. 6시간을 넘긴 날에는 같은 일이 3일이었어요.',
  b: '최근 30일 중 루틴을 실행한 7일 가운데 5일은 다음 날 불편 강도가 낮게 기록됐어요. 실행하지 않은 날과 비교하면 평균 0.8단계 차이예요.',
};

export function patternDataRows(id: PatternId) {
  return [
    { key: '기간', k: '기간', v: '2026.07.15 – 08.13' },
    { key: '기록한 날', k: '기록한 날', v: '30일 중 27일' },
    { key: '사용한 항목', k: '사용한 항목', v: id === 'b' ? '루틴 실행 · 불편 강도' : '수면 시간 · 불편 강도' },
    { key: '해당 / 예외', k: '해당 / 예외', v: id === 'b' ? '5일 / 2일' : '6일 / 3일' },
  ];
}

export const PATTERN_MATCH_COUNT: Record<PatternId, number> = { a: 6, b: 5 };
export const PATTERN_MATCHES: Record<PatternId, { date: string; detail: string }[]> = {
  b: [
    { date: '8월 9일', detail: '루틴 실행 → 다음 날 1단계' },
    { date: '8월 7일', detail: '루틴 실행 → 다음 날 1단계' },
    { date: '8월 2일', detail: '루틴 실행 → 다음 날 없음' },
  ],
  a: [
    { date: '8월 10일', detail: '수면 5시간 40분 → 어깨 2단계' },
    { date: '8월 6일', detail: '수면 5시간 10분 → 어깨 3단계' },
    { date: '8월 3일', detail: '수면 5시간 25분 → 어깨 2단계' },
  ],
};

export const PATTERN_EX_COUNT: Record<PatternId, number> = { a: 3, b: 2 };
export const PATTERN_EXCEPTIONS: Record<PatternId, { date: string; detail: string }[]> = {
  b: [
    { date: '7월 28일', detail: '루틴 실행했지만 다음 날 강도 그대로 — 야근 기록 있음' },
    { date: '7월 21일', detail: '루틴 실행했지만 다음 날 1단계 상승' },
  ],
  a: [
    { date: '8월 1일', detail: '수면 5시간 50분이었지만 불편 없음' },
    { date: '7월 26일', detail: '수면 5시간 30분이었지만 불편 없음 — 운동 기록 있음' },
  ],
};

export const PATTERN_ACTIONS = [
  { key: 'a', title: '목 이완 루틴 시작', meta: '2분 · 3개 동작', icon: 'routine' as const, to: '/routine' as const },
  { key: 'b', title: '이 패턴에 대해 더 묻기', meta: '웰니스 챗에서 기록 기반으로 답해요', icon: 'health' as const, to: '/assistant' as const },
  { key: 'c', title: '전문가 공유용 요약 만들기', meta: '기간과 포함 항목을 골라 카드로', icon: 'skin' as const, to: '/reports/setup' as const },
];
