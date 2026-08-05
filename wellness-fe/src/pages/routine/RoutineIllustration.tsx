import Svg, { Circle, G, Path } from 'react-native-svg';
import type { RoutineStep } from '@/domain/wellness';
import { colors } from '@/theme/tokens';

export default function RoutineIllustration({ step, size = 180 }: { step: RoutineStep; size?: number }) {
  const lean = step.side === 'left' ? -8 : step.side === 'right' ? 8 : 0;
  return <Svg accessibilityLabel={`${step.title} 동작 안내`} height={size} viewBox="0 0 180 180" width={size}>
    <Circle cx="90" cy="90" fill={colors.primarySoft} r="82" />
    <Path d="M50 145 C58 116 69 105 90 105 C111 105 122 116 130 145" fill="#91B5A4" />
    <G rotation={lean} origin="90,92">
      <Circle cx="90" cy="68" fill="#F2C9AE" r="24" />
      <Path d="M76 93 C80 103 100 103 104 93 L112 110 C102 120 78 120 68 110 Z" fill={colors.warning} opacity="0.85" />
      <Path d={step.side === 'center' ? 'M65 117 C75 129 105 129 115 117' : step.side === 'left' ? 'M68 113 C58 93 60 79 72 68' : 'M112 113 C122 93 120 79 108 68'} fill="none" stroke={colors.primary} strokeLinecap="round" strokeWidth="9" />
    </G>
    <Path d={step.side === 'left' ? 'M120 55 C130 64 130 78 120 87' : step.side === 'right' ? 'M60 55 C50 64 50 78 60 87' : 'M68 47 C80 37 100 37 112 47'} fill="none" stroke={colors.primary} strokeDasharray="4 5" strokeLinecap="round" strokeWidth="3" />
  </Svg>;
}
