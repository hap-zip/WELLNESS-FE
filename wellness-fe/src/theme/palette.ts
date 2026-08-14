/**
 * `Momgirok v8.dc.html` → `palette()` 를 그대로 옮긴 것.
 *
 * 키 이름을 프로토타입과 똑같이 유지한다. 화면 코드가 `c.g900`, `c.priLightest`
 * 처럼 프로토타입의 CSS와 1:1로 대응해야 옮긴 값이 맞는지 나중에 대조할 수 있다.
 * 여기 있는 hex 는 하나도 바꾸지 않는다.
 */

export type Palette = {
  bg: string; card: string;
  g100: string; g200: string; g300: string; g400: string; g500: string;
  g600: string; g700: string; g800: string; g900: string;
  pri: string; priDk: string; priLightest: string;
  danger: string; dangerBg: string; dangerDk: string;
  info: string; figFill: string; figLine: string;
};

export const lightPalette: Palette = {
  bg: '#F1F3F5', card: '#FFFFFF', g100: '#F7F8F9', g200: '#EFF1F3', g300: '#D5DAE0', g400: '#B3BAC3',
  g500: '#8B939D', g600: '#6B7480', g700: '#4A525C', g800: '#2A2F36', g900: '#16191D',
  pri: '#93C90F', priDk: '#7FAF0C', priLightest: '#F2F9E2', danger: '#FF3B3B', dangerBg: '#FFEBEB', dangerDk: '#D91F1F',
  info: '#0A84FF', figFill: '#FFFFFF', figLine: '#C7CDD4',
};

export const darkPalette: Palette = {
  bg: '#0F1113', card: '#1A1D21', g100: '#1A1D21', g200: '#262A2F', g300: '#343941', g400: '#5C636C',
  g500: '#8B939D', g600: '#A7AEB7', g700: '#C4C9D0', g800: '#E1E4E8', g900: '#F2F4F6',
  pri: '#93C90F', priDk: '#A3D91F', priLightest: '#1F2A10', danger: '#FF6B6B', dangerBg: '#33201F', dangerDk: '#FF8A8A',
  info: '#4DA3FF', figFill: '#262A2F', figLine: '#454B54',
};

/**
 * palette() 밖에서 인라인으로 박혀 있는 색들. 프로토타입에서 이 값들은
 * 라이트/다크 구분 없이 고정이므로 팔레트와 분리해 둔다.
 */
export const fixed = {
  white: '#FFFFFF',

  // 기록 전 홈 히어로 — 라임 면 위에 얹는 짙은 녹색 (`homeEmpty` 블록)
  heroInk: '#1E2D05',      // 제목 · CTA 배경
  heroInkSoft: '#3A5209',  // eyebrow · 하단 캡션 · 바디맵 외곽선

  // 경고(앰버). 시스템 오류(danger 계열)와 반드시 구분한다.
  warnBg: '#FFF6E5', warnText: '#A2761E',
  warnCardBg: '#FFFBF3', warnCardBorder: '#F3E2C6',

  // 오류 카드 — dangerBg 위에 얹는 테두리, 그리고 파괴적 보조 버튼 테두리
  errCardBorder: '#F5D6D6', errBtnBorder: '#E8C4C4',

  // 마스코트 · 앱 아이콘
  leafDk: '#4F6D08', bodyFill: '#FFFDF7',

  // 소셜 로그인
  kakao: '#FEE500', kakaoInk: '#191919', naver: '#03C75A',

  // 라임 스케일 보조 (스펙 패널 · 토스트 테두리)
  priPale: '#DCEBB8', priMid: '#CDE88E',
} as const;

/** 커넥션 비교 기준 6종의 시리즈 색. 순서를 바꾸지 않는다. */
export const seriesColors = {
  sleep: '#93C90F', discomfort: '#FF3B3B', posture: '#8B5CF6',
  activity: '#0A84FF', skin: '#F5A623', routine: '#00A98F',
} as const;

/** 연속 기록(불꽃) 강조색 — seriesColors.skin 과 값은 같지만 용도가 다르다. */
export const streak = '#F5A623';
