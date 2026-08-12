import { useCallback, useMemo } from 'react';
import { ActivityIndicator, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppIcon } from '@/components/app-icon';
import HomeAvatar from '@/pages/home/HomeAvatar';
import type { HomeSummary } from '@/domain/wellness';
import { useAsyncData } from '@/hooks/use-async-data';
import { wellnessApi } from '@/services/wellness-api';

/**
 * DIRECTION A — LIGHT / PRODUCT
 * Visual reference: mmm (https://wwit.design/2025/03/04/mmm/) — profile & add-pick screens.
 * Dev-only preview. Not linked from production navigation.
 */
const A = {
  canvas: '#FFFFFF',
  ink: '#121212',
  inkSoft: '#6B6A66',
  inkMute: '#A6A49C',
  container: '#F1EFEA',
  line: '#EDEBE4',
  accent: '#E5573A',
  accentInk: '#FFFFFF',
} as const;

const EMPTY_HOME: HomeSummary = {
  dateLabel: '', conditionLabel: '', evidence: '', tags: [], recentRecords: [], tips: [],
  insight: { text: '', tags: [] }, routine: { title: '', description: '', duration: '', intensity: '' },
  sleepTrend: { values: [], averageLabel: '', periodLabel: '' }, bodyHighlights: [],
  bodyDetails: { neck:{title:'',lines:[]}, shoulder:{title:'',lines:[]}, chest:{title:'',lines:[]}, upperArm:{title:'',lines:[]}, forearm:{title:'',lines:[]}, abdomen:{title:'',lines:[]}, hip:{title:'',lines:[]}, thigh:{title:'',lines:[]}, knee:{title:'',lines:[]}, calf:{title:'',lines:[]} },
  streakDays: 0, checkState: 'not-started',
};

const MUSCLE_LABELS: Record<string, string> = { abs: '복부', biceps: '위팔', calves: '종아리', chest: '가슴', deltoids: '어깨', forearm: '아래팔', knees: '무릎', neck: '목', obliques: '옆구리', quadriceps: '허벅지', tibialis: '정강이', trapezius: '승모근' };

