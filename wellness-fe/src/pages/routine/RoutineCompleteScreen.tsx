import { useCallback } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAsyncData } from '@/hooks/use-async-data';
import { wellnessApi } from '@/services/wellness-api';
import { completeStyles as styles } from './routine-complete.styles';

export default function RoutineCompleteScreen() {
  const router = useRouter(); const insets = useSafeAreaInsets(); const params = useLocalSearchParams<{ routineId?: string; seconds?: string; steps?: string }>();
  const routineId = typeof params.routineId === 'string' ? params.routineId : ''; const seconds = Number(params.seconds ?? 0); const steps = Number(params.steps ?? 0);
  const save = useCallback(() => wellnessApi.saveRoutineCompletion(routineId, seconds, steps), [routineId, seconds, steps]);
  const { data, error, isLoading, reload } = useAsyncData(save, null);
  return <SafeAreaView edges={['top', 'bottom']} style={styles.screen}><View style={styles.body}>{isLoading ? <><ActivityIndicator color="#1257E0" /><Text style={styles.status}>완료 기록을 저장하는 중</Text></> : error || !data ? <><Text style={styles.errorTitle}>완료 기록을 저장하지 못했어요</Text><Pressable onPress={() => void reload().catch(() => undefined)} style={styles.retryButton}><Text style={styles.retryText}>다시 시도</Text></Pressable></> : <><View style={styles.check}><Text style={styles.checkText}>✓</Text></View><Text style={styles.eyebrow}>ROUTINE COMPLETE</Text><Text style={styles.title}>오늘의 루틴을{`\n`}완료했어요</Text><Text style={styles.description}>짧게 움직인 시간도 몸의 변화를 알아가는 중요한 기록이 돼요.</Text><View style={styles.summary}><Summary label="운동 시간" value={`${Math.floor(seconds / 60)}분 ${seconds % 60}초`} /><View style={styles.divider} /><Summary label="완료 동작" value={`${steps}개`} /></View></>}</View>{!isLoading && !error && data ? <View style={[styles.actions, { paddingBottom: Math.max(insets.bottom, 12) }]}><Pressable accessibilityRole="button" onPress={() => router.replace({ pathname: '/routine/feedback', params: { routineId } })} style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}><Text style={styles.primaryText}>효과 기록하기</Text></Pressable><Pressable accessibilityRole="button" onPress={() => router.dismissTo('/(tabs)/home')} style={styles.laterButton}><Text style={styles.laterText}>나중에 하기</Text></Pressable></View> : null}</SafeAreaView>;
}
function Summary({ label, value }: { label: string; value: string }) { return <View style={styles.summaryItem}><Text style={styles.summaryValue}>{value}</Text><Text style={styles.summaryLabel}>{label}</Text></View>; }
