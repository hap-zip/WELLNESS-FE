import { useCallback, useMemo } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppIcon, type AppIconName } from '@/components/app-icon';
import HomeAvatar from '@/pages/home/HomeAvatar';
import type { HomeSummary } from '@/domain/wellness';
import { useAsyncData } from '@/hooks/use-async-data';
import { wellnessApi } from '@/services/wellness-api';

/**
 * DIRECTION B — DATA / HEALTH
 * Visual reference: Naver Pay 2025 (https://wwit.design/2025/02/15/npay/) — 자산 홈, 보장 비교 차트.
 * Dev-only preview. Not linked from production navigation.
 */
const B = {
  canvas: '#F5F6F8',
  surface: '#FFFFFF',
  ink: '#191A1C',
  inkSoft: '#5B5E66',
  inkMute: '#9B9EA6',
  line: '#E7E9EE',
  primary: '#2455D6',
  primarySoft: '#EAF0FF',
  positive: '#2455D6',
  caution: '#D65A2A',
} as const;

const EMPTY_HOME: HomeSummary = {
  dateLabel: '', conditionLabel: '', evidence: '', tags: [], recentRecords: [], tips: [],
  insight: { text: '', tags: [] }, routine: { title: '', description: '', duration: '', intensity: '' },
  sleepTrend: { values: [], averageLabel: '', periodLabel: '' }, bodyHighlights: [],
  bodyDetails: { neck:{title:'',lines:[]}, shoulder:{title:'',lines:[]}, chest:{title:'',lines:[]}, upperArm:{title:'',lines:[]}, forearm:{title:'',lines:[]}, abdomen:{title:'',lines:[]}, hip:{title:'',lines:[]}, thigh:{title:'',lines:[]}, knee:{title:'',lines:[]}, calf:{title:'',lines:[]} },
  streakDays: 0, checkState: 'not-started',
};

const PART_LABELS: Record<string, string> = { neck: '목', shoulder: '어깨', chest: '가슴', upperArm: '위팔', forearm: '아래팔', abdomen: '복부', hip: '골반', thigh: '허벅지', knee: '무릎', calf: '종아리' };

const QUICK_STATS: { key: string; icon: AppIconName; label: string }[] = [
  { key: 'condition', icon: 'heart', label: '컨디션' },
  { key: 'sleep', icon: 'trend-up', label: '수면' },
  { key: 'steps', icon: 'arrow-up', label: '걸음' },
  { key: 'discomfort', icon: 'alert', label: '불편' },
];

