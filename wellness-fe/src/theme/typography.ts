import type { TextStyle } from 'react-native';

/**
 * Pretendard 웨이트 매핑과 CSS → RN 단위 환산.
 *
 * 프로토타입은 `font-size:20px; font-weight:700; letter-spacing:-.035em` 처럼
 * CSS 값으로 적혀 있다. 화면 코드에서 이걸 손으로 환산하다 보면 반올림이 섞이므로
 * `text()` 에 프로토타입 값을 **그대로** 넘기고 환산은 여기서만 한다.
 *
 *   text({ size: 20, weight: 700, tracking: -0.035 })
 *   → { fontFamily: 'Pretendard-Bold', fontSize: 20, letterSpacing: -0.7 }
 */

export type Weight = 400 | 500 | 600 | 700;

/**
 * iOS 는 fontWeight 숫자만으로 웨이트별 파일을 고르지 못한다. 파일명을 직접 준다.
 * 키는 `scripts/download-fonts.mjs` 가 받는 파일명과 일치해야 한다.
 */
export const fontFamilyFor: Record<Weight, string> = {
  400: 'Pretendard-Regular',
  500: 'Pretendard-Medium',
  600: 'Pretendard-SemiBold',
  700: 'Pretendard-Bold',
};

/** expo-font `useFonts()` 에 넘길 맵. */
export const fontAssets = {
  'Pretendard-Regular': require('../../assets/fonts/Pretendard-Regular.otf'),
  'Pretendard-Medium': require('../../assets/fonts/Pretendard-Medium.otf'),
  'Pretendard-SemiBold': require('../../assets/fonts/Pretendard-SemiBold.otf'),
  'Pretendard-Bold': require('../../assets/fonts/Pretendard-Bold.otf'),
};

/** `letter-spacing:-.035em` + fontSize 20 → -0.7 */
export const tracking = (size: number, em: number) => size * em;

/** `line-height:1.65` + fontSize 14 → 23.1 */
export const leading = (size: number, ratio: number) => size * ratio;

export type TextSpec = {
  /** CSS `font-size` (px) */
  size: number;
  /** CSS `font-weight`. 생략하면 400 (CSS 기본값). */
  weight?: Weight;
  /** CSS `letter-spacing` 의 em 값. `-.035em` → -0.035 */
  tracking?: number;
  /** CSS `line-height` 의 배수. `1.65` → 1.65. 프로토타입에 없으면 넘기지 않는다. */
  leading?: number;
  /** `font-variant-numeric: tabular-nums` */
  tabular?: boolean;
};

/**
 * 프로토타입 CSS 값을 RN TextStyle 로 환산한다.
 *
 * `fontWeight` 는 일부러 넣지 않는다. 웨이트별 파일을 이미 지정했으므로
 * 여기에 fontWeight 를 함께 주면 웹에서 가짜 볼드(synthetic bold)가 덧씌워진다.
 */
export function text(spec: TextSpec): TextStyle {
  const style: TextStyle = {
    fontFamily: fontFamilyFor[spec.weight ?? 400],
    fontSize: spec.size,
  };
  if (spec.tracking !== undefined) style.letterSpacing = tracking(spec.size, spec.tracking);
  if (spec.leading !== undefined) style.lineHeight = leading(spec.size, spec.leading);
  if (spec.tabular) style.fontVariant = ['tabular-nums'];
  return style;
}

/**
 * 핸드오프 문서의 타이포 스케일. 여러 화면에서 반복되는 역할만 이름을 붙였다.
 * 한 화면에서만 쓰는 크기는 여기 넣지 말고 화면에서 `text()` 로 직접 적는다.
 */
export const type = {
  /** 탭 루트 화면 제목 — 화면당 1회 */
  screenTitle: text({ size: 20, weight: 700, tracking: -0.035 }),
  /** 플로우 질문 제목 */
  flowTitle: text({ size: 24, weight: 700, tracking: -0.04, leading: 1.42 }),
  /** 큰 숫자 (루틴 타이머) */
  timer: text({ size: 48, weight: 700, tracking: -0.055, tabular: true }),
  /** 섹션 제목 */
  sectionTitle: text({ size: 18, weight: 700, tracking: -0.035 }),
  /** 스택 헤더 제목 */
  stackTitle: text({ size: 16, weight: 700, tracking: -0.03 }),
  /** 리스트 항목 */
  listItem: text({ size: 15, weight: 600, tracking: -0.025 }),
  /** 카드 제목 */
  cardTitle: text({ size: 14.5, weight: 700, tracking: -0.03 }),
  /** 본문 */
  body: text({ size: 14, leading: 1.7 }),
  /** 값 표시 */
  value: text({ size: 13.5, weight: 700, tracking: -0.025, tabular: true }),
  /** 보조 텍스트 */
  caption: text({ size: 12.5, weight: 600 }),
  /** 라벨 */
  label: text({ size: 11, weight: 700 }),
} as const;
