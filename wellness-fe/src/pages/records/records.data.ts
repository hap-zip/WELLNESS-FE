/**
 * `Momgirok v8.dc.html` → `isRecords` 블록의 시연 데이터를 그대로 옮긴 것.
 * 홈과 마찬가지로 프로토타입과 픽셀 대조를 하려면 내용이 같아야 해서 고정값을 쓴다.
 * 실데이터로 바꿀 때는 이 모듈만 캘린더 API 응답으로 교체하면 된다.
 */

export type DayTone = 'ok' | 'mid' | 'bad';

/** 기기의 현재 날짜를 기준으로 미래 날짜만 탭 불가 처리한다. */
const now = new Date();
export const TODAY = { year: now.getFullYear(), month: now.getMonth() + 1, day: now.getDate() };

export const DAY_TONE: Record<number, DayTone> = { 5: 'bad', 6: 'ok', 7: 'mid', 8: 'ok', 9: 'mid', 10: 'bad', 11: 'mid', 12: 'bad' };

/** "루틴 완료" 필터용 — 이 날짜에 루틴을 실행했다고 기록된 날. */
export const ROUTINE_DONE_DAYS = [6, 8, 11];

export const DAY_ROWS: { key: string; label: string; value: string; tone: boolean }[] = [
  { key: 'sleep', label: '수면', value: '6시간 27분 · 만족 보통', tone: false },
  { key: 'steps', label: '걸음 수', value: '4,120보', tone: false },
  { key: 'ache', label: '불편 부위', value: '왼쪽·오른쪽 어깨 2단계', tone: true },
  { key: 'activity', label: '활동·피부', value: '가벼운 산책 · 건조함', tone: false },
];

export const DAY_MEMO = '오후에 노트북 오래 봤더니 목 뒤가 뻐근했다.';

export const FILTERS = ['전체', '불편 있음', '루틴 완료'] as const;
export type RecordFilter = (typeof FILTERS)[number];

export const LEGEND: { tone: DayTone; label: string }[] = [
  { tone: 'ok', label: '불편 없음' },
  { tone: 'mid', label: '가벼움' },
  { tone: 'bad', label: '뚜렷함' },
];

export const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

/** 날짜별 상세의 불편 부위 표시 — 홈 바디맵과 같은 두 부위. */
export const DAY_PARTS = [
  { id: 'front-shoulder-left', name: '왼쪽 어깨 앞' },
  { id: 'front-shoulder-right', name: '오른쪽 어깨 앞' },
];

export type HkIconId = 'health' | 'ache' | 'sleep' | 'skin' | 'routine';

export const DAY_GROUPS: {
  key: string; title: string; src: string; icon: HkIconId; tone: boolean; photos: number;
  rows: { key: string; label: string; value: string; tone: boolean }[];
}[] = [
  {
    key: 'auto', title: '자동 수집', src: 'Apple 건강', icon: 'health', tone: false, photos: 0,
    rows: [
      { key: 'sleep', label: '수면 시간', value: '6시간 27분', tone: false },
      { key: 'steps', label: '걸음 수', value: '4,120보', tone: false },
      { key: 'energy', label: '활동 에너지', value: '312kcal', tone: false },
    ],
  },
  {
    key: 'ache', title: '불편', src: '직접 입력', icon: 'ache', tone: true, photos: 0,
    rows: [
      { key: 'left', label: '왼쪽 어깨 앞', value: '2단계 · 뻐근함', tone: true },
      { key: 'right', label: '오른쪽 어깨 앞', value: '2단계 · 묵직함', tone: true },
      { key: 'headache', label: '두통', value: '없음', tone: false },
    ],
  },
  {
    key: 'sleep', title: '수면', src: '직접 입력', icon: 'sleep', tone: false, photos: 0,
    rows: [
      { key: 'quality', label: '만족도', value: '보통이에요', tone: false },
      { key: 'pose', label: '자세', value: '옆으로 잠', tone: false },
      { key: 'pillow', label: '베개 높이', value: '보통', tone: false },
    ],
  },
  {
    key: 'activity', title: '활동·피부', src: '직접 입력', icon: 'skin', tone: false, photos: 2,
    rows: [
      { key: 'sit', label: '앉아 있던 시간', value: '5~8시간', tone: false },
      { key: 'activity', label: '활동', value: '가벼운 산책', tone: false },
      { key: 'skin', label: '피부', value: '건조', tone: false },
      { key: 'trouble', label: '트러블', value: '턱 · 사진 2장', tone: true },
    ],
  },
  {
    key: 'routine', title: '실행한 루틴', src: '기록됨', icon: 'routine', tone: false, photos: 0,
    rows: [
      { key: 'title', label: '목 주변 가볍게 이완하기', value: '오후 9:20 · 1분 58초', tone: false },
      { key: 'effect', label: '다음 날 효과', value: '나아졌어요', tone: false },
    ],
  },
];
