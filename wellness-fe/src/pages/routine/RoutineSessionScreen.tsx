import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle } from 'react-native-svg';
import type { RoutinePlan } from '@/domain/wellness';
import { useAsyncData } from '@/hooks/use-async-data';
import { wellnessApi } from '@/services/wellness-api';
import { AppIcon } from '@/components/app-icon';
import { colors } from '@/theme/tokens';
import { sessionStyles as styles } from './routine-session.styles';

export default function RoutineSessionScreen() {
  const router = useRouter(); const insets = useSafeAreaInsets();
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
  const nextStep = routine.steps[stepIndex + 1];
  const circumference = 616;
  const stepProgress = remaining / step.durationSeconds;
  return <SafeAreaView edges={['top']} style={styles.screen}><View style={styles.topBar}><Pressable accessibilityLabel="루틴 종료" accessibilityRole="button" onPress={() => setShowExitConfirm(true)} style={({ pressed }) => [styles.exitButton, pressed && styles.pressed]}><AppIcon color={colors.white} name="close" size={22}/></Pressable><Text numberOfLines={1} style={styles.progressLabel}>{stepIndex + 1} / {routine.steps.length} · {routine.title}</Text><View style={styles.topSpacer}/></View><ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false} style={styles.bodyScroll}>
    <View accessibilityLabel={`남은 시간 ${remaining}초, 루틴 진행률 ${Math.round(progress)}퍼센트`} accessibilityRole="progressbar" accessibilityValue={{ min: 0, max: 100, now: Math.round(progress) }} style={styles.timerRing}><Svg height={216} width={216}><Circle cx={108} cy={108} fill="none" r={98} stroke="rgba(255,255,255,.13)" strokeWidth={8}/><Circle cx={108} cy={108} fill="none" r={98} rotation={-90} origin="108,108" stroke={colors.sessionAccent} strokeDasharray={`${circumference} ${circumference}`} strokeDashoffset={circumference * (1 - stepProgress)} strokeLinecap="round" strokeWidth={8}/></Svg><View style={styles.timerCenter}><Text accessibilityLiveRegion="polite" style={styles.timer}>{String(Math.floor(remaining / 60)).padStart(2, '0')}:{String(remaining % 60).padStart(2, '0')}</Text><Text style={styles.timerLabel}>남은 시간</Text></View></View><Text accessibilityRole="header" style={styles.title}>{step.title}</Text><Text style={styles.instruction}>{step.instruction}</Text><Text style={styles.breathe}>{paused ? '잠시 쉬어도 괜찮아요' : '호흡을 이어가며 천천히 움직이세요'}</Text>{nextStep ? <Text style={styles.nextStep}>다음 · {nextStep.title}</Text> : <Text style={styles.nextStep}>마지막 동작이에요</Text>}
  </ScrollView><View style={[styles.actions, { paddingBottom: Math.max(insets.bottom, 18) }]}><Pressable accessibilityRole="button" onPress={togglePause} style={({ pressed }) => [styles.pauseButton, pressed && styles.pressed]}><AppIcon color={colors.session} name={paused ? 'play' : 'pause'} size={20}/><Text style={styles.pauseText}>{paused ? '계속하기' : '일시정지'}</Text></Pressable><Pressable accessibilityRole="button" onPress={skip} style={({ pressed }) => [styles.nextButton, pressed && styles.pressed]}><Text style={styles.nextButtonText}>다음</Text></Pressable></View>
    <Modal animationType="fade" onRequestClose={() => setShowExitConfirm(false)} transparent visible={showExitConfirm}>
      <View style={styles.modalOverlay}><Pressable accessibilityLabel="중단 확인 닫기" onPress={() => setShowExitConfirm(false)} style={StyleSheet.absoluteFill}/><View accessibilityViewIsModal style={styles.exitDialog}><Text style={styles.exitTitle}>루틴을 중단할까요?</Text><Text style={styles.exitDescription}>지금까지 진행한 동작은 완료 기록에 포함되지 않아요.</Text><View style={styles.exitActions}><Pressable accessibilityRole="button" onPress={() => setShowExitConfirm(false)} style={({ pressed }) => [styles.exitSecondary, pressed && styles.pressed]}><Text style={styles.exitSecondaryText}>계속하기</Text></Pressable><Pressable accessibilityRole="button" onPress={() => router.replace('/routine')} style={({ pressed }) => [styles.exitDanger, pressed && styles.pressed]}><Text style={styles.exitDangerText}>중단하기</Text></Pressable></View></View></View>
    </Modal>
  </SafeAreaView>;
}
