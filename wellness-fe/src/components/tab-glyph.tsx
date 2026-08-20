import Svg, { Circle, Path } from 'react-native-svg';

import { usePalette } from '@/theme/use-palette';

/**
 * `Momgirok v8.dc.html` → `GLYPH` / `tabIcon()` 를 그대로 옮긴 것.
 * 24 그리드, 획 1.85, 라운드 캡/조인. 비활성은 선(line), 활성은 면(solid).
 * path 문자열을 한 글자도 고치지 않는다.
 */

type Dot = readonly [number, number];

const GLYPH = {
  home: {
    line: [
      'M3.9 10.3a2.1 2.1 0 0 1 .79-1.65l6.0-4.72a2.1 2.1 0 0 1 2.62 0l6.0 4.72a2.1 2.1 0 0 1 .79 1.65V18.9a2.1 2.1 0 0 1-2.1 2.1H6a2.1 2.1 0 0 1-2.1-2.1Z',
      'M9.6 21v-4.7a2.4 2.4 0 0 1 4.8 0V21',
    ],
    solid: [
      'M3.9 10.3a2.1 2.1 0 0 1 .79-1.65l6.0-4.72a2.1 2.1 0 0 1 2.62 0l6.0 4.72a2.1 2.1 0 0 1 .79 1.65V18.9a2.1 2.1 0 0 1-2.1 2.1h-3.6v-4.7a2.4 2.4 0 0 0-4.8 0V21H6a2.1 2.1 0 0 1-2.1-2.1Z',
    ],
  },
  records: {
    line: [
      'M3.8 7.4a2.1 2.1 0 0 1 2.1-2.1h12.2a2.1 2.1 0 0 1 2.1 2.1v11.5a2.1 2.1 0 0 1-2.1 2.1H5.9a2.1 2.1 0 0 1-2.1-2.1Z',
      'M3.8 9.9h16.4', 'M8.2 3.2v3.6', 'M15.8 3.2v3.6',
    ],
    dots: [[8.1, 13.6], [12, 13.6], [15.9, 13.6], [8.1, 17.4], [12, 17.4]] as Dot[],
    solid: [
      'M3.8 9.9h16.4v9a2.1 2.1 0 0 1-2.1 2.1H5.9a2.1 2.1 0 0 1-2.1-2.1Z',
      'M5.9 5.3h12.2a2.1 2.1 0 0 1 2.1 2.1v1H3.8v-1a2.1 2.1 0 0 1 2.1-2.1Z',
    ],
    solidLine: ['M8.2 3.2v3.6', 'M15.8 3.2v3.6'],
    knockDots: [[8.1, 13.6], [12, 13.6], [15.9, 13.6], [8.1, 17.4], [12, 17.4]] as Dot[],
  },
  discover: {
    line: [
      'M6.5 5.2a3.4 3.4 0 1 1 0 6.8 3.4 3.4 0 0 1 0-6.8Z',
      'M17.5 12a3.4 3.4 0 1 1 0 6.8 3.4 3.4 0 0 1 0-6.8Z',
      'M9.5 10.5c2 1.2 3.6 2.6 5.1 4.1',
    ],
    solid: [
      'M6.5 5a3.6 3.6 0 1 1 0 7.2 3.6 3.6 0 0 1 0-7.2Z',
      'M17.5 11.8a3.6 3.6 0 1 1 0 7.2 3.6 3.6 0 0 1 0-7.2Z',
    ],
    solidLine: ['M9.5 10.5c2 1.2 3.6 2.6 5.1 4.1'],
  },
  me: {
    line: [
      'M12 3c2.4 0 4.2 2.1 4.15 4.7C16.1 10.2 14.5 12 12 12S7.9 10.2 7.85 7.7C7.8 5.1 9.6 3 12 3Z',
      'M4.6 21c.55-4.1 3.35-6.3 7.4-6.3s6.85 2.2 7.4 6.3',
    ],
    solid: [
      'M12 3c2.4 0 4.2 2.1 4.15 4.7C16.1 10.2 14.5 12 12 12S7.9 10.2 7.85 7.7C7.8 5.1 9.6 3 12 3Z',
      'M12 14.2c4.35 0 7.35 2.5 7.9 6.8H4.1c.55-4.3 3.55-6.8 7.9-6.8Z',
    ],
  },
} as const;

/** 중앙 FAB — 조약돌(몸) 면 채움 + 그린 녹아웃 더하기 */
const CHECK = {
  solid: ['M12 3.4c3.9 0 6.9 3.6 6.8 8.2-.1 4.5-2.6 7.7-6.8 7.7s-6.7-3.2-6.8-7.7C5.1 7 8.1 3.4 12 3.4Z'],
  knock: ['M12 8.6v6', 'M9 11.6h6'],
} as const;

export type TabGlyphName = keyof typeof GLYPH;

const STROKE = 1.85;

export function TabGlyph({ name, active }: { name: TabGlyphName; active: boolean }) {
  const c = usePalette();
  const g = GLYPH[name] as {
    line: readonly string[]; solid: readonly string[];
    solidLine?: readonly string[]; dots?: Dot[]; knockDots?: Dot[];
  };
  const col = active ? c.priDk : c.g500;

  return (
    <Svg width={23} height={23} viewBox="0 0 24 24">
      {active ? (
        <>
          {g.solid.map((d, i) => <Path key={`s${i}`} d={d} fill={col} />)}
          {(g.solidLine ?? []).map((d, i) => (
            <Path key={`sl${i}`} d={d} fill="none" stroke={col} strokeWidth={STROKE + 0.2} strokeLinecap="round" strokeLinejoin="round" />
          ))}
          {(g.knockDots ?? []).map(([cx, cy], i) => <Circle key={`kd${i}`} cx={cx} cy={cy} r={1.25} fill={c.priLightest} />)}
        </>
      ) : (
        <>
          {g.line.map((d, i) => (
            <Path key={`l${i}`} d={d} fill="none" stroke={col} strokeWidth={STROKE} strokeLinecap="round" strokeLinejoin="round" />
          ))}
          {(g.dots ?? []).map(([cx, cy], i) => <Circle key={`d${i}`} cx={cx} cy={cy} r={1.25} fill={col} />)}
        </>
      )}
    </Svg>
  );
}

export function CheckGlyph() {
  const c = usePalette();
  return (
    <Svg width={27} height={27} viewBox="0 0 24 24">
      {CHECK.solid.map((d, i) => <Path key={`s${i}`} d={d} fill="#fff" />)}
      {CHECK.knock.map((d, i) => (
        <Path key={`k${i}`} d={d} fill="none" stroke={c.pri} strokeWidth={2.5} strokeLinecap="round" />
      ))}
    </Svg>
  );
}
