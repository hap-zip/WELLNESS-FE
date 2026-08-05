import Svg, { Circle, Path } from 'react-native-svg';
import { colors } from '@/theme/tokens';

import { styles } from './home.styles';

export default function HomeSleepChart({ values }: { values: number[] }) {
  if (values.length < 2) return null;
  const width = 310;
  const height = 46;
  const min = Math.min(...values) - 0.5;
  const max = Math.max(...values) + 0.5;
  const points = values.map((value, index) => ({
    x: (index / (values.length - 1)) * width,
    y: height - ((value - min) / (max - min || 1)) * (height - 8) - 4,
  }));
  const line = points.map((point, index) => `${index === 0 ? 'M' : 'L'}${point.x.toFixed(1)} ${point.y.toFixed(1)}`).join(' ');
  const area = `${line} L${width} ${height} L0 ${height} Z`;
  const last = points[points.length - 1];

  return (
    <Svg height={height} viewBox={`0 0 ${width} ${height}`} width="100%" style={styles.sleepChart}>
      <Path d={area} fill={colors.primary} fillOpacity={0.1} />
      <Path d={line} fill="none" stroke={colors.primary} strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.4} />
      <Circle cx={last.x} cy={last.y} fill={colors.primary} r={3.5} />
    </Svg>
  );
}
