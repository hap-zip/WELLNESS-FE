import { useCallback, useEffect, useMemo, useState } from 'react';
import { useFocusEffect, useRouter } from 'expo-router';
import { Image, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, ClipPath, Defs, Line, Polyline, Rect } from 'react-native-svg';
import Animated, { cancelAnimation, Easing, useAnimatedProps, useReducedMotion, useSharedValue, withDelay, withTiming } from 'react-native-reanimated';

import { CHEKI } from '@/lib/cheki';
import { HeroChevronGlyph, LockGlyph } from '@/components/glyphs';
import { headerShadow, useScrollElevation } from '@/hooks/use-scroll-header';
import { text } from '@/theme/typography';
import { usePalette } from '@/theme/use-palette';
import {
  CRITERIA_META, DEFAULT_CRITERIA, loadConnectionSeries, loadPatterns, loadRecordedDayCount,
  MAX_CRITERIA, PERIODS, type ConnectionSeries, type CriterionId, type DiscoverPatternView, type Period,
} from './discover.data';

/**
 * `Momgirok v8.dc.html` → `<sc-if value="{{ isDiscover }}">` 블록을 그대로 옮긴 것.
 *
 * 차트는 기록이 있는 만큼 항상 그린다 — 게이트가 걸리는 건 "해석"(히어로 카드)뿐이다.
 * `gateDays`는 실제로 기록된 날 수를 따른다. 프로토타입의 "30일 도달 상태로 미리보기"
 * 버튼은 디자인 QA 용 치트였을 뿐이라 이식하지 않았다 — 실제 사용자가 자기 게이트를
 * 스스로 앞당길 수 있으면 안 된다.
 */

const CHART_W = 320;
const CHART_H = 150;
const CHART_TOP = 15;
const CHART_BOTTOM = 135;
const DRAW_DURATION = 700;
const DRAW_EASE = Easing.out(Easing.cubic);

const AnimatedRect = Animated.createAnimatedComponent(Rect);
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

/** 선이 왼쪽에서 오른쪽으로 그려지는 애니메이션 — stroke-dasharray 대신 클립 사각형을
 * 넓혀가는 방식을 쓴 이유는, 점선(strokeDasharray="2 5" 등) 시리즈는 dasharray 를
 * "그리기 진행률" 용도로 또 쓸 수 없기 때문이다. 데이터가 바뀔 때마다(기간·기준 변경)
 * points 문자열이 바뀌므로 그때마다 처음부터 다시 그려진다. */
function AnimatedSeriesLine({ sr, delay }: { sr: { id: string; pts: string; color: string; width: number; dash?: string }; delay: number }) {
  const reduceMotion = useReducedMotion();
  const progress = useSharedValue(reduceMotion ? 1 : 0);
  useFocusEffect(useCallback(() => {
    progress.value = reduceMotion ? 1 : 0;
    if (!reduceMotion) progress.value = withDelay(120 + delay, withTiming(1, { duration: DRAW_DURATION, easing: DRAW_EASE }));
    return () => cancelAnimation(progress);
  }, [delay, progress, reduceMotion]));
  const clipId = `chart-reveal-${sr.id}`;
  const clipProps = useAnimatedProps(() => ({ width: CHART_W * progress.value }));
  return (
    <>
      <Defs>
        <ClipPath id={clipId}>
          <AnimatedRect animatedProps={clipProps} height={CHART_H} x={0} y={0} />
        </ClipPath>
      </Defs>
      <Polyline clipPath={`url(#${clipId})`} fill="none" points={sr.pts} stroke={sr.color} strokeDasharray={sr.dash} strokeLinecap="round" strokeLinejoin="round" strokeWidth={sr.width} />
    </>
  );
}

function AnimatedMarkPoint({ cx, cy, color, ringColor, delay }: { cx: number; cy: number; color: string; ringColor: string; delay: number }) {
  const reduceMotion = useReducedMotion();
  const progress = useSharedValue(reduceMotion ? 1 : 0);
  useFocusEffect(useCallback(() => {
    progress.value = reduceMotion ? 1 : 0;
    if (!reduceMotion) progress.value = withDelay(120 + delay, withTiming(1, { duration: 320, easing: DRAW_EASE }));
    return () => cancelAnimation(progress);
  }, [delay, progress, reduceMotion]));
  const animatedProps = useAnimatedProps(() => ({ opacity: progress.value, r: 5.5 * progress.value }));
  return <AnimatedCircle animatedProps={animatedProps} cx={cx} cy={cy} fill={color} stroke={ringColor} strokeWidth={3} />;
}

