import Svg, { Circle, G, Path, Rect } from 'react-native-svg';

import { colors } from '@/theme/tokens';

export type SleepPosture = '똑바로' | '왼쪽으로' | '오른쪽으로' | '엎드려서' | '웅크려서' | '상체를 세우고' | '잘 모르겠어요';

export default function SleepPostureIllustration({ posture, selected }: { posture: SleepPosture; selected: boolean }) {
  const ink = selected ? colors.primaryPressed : colors.textSecondary;
  const skin = colors.illustrationSkin;
  const line = colors.border;
  const pillow = selected ? colors.primarySoft : colors.surfaceStrong;
  const common = { fill: 'none', stroke: ink, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, strokeWidth: 2.4 };

  if (posture === '잘 모르겠어요') return <Svg height="88" viewBox="0 0 136 88" width="100%"><Path d="M14 70h108" stroke={line} strokeLinecap="round" strokeWidth="3"/><Rect fill={pillow} height="42" rx="18" width="58" x="39" y="20"/><Path {...common} d="M58 34c1-8 18-9 20 1 2 9-11 9-11 18"/><Circle cx="67" cy="61" fill={ink} r="2.4"/></Svg>;

  if (posture === '똑바로') return <Svg height="88" viewBox="0 0 136 88" width="100%"><Path d="M13 73h110" stroke={line} strokeLinecap="round" strokeWidth="3"/><Rect fill={pillow} height="24" rx="11" stroke={line} strokeWidth="1.4" width="48" x="44" y="9"/><Circle cx="68" cy="27" fill={skin} r="12" stroke={ink} strokeWidth="1.5"/><Path d="M49 46c0-10 8-16 19-16s19 6 19 16l-4 26H53Z" fill={skin} stroke={ink} strokeLinejoin="round" strokeWidth="1.5"/><Path {...common} d="M68 41v24M56 44l5 13M80 44l-5 13"/><Path d="M63 27h10" stroke={ink} strokeLinecap="round" strokeWidth="1.4"/></Svg>;

  if (posture === '엎드려서') return <Svg height="88" viewBox="0 0 136 88" width="100%"><Path d="M13 73h110" stroke={line} strokeLinecap="round" strokeWidth="3"/><Rect fill={pillow} height="22" rx="10" width="45" x="13" y="44"/><Circle cx="48" cy="45" fill={skin} r="12" stroke={ink} strokeWidth="1.5"/><Path d="M56 46c19-9 43-6 59 8l-8 17H54c-7-7-6-18 2-25Z" fill={skin} stroke={ink} strokeLinejoin="round" strokeWidth="1.5"/><Path {...common} d="M61 53 43 66M89 55l16 15"/></Svg>;

  const mirror = posture === '오른쪽으로';
  const curled = posture === '웅크려서';
  return <Svg height="88" viewBox="0 0 136 88" width="100%"><G transform={mirror ? 'translate(136 0) scale(-1 1)' : undefined}><Path d="M13 73h110" stroke={line} strokeLinecap="round" strokeWidth="3"/><Rect fill={pillow} height="23" rx="10" width="44" x="14" y="43"/><Circle cx="49" cy="43" fill={skin} r="12" stroke={ink} strokeWidth="1.5"/><Path d={curled ? 'M58 44c17-7 36 2 42 18l-10 10H57c-8-8-7-21 1-28Z' : 'M58 44c19-5 40 2 53 17l-9 11H57c-8-8-7-21 1-28Z'} fill={skin} stroke={ink} strokeLinejoin="round" strokeWidth="1.5"/><Path {...common} d="M66 54 82 69M101 59l13 12"/></G></Svg>;
}
