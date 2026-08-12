import { useCallback, useMemo } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppIcon } from '@/components/app-icon';
import StateNotice from '@/components/state-notice';
import type { HomeSummary } from '@/domain/wellness';
import { useAsyncData } from '@/hooks/use-async-data';
import { wellnessApi } from '@/services/wellness-api';
import { colors } from '@/theme/tokens';

import HomeAvatar from './HomeAvatar';
import { styles } from './home.styles';

const EMPTY_HOME: HomeSummary = {
  dateLabel: '', conditionLabel: '', evidence: '', tags: [], recentRecords: [], tips: [],
  insight: { text: '', tags: [] }, routine: { title: '', description: '', duration: '', intensity: '' },
  sleepTrend: { values: [], averageLabel: '', periodLabel: '' }, bodyHighlights: [],
  bodyDetails: { neck:{title:'',lines:[]}, shoulder:{title:'',lines:[]}, chest:{title:'',lines:[]}, upperArm:{title:'',lines:[]}, forearm:{title:'',lines:[]}, abdomen:{title:'',lines:[]}, hip:{title:'',lines:[]}, thigh:{title:'',lines:[]}, knee:{title:'',lines:[]}, calf:{title:'',lines:[]} },
  streakDays: 0, checkState: 'not-started',
};

