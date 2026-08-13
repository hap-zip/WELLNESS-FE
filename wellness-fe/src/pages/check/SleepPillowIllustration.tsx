import Svg, { Path } from 'react-native-svg';

import { colors } from '@/theme/tokens';

export type PillowHeight = 'low' | 'medium' | 'high';

const SHAPES: Record<PillowHeight, string> = {
  low: 'M13 42c4-8 12-10 27-10h22c15 0 23 2 27 10l-4 12H17Z',
  medium: 'M13 35c4-9 12-12 27-12h22c15 0 23 3 27 12l-4 19H17Z',
  high: 'M13 27c4-10 12-14 27-14h22c15 0 23 4 27 14l-4 27H17Z',
};

export default function SleepPillowIllustration({ height, selected }: { height: PillowHeight; selected: boolean }) {
  return <Svg height="62" viewBox="0 0 102 62" width="82"><Path d="M10 55h82" stroke={colors.border} strokeLinecap="round" strokeWidth="2"/><Path d={SHAPES[height]} fill={selected ? colors.primarySoft : colors.surfaceStrong} stroke={selected ? colors.primaryPressed : colors.textMuted} strokeLinejoin="round" strokeWidth="2"/><Path d="M24 48c16-5 38-5 54 0" fill="none" stroke={selected ? colors.primaryPressed : colors.border} strokeLinecap="round" strokeWidth="1.5"/></Svg>;
}
