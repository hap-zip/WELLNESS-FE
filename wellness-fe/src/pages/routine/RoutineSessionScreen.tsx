import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Modal, Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import type { RoutinePlan } from '@/domain/wellness';
import { useAsyncData } from '@/hooks/use-async-data';
import { wellnessApi } from '@/services/wellness-api';
import RoutineIllustration from './RoutineIllustration';
import { AppIcon } from '@/components/app-icon';
import { colors } from '@/theme/tokens';
import { sessionStyles as styles } from './routine-session.styles';

export default function RoutineSessionScreen() {
  const router = useRouter(); const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { data: routine, isLoading } = useAsyncData<RoutinePlan | null>(wellnessApi.getTodayRoutine, null);
  const [stepIndex, setStepIndex] = useState(0); const [remaining, setRemaining] = useState(0); const [paused, setPaused] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const deadline = useRef<number | null>(null); const initializedId = useRef<string | null>(null);
  const finish = useCallback((plan: RoutinePlan) => router.replace({ pathname: '/routine/complete', params: { routineId: plan.id, seconds: String(plan.totalSeconds), steps: String(plan.steps.length) } }), [router]);
  useEffect(() => { if (!routine || initializedId.current === routine.id) return; initializedId.current = routine.id; setRemaining(routine.steps[0].durationSeconds); deadline.current = Date.now() + routine.steps[0].durationSeconds * 1000; }, [routine]);
  useEffect(() => { if (!routine || paused || remaining <= 0) return; const timer = setInterval(() => { if (!deadline.current) return; const next = Math.max(0, Math.ceil((deadline.current - Date.now()) / 1000)); setRemaining(next); if (next === 0) { clearInterval(timer); if (stepIndex >= routine.steps.length - 1) finish(routine); else { const nextIndex = stepIndex + 1; const seconds = routine.steps[nextIndex].durationSeconds; setStepIndex(nextIndex); setRemaining(seconds); deadline.current = Date.now() + seconds * 1000; } } }, 200); return () => clearInterval(timer); }, [finish, paused, remaining, routine, stepIndex]);
  const togglePause = () => { if (paused) deadline.current = Date.now() + remaining * 1000; setPaused((value) => !value); };
  const skip = () => { if (!routine) return; if (stepIndex >= routine.steps.length - 1) finish(routine); else { const next = stepIndex + 1; setStepIndex(next); setRemaining(routine.steps[next].durationSeconds); deadline.current = Date.now() + routine.steps[next].durationSeconds * 1000; setPaused(false); } };
  if (isLoading || !routine) return <SafeAreaView edges={['top', 'bottom']} style={styles.center}><ActivityIndicator color={colors.sessionAccent} /></SafeAreaView>;
  const step = routine.steps[stepIndex]; const progress = ((stepIndex + (1 - remaining / step.durationSeconds)) / routine.steps.length) * 100;
  const illustrationSize = Math.min(220, Math.max(168, width - 160));
  const nextStep = routine.steps[stepIndex + 1];
  return <SafeAreaView edges={['top']} style={styles.screen}><View style={styles.topBar}><Pressable accessibilityLabel="루틴 종료" accessibilityRole="button" onPress={() => setShowExitConfirm(true)} style={({ pressed }) => [styles.exitButton, pressed && styles.pressed]}><AppIcon color={colors.white} name="close" size={22}/></Pressable><Text style={styles.progressLabel}>{stepIndex + 1} / {routine.steps.length}</Text><Pressable accessibilityRole="button" onPress={skip} style={({ pressed }) => [styles.skipButton, pressed && styles.pressed]}><Text style={styles.skipText}>건너뛰기</Text></Pressable></View><View accessibilityLabel={`루틴 진행률 ${Math.round(progress)}퍼센트`} accessibilityRole="progressbar" accessibilityValue={{ min: 0, max: 100, now: Math.round(progress) }} style={styles.progressTrack}><View style={[styles.progressFill, { width: `${progress}%` }]} /></View><ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false} style={styles.bodyScroll}>
    <Text style={styles.stepLabel}>{stepIndex + 1}번째 동작</Text><Text accessibilityRole="header" style={styles.title}>{step.title}</Text><Text style={styles.instruction}>{step.instruction}</Text><View style={styles.illustration}><RoutineIllustration size={illustrationSize} step={step} /></View><Text accessibilityLiveRegion="polite" style={styles.timer}>{String(Math.floor(remaining / 60)).padStart(2, '0')}:{String(remaining % 60).padStart(2, '0')}</Text><Text style={styles.breathe}>{paused ? '잠시 쉬어도 괜찮아요' : '호흡을 이어가며 천천히 움직이세요'}</Text>{nextStep ? <Text style={styles.nextStep}>다음 · {nextStep.title}</Text> : <Text style={styles.nextStep}>마지막 동작이에요</Text>}
  </ScrollView><View style={[styles.actions, { paddingBottom: Math.max(insets.bottom, 18) }]}><Pressable accessibilityRole="button" onPress={togglePause} style={({ pressed }) => [styles.pauseButton, pressed && styles.pressed]}><View style={styles.pauseIcon}><AppIcon color={colors.recovery} name={paused ? 'play' : 'pause'} size={20}/></View><Text style={styles.pauseText}>{paused ? '계속하기' : '잠시 멈추기'}</Text></Pressable></View>
    <Modal animationType="fade" onRequestClose={() => setShowExitConfirm(false)} transparent visible={showExitConfirm}>
      <View style={styles.modalOverlay}><Pressable accessibilityLabel="중단 확인 닫기" onPress={() => setShowExitConfirm(false)} style={StyleSheet.absoluteFill}/><View accessibilityViewIsModal style={styles.exitDialog}><Text style={styles.exitTitle}>루틴을 중단할까요?</Text><Text style={styles.exitDescription}>지금까지 진행한 동작은 완료 기록에 포함되지 않아요.</Text><View style={styles.exitActions}><Pressable accessibilityRole="button" onPress={() => setShowExitConfirm(false)} style={({ pressed }) => [styles.exitSecondary, pressed && styles.pressed]}><Text style={styles.exitSecondaryText}>계속하기</Text></Pressable><Pressable accessibilityRole="button" onPress={() => router.replace('/routine')} style={({ pressed }) => [styles.exitDanger, pressed && styles.pressed]}><Text style={styles.exitDangerText}>중단하기</Text></Pressable></View></View></View>
    </Modal>
  </SafeAreaView>;
}
