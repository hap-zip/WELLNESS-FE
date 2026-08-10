import { useCallback } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import NavigationBackButton from '@/components/navigation-back-button';
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
    <View style={styles.hero}><View style={styles.heroCopy}><Text style={styles.kicker}>오늘 기록을 바탕으로</Text><Text style={styles.target}>{data.targetArea}</Text><Text style={styles.title}>{data.title}</Text><Text style={styles.description}>{data.description}</Text></View><View style={styles.heroVisual}><RoutineIllustration step={data.steps[1] ?? data.steps[0]} /></View><View style={styles.metaRow}><Text style={styles.meta}>약 {Math.ceil(data.totalSeconds / 60)}분</Text><Text style={styles.meta}>{data.intensity}</Text><Text style={styles.meta}>{data.steps.length}개 동작</Text></View></View>
    <View style={styles.reasonCard}><Text style={styles.reasonLabel}>이 루틴을 추천한 이유</Text><Text style={styles.reason}>{data.reason}</Text></View>
    <Text accessibilityRole="header" style={styles.sectionTitle}>이렇게 진행해요</Text>{data.steps.map((step, index) => <View key={step.id} style={styles.stepRow}><View style={styles.stepIndex}><Text style={styles.stepIndexText}>{index + 1}</Text></View><View style={styles.stepCopy}><Text style={styles.stepTitle}>{step.title}</Text><Text style={styles.stepInstruction}>{step.instruction}</Text></View><Text style={styles.stepTime}>{step.durationSeconds}초</Text></View>)}
    <View style={styles.caution}><Text style={styles.cautionLabel}>시작 전 확인</Text><Text style={styles.cautionText}>{data.caution}</Text></View>
  </ScrollView><View style={[styles.bottomAction, { paddingBottom: Math.max(insets.bottom, 12) }]}><Pressable accessibilityRole="button" onPress={() => router.push('/routine/session')} style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}><Text style={styles.primaryText}>루틴 시작하기</Text></Pressable></View></SafeAreaView>;
}
function Center({ children }: { children: React.ReactNode }) { return <SafeAreaView edges={['top', 'bottom']} style={styles.center}>{children}</SafeAreaView>; }
