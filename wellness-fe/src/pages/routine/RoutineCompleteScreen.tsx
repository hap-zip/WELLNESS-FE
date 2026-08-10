import { useCallback } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAsyncData } from '@/hooks/use-async-data';
import { AppIcon } from '@/components/app-icon';
import { wellnessApi } from '@/services/wellness-api';
import { colors } from '@/theme/tokens';
import { completeStyles as styles } from './routine-complete.styles';

export default function RoutineCompleteScreen() {
  const router = useRouter(); const insets = useSafeAreaInsets(); const params = useLocalSearchParams<{ routineId?: string; seconds?: string; steps?: string }>();
  const routineId = typeof params.routineId === 'string' ? params.routineId : ''; const seconds = Number(params.seconds ?? 0); const steps = Number(params.steps ?? 0);
  const save = useCallback(() => wellnessApi.saveRoutineCompletion(routineId, seconds, steps), [routineId, seconds, steps]);
  const { data, error, isLoading, reload } = useAsyncData(save, null);
  return <SafeAreaView edges={['top', 'bottom']} style={styles.screen}><ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>{isLoading ? <><ActivityIndicator color={colors.primary} /><Text style={styles.status}>완료 기록을 저장하는 중</Text></> : error || !data ? <><Text style={styles.errorTitle}>완료 기록을 저장하지 못했어요</Text><Pressable accessibilityRole="button" onPress={() => void reload().catch(() => undefined)} style={({pressed})=>[styles.retryButton,pressed&&styles.pressed]}><Text style={styles.retryText}>다시 시도</Text></Pressable></> : <><View accessibilityLabel="루틴 완료" style={styles.check}><AppIcon color={colors.white} name="check" size={32} strokeWidth={2.4}/></View><Text style={styles.eyebrow}>루틴 완료</Text><Text accessibilityRole="header" style={styles.title}>오늘의 루틴을 완료했어요</Text><Text style={styles.description}>지금 느껴지는 변화를 남기면 다음 루틴의 강도와 동작을 조정하는 데 도움이 돼요.</Text><View style={styles.summary}><Summary label="움직인 시간" value={`${Math.floor(seconds / 60)}분 ${seconds % 60}초`} /><View style={styles.divider} /><Summary label="완료한 동작" value={`${steps}개`} /></View></>}</ScrollView>{!isLoading && !error && data ? <View style={[styles.actions, { paddingBottom: Math.max(insets.bottom, 12) }]}><Pressable accessibilityRole="button" onPress={() => router.replace({ pathname: '/routine/feedback', params: { routineId } })} style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}><Text style={styles.primaryText}>지금 느낌 남기기</Text></Pressable><Pressable accessibilityRole="button" onPress={() => router.dismissTo('/(tabs)/home')} style={({pressed})=>[styles.laterButton,pressed&&styles.pressed]}><Text style={styles.laterText}>홈으로 돌아가기</Text></Pressable></View> : null}</SafeAreaView>;
}
function Summary({ label, value }: { label: string; value: string }) { return <View style={styles.summaryItem}><Text style={styles.summaryValue}>{value}</Text><Text style={styles.summaryLabel}>{label}</Text></View>; }
