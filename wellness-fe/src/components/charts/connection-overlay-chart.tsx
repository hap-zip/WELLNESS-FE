import { useEffect } from 'react';
import Svg, { Circle, Line, Path, Rect, Text as SvgText } from 'react-native-svg';
import Animated, { Easing, useAnimatedProps, useReducedMotion, useSharedValue, withTiming } from 'react-native-reanimated';
import type { ConnectionMetric } from '@/domain/wellness';
import { mkLine } from './wellness-charts';

const AnimatedPath = Animated.createAnimatedComponent(Path);
const WIDTH = 320; const PLOT_HEIGHT = 150; const PADDING = 20;
export default function ConnectionOverlayChart({ labels, metrics, onPointPress, selectedIndex }: { labels: readonly string[]; metrics: readonly ConnectionMetric[]; onPointPress: (index: number) => void; selectedIndex: number | null }) {
  return <Svg accessibilityLabel="선택한 기록을 겹쳐 본 그래프" height={188} viewBox="0 0 320 188" width="100%">
    {[0,1,2,3].map(row=><Line key={row} stroke="#E8EBF0" strokeDasharray="3 5" x1={PADDING} x2={WIDTH-PADDING} y1={PADDING+row*36} y2={PADDING+row*36}/>) }
    {selectedIndex!==null?<Rect fill="#EEF3FF" height={PLOT_HEIGHT-2*PADDING} opacity={.65} rx={7} width={Math.max(18,(WIDTH-2*PADDING)/labels.length)} x={xAt(selectedIndex,labels.length)-Math.max(9,(WIDTH-2*PADDING)/labels.length/2)} y={PADDING}/>:null}
    {metrics.map((metric,index)=><MetricPath delay={index*100} key={`${metric.id}-${metric.values.join(',')}`} metric={metric}/>) }
    {metrics[0]?.values.map((_,index)=>{const x=xAt(index,labels.length);return <Rect accessibilityLabel={`${labels[index]} 기록 보기`} fill="transparent" height={PLOT_HEIGHT} key={`touch-${index}`} onPress={()=>onPointPress(index)} width={Math.max(24,(WIDTH-2*PADDING)/labels.length)} x={x-Math.max(12,(WIDTH-2*PADDING)/labels.length/2)} y="0"/>})}
    {labels.map((label,index)=>{const show=labels.length<=14||index===0||index===labels.length-1||index%Math.ceil(labels.length/7)===0;return show?<SvgText fill="#767F78" fontSize="8.5" key={`${label}-${index}`} textAnchor="middle" x={xAt(index,labels.length)} y="180">{label}</SvgText>:null})}
  </Svg>;
}
function xAt(index:number,count:number){return PADDING+(count===1?(WIDTH-2*PADDING)/2:(WIDTH-2*PADDING)*index/Math.max(count-1,1))}
function MetricPath({delay,metric}:{delay:number;metric:ConnectionMetric}){const line=mkLine(metric.values,WIDTH,PLOT_HEIGHT,PADDING);const reduce=useReducedMotion();const progress=useSharedValue(reduce?1:0);useEffect(()=>{progress.value=reduce?1:0;if(!reduce)progress.value=withTiming(1,{duration:800+delay,easing:Easing.out(Easing.cubic)})},[delay,line.path,progress,reduce]);const props=useAnimatedProps(()=>({strokeDashoffset:line.length*(1-progress.value)}));return <>{line.path?<AnimatedPath animatedProps={props} d={line.path} fill="none" stroke={metric.color} strokeDasharray={`${line.length} ${line.length}`} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.8"/>:null}{line.points.map((point,index)=><Circle cx={point.x} cy={point.y} fill="#FFF" key={index} r="2.8" stroke={metric.color} strokeWidth="1.8"/>)}</>}
