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

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { data, error, isLoading, reload } = useAsyncData(wellnessApi.getHomeSummary, EMPTY_HOME);
  const home = useMemo(() => ({ ...EMPTY_HOME, ...data }), [data]);
  const done = home.checkState === 'completed';

  useFocusEffect(useCallback(() => { void reload().catch(() => undefined); }, [reload]));

  if (isLoading) return <SafeAreaView style={styles.screen}><View style={styles.loading}><ActivityIndicator color={colors.primary} /><Text style={styles.loadingText}>오늘의 기록을 준비하고 있어요</Text></View></SafeAreaView>;
  if (error) return <SafeAreaView style={styles.screen}><View style={styles.error}><StateNotice actionLabel="다시 불러오기" description="작성 중인 기록은 그대로 있어요." icon="!" onAction={() => void reload().catch(() => undefined)} title="홈을 불러오지 못했어요" tone="error" /></View></SafeAreaView>;

  return (
    <SafeAreaView edges={['top']} style={styles.screen}>
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 148 }]} showsVerticalScrollIndicator={false}>
        <View style={styles.topline}>
          <View><Text style={styles.wordmark}>몸기록</Text><Text style={styles.date}>{home.dateLabel || formatToday()}</Text></View>
          <Pressable accessibilityLabel="알림 설정 열기" accessibilityRole="button" onPress={() => router.push('/settings/notifications')} style={({ pressed }) => [styles.notification, pressed && styles.pressed]}><AppIcon color={colors.text} name="bell" size={20} /></Pressable>
        </View>

        <View style={styles.hero}>
          <Text style={styles.heroEyebrow}>{done ? 'TODAY / RECORDED' : 'TODAY / CHECK IN'}</Text>
          <Text style={styles.heroTitle}>{done ? (home.conditionLabel || '오늘의 상태를 남겼어요') : '오늘의 몸은\n어떤가요?'}</Text>
          <Text style={styles.heroCopy}>{done ? (home.evidence || '기록이 쌓일수록 나의 평소와 오늘의 차이가 선명해져요.') : '수면과 컨디션을 간단히 남기고,\n나에게 맞는 하루의 기준을 만들어보세요.'}</Text>
          <Pressable accessibilityRole="button" onPress={() => router.push('/check/auto')} style={({ pressed }) => [styles.heroAction, pressed && styles.heroActionPressed]}><Text style={styles.heroActionText}>{done ? '오늘 기록 다시 보기' : '오늘 기록 시작하기'}</Text><AppIcon color={colors.white} name="arrow-up-right" size={19} /></Pressable>
          <Text style={styles.heroMeta}>{home.streakDays > 0 ? `${home.streakDays}일째 기록 중` : '약 3분이면 충분해요'}</Text>
        </View>

        <View style={styles.sectionIntro}><Text style={styles.sectionKicker}>YOUR BASELINE</Text><Text style={styles.sectionTitle}>최근 몸의 리듬</Text></View>
        <View style={styles.metrics}>
          <Metric index="01" label="평균 수면" value={home.sleepTrend.averageLabel || '-'} />
          <Metric index="02" label="최근 불편" value={home.bodyHighlights.length ? `${home.bodyHighlights.length}곳` : '없음'} accent="coral" />
          <Metric index="03" label="기록 연속" value={`${home.streakDays}일`} />
        </View>

        <View style={styles.bodySection}>
          <View style={styles.sectionIntro}><Text style={styles.sectionKicker}>BODY MAP</Text><Text style={styles.sectionTitle}>몸에 남은 신호</Text><Text style={styles.sectionDescription}>{home.bodyHighlights.length ? '표시된 부위를 눌러 지난 기록을 확인하세요.' : '오늘 불편한 부위가 있다면 함께 남겨보세요.'}</Text></View>
          <View style={styles.avatarFrame}><HomeAvatar highlights={home.bodyHighlights} onMarkerPress={() => router.push('/(tabs)/records')} /></View>
          <Pressable accessibilityRole="button" onPress={() => router.push('/check/discomfort')} style={({ pressed }) => [styles.textAction, pressed && styles.pressed]}><Text style={styles.textActionLabel}>{home.bodyHighlights.length ? '불편한 부위 수정' : '불편한 부위 기록하기'}</Text><AppIcon color={colors.body} name="arrow-up-right" size={17} /></Pressable>
        </View>

        {(home.routine.title || home.insight.text) ? <View style={styles.nextSection}><View style={styles.sectionIntro}><Text style={styles.sectionKicker}>NEXT</Text><Text style={styles.sectionTitle}>이어서 해볼 일</Text></View>{home.routine.title ? <NextRow label="오늘의 루틴" title={home.routine.title} detail={[home.routine.duration, home.routine.intensity].filter(Boolean).join(' · ')} onPress={() => router.push('/routine')} /> : null}{home.insight.text ? <NextRow label="기록에서 발견한 것" title="최근 변화 자세히 보기" detail={home.insight.text} onPress={() => router.push('/(tabs)/discover')} /> : null}</View> : null}

        {home.recentRecords.length > 0 ? <View style={styles.recent}><View style={styles.sectionIntro}><Text style={styles.sectionKicker}>LOGBOOK</Text><Text style={styles.sectionTitle}>최근 기록</Text></View>{home.recentRecords.slice(0, 4).map((record) => <View key={record.id} style={styles.logRow}><View style={styles.logMarker} /><Text style={styles.logDate}>{record.date}</Text><Text numberOfLines={1} style={styles.logValue}>{record.value}</Text></View>)}<Pressable accessibilityRole="button" onPress={() => router.push('/(tabs)/records')} style={styles.allLogs}><Text style={styles.allLogsText}>전체 기록 보기</Text><AppIcon color={colors.primary} name="arrow-up-right" size={16} /></Pressable></View> : null}
      </ScrollView>
    </SafeAreaView>
  );
}

function Metric({ accent, index, label, value }: { accent?: 'coral'; index: string; label: string; value: string }) { return <View style={styles.metric}><Text style={styles.metricIndex}>{index}</Text><Text style={[styles.metricValue, accent === 'coral' && styles.coral]}>{value}</Text><Text style={styles.metricLabel}>{label}</Text></View>; }
function NextRow({ detail, label, onPress, title }: { detail: string; label: string; onPress: () => void; title: string }) { return <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => [styles.nextRow, pressed && styles.pressed]}><View style={styles.nextCopy}><Text style={styles.nextLabel}>{label}</Text><Text style={styles.nextTitle}>{title}</Text><Text numberOfLines={2} style={styles.nextDetail}>{detail}</Text></View><AppIcon color={colors.primary} name="arrow-up-right" size={19} /></Pressable>; }
function formatToday() { return new Intl.DateTimeFormat('ko-KR', { month: 'long', day: 'numeric', weekday: 'long' }).format(new Date()); }