const PART_LABELS: Record<string, string> = { neck: '목', shoulder: '어깨', chest: '가슴', upperArm: '위팔', forearm: '아래팔', abdomen: '복부', hip: '골반', thigh: '허벅지', knee: '무릎', calf: '종아리' };

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { data, error, isLoading, reload } = useAsyncData(wellnessApi.getHomeSummary, EMPTY_HOME);
  const home = useMemo(() => ({ ...EMPTY_HOME, ...data }), [data]);
  const done = home.checkState === 'completed';
  const primaryHighlight = home.bodyHighlights[0];
  const lastRecord = home.recentRecords[0];

  useFocusEffect(useCallback(() => { void reload().catch(() => undefined); }, [reload]));

  if (isLoading) return <SafeAreaView style={styles.screen}><View style={styles.loading}><ActivityIndicator color={colors.primary} /><Text style={styles.loadingText}>오늘의 기록을 준비하고 있어요</Text></View></SafeAreaView>;
  if (error) return <SafeAreaView style={styles.screen}><View style={styles.error}><StateNotice actionLabel="다시 불러오기" description="작성 중인 기록은 그대로 있어요." icon="!" onAction={() => void reload().catch(() => undefined)} title="홈을 불러오지 못했어요" tone="error" /></View></SafeAreaView>;

  return (
    <SafeAreaView edges={['top']} style={styles.screen}>
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 120 }]} showsVerticalScrollIndicator={false}>
        <View style={styles.topline}>
          <Text style={styles.dateLabel}>{home.dateLabel || formatToday()}</Text>
          <Pressable accessibilityLabel="알림 설정 열기" accessibilityRole="button" onPress={() => router.push('/settings/notifications')} style={styles.iconBtn}><AppIcon color={colors.textSecondary} name="bell" size={19} /></Pressable>
        </View>

        {/* 01 TODAY STATE — 질문이 아니라 상태 문장. 기록 전/후 동일한 블록 구조를 유지한다. */}
        <View style={styles.state}>
          <Text style={styles.stateTitle}>{done ? (home.conditionLabel || '오늘의 상태를 기록했어요') : '아직 오늘의 몸 상태를\n기록하지 않았어요'}</Text>
          <Text style={styles.stateSupport}>
            {done ? (home.evidence || '기록이 쌓일수록 평소와 오늘의 차이가 선명해져요.') : lastRecord ? `최근 기록 · ${lastRecord.date} · ${lastRecord.value}` : '기록을 시작하면 평소 기준을 만들어드려요.'}
          </Text>
          {done ? (
            <Pressable accessibilityRole="button" onPress={() => router.push('/check/auto')} style={({ pressed }) => [styles.stateLink, pressed && styles.pressed]}>
              <Text style={styles.stateLinkText}>오늘 기록 다시 보기</Text>
              <AppIcon color={colors.primary} name="arrow-up-right" size={15} />
            </Pressable>
          ) : (
            <Pressable accessibilityRole="button" onPress={() => router.push('/check/auto')} style={({ pressed }) => [styles.stateCta, pressed && styles.pressed]}>
              <Text style={styles.stateCtaText}>오늘 기록하기</Text>
            </Pressable>
          )}
        </View>

        {/* 02 TODAY DATA — 카드로 쪼개지 않고, 하나의 옅은 strip 안에 2~3개 수치를 나란히. 기록 여부와 무관하게 최근 추세로 보여준다. */}
        {(home.sleepTrend.averageLabel || home.streakDays > 0 || primaryHighlight) ? (
          <View style={styles.dataStrip}>
            {home.sleepTrend.averageLabel ? (
              <View style={styles.dataItem}>
                <Text style={styles.dataValue}>{home.sleepTrend.averageLabel}</Text>
                <Text style={styles.dataCaption}>{home.sleepTrend.periodLabel ? `수면 · ${home.sleepTrend.periodLabel}` : '수면'}</Text>
              </View>
            ) : null}
            {primaryHighlight ? (
              <View style={styles.dataItem}>
                <Text style={styles.dataValue}>{primaryHighlight.intensity}/3</Text>
                <Text style={styles.dataCaption}>{PART_LABELS[primaryHighlight.part] ?? primaryHighlight.part} 불편</Text>
              </View>
            ) : null}
            {home.streakDays > 0 ? (
              <View style={styles.dataItem}>
                <Text style={styles.dataValue}>{home.streakDays}일</Text>
                <Text style={styles.dataCaption}>연속 기록</Text>
              </View>
            ) : null}
          </View>
        ) : null}

        {/* 03 MEANINGFUL CHANGE — heading + 문장 + metadata로 구성된 독립 정보 블록. 목록 row가 아니다. */}
        {home.recentPattern ? (
          <Pressable accessibilityRole="button" onPress={() => router.push('/(tabs)/discover')} style={({ pressed }) => [styles.patternBlock, pressed && styles.pressed]}>
            <Text style={styles.patternHeading}>최근 달라진 점</Text>
            <Text style={styles.patternSentence}>{home.recentPattern.title}</Text>
            <Text style={styles.patternMeta}>{home.recentPattern.description}</Text>
            <Text style={styles.patternLink}>자세히 보기</Text>
          </Pressable>
        ) : null}

        {/* 04 TODAY'S ACTION — WHAT / DURATION / WHY / ACTION. 기록 여부와 무관하게 항상 같은 구성. */}
        {home.routine.title ? (
          <View style={styles.actionBlock}>
            <Text style={styles.actionHeading}>오늘의 루틴</Text>
            <Text style={styles.actionWhat}>{home.routine.title}</Text>
            {home.routine.duration || home.routine.intensity ? <Text style={styles.actionMeta}>{[home.routine.duration, home.routine.intensity].filter(Boolean).join(' · ')}</Text> : null}
            {home.routine.description ? <Text style={styles.actionWhy}>{home.routine.description}</Text> : null}
            <Pressable accessibilityRole="button" onPress={() => router.push('/routine')} style={({ pressed }) => [styles.actionCta, pressed && styles.pressed]}>
              <Text style={styles.actionCtaText}>루틴 시작하기</Text>
            </Pressable>
          </View>
        ) : null}

        {/* 몸에 남은 신호 — 실제 기록이 있을 때만 body map을 보여준다. */}
        {home.bodyHighlights.length > 0 ? (
          <View style={styles.bodySection}>
            <Text style={styles.bodyLabel}>몸에 남은 신호</Text>
            <View style={styles.avatarFrame}><HomeAvatar highlights={home.bodyHighlights} onMarkerPress={() => router.push('/(tabs)/records')} /></View>
            <Pressable accessibilityRole="button" onPress={() => router.push('/check/discomfort')} style={({ pressed }) => [styles.textAction, pressed && styles.pressed]}><Text style={styles.textActionLabel}>불편한 부위 수정</Text><AppIcon color={colors.body} name="arrow-up-right" size={17} /></Pressable>
          </View>
        ) : (
          <Pressable accessibilityRole="button" onPress={() => router.push('/check/discomfort')} style={({ pressed }) => [styles.bodyPromptRow, pressed && styles.pressed]}>
            <Text style={styles.bodyPromptText}>불편한 부위가 있다면 기록해보세요</Text>
            <AppIcon color={colors.body} name="arrow-up-right" size={17} />
          </Pressable>
        )}

        {/* 최근 기록 */}
        {home.recentRecords.length > 0 ? (
          <View style={styles.recent}>
            <Text style={styles.recentLabel}>최근 기록</Text>
            {home.recentRecords.slice(0, 3).map((record) => <View key={record.id} style={styles.logRow}><View style={styles.logMarker} /><Text style={styles.logDate}>{record.date}</Text><Text numberOfLines={1} style={styles.logValue}>{record.value}</Text></View>)}
            <Pressable accessibilityRole="button" onPress={() => router.push('/(tabs)/records')} style={styles.allLogs}><Text style={styles.allLogsText}>전체 기록 보기</Text><AppIcon color={colors.primary} name="arrow-up-right" size={16} /></Pressable>
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

function formatToday() { return new Intl.DateTimeFormat('ko-KR', { month: 'long', day: 'numeric', weekday: 'long' }).format(new Date()); }
