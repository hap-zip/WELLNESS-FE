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

  const currentStep = data.steps[0];
  const upcomingSteps = data.steps.slice(1);

  return <SafeAreaView edges={['top']} style={styles.screen}><View style={styles.topBar}><NavigationBackButton accessibilityLabel="오늘 화면으로 돌아가기" fallbackHref="/(tabs)/home" /><Text accessibilityRole="header" style={styles.topTitle}>오늘의 루틴</Text><View style={styles.topSpacer} /></View><ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 120 }]} showsVerticalScrollIndicator={false}>

    {/* 지금 해야 할 행동 — 루틴 목록이 아니라 실행 flow의 첫 동작이 화면의 중심이다. */}
    <View style={styles.hero}>
      <Text style={styles.context}>{data.targetArea}</Text>
      {data.reason ? <Text style={styles.reason}>{data.reason}</Text> : null}
      {currentStep ? (
        <>
          <View style={styles.heroVisual}><RoutineIllustration size={236} step={currentStep} /></View>
          <Text style={styles.stepTitle}>{currentStep.title}</Text>
          <Text style={styles.stepInstruction}>{currentStep.instruction}</Text>
        </>
      ) : null}
      <Text style={styles.meta}>약 {Math.ceil(data.totalSeconds / 60)}분 · {data.intensity} · {data.steps.length}개 동작</Text>
    </View>

    {/* 다음 순서 — 나머지 동작은 작은 순서 목록으로 후퇴시킨다. 동일한 카드를 반복하지 않는다. */}
    {upcomingSteps.length > 0 ? (
      <View style={styles.upcoming}>
        <Text style={styles.upcomingTitle}>다음 순서</Text>
        {upcomingSteps.map((step, index) => <View key={step.id} style={styles.upcomingRow}><Text style={styles.upcomingIndex}>{index + 2}</Text><Text numberOfLines={1} style={styles.upcomingStepTitle}>{step.title}</Text><Text style={styles.upcomingTime}>{step.durationSeconds}초</Text></View>)}
      </View>
    ) : null}

    {data.caution ? <View style={styles.caution}><AppIcon color={colors.warning} name="alert" size={16} /><Text style={styles.cautionText}>{data.caution}</Text></View> : null}

  </ScrollView><View style={[styles.bottomAction, { paddingBottom: Math.max(insets.bottom, 12) }]}><Pressable accessibilityRole="button" onPress={() => router.push('/routine/session')} style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}><Text style={styles.primaryText}>루틴 시작하기</Text></Pressable></View></SafeAreaView>;
}
function Center({ children }: { children: React.ReactNode }) { return <SafeAreaView edges={['top', 'bottom']} style={styles.center}>{children}</SafeAreaView>; }