export default function DiscoverScreen() {
  const c = usePalette();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [period, setPeriod] = useState<Period>('30일');
  const [crit, setCrit] = useState<CriterionId[]>(DEFAULT_CRITERIA);
  const [gateDays, setGateDays] = useState(0);
  const [connectionSeries, setConnectionSeries] = useState<ConnectionSeries | null>(null);
  const [patterns, setPatterns] = useState<DiscoverPatternView[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const { elevated, onScroll } = useScrollElevation();

  const loadAll = useCallback(async (nextPeriod: Period, isActive: () => boolean) => {
    const [days, connections, patternList] = await Promise.all([
      loadRecordedDayCount(),
      loadConnectionSeries(nextPeriod),
      loadPatterns(),
    ]);
    if (!isActive()) return;
    setGateDays(days);
    setConnectionSeries(connections);
    setPatterns(patternList);
  }, []);

  useEffect(() => {
    let active = true;
    void loadAll(period, () => active).catch(() => undefined);
    return () => { active = false; };
  }, [loadAll, period]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAll(period, () => true).catch(() => undefined);
    setRefreshing(false);
  };

  const gateOpen = gateDays >= 30;
  const gateLeft = Math.max(0, 30 - gateDays);
  const heroPattern = patterns[0];
  const otherPatterns = patterns.slice(1);
  const n = connectionSeries?.dates.length ?? 0;
  const px = (i: number) => (n <= 1 ? 0 : (i / (n - 1)) * CHART_W);

  const selected = useMemo(() => crit.map((id) => CRITERIA_META.find((x) => x.id === id)!), [crit]);
  const chartTitle = selected.length === 0 ? '기준을 골라주세요' : selected.map((cr) => cr.label).join(' · ');
  const chartStats = selected.slice(0, 2).map((cr) => ({ ...cr, ...(connectionSeries?.stats[cr.id] ?? { stat: '기록 없음', statLabel: '' }) }));
  // 각 기준을 자기 값 범위 안에서 세로로 정규화한다 — 고정된 base/scale 을 쓰면 기준마다
  // 실제 값 폭이 달라 차트 밖으로 선이 넘칠 수 있다(불편 강도가 특히 그랬다). 항상
  // CHART_TOP~CHART_BOTTOM 안에 들어오게 해서 옆 텍스트와 겹치거나 잘리지 않게 한다.
  const series = connectionSeries ? selected.map((cr, i) => {
    const slice = connectionSeries.criteria[cr.id];
    const min = Math.min(...slice);
    const max = Math.max(...slice);
    const span = max - min || 1;
    const yOf = (v: number) => CHART_BOTTOM - ((v - min) / span) * (CHART_BOTTOM - CHART_TOP);
    return {
      ...cr,
      width: i === 0 ? 3 : 2,
      dash: i === 0 ? undefined : cr.dashPattern,
      pts: slice.map((v, j) => `${px(j).toFixed(1)},${yOf(v).toFixed(1)}`).join(' '),
      yLast: yOf(slice[slice.length - 1]),
    };
  }) : [];
  const hasMark = series.length > 0;

  const toggleCriterion = (id: CriterionId) => {
    setCrit((cur) => {
      if (cur.includes(id)) return cur.filter((v) => v !== id);
      if (cur.length >= MAX_CRITERIA) return cur;
      return [...cur, id];
    });
  };

  return (
    <View style={[s.screen, { backgroundColor: c.bg }]}>
      <View style={[s.headerSurface, { backgroundColor: c.card, borderBottomColor: c.g200, paddingTop: insets.top }, elevated && headerShadow]}>
        <View style={s.header}>
          <Text style={[text({ size: 20, weight: 700, tracking: -0.035 }), { color: c.g900 }]}>커넥션</Text>
        </View>
      </View>
      <ScrollView
        onScroll={onScroll}
        refreshControl={<RefreshControl onRefresh={() => void onRefresh()} refreshing={refreshing} tintColor={c.pri} />}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        style={s.body}>

      {/* 핵심 추이를 먼저 보여주고, 아래에서 기간과 비교 기준을 조정한다. */}
      <View style={[s.section, s.chartSection, s.chartSectionFirst, { backgroundColor: c.card }]}>
        <View style={s.chartHead}>
          <Text style={[text({ size: 18, weight: 700, tracking: -0.035 }), s.flex1, { color: c.g900 }]}>{chartTitle}</Text>
          <Text style={[text({ size: 11.5, weight: 600 }), { color: c.g500 }]}>최근 {period}</Text>
        </View>

        <View style={s.chartStats}>
          {chartStats.map((cr, i) => (
            <View key={cr.id} style={[s.statCell, i === 0 && chartStats.length > 1 && { borderRightWidth: 1, borderRightColor: c.g200, paddingRight: 12 }, i ? { paddingLeft: 14 } : null]}>
              <Text numberOfLines={1} style={[text({ size: 22, weight: 700, tracking: -0.045, tabular: true }), { color: cr.colorToken === 'pri' ? c.g900 : cr.color }]}>{cr.stat}</Text>
              <Text style={[text({ size: 11.5, weight: 600 }), s.statLabel, { color: c.g500 }]}>{period} {cr.statLabel}</Text>
            </View>
          ))}
        </View>

        <Svg height={146} style={s.chart} viewBox={`0 0 ${CHART_W} ${CHART_H}`} width="100%">
          <Line stroke={c.g200} strokeWidth={1.5} x1={0} x2={CHART_W} y1={24} y2={24} />
          <Line stroke={c.g200} strokeWidth={1.5} x1={0} x2={CHART_W} y1={79} y2={79} />
          <Line stroke={c.g200} strokeWidth={1.5} x1={0} x2={CHART_W} y1={134} y2={134} />
          {series.map((sr, i) => <AnimatedSeriesLine delay={i * 90} key={sr.id} sr={sr} />)}
          {hasMark ? <AnimatedMarkPoint color={series[0].color} cx={px(n - 1)} cy={series[0].yLast} delay={DRAW_DURATION * 0.7} key={`mark-${series[0].id}`} ringColor={c.card} /> : null}
        </Svg>

        <View style={s.chartLabels}>
          {(connectionSeries?.labels ?? []).map((l, i) => <Text key={`${l}-${i}`} style={[text({ size: 10.5, weight: 600 }), { color: c.g500 }]}>{l}</Text>)}
        </View>

        <View style={[s.legend, { borderTopColor: c.g200 }]}>
          {series.map((sr) => (
            <View key={sr.id} style={s.legendItem}>
              <View style={[s.legendSwatch, { backgroundColor: sr.color }]} />
              <Text style={[text({ size: 11.5, weight: 600 }), { color: c.g600 }]}>{sr.label}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* 기간 · 비교 기준 — padding:12px 20px 16px */}
      <View style={[s.controls, { backgroundColor: c.card }]}>
        <View style={s.periodRow}>
          <Text style={[text({ size: 13, weight: 700 }), { color: c.g700 }]}>기간</Text>
          <View style={s.periodPills}>
            {PERIODS.map((p) => {
              const active = p === period;
              return (
                <Pressable key={p} accessibilityRole="button" accessibilityState={{ selected: active }} onPress={() => setPeriod(p)} style={[s.periodPill, { borderColor: active ? c.g900 : c.g300, backgroundColor: active ? c.g900 : c.card }]}>
                  <Text style={[text({ size: 13, weight: active ? 700 : 500 }), { color: active ? c.card : c.g600 }]}>{p}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={s.criteriaHead}>
          <Text style={[text({ size: 13, weight: 700 }), { color: c.g700 }]}>비교 기준</Text>
          <Text style={[text({ size: 12, weight: 700, tabular: true }), { color: crit.length >= MAX_CRITERIA ? c.priDk : c.g500 }]}>{crit.length} / {MAX_CRITERIA}</Text>
        </View>
        <View style={s.criteriaWrap}>
          {CRITERIA_META.map((cr) => {
            const on = crit.includes(cr.id);
            const full = crit.length >= MAX_CRITERIA && !on;
            return (
              <Pressable
                key={cr.id}
                accessibilityRole="button"
                accessibilityState={{ selected: on, disabled: full }}
                disabled={full}
                onPress={() => toggleCriterion(cr.id)}
                style={[s.criteriaChip, { borderColor: on ? c.g900 : c.g200, backgroundColor: on ? c.g900 : 'transparent', opacity: full ? 0.5 : 1 }]}>
                <View style={[s.criteriaDot, { backgroundColor: on ? cr.color : c.g300 }]} />
                <Text style={[text({ size: 12.5, weight: on ? 700 : 500 }), { color: on ? c.card : full ? c.g400 : c.g600 }]}>{cr.label}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {gateOpen ? (
        heroPattern ? (
          <View style={[s.section, { backgroundColor: c.card }]}>
            <Pressable
              accessibilityRole="button"
              onPress={() => router.push(`/discover/pattern/${heroPattern.id}`)}
              style={({ pressed }) => [s.hero, { backgroundColor: c.priDk, experimental_backgroundImage: `linear-gradient(140deg, ${c.pri}, ${c.priDk})` }, pressed && s.heroPressed]}>
              <View style={s.heroBadge}>
                <Text style={[text({ size: 11, weight: 700 }), { color: '#fff' }]}>가장 뚜렷한 연결</Text>
              </View>
              <Text style={[text({ size: 22, weight: 700, tracking: -0.04, leading: 1.45 }), s.heroTitle, { color: '#fff' }]}>{heroPattern.title}</Text>
              <View style={s.heroFoot}>
                <Text style={[text({ size: 12.5, weight: 600 }), { color: 'rgba(255,255,255,.92)' }]}>{heroPattern.subtitle || heroPattern.periodLabel}</Text>
                <View style={s.heroLink}>
                  <Text style={[text({ size: 12.5, weight: 700 }), { color: '#fff' }]}>자세히</Text>
                  <HeroChevronGlyph color="#fff" />
                </View>
              </View>
            </Pressable>
          </View>
        ) : (
          <View style={[s.section, { backgroundColor: c.card }]}>
            <Text style={[text({ size: 14, weight: 700 }), { color: c.g700 }]}>아직 발견된 패턴이 없어요</Text>
            <Text style={[text({ size: 12.5, leading: 1.7 }), { marginTop: 6, color: c.g500 }]}>기록이 쌓이면 반복되는 흐름을 찾아 알려드릴게요.</Text>
          </View>
        )
      ) : (
        <View style={[s.section, { backgroundColor: c.card }]}>
          <View style={[s.gateCard, { backgroundColor: c.g100 }]}>
            <View style={s.gateHead}>
              <View style={[s.gateIconWrap, { backgroundColor: c.card }]}>
                <LockGlyph color={c.g600} />
              </View>
              <Text style={[text({ size: 12, weight: 700 }), { color: c.g600 }]}>패턴 해석은 30일부터</Text>
            </View>
            <Text style={[text({ size: 19, weight: 700, tracking: -0.04, leading: 1.45 }), s.gateTitle, { color: c.g900 }]}>아래 추이는 지금도{'\n'}모두 볼 수 있어요</Text>
            <Text style={[text({ size: 12.5, leading: 1.7 }), s.gateBody, { color: c.g600 }]}>표본이 얇을 때 “A 때문에 B”라고 말하지 않기 위해, 해석 문장만 30일 이후에 열어요.</Text>

            <View style={s.gateProgressHead}>
              <Text style={[text({ size: 12.5, weight: 700, tabular: true }), { color: c.g800 }]}>{gateDays}일 기록</Text>
              <Text style={[text({ size: 12.5, weight: 700, tabular: true }), { color: c.priDk }]}>해석까지 {gateLeft}일</Text>
            </View>
            <View style={[s.gateTrack, { backgroundColor: c.g200 }]}>
              <View style={[s.gateFill, { width: `${Math.min(100, (gateDays / 30) * 100)}%`, backgroundColor: c.pri }]} />
            </View>
          </View>
        </View>
      )}

      {gateOpen && otherPatterns.length > 0 ? (
        <View style={[s.section, s.insightsSection, { backgroundColor: c.card }]}>
          <View style={s.insightsHead}>
            <Image accessibilityIgnoresInvertColors resizeMode="contain" source={CHEKI.insight} style={s.insightsMascot} />
            <Text style={[text({ size: 18, weight: 700, tracking: -0.035 }), { color: c.g900 }]}>그 밖의 흐름</Text>
          </View>
          <View style={s.insightsList}>
            {otherPatterns.map((it) => (
              <Pressable key={it.id} accessibilityRole="button" onPress={() => router.push(`/discover/pattern/${it.id}`)} style={[s.insightRow, { borderColor: c.g200, backgroundColor: c.card }]}>
                <View style={s.flex1}>
                  <Text style={[text({ size: 14, weight: 700, tracking: -0.03, leading: 1.5 }), { color: c.g900 }]}>{it.title}</Text>
                  <Text style={[text({ size: 11.5 }), s.insightDates, { color: c.g500 }]}>{it.subtitle || it.periodLabel}</Text>
                </View>
              </Pressable>
            ))}
          </View>
          <Text style={[text({ size: 11.5, leading: 1.7 }), s.insightsFootnote, { color: c.g500 }]}>기록된 값 사이의 동시 발생을 보여줄 뿐, 원인이나 진단을 뜻하지 않아요.</Text>
        </View>
      ) : null}

      <View style={{ height: 112 }} />
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1 },
  body: { flex: 1 },
  flex1: { flex: 1, minWidth: 0 },

  header: { height: 52, justifyContent: 'center', paddingHorizontal: 20 },
  headerSurface: { zIndex: 2, borderBottomWidth: StyleSheet.hairlineWidth },

  controls: { marginTop: 10, paddingTop: 16, paddingHorizontal: 20, paddingBottom: 18 },
  periodRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  periodPills: { flexDirection: 'row', gap: 7 },
  periodPill: { height: 36, paddingHorizontal: 16, borderRadius: 19, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },

  criteriaHead: { marginTop: 14, flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' },
  criteriaWrap: { marginTop: 9, flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  criteriaChip: { minHeight: 38, paddingHorizontal: 13, flexDirection: 'row', alignItems: 'center', gap: 7, borderWidth: 1.5, borderRadius: 20 },
  criteriaDot: { width: 7, height: 7, borderRadius: 4 },

  section: { marginTop: 10, padding: 20 },
  chartSection: { paddingTop: 18, paddingHorizontal: 20, paddingBottom: 20 },
  chartSectionFirst: { marginTop: 0 },
  insightsSection: { paddingTop: 18, paddingHorizontal: 20, paddingBottom: 22 },

  hero: { width: '100%', padding: 20, borderRadius: 20 },
  heroPressed: { transform: [{ scale: 0.985 }] },
  heroBadge: { alignSelf: 'flex-start', height: 24, paddingHorizontal: 10, borderRadius: 13, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,.24)' },
  heroTitle: { marginTop: 14 },
  heroFoot: { marginTop: 16, paddingTop: 14, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,.28)', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  heroLink: { flexDirection: 'row', alignItems: 'center', gap: 3 },

  gateCard: { padding: 20, borderRadius: 20 },
  gateHead: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  gateIconWrap: { width: 26, height: 26, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  gateTitle: { marginTop: 13 },
  gateBody: { marginTop: 8 },
  gateProgressHead: { marginTop: 18, flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' },
  gateTrack: { position: 'relative', marginTop: 9, height: 8, borderRadius: 5, overflow: 'hidden' },
  gateFill: { position: 'absolute', left: 0, top: 0, bottom: 0, borderRadius: 5 },

  chartHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  chartStats: { marginTop: 14, flexDirection: 'row' },
  statCell: { flex: 1, minWidth: 0 },
  statLabel: { marginTop: 4 },
  chart: { marginTop: 16, overflow: 'visible' },
  chartLabels: { marginTop: 10, flexDirection: 'row', justifyContent: 'space-between' },
  legend: { marginTop: 14, paddingTop: 13, borderTopWidth: 1, flexDirection: 'row', flexWrap: 'wrap', gap: 16 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendSwatch: { width: 16, height: 3, borderRadius: 2 },

  insightsHead: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  insightsMascot: { width: 32, height: 32 },
  insightsList: { marginTop: 12, gap: 8 },
  insightRow: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderWidth: 1, borderRadius: 16 },
  insightDates: { marginTop: 5 },
  insightsFootnote: { marginTop: 16 },
});
