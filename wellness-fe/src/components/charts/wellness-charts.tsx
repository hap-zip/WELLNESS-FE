import { useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import Svg, { Circle, Line, Path, Rect, Text as SvgText } from 'react-native-svg';
import Animated, { cancelAnimation, Easing, useAnimatedProps, useReducedMotion, useSharedValue, withDelay, withTiming } from 'react-native-reanimated';
import { colors } from '@/theme/tokens';

type ChartPoint = { x: number; y: number; value: number };
type ChartBar = ChartPoint & { width: number; height: number };

const AnimatedPath = Animated.createAnimatedComponent(Path);
const AnimatedRect = Animated.createAnimatedComponent(Rect);
const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const DRAW_DURATION = 850;
const EASE_OUT = Easing.bezier(0.22, 1, 0.36, 1);

function range(values: readonly number[]) {
  const min = Math.min(...values);
  const max = Math.max(...values);
  return { min, span: Math.max(max - min, 1) };
}

export function mkLine(values: readonly number[], width: number, height: number, padding = 18) {
  if (values.length === 0) return { path: '', points: [] as ChartPoint[], length: 0 };
  const { min, span } = range(values);
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;
  const points = values.map((value, index) => ({
    value,
    x: padding + (values.length === 1 ? chartWidth / 2 : chartWidth * index / (values.length - 1)),
    y: padding + chartHeight - ((value - min) / span) * chartHeight,
  }));
  const path = points.map((point, index) => `${index === 0 ? 'M' : 'L'}${point.x.toFixed(2)} ${point.y.toFixed(2)}`).join(' ');
  const length = points.slice(1).reduce((total, point, index) => total + Math.hypot(point.x - points[index].x, point.y - points[index].y), 0);
  return { path, points, length };
}

export function mkBars(values: readonly number[], width: number, height: number, padding = 18, gap = 8) {
  if (values.length === 0) return [] as ChartBar[];
  const max = Math.max(...values, 1);
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;
  const barWidth = Math.max(5, (chartWidth - gap * (values.length - 1)) / values.length);
  return values.map((value, index) => {
    const barHeight = value / max * chartHeight;
    return { value, width: barWidth, height: barHeight, x: padding + index * (barWidth + gap), y: padding + chartHeight - barHeight };
  });
}

export function WellnessLineChart({ labels, values, color = colors.primary, secondaryValues, secondaryColor = colors.danger }: { labels: readonly string[]; values: readonly number[]; color?: string; secondaryValues?: readonly number[]; secondaryColor?: string }) {
  const width = 300;
  const plotHeight = 126;
  const totalHeight = 154;
  const primary = mkLine(values, width, plotHeight, 18);
  const secondary = secondaryValues ? mkLine(secondaryValues, width, plotHeight, 18) : null;
  const animationKey = `${values.join(',')}|${secondaryValues?.join(',') ?? ''}`;

  return (
    <Svg accessibilityLabel="날짜별 추이 선 차트" height={totalHeight} viewBox={`0 0 ${width} ${totalHeight}`} width="100%">
      {[0, 1, 2].map((row) => <Line key={row} stroke={colors.divider} strokeDasharray="3 5" x1="18" x2="282" y1={18 + row * 45} y2={18 + row * 45} />)}
      {secondary?.path ? <DrawingPath color={secondaryColor} delay={90} key={`secondary-${animationKey}`} line={secondary} strokeWidth={2.5} /> : null}
      {primary.path ? <DrawingPath color={color} key={`primary-${animationKey}`} line={primary} strokeWidth={3} /> : null}
      {primary.points.map((point, index) => <AppearingPoint color={color} delay={420 + index * 55} key={`${animationKey}-${index}`} point={point} />)}
      {labels.map((label, index) => {
        const x = 18 + (labels.length === 1 ? 132 : 264 * index / Math.max(labels.length - 1, 1));
        return <SvgText fill={colors.textMuted} fontSize="9" key={`${label}-${index}`} textAnchor="middle" x={x} y="148">{label}</SvgText>;
      })}
    </Svg>
  );
}

function DrawingPath({ color, delay = 0, line, strokeWidth }: { color: string; delay?: number; line: ReturnType<typeof mkLine>; strokeWidth: number }) {
  const reduceMotion = useReducedMotion();
  const progress = useSharedValue(reduceMotion ? 1 : 0);
  useFocusEffect(useCallback(() => {
    progress.value = reduceMotion ? 1 : 0;
    if (!reduceMotion) progress.value = withDelay(120 + delay, withTiming(1, { duration: DRAW_DURATION, easing: EASE_OUT }));
    return () => cancelAnimation(progress);
  }, [delay, progress, reduceMotion]));
  const animatedProps = useAnimatedProps(() => ({ strokeDashoffset: line.length * (1 - progress.value) }));
  return <AnimatedPath animatedProps={animatedProps} d={line.path} fill="none" stroke={color} strokeDasharray={`${line.length} ${line.length}`} strokeLinecap="round" strokeLinejoin="round" strokeWidth={strokeWidth} />;
}

function AppearingPoint({ color, delay, point }: { color: string; delay: number; point: ChartPoint }) {
  const reduceMotion = useReducedMotion();
  const progress = useSharedValue(reduceMotion ? 1 : 0);
  useFocusEffect(useCallback(() => {
    progress.value = reduceMotion ? 1 : 0;
    if (!reduceMotion) progress.value = withDelay(120 + delay, withTiming(1, { duration: 260, easing: EASE_OUT }));
    return () => cancelAnimation(progress);
  }, [delay, progress, reduceMotion]));
  const animatedProps = useAnimatedProps(() => ({ opacity: progress.value, r: 3.5 * progress.value }));
  return <AnimatedCircle animatedProps={animatedProps} cx={point.x} cy={point.y} fill={colors.white} stroke={color} strokeWidth={2} />;
}

export function WellnessBarsChart({ labels, values, color = colors.data }: { labels: readonly string[]; values: readonly number[]; color?: string }) {
  const width = 300;
  const plotHeight = 126;
  const bars = mkBars(values, width, plotHeight, 18, 9);
  const animationKey = values.join(',');
  return (
    <Svg accessibilityLabel="날짜별 막대 차트" height={154} viewBox="0 0 300 154" width="100%">
      {[0, 1, 2].map((row) => <Line key={row} stroke={colors.divider} strokeDasharray="3 5" x1="18" x2="282" y1={18 + row * 45} y2={18 + row * 45} />)}
      {bars.map((bar, index) => <RisingBar bar={bar} color={color} delay={index * 65} key={`${animationKey}-${index}`} />)}
      {bars.map((bar, index) => <SvgText fill={colors.textMuted} fontSize="9" key={`label-${index}`} textAnchor="middle" x={bar.x + bar.width / 2} y="148">{labels[index] ?? ''}</SvgText>)}
    </Svg>
  );
}

function RisingBar({ bar, color, delay }: { bar: ChartBar; color: string; delay: number }) {
  const reduceMotion = useReducedMotion();
  const progress = useSharedValue(reduceMotion ? 1 : 0);
  const baseline = bar.y + bar.height;
  useFocusEffect(useCallback(() => {
    progress.value = reduceMotion ? 1 : 0;
    if (!reduceMotion) progress.value = withDelay(120 + delay, withTiming(1, { duration: 620, easing: EASE_OUT }));
    return () => cancelAnimation(progress);
  }, [delay, progress, reduceMotion]));
  const animatedProps = useAnimatedProps(() => ({ height: bar.height * progress.value, y: baseline - bar.height * progress.value }));
  return <AnimatedRect animatedProps={animatedProps} fill={color} rx={4} width={bar.width} x={bar.x} />;
}
