import { useCallback, useMemo } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, Defs, LinearGradient, Rect, Stop } from 'react-native-svg';

import { AppIcon } from '@/components/app-icon';
import HomeAvatar from '@/pages/home/HomeAvatar';
import type { HomeSummary } from '@/domain/wellness';
import { useAsyncData } from '@/hooks/use-async-data';
import { wellnessApi } from '@/services/wellness-api';

/**
 * DIRECTION C — WELLNESS / IMMERSIVE
 * Visual reference: Alarmy 2025 (https://wwit.design/2025/04/06/alarmy/) — 알람 홈, 수면 리포트.
 * Dev-only preview. Not linked from production navigation.
 */
const C = {
  canvas: '#0E0E11',
  surface: '#1B1B20',
  surfaceRaised: '#232329',
  ink: '#F5F4F0',
  inkSoft: '#A6A4AC',
  inkMute: '#6E6D75',
  accent: '#FF5A45',
  accentSoft: 'rgba(255,90,69,0.16)',
  gradientA: '#463AA0',
  gradientB: '#8C6FE8',
  good: '#3DDC84',
  caution: '#FFB020',
} as const;

const EMPTY_HOME: HomeSummary = {
  dateLabel: '', conditionLabel: '', evidence: '', tags: [], recentRecords: [], tips: [],
  insight: { text: '', tags: [] }, routine: { title: '', description: '', duration: '', intensity: '' },
  sleepTrend: { values: [], averageLabel: '', periodLabel: '' }, bodyHighlights: [],
  bodyDetails: { neck:{title:'',lines:[]}, shoulder:{title:'',lines:[]}, chest:{title:'',lines:[]}, upperArm:{title:'',lines:[]}, forearm:{title:'',lines:[]}, abdomen:{title:'',lines:[]}, hip:{title:'',lines:[]}, thigh:{title:'',lines:[]}, knee:{title:'',lines:[]}, calf:{title:'',lines:[]} },
  streakDays: 0, checkState: 'not-started',
};

function RingGauge({ centerText, label, pct, size = 168 }: { centerText: string; label: string; pct: number; size?: number }) {
  const stroke = 14;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const clamped = Math.max(0, Math.min(1, pct));
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg height={size} width={size}>
        <Circle cx={size / 2} cy={size / 2} fill="none" r={r} stroke={C.surfaceRaised} strokeWidth={stroke} />
        <Circle
          cx={size / 2} cy={size / 2} fill="none" r={r} stroke={C.accent} strokeDasharray={`${c} ${c}`}
          strokeDashoffset={c * (1 - clamped)} strokeLinecap="round" strokeWidth={stroke}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      <View style={styles.ringCenter}>
        <Text style={styles.ringNumber}>{centerText}</Text>
        <Text style={styles.ringLabel}>{label}</Text>
      </View>
    </View>
  );
}

