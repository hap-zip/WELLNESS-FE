import Svg, { Circle, Ellipse, G, Path, Text as SvgText } from 'react-native-svg';
import { colors } from '@/theme/tokens';

export type MomiMood = 'happy' | 'neutral' | 'cheer' | 'sleepy' | 'ache';

type Props = { alt?: string; bodyFill?: string; ink?: string; leaf?: string; mood?: MomiMood; showShadow?: boolean; size?: number };

const poses: Record<MomiMood, { armLeft: string; armRight: string; legLeft: string; legRight: string }> = {
  happy: { armLeft: 'M26 68 13 78', armRight: 'M94 68 107 78', legLeft: 'M48 101 43 121', legRight: 'M72 101 77 121' },
  neutral: { armLeft: 'M25 70 14 79', armRight: 'M95 70 106 79', legLeft: 'M49 101 46 121', legRight: 'M71 101 74 121' },
  cheer: { armLeft: 'M26 62 10 46', armRight: 'M94 62 110 46', legLeft: 'M48 101 40 119', legRight: 'M72 101 80 119' },
  sleepy: { armLeft: 'M26 74 15 84', armRight: 'M94 74 105 84', legLeft: 'M50 101 47 120', legRight: 'M70 101 73 120' },
  ache: { armLeft: 'M26 66 34 50', armRight: 'M94 68 105 80', legLeft: 'M49 101 45 121', legRight: 'M71 101 75 121' },
};

export function Momi({ alt = '몸기록 캐릭터 몸이', bodyFill = '#FFFDF7', ink = '#2A2F36', leaf = colors.primary, mood = 'happy', showShadow = false, size = 96 }: Props) {
  const pose = poses[mood]; const eyeY = mood === 'sleepy' ? 56 : 55;
  const mouth = { happy: 'M53 66q7 7.5 14 0', neutral: 'M54.5 68h11', cheer: 'M51 64q9 13 18 0q-9 4-18 0Z', sleepy: 'M55 68q5 4.5 10 0', ache: 'M52 69q3.5-4 7 0t7 0' }[mood];
  const common = { fill: 'none', stroke: ink, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, strokeWidth: 4.2 };
  return <Svg accessibilityLabel={alt} height={(size * 132) / 120} role="img" viewBox="0 0 120 132" width={size}>
    {showShadow ? <Ellipse cx="60" cy="126" fill="rgba(42,47,54,.09)" rx="30" ry="5" /> : null}
    <G {...common}><Path d={pose.armLeft} /><Path d={pose.armRight} /><Path d={pose.legLeft} /><Path d={pose.legRight} /></G>
    <Path d="M60 13c20.5 0 36.5 20.5 36 46.5-.5 25.5-14.5 43.5-36 43.5s-35.5-18-36-43.5C23.5 33.5 39.5 13 60 13Z" fill={bodyFill} stroke={ink} strokeLinejoin="round" strokeWidth="4.2" />
    <Path d="M35 74c4 14 13 21 25 21s21-7 25-21c-3 16-12 26-25 26s-22-10-25-26Z" fill="rgba(42,47,54,.055)" />
    <G fill={leaf}><Path d="M61 13c-1-7 2-12 8-13 2 6-1 12-8 13Z" /><Path d="M59 13c-3-5-8-7-13-5 1 5 6 8 13 5Z" opacity={.72} /></G>
    <Ellipse cx="36" cy={mood === 'cheer' ? 69 : 68} fill="#FFD5CE" rx="8.5" ry="5.6" /><Ellipse cx="84" cy={mood === 'cheer' ? 69 : 68} fill="#FFD5CE" rx="8.5" ry="5.6" />
    {(mood === 'happy' || mood === 'neutral') ? <><Ellipse cx="47" cy={eyeY} fill={ink} rx="3.9" ry="4.4" /><Ellipse cx="73" cy={eyeY} fill={ink} rx="3.9" ry="4.4" /><Circle cx="48.4" cy={eyeY - 1.6} fill={bodyFill} r="1.25" /><Circle cx="74.4" cy={eyeY - 1.6} fill={bodyFill} r="1.25" /></> : null}
    {mood === 'cheer' ? <G fill="none" stroke={ink} strokeLinecap="round" strokeWidth="3.8"><Path d={`M42.5 ${eyeY + 2.5}q4.5-5.5 9 0`} /><Path d={`M68.5 ${eyeY + 2.5}q4.5-5.5 9 0`} /></G> : null}
    {mood === 'sleepy' ? <G fill="none" stroke={ink} strokeLinecap="round" strokeWidth="3.8"><Path d={`M42.5 ${eyeY}q4.5 5 9 0`} /><Path d={`M68.5 ${eyeY}q4.5 5 9 0`} /></G> : null}
    {mood === 'ache' ? <G fill="none" stroke={ink} strokeLinecap="round" strokeWidth="3.4"><Path d="M41 44.5 51 48.5" /><Path d="M79 44.5 69 48.5" /></G> : null}
    <Path d={mouth} fill={mood === 'cheer' ? ink : 'none'} stroke={ink} strokeLinecap="round" strokeLinejoin="round" strokeWidth="3.4" />
    {mood === 'sleepy' ? <G fill={ink}><SvgText fontSize="15" fontWeight="800" x="92" y="34">z</SvgText><SvgText fontSize="11" fontWeight="800" x="102" y="22">z</SvgText></G> : null}
    {mood === 'ache' ? <G fill="none" opacity={.9} stroke="#FF6B6B" strokeLinecap="round" strokeWidth="3.4"><Path d="M94 52c4-3 4-9 0-12" /><Path d="M102 56c7-6 7-16 0-22" /></G> : null}
    {mood === 'cheer' ? <G fill={leaf}><Path d="M14 30c1.5 4.5 2.5 5.5 7 7-4.5 1.5-5.5 2.5-7 7-1.5-4.5-2.5-5.5-7-7 4.5-1.5 5-2.5 7-7Z" /><Path d="M104 78c1 3.2 1.8 4 5 5-3.2 1-4 1.8-5 5-1-3.2-1.8-4-5-5 3.2-1 4-1.8 5-5Z" opacity={.75} /></G> : null}
  </Svg>;
}
