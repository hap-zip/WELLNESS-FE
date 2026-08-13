import { useCallback } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import NavigationBackButton from '@/components/navigation-back-button';
import { AppIcon } from '@/components/app-icon';
import type { RoutinePlan } from '@/domain/wellness';
import { useAsyncData } from '@/hooks/use-async-data';
import { wellnessApi } from '@/services/wellness-api';
import { colors } from '@/theme/tokens';
import RoutineIllustration from './RoutineIllustration';
import { styles } from './routine.styles';

export default function TodayRoutineScreen() {
  const router = useRouter(); const insets = useSafeAreaInsets();
  const { data, error, isLoading, reload } = useAsyncData<RoutinePlan | null>(wellnessApi.getTodayRoutine, null);
  useFocusEffect(useCallback(() => { void reload().catch(() => undefined); }, [reload]));
  if (isLoading) return <Center><ActivityIndicator color={colors.primary} /><Text style={styles.loadingText}>오늘의 루틴을 준비하는 중</Text></Center>;
  if (error || !data) return <Center><Text accessibilityLiveRegion="polite" style={styles.errorTitle}>루틴을 불러오지 못했어요</Text><Pressable accessibilityRole="button" onPress={() => void reload().catch(() => undefined)} style={styles.retryButton}><Text style={styles.retryText}>다시 시도</Text></Pressable></Center>;

  return <SafeAreaView edges={['top']} style={styles.screen}><View style={styles.topBar}><NavigationBackButton accessibilityLabel="오늘 화면으로 돌아가기" fallbackHref="/(tabs)/home" /><Text accessibilityRole="header" style={styles.topTitle}>오늘의 루틴</Text><View style={styles.topSpacer} /></View><ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 120 }]} showsVerticalScrollIndicator={false}>
    <View style={styles.reasonCard}><Text style={styles.context}>이 루틴을 추천한 이유</Text><Text style={styles.reason}>{data.reason}</Text></View>
    <Text style={styles.routineTitle}>{data.title}</Text><Text style={styles.routineDescription}>{data.description}</Text>
    <View style={styles.metaGrid}><Meta label="예상 시간" value={`약 ${Math.ceil(data.totalSeconds / 60)}분`}/><Meta label="강도" value={data.intensity}/><Meta label="적용 부위" value={data.targetArea}/><Meta label="준비물" value="없음"/></View>
    <View style={styles.upcoming}><Text style={styles.upcomingTitle}>동작 {data.steps.length}개</Text>{data.steps.map((step, index) => <View key={step.id} style={styles.stepRow}><View style={styles.stepVisual}><RoutineIllustration size={52} step={step}/></View><Text style={styles.upcomingIndex}>{index + 1}</Text><View style={styles.stepCopy}><Text style={styles.upcomingStepTitle}>{step.title}</Text><Text numberOfLines={2} style={styles.stepInstruction}>{step.instruction}</Text></View><Text style={styles.upcomingTime}>{step.durationSeconds}초</Text></View>)}</View>

    {data.caution ? <View style={styles.caution}><AppIcon color={colors.warning} name="alert" size={16} /><Text style={styles.cautionText}>{data.caution}</Text></View> : null}

  </ScrollView><View style={[styles.bottomAction, { paddingBottom: Math.max(insets.bottom, 12) }]}><Pressable accessibilityRole="button" onPress={() => router.push('/routine/session')} style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}><Text style={styles.primaryText}>루틴 시작하기</Text></Pressable></View></SafeAreaView>;
}
function Meta({label,value}:{label:string;value:string}) { return <View style={styles.metaItem}><Text style={styles.metaLabel}>{label}</Text><Text style={styles.metaValue}>{value}</Text></View>; }
function Center({ children }: { children: React.ReactNode }) { return <SafeAreaView edges={['top', 'bottom']} style={styles.center}>{children}</SafeAreaView>; }