export default function DesignCScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { data, error, isLoading, reload } = useAsyncData(wellnessApi.getHomeSummary, EMPTY_HOME);
  const home = useMemo(() => ({ ...EMPTY_HOME, ...data }), [data]);
  const done = home.checkState === 'completed';
  useFocusEffect(useCallback(() => { void reload().catch(() => undefined); }, [reload]));

  if (isLoading) return <SafeAreaView style={styles.screen}><View style={styles.center}><ActivityIndicator color={C.accent} /></View></SafeAreaView>;
  if (error) return <SafeAreaView style={styles.screen}><View style={styles.center}><Text style={styles.errorText}>불러오지 못했어요</Text></View></SafeAreaView>;

  const streakPct = Math.min(100, (home.streakDays / 7) * 100);

  return (
    <SafeAreaView edges={['top']} style={styles.screen}>
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 140 }]} showsVerticalScrollIndicator={false}>
        <View style={styles.topline}>
          <View style={styles.streakPill}><Text style={styles.streakPillText}>🔥 {home.streakDays}일째 기록</Text></View>
          <Pressable accessibilityRole="button" style={styles.iconBtn}><AppIcon color={C.ink} name="bell" size={18} /></Pressable>
        </View>

        <Text style={styles.heroHeadline}>{done ? (home.conditionLabel || '기록 완료') : '오늘의 몸은\n어때요?'}</Text>

        <View style={styles.gradientCard}>
          <Svg height="100%" style={StyleSheet.absoluteFill} width="100%">
            <Defs>
              <LinearGradient id="hero" x1="0" x2="1" y1="0" y2="1">
                <Stop offset="0" stopColor={C.gradientA} />
                <Stop offset="1" stopColor={C.gradientB} />
              </LinearGradient>
            </Defs>
            <Rect fill="url(#hero)" height="100%" rx={26} width="100%" />
          </Svg>
          <View style={styles.gradientPill}><Text style={styles.gradientPillText}>상태</Text></View>
          <Text style={styles.gradientHeadline}>{done ? (home.evidence || '오늘 기록을 확인했어요') : '아직 오늘 기록 전이에요'}</Text>
          <Text style={styles.gradientSub}>{done ? (home.insight.text || '기록이 쌓이는 중이에요.') : '수면과 컨디션을 남기고 시작해보세요.'}</Text>
          {!done ? (
            <Pressable accessibilityRole="button" onPress={() => router.push('/check/auto')} style={({ pressed }) => [styles.gradientButton, pressed && styles.pressed]}>
              <Text style={styles.gradientButtonText}>기록 시작하기</Text>
            </Pressable>
          ) : null}
        </View>

        <View style={styles.bodySection}>
          <View style={styles.bodyStage}>
            <HomeAvatar
              defaultFill={C.surfaceRaised}
              defaultStroke={C.canvas}
              figureStyle={{ width: 190, height: 258 }}
              hideHint
              highlights={home.bodyHighlights}
              markColor={C.accent}
              onMarkerPress={() => router.push('/(tabs)/records')}
              scale={0.78}
              stageStyle={{ height: 258 }}
              wrapStyle={{ minHeight: 258 }}
            />
          </View>
          <View style={styles.gaugeRow}>
            <RingGauge centerText={`${home.streakDays}일`} label="연속 기록 · 목표 7일" pct={streakPct / 100} />
            <View style={styles.gaugeCopy}>
              <Text style={styles.gaugeCopyTitle}>{home.streakDays}일 연속</Text>
              <Text style={styles.gaugeCopyBody}>{home.bodyHighlights.length ? `${home.bodyHighlights.length}곳에 신호가 남아있어요` : '기록된 불편 신호가 없어요'}</Text>
            </View>
          </View>
        </View>

        {home.recentPattern ? (
          <View style={styles.card}>
            <Text style={styles.cardEyebrow}>최근 변화</Text>
            <Text style={styles.cardTitle}>{home.recentPattern.title}</Text>
            <Text style={styles.cardBody}>{home.recentPattern.description}</Text>
          </View>
        ) : null}

        {home.recentRecords.length ? (
          <View style={styles.recordSection}>
            <Text style={styles.sectionLabel}>최근 기록</Text>
            {home.recentRecords.slice(0, 4).map((record) => (
              <View key={record.id} style={styles.recordCard}>
                <Text style={styles.recordDate}>{record.date}</Text>
                <Text numberOfLines={1} style={styles.recordValue}>{record.value}</Text>
              </View>
            ))}
          </View>
        ) : null}
      </ScrollView>

      {home.routine.title ? (
        <View style={[styles.fabWrap, { bottom: insets.bottom + 20 }]}>
          <Text style={styles.fabLabel}>{home.routine.title}</Text>
          <Pressable accessibilityRole="button" onPress={() => router.push('/routine')} style={({ pressed }) => [styles.fab, pressed && styles.pressed]}>
            <AppIcon color={C.ink} name="play" size={22} />
          </Pressable>
        </View>
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.canvas },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  errorText: { color: C.ink },
  content: { paddingHorizontal: 20, paddingTop: 6 },

  topline: { minHeight: 52, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  streakPill: { paddingVertical: 7, paddingHorizontal: 13, borderRadius: 999, backgroundColor: C.surfaceRaised },
  streakPillText: { color: C.ink, fontSize: 12.5, fontWeight: '700' },
  iconBtn: { width: 38, height: 38, borderRadius: 999, backgroundColor: C.surfaceRaised, alignItems: 'center', justifyContent: 'center' },

  heroHeadline: { marginTop: 18, color: C.ink, fontSize: 38, lineHeight: 44, fontWeight: '800', letterSpacing: -1.0 },

  gradientCard: { marginTop: 18, padding: 20, borderRadius: 26, overflow: 'hidden', minHeight: 150 },
  gradientPill: { alignSelf: 'flex-start', paddingVertical: 5, paddingHorizontal: 12, borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.22)' },
  gradientPillText: { color: '#fff', fontSize: 11.5, fontWeight: '800' },
  gradientHeadline: { marginTop: 12, color: '#fff', fontSize: 19, lineHeight: 25, fontWeight: '800', maxWidth: 300 },
  gradientSub: { marginTop: 6, color: 'rgba(255,255,255,0.82)', fontSize: 13.5, lineHeight: 19, fontWeight: '500', maxWidth: 300 },
  gradientButton: { marginTop: 14, alignSelf: 'flex-start', minHeight: 42, paddingHorizontal: 18, borderRadius: 999, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  gradientButtonText: { color: C.gradientA, fontSize: 13.5, fontWeight: '800' },
  pressed: { opacity: 0.78 },

  bodySection: { marginTop: 22, alignItems: 'center' },
  bodyStage: { width: '100%', borderRadius: 26, backgroundColor: C.surface, alignItems: 'center', justifyContent: 'center', paddingVertical: 12 },
  gaugeRow: { marginTop: 18, flexDirection: 'row', alignItems: 'center', gap: 18, alignSelf: 'stretch' },
  gaugeCopy: { flex: 1 },
  gaugeCopyTitle: { color: C.ink, fontSize: 20, fontWeight: '800' },
  gaugeCopyBody: { marginTop: 4, color: C.inkSoft, fontSize: 13, lineHeight: 19, fontWeight: '500' },
  ringCenter: { position: 'absolute', alignItems: 'center' },
  ringNumber: { color: C.ink, fontSize: 34, fontWeight: '800', fontVariant: ['tabular-nums'] },
  ringLabel: { marginTop: 2, color: C.inkMute, fontSize: 11, fontWeight: '700' },

  card: { marginTop: 16, padding: 18, borderRadius: 22, backgroundColor: C.surface },
  cardEyebrow: { color: C.inkMute, fontSize: 11, fontWeight: '800' },
  cardTitle: { marginTop: 6, color: C.ink, fontSize: 17, fontWeight: '800', lineHeight: 23 },
  cardBody: { marginTop: 4, color: C.inkSoft, fontSize: 13, lineHeight: 19, fontWeight: '500' },

  recordSection: { marginTop: 20 },
  sectionLabel: { color: C.inkMute, fontSize: 12, fontWeight: '700', marginBottom: 10 },
  recordCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 14, paddingHorizontal: 16, borderRadius: 16, backgroundColor: C.surface, marginBottom: 8 },
  recordDate: { color: C.ink, fontSize: 13, fontWeight: '800' },
  recordValue: { flex: 1, textAlign: 'right', color: C.inkSoft, fontSize: 12.5, fontWeight: '500' },

  fabWrap: { position: 'absolute', right: 20, alignItems: 'flex-end', gap: 8 },
  fabLabel: { color: C.ink, fontSize: 12.5, fontWeight: '700', backgroundColor: 'rgba(27,27,32,0.9)', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 999, overflow: 'hidden' },
  fab: { width: 60, height: 60, borderRadius: 999, backgroundColor: C.accent, alignItems: 'center', justifyContent: 'center', shadowColor: C.accent, shadowOpacity: 0.5, shadowRadius: 16, shadowOffset: { width: 0, height: 8 }, elevation: 6 },
});
