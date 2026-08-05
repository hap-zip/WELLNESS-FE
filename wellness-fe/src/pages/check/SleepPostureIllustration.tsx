import Svg, { Circle, Ellipse, G, Line, Path, Rect } from 'react-native-svg';

export type SleepPosture = '똑바로' | '왼쪽으로' | '오른쪽으로' | '엎드려서' | '웅크려서' | '상체를 세우고' | '잘 모르겠어요';

const INK = '#68778D';
const PERSON = '#AFC5E8';
const PILLOW = '#DDE7F6';
const BED = '#D5DCE6';

export default function SleepPostureIllustration({ posture, selected }: { posture: SleepPosture; selected: boolean }) {
  const accent = selected ? '#285C4D' : INK;

  if (posture === '잘 모르겠어요') {
    return (
      <Svg height="72" viewBox="0 0 120 72" width="120">
        <Ellipse cx="60" cy="60" fill="#EEF2F7" rx="48" ry="6" />
        <Circle cx="60" cy="31" fill={PILLOW} r="22" />
        <Path d="M52 24c1-7 15-8 17 0 2 9-9 9-9 16" fill="none" stroke={accent} strokeLinecap="round" strokeWidth="4" />
        <Circle cx="60" cy="48" fill={accent} r="2.5" />
      </Svg>
    );
  }

  if (posture === '똑바로') {
    return (
      <Svg height="72" viewBox="0 0 120 72" width="120">
        <Rect fill={BED} height="4" rx="2" width="104" x="8" y="61" />
        <Rect fill={PILLOW} height="18" rx="8" stroke={selected ? accent : PILLOW} width="34" x="43" y="8" />
        <Circle cx="60" cy="24" fill={PERSON} r="10" />
        <Path d="M45 38c0-7 6-11 15-11s15 4 15 11l-3 22H48Z" fill={PERSON} />
        <Line stroke={accent} strokeLinecap="round" strokeWidth="2.5" x1="60" x2="60" y1="32" y2="55" />
      </Svg>
    );
  }

  if (posture === '엎드려서') {
    return (
      <Svg height="72" viewBox="0 0 120 72" width="120">
        <Rect fill={BED} height="4" rx="2" width="104" x="8" y="61" />
        <Rect fill={PILLOW} height="16" rx="8" width="35" x="12" y="39" />
        <Circle cx="37" cy="40" fill={PERSON} r="10" />
        <Path d="M43 42c17-8 39-7 56 3l-5 14H45Z" fill={PERSON} />
        <Path d="M46 47 31 56M75 48 88 58" fill="none" stroke={accent} strokeLinecap="round" strokeWidth="3" />
      </Svg>
    );
  }

  if (posture === '상체를 세우고') {
    return <Svg height="72" viewBox="0 0 120 72" width="120"><Path d="M18 61h92M31 61V24h12l11 37" fill="none" stroke={BED} strokeLinecap="round" strokeWidth="4"/><Circle cx="55" cy="23" fill={PERSON} r="10"/><Path d="M55 34c15 1 25 10 28 27H52Z" fill={PERSON}/><Path d="M58 39 73 52" fill="none" stroke={accent} strokeLinecap="round" strokeWidth="3"/></Svg>;
  }

  const left = posture === '왼쪽으로' || posture === '웅크려서';
  return (
    <Svg height="72" viewBox="0 0 120 72" width="120">
      <G transform={left ? undefined : 'translate(120 0) scale(-1 1)'}>
        <Rect fill={BED} height="4" rx="2" width="104" x="8" y="61" />
        <Rect fill={PILLOW} height="17" rx="8" stroke={selected ? accent : PILLOW} width="35" x="13" y="37" />
        <Circle cx="39" cy="38" fill={PERSON} r="10" />
        <Path d={posture === '웅크려서' ? 'M47 40c12-5 30 1 36 12l-8 8H47c-6-5-6-14 0-20Z' : 'M47 40c14-4 33 1 44 12l-8 8H47c-6-5-6-14 0-20Z'} fill={PERSON} />
        <Path d="M55 49 70 58M85 52 98 59" fill="none" stroke={accent} strokeLinecap="round" strokeWidth="3" />
      </G>
    </Svg>
  );
}
