/**
 * 홈 화면이 그리는 값. 지금은 `Momgirok v8.dc.html` 의 시연 데이터를 그대로 담고
 * 있다 — 프로토타입과 픽셀 단위로 대조하려면 내용이 같아야 하기 때문이다.
 *
 * 레이아웃이 확정되면 이 모듈만 `wellnessApi.getHomeSummary()` 결과로 바꾸면 된다.
 * 화면 컴포넌트는 이 타입에만 의존한다.
 */

export type HomeState = 'done' | 'empty' | 'syncing' | 'error';

export type HomeView = {
  /** 이번 주 기록 */
  week: { recorded: number; total: number; percent: number; pillLabel: string; todayIndex: number };

  /** 오늘의 몸 */
  parts: { id: string; name: string; meta: string; trend: number[] }[];
  facts: { key: string; label: string; value: string; source: string; tone: boolean }[];

  /** 최근 변화 — 30일 게이트 */
  gateDays: number;

  /** 오늘의 루틴 */
  routine: {
    badge: string;
    title: string;
    meta: string[];
    moves: { n: string; name: string; sec: string }[];
  };

  /** 최근 기록 */
  recent: {
    key: string; title: string; time: string; date: string;
    sleep: string; pain: string; tag: string; tone: 'ok' | 'mid' | 'bad';
  }[];
};

export const homeView: HomeView = {
  week: { recorded: 5, total: 7, percent: 71, pillLabel: '오늘까지 5일', todayIndex: 4 },

  parts: [
    { id: 'front-shoulder-left', name: '왼쪽 어깨 앞', meta: '3일째 · 2단계 · 뻐근함', trend: [1, 2, 2, 2] },
    { id: 'front-shoulder-right', name: '오른쪽 어깨 앞', meta: '3일째 · 2단계 · 묵직함', trend: [0, 1, 2, 2] },
  ],

  facts: [
    { key: 'a', label: '수면', value: '6시간 27분', source: 'Apple 건강', tone: false },
    { key: 'b', label: '걸음', value: '4,120보', source: 'Apple 건강', tone: false },
    { key: 'c', label: '불편 강도', value: '2단계', source: '직접 입력', tone: true },
  ],

  gateDays: 18,

  routine: {
    badge: '어깨 3일째라 추천',
    title: '목 주변 가볍게 이완하기',
    meta: ['2분', '강도 가볍게', '목·어깨', '준비물 없음'],
    moves: [
      { n: '1', name: '목 뒤 늘이기', sec: '40초' },
      { n: '2', name: '어깨 으쓱 이완', sec: '40초' },
      { n: '3', name: '가슴 열기', sec: '40초' },
    ],
  },

  recent: [
    { key: 'a', title: '어깨 불편이 이어졌어요', time: '어제 · 오후 9:12', date: '8월 11일', sleep: '6시간 5분', pain: '1단계', tag: '기록됨', tone: 'mid' },
    { key: 'b', title: '몸이 가벼운 날이었어요', time: '8월 8일 · 오후 10:02', date: '8월 8일', sleep: '7시간 10분', pain: '없음', tag: '좋음', tone: 'ok' },
    { key: 'c', title: '허리가 뻐근했어요', time: '8월 5일 · 오후 8:40', date: '8월 5일', sleep: '5시간 40분', pain: '2단계', tag: '주의', tone: 'bad' },
  ],
};

export const WEEK_LABELS = ['일', '월', '화', '수', '목', '금', '토'];