export default function DesignBScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { data, error, isLoading, reload } = useAsyncData(wellnessApi.getHomeSummary, EMPTY_HOME);
  const home = useMemo(() => ({ ...EMPTY_HOME, ...data }), [data]);
  const done = home.checkState === 'completed';
  useFocusEffect(useCallback(() => { void reload().catch(() => undefined); }, [reload]));

  if (isLoading) return <SafeAreaView style={styles.screen}><View style={styles.center}><ActivityIndicator color={B.primary} /></View></SafeAreaView>;
  if (error) return <SafeAreaView style={styles.screen}><View style={styles.center}><Text>불러오지 못했어요</Text></View></SafeAreaView>;

  const sleepValues = home.sleepTrend.values;
  const maxSleep = Math.max(1, ...sleepValues);
  const latestSleep = sleepValues[sleepValues.length - 1] ?? 0;
  const avgSleep = sleepValues.length ? sleepValues.reduce((a, b) => a + b, 0) / sleepValues.length : 0;
  const deltaPct = avgSleep > 0 ? Math.round(((latestSleep - avgSleep) / avgSleep) * 100) : 0;

  return (
    <SafeAreaView edges={['top']} style={styles.screen}>
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 40 }]} showsVerticalScrollIndicator={false}>
        <View style={styles.topline}>
          <View><Text style={styles.hello}>{home.dateLabel || '오늘'}</Text><Text style={styles.wordmark}>몸 데이터</Text></View>
          <Pressable accessibilityRole="button" style={styles.bellBtn}><AppIcon color={B.ink} name="bell" size={19} /></Pressable>
        </View>

        <View style={styles.quickRow}>
          {QUICK_STATS.map((stat) => (
            <View key={stat.key} style={styles.quickItem}>
              <View style={styles.quickIcon}><AppIcon color={B.primary} name={stat.icon} size={17} /></View>
              <Text style={styles.quickLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>

        <View style={styles.surface}>
          <Text style={styles.surfaceEyebrow}>오늘 상태</Text>
          <Text style={styles.surfaceTitle}>{done ? (home.conditionLabel || '기록 완료') : '아직 기록 전이에요'}</Text>
          {done && home.evidence ? <Text style={styles.surfaceRow}>{home.evidence}</Text> : null}
          {!done ? (
            <Pressable accessibilityRole="button" onPress={() => router.push('/check/auto')} style={({ pressed }) => [styles.primaryButtonCompact, pressed && styles.pressed]}>
              <Text style={styles.primaryButtonCompactText}>기록 시작하기</Text>
            </Pressable>
          ) : null}
        </View>

        <View style={styles.surface}>
          <View style={styles.surfaceHeadRow}><Text style={styles.surfaceEyebrow}>최근 수면</Text>{sleepValues.length ? <Text style={[styles.deltaText, deltaPct < 0 ? styles.deltaDown : styles.deltaUp]}>{deltaPct > 0 ? '+' : ''}{deltaPct}%</Text> : null}</View>
          <View style={styles.sleepRow}>
            <Text style={styles.sleepValue}>{home.sleepTrend.averageLabel || '기록 없음'}</Text>
            <Text style={styles.sleepPeriod}>{home.sleepTrend.periodLabel}</Text>
          </View>
          {sleepValues.length ? (
            <View style={styles.barChart}>
              {sleepValues.map((value, index) => (
                <View key={index} style={styles.barTrack}>
                  <View style={[styles.barFill, { height: `${Math.max(8, (value / maxSleep) * 100)}%` }, index === sleepValues.length - 1 && styles.barFillActive]} />
                </View>
              ))}
            </View>
          ) : null}
          {home.recentPattern ? (
            <View style={styles.compareBlock}>
              <Text style={styles.compareLabel}>발견된 연관</Text>
              <Text style={styles.compareTitle}>{home.recentPattern.title}</Text>
              <Text style={styles.compareDesc}>{home.recentPattern.description}</Text>
            </View>
          ) : null}
        </View>

        <View style={styles.surface}>
          <Text style={styles.surfaceEyebrow}>몸에 남은 신호</Text>
          <View style={styles.bodyRow}>
            <View style={styles.bodyThumb}>
              <HomeAvatar
                defaultFill={B.line}
                defaultStroke={B.surface}
                figureStyle={{ width: 84, height: 116 }}
                hideHint
                highlights={home.bodyHighlights}
                markColor={B.caution}
                onMarkerPress={() => router.push('/(tabs)/records')}
                scale={0.33}
                stageStyle={{ height: 116 }}
                wrapStyle={{ minHeight: 116, width: 84 }}
              />
            </View>
            <View style={styles.bodyList}>
              {home.bodyHighlights.length ? home.bodyHighlights.map((h) => (
                <View key={h.muscle} style={styles.bodyListRow}>
                  <Text style={styles.bodyListLabel}>{PART_LABELS[h.part] ?? h.part}</Text>
                  <View style={styles.intensityTrack}><View style={[styles.intensityFill, { width: `${(h.intensity / 3) * 100}%` }]} /></View>
                  <Text style={styles.bodyListValue}>{h.intensity}/3</Text>
                </View>
              )) : <Text style={styles.surfaceRow}>기록된 불편 부위가 없어요</Text>}
            </View>
          </View>
        </View>

        {home.routine.title ? (
          <Pressable accessibilityRole="button" onPress={() => router.push('/routine')} style={({ pressed }) => [styles.actionSurface, pressed && styles.pressed]}>
            <View style={styles.actionIcon}><AppIcon color={B.primary} name="play" size={16} /></View>
            <View style={styles.actionCopy}>
              <Text style={styles.actionLabel}>오늘 할 행동</Text>
              <Text style={styles.actionTitle}>{home.routine.title}</Text>
              <Text style={styles.actionMeta}>{[home.routine.duration, home.routine.intensity].filter(Boolean).join(' · ')}</Text>
            </View>
            <AppIcon color={B.inkMute} name="chevron-right" size={18} />
          </Pressable>
        ) : null}

        {home.recentRecords.length ? (
          <View style={styles.surface}>
            <Text style={styles.surfaceEyebrow}>최근 기록</Text>
            {home.recentRecords.slice(0, 4).map((record) => (
              <View key={record.id} style={styles.listRow}>
                <View style={styles.listDot} />
                <Text style={styles.listDate}>{record.date}</Text>
                <Text numberOfLines={1} style={styles.listValue}>{record.value}</Text>
              </View>
            ))}
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: B.canvas },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  content: { paddingHorizontal: 16, paddingTop: 6 },

  topline: { minHeight: 52, flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  hello: { color: B.inkMute, fontSize: 12, fontWeight: '600' },
  wordmark: { marginTop: 2, color: B.ink, fontSize: 19, fontWeight: '800', letterSpacing: -0.4 },
  bellBtn: { width: 34, height: 34, borderRadius: 999, alignItems: 'center', justifyContent: 'center', backgroundColor: B.surface, borderWidth: 1, borderColor: B.line },

  quickRow: { flexDirection: 'row', marginTop: 14, backgroundColor: B.surface, borderRadius: 14, paddingVertical: 14, borderWidth: 1, borderColor: B.line },
  quickItem: { flex: 1, alignItems: 'center', gap: 6 },
  quickIcon: { width: 38, height: 38, borderRadius: 999, backgroundColor: B.primarySoft, alignItems: 'center', justifyContent: 'center' },
  quickLabel: { fontSize: 11, fontWeight: '700', color: B.inkSoft },

  surface: { marginTop: 12, padding: 16, borderRadius: 14, backgroundColor: B.surface, borderWidth: 1, borderColor: B.line },
  surfaceHeadRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  surfaceEyebrow: { color: B.inkMute, fontSize: 11.5, fontWeight: '700' },
  surfaceTitle: { marginTop: 6, color: B.ink, fontSize: 20, fontWeight: '800', letterSpacing: -0.3 },
  surfaceRow: { marginTop: 6, color: B.inkSoft, fontSize: 13.5, fontWeight: '500', lineHeight: 19 },
  deltaText: { fontSize: 13, fontWeight: '800' },
  deltaUp: { color: B.positive }, deltaDown: { color: B.caution },

  primaryButtonCompact: { marginTop: 12, minHeight: 42, borderRadius: 10, backgroundColor: B.primary, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 16, alignSelf: 'flex-start' },
  primaryButtonCompactText: { color: '#fff', fontSize: 13.5, fontWeight: '700' },
  pressed: { opacity: 0.75 },

  sleepRow: { flexDirection: 'row', alignItems: 'baseline', gap: 8, marginTop: 4 },
  sleepValue: { color: B.ink, fontSize: 24, fontWeight: '800', letterSpacing: -0.5, fontVariant: ['tabular-nums'] },
  sleepPeriod: { color: B.inkMute, fontSize: 12, fontWeight: '600' },
  barChart: { flexDirection: 'row', alignItems: 'flex-end', gap: 5, height: 56, marginTop: 14 },
  barTrack: { flex: 1, height: '100%', justifyContent: 'flex-end', backgroundColor: B.line, borderRadius: 3, overflow: 'hidden' },
  barFill: { width: '100%', backgroundColor: '#C7D3EE', borderRadius: 3 },
  barFillActive: { backgroundColor: B.primary },
  compareBlock: { marginTop: 14, paddingTop: 12, borderTopWidth: 1, borderColor: B.line },
  compareLabel: { color: B.primary, fontSize: 11, fontWeight: '800' },
  compareTitle: { marginTop: 3, color: B.ink, fontSize: 14.5, fontWeight: '700' },
  compareDesc: { marginTop: 2, color: B.inkMute, fontSize: 12.5, fontWeight: '500' },

  bodyRow: { flexDirection: 'row', alignItems: 'center', gap: 14, marginTop: 8 },
  bodyThumb: { width: 84, alignItems: 'center', justifyContent: 'center' },
  bodyList: { flex: 1, minWidth: 0, gap: 10 },
  bodyListRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  bodyListLabel: { width: 46, color: B.inkSoft, fontSize: 11.5, fontWeight: '700' },
  intensityTrack: { flex: 1, height: 6, borderRadius: 3, backgroundColor: B.line, overflow: 'hidden' },
  intensityFill: { height: '100%', backgroundColor: B.caution, borderRadius: 3 },
  bodyListValue: { width: 28, textAlign: 'right', color: B.inkMute, fontSize: 11, fontWeight: '700', fontVariant: ['tabular-nums'] },

  actionSurface: { marginTop: 12, flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: 14, backgroundColor: B.surface, borderWidth: 1, borderColor: B.line },
  actionIcon: { width: 36, height: 36, borderRadius: 999, backgroundColor: B.primarySoft, alignItems: 'center', justifyContent: 'center' },
  actionCopy: { flex: 1 },
  actionLabel: { color: B.inkMute, fontSize: 11, fontWeight: '700' },
  actionTitle: { marginTop: 2, color: B.ink, fontSize: 15, fontWeight: '800' },
  actionMeta: { marginTop: 1, color: B.inkMute, fontSize: 11.5, fontWeight: '600' },

  listRow: { flexDirection: 'row', alignItems: 'center', gap: 8, minHeight: 36, borderTopWidth: 1, borderColor: B.line },
  listDot: { width: 5, height: 5, borderRadius: 999, backgroundColor: B.caution },
  listDate: { width: 62, color: B.ink, fontSize: 12, fontWeight: '700' },
  listValue: { flex: 1, textAlign: 'right', color: B.inkSoft, fontSize: 12, fontWeight: '500' },
});