export default function DesignAScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { data, error, isLoading, reload } = useAsyncData(wellnessApi.getHomeSummary, EMPTY_HOME);
  const home = useMemo(() => ({ ...EMPTY_HOME, ...data }), [data]);
  const done = home.checkState === 'completed';
  useFocusEffect(useCallback(() => { void reload().catch(() => undefined); }, [reload]));

  if (isLoading) return <SafeAreaView style={styles.screen}><View style={styles.center}><ActivityIndicator color={A.ink} /></View></SafeAreaView>;
  if (error) return <SafeAreaView style={styles.screen}><View style={styles.center}><Text style={styles.errorText}>불러오지 못했어요</Text></View></SafeAreaView>;

  const primaryHighlight = home.bodyHighlights[0];
  const bodySummary = primaryHighlight ? `${MUSCLE_LABELS[primaryHighlight.muscle] ?? primaryHighlight.muscle}${home.bodyHighlights.length > 1 ? ` 외 ${home.bodyHighlights.length - 1}곳` : ''}` : '기록된 신호 없음';

  return (
    <SafeAreaView edges={['top']} style={styles.screen}>
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 48 }]} showsVerticalScrollIndicator={false}>
        <View style={styles.topline}>
          <Text style={styles.wordmark}>몸기록</Text>
          <Pressable accessibilityRole="button" onPress={() => router.back()} style={styles.iconBtn}><AppIcon color={A.accentInk} name="bell" size={18} /></Pressable>
        </View>

        <View style={styles.hero}>
          <View style={styles.heroRow}>
            <Text style={styles.heroHeadline}>{done ? (home.conditionLabel || '기록 완료') : '오늘의\n몸은 어때요?'}</Text>
            <View style={styles.streakBadge}><Text style={styles.streakBadgeNumber}>{home.streakDays}</Text><Text style={styles.streakBadgeLabel}>일째</Text></View>
          </View>
          {done && home.evidence ? <View style={styles.inlinePill}><View style={styles.inlinePillDot} /><Text style={styles.inlinePillText}>{home.evidence}</Text></View> : null}
          <Text style={styles.heroSupport}>{done ? (home.insight.text || '기록이 쌓이는 중이에요.') : '수면과 컨디션을 남기고 나만의 기준을 만들어보세요.'}</Text>
          {!done ? (
            <Pressable accessibilityRole="button" onPress={() => router.push('/check/auto')} style={({ pressed }) => [styles.pillButtonBlack, pressed && styles.pressed]}>
              <Text style={styles.pillButtonBlackText}>오늘 기록 시작하기</Text>
              <AppIcon color={A.accentInk} name="arrow-up-right" size={17} />
            </Pressable>
          ) : null}
        </View>

        {home.recentPattern ? (
          <View style={styles.card}>
            <Text style={styles.cardEyebrow}>최근 변화</Text>
            <Text style={styles.cardTitle}>{home.recentPattern.title}</Text>
            <Text style={styles.cardBody}>{home.recentPattern.description}</Text>
          </View>
        ) : null}

        <View style={styles.bodyCard}>
          <View style={styles.bodyThumb}>
            <HomeAvatar
              defaultFill={A.line}
              defaultStroke={A.canvas}
              figureStyle={{ width: 92, height: 128 }}
              hideHint
              highlights={home.bodyHighlights}
              markColor={A.accent}
              onMarkerPress={() => router.push('/(tabs)/records')}
              scale={0.36}
              stageStyle={{ height: 128 }}
              wrapStyle={{ minHeight: 128 }}
            />
          </View>
          <View style={styles.bodyCopy}>
            <Text style={styles.cardEyebrow}>몸에 남은 신호</Text>
            <Text style={styles.bodyCardTitle}>{bodySummary}</Text>
            <Pressable accessibilityRole="button" onPress={() => router.push('/check/discomfort')} style={styles.textLink}><Text style={styles.textLinkText}>기록하기</Text></Pressable>
          </View>
        </View>

        {home.routine.title ? (
          <View style={styles.card}>
            <Text style={styles.cardEyebrow}>오늘 할 행동</Text>
            <Text style={styles.cardTitle}>{home.routine.title}</Text>
            <Text style={styles.cardBody}>{[home.routine.duration, home.routine.intensity].filter(Boolean).join(' · ')}</Text>
            <Pressable accessibilityRole="button" onPress={() => router.push('/routine')} style={({ pressed }) => [styles.pillButtonBlack, styles.pillButtonInline, pressed && styles.pressed]}>
              <Text style={styles.pillButtonBlackText}>루틴 보기</Text>
              <AppIcon color={A.accentInk} name="arrow-up-right" size={16} />
            </Pressable>
          </View>
        ) : null}

        {home.recentRecords.length ? (
          <View style={styles.card}>
            <Text style={styles.cardEyebrow}>최근 기록</Text>
            {home.recentRecords.slice(0, 4).map((record) => (
              <View key={record.id} style={styles.recordRow}>
                <Text style={styles.recordDate}>{record.date}</Text>
                <Text numberOfLines={1} style={styles.recordValue}>{record.value}</Text>
              </View>
            ))}
          </View>
        ) : null}
      </ScrollView>

      <View style={styles.tabBar}>
        {[{ icon: 'home' as const, label: '홈', active: true }, { icon: 'calendar' as const, label: '기록', active: false }, { icon: 'connection' as const, label: '커넥션', active: false }, { icon: 'person' as const, label: '마이', active: false }].map((tab) => (
          <View key={tab.label} style={styles.tabItem}>
            <View style={[styles.tabIconWrap, tab.active && styles.tabIconWrapActive]}><AppIcon color={tab.active ? A.accentInk : A.inkMute} name={tab.icon} size={19} /></View>
            <Text style={[styles.tabLabel, tab.active && styles.tabLabelActive]}>{tab.label}</Text>
          </View>
        ))}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: A.canvas },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  errorText: { color: A.ink },
  content: { paddingHorizontal: 22, paddingTop: 8 },

  topline: { minHeight: 64, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  wordmark: { color: A.ink, fontSize: 20, fontWeight: '900', letterSpacing: -0.5 },
  iconBtn: { width: 40, height: 40, borderRadius: 999, backgroundColor: A.ink, alignItems: 'center', justifyContent: 'center' },

  hero: { marginTop: 18, paddingBottom: 8 },
  heroRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 },
  heroHeadline: { flex: 1, color: A.ink, fontSize: 42, lineHeight: 46, fontWeight: '900', letterSpacing: -1.4 },
  streakBadge: { width: 62, height: 62, borderRadius: 999, backgroundColor: A.accent, alignItems: 'center', justifyContent: 'center' },
  streakBadgeNumber: { color: A.accentInk, fontSize: 19, fontWeight: '900', lineHeight: 21 },
  streakBadgeLabel: { color: 'rgba(255,255,255,0.85)', fontSize: 10, fontWeight: '700' },

  inlinePill: { flexDirection: 'row', alignItems: 'center', gap: 7, alignSelf: 'flex-start', marginTop: 16, paddingVertical: 8, paddingHorizontal: 14, borderRadius: 999, borderWidth: 1.5, borderColor: A.ink },
  inlinePillDot: { width: 7, height: 7, borderRadius: 999, backgroundColor: A.accent },
  inlinePillText: { color: A.ink, fontSize: 14, fontWeight: '700' },
  heroSupport: { marginTop: 16, color: A.inkSoft, fontSize: 15.5, lineHeight: 23, fontWeight: '500', maxWidth: 340 },

  pillButtonBlack: { marginTop: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, minHeight: 56, borderRadius: 999, backgroundColor: A.ink, paddingHorizontal: 22, alignSelf: 'flex-start' },
  pillButtonInline: { marginTop: 16, minHeight: 48 },
  pillButtonBlackText: { color: A.accentInk, fontSize: 15.5, fontWeight: '800' },
  pressed: { opacity: 0.7 },

  card: { marginTop: 20, padding: 22, borderRadius: 28, backgroundColor: A.container },
  cardEyebrow: { color: A.inkSoft, fontSize: 11.5, fontWeight: '800', letterSpacing: 0.4, textTransform: 'uppercase' },
  cardTitle: { marginTop: 8, color: A.ink, fontSize: 22, lineHeight: 28, fontWeight: '800', letterSpacing: -0.4 },
  cardBody: { marginTop: 6, color: A.inkSoft, fontSize: 14.5, lineHeight: 21, fontWeight: '500' },

  bodyCard: { marginTop: 20, flexDirection: 'row', alignItems: 'center', gap: 16, padding: 18, borderRadius: 28, backgroundColor: A.container },
  bodyThumb: { width: 108, alignItems: 'center', justifyContent: 'center' },
  bodyCopy: { flex: 1 },
  bodyCardTitle: { marginTop: 6, color: A.ink, fontSize: 18, fontWeight: '800' },
  textLink: { marginTop: 10, alignSelf: 'flex-start' },
  textLinkText: { color: A.accent, fontSize: 13.5, fontWeight: '800' },

  recordRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 10, marginTop: 4, borderTopWidth: 1, borderColor: A.line },
  recordDate: { width: 70, color: A.ink, fontSize: 13, fontWeight: '800' },
  recordValue: { flex: 1, textAlign: 'right', color: A.inkSoft, fontSize: 13, fontWeight: '500' },

  tabBar: { flexDirection: 'row', paddingTop: 10, paddingBottom: Platform.select({ ios: 4, default: 10 }), borderTopWidth: 1, borderColor: A.line, backgroundColor: A.canvas },
  tabItem: { flex: 1, alignItems: 'center', gap: 4 },
  tabIconWrap: { width: 36, height: 36, borderRadius: 999, alignItems: 'center', justifyContent: 'center' },
  tabIconWrapActive: { backgroundColor: A.ink },
  tabLabel: { fontSize: 10.5, fontWeight: '700', color: A.inkMute },
  tabLabelActive: { color: A.ink },
});
