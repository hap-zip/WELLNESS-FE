import Svg, { Ellipse, G, Path } from 'react-native-svg';

import { usePalette } from '@/theme/use-palette';

/**
 * `Momgirok v8.dc.html` 의 전신 도형. viewBox 290×448, 획 3, 라운드 조인/캡.
 * path 를 한 글자도 고치지 않는다 — 홈·기록 플로우·날짜별 상세가 같은 도형을 쓴다.
 */

const FIGURE = [
  'M133 68v12q12 7 24 0V68',
  'M133 78c-13 4-25 12-29 22l-8 32c-3 16 4 36 8 54 4 24 4 46 6 66h70c2-20 2-42 6-66 4-18 11-38 8-54l-8-32c-4-10-16-18-29-22',
  'M104 100c-12 6-20 18-24 32l-18 76c-2 10 6 16 12 10l26-66',
  'M186 100c12 6 20 18 24 32l18 76c2 10-6 16-12 10l-26-66',
  'M110 254c-4 46-6 102-4 170h30c4-68 6-124 7-166',
  'M180 254c4 46 6 102 4 170h-30c-4-68-6-124-7-166',
];

/**
 * 불편 표시 타원의 중심. 프로토타입이 손으로 배치한 값이라 `ZONES` 의 터치
 * 영역 좌표와는 별개다. 화면에서 새로 필요해질 때마다 프로토타입에서 읽어 추가한다.
 */
export const MARK_CENTERS: Record<string, { cx: number; cy: number }> = {
  'front-shoulder-left': { cx: 117, cy: 106 },
  'front-shoulder-right': { cx: 173, cy: 106 },
};

export type BodyMapProps = {
  width: number;
  height: number;
  /** 불편이 기록된 부위 id 목록 */
  marks?: string[];
  /**
   * default: 홈·날짜별 상세의 요약 도형 (g200 채움)
   * onPrimary: 기록 전 홈 히어로처럼 라임 면 위에 얹는 변형
   * selectable: 기록 플로우 2단계 — 터치 영역을 얹는 대상 (figFill 채움)
   * dashed: 캐릭터 뒤에 놓는 점선 실루엣 — 채움 없이 윤곽선만, "아직 채워지지 않음"을 뜻한다
   */
  variant?: 'default' | 'onPrimary' | 'selectable' | 'dashed';
  label?: string;
};

export function BodyMap({ width, height, marks = [], variant = 'default', label }: BodyMapProps) {
  const c = usePalette();
  const onPrimary = variant === 'onPrimary';
  const selectable = variant === 'selectable';
  const dashed = variant === 'dashed';

  return (
    <Svg
      width={width}
      height={height}
      viewBox="0 0 290 448"
      accessibilityRole="image"
      accessibilityLabel={label}>
      <G
        fill={dashed ? 'none' : onPrimary ? 'rgba(255,255,255,.46)' : selectable ? c.figFill : c.g200}
        stroke={dashed ? '#2F4407' : onPrimary ? '#3A5209' : c.figLine}
        strokeWidth={dashed ? 3.4 : 3}
        strokeDasharray={dashed ? '7 6' : undefined}
        strokeLinejoin="round"
        strokeLinecap="round"
        opacity={dashed ? 0.42 : onPrimary ? 0.92 : 1}>
        <Ellipse cx={145} cy={42} rx={25} ry={29} />
        {FIGURE.map((d) => <Path key={d} d={d} />)}
      </G>

      {/* 큰 타원 opacity .2 + 작은 타원 불투명 — 두 겹으로 번지는 표시 */}
      {marks.map((id) => {
        const p = MARK_CENTERS[id];
        if (!p) return null;
        return <Ellipse key={`h${id}`} cx={p.cx} cy={p.cy} rx={25} ry={18} fill={c.danger} opacity={0.2} />;
      })}
      {marks.map((id) => {
        const p = MARK_CENTERS[id];
        if (!p) return null;
        return <Ellipse key={`c${id}`} cx={p.cx} cy={p.cy} rx={13} ry={9.5} fill={c.danger} />;
      })}
    </Svg>
  );
}
