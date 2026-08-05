import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import NavigationBackButton from '@/components/navigation-back-button';
import type { RoutinePlan } from '@/domain/wellness';
import { useAsyncData } from '@/hooks/use-async-data';
import { wellnessApi } from '@/services/wellness-api';
import RoutineIllustration from './RoutineIllustration';
import { sessionStyles as styles } from './routine-session.styles';

export default function RoutineSessionScreen() {
  const router = useRouter(); const insets = useSafeAreaInsets();
  const { data: routine, isLoading } = useAsyncData<RoutinePlan | null>(wellnessApi.getTodayRoutine, null);
  const [stepIndex, setStepIndex] = useState(0); const [remaining, setRemaining] = useState(0); const [paused, setPaused] = useState(false);
  const deadline = useRef<number | null>(null); const initializedId = useRef<string | null>(null);
  const finish = useCallback((plan: RoutinePlan) => router.replace({ pathname: '/routine/complete', params: { routineId: plan.id, seconds: String(plan.totalSeconds), steps: String(plan.steps.length) } }), [router]);
  useEffect(() => { if (!routine || initializedId.current === routine.id) return; initializedId.current = routine.id; setRemaining(routine.steps[0].durationSeconds); deadline.current = Date.now() + routine.steps[0].durationSeconds * 1000; }, [routine]);
  useEffect(() => { if (!routine || paused || remaining <= 0) return; const timer = setInterval(() => { if (!deadline.current) return; const next = Math.max(0, Math.ceil((deadline.current - Date.now()) / 1000)); setRemaining(next); if (next === 0) { clearInterval(timer); if (stepIndex >= routine.steps.length - 1) finish(routine); else { const nextIndex = stepIndex + 1; const seconds = routine.steps[nextIndex].durationSeconds; setStepIndex(nextIndex); setRemaining(seconds); deadline.current = Date.now() + seconds * 1000; } } }, 200); return () => clearInterval(timer); }, [finish, paused, remaining, routine, stepIndex]);
  const togglePause = () => { if (paused) deadline.current = Date.now() + remaining * 1000; setPaused((value) => !value); };
  const skip = () => { if (!routine) return; if (stepIndex >= routine.steps.length - 1) finish(routine); else { const next = stepIndex + 1; setStepIndex(next); setRemaining(routine.steps[next].durationSeconds); deadline.current = Date.now() + routine.steps[next].durationSeconds * 1000; setPaused(false); } };
  if (isLoading || !routine) return <SafeAreaView edges={['top', 'bottom']} style={styles.center}><ActivityIndicator color="#1257E0" /></SafeAreaView>;
  const step = routine.steps[stepIndex]; const progress = ((stepIndex + (1 - remaining / step.durationSeconds)) / routine.steps.length) * 100;
  return <SafeAreaView edges={['top']} style={styles.screen}><View style={styles.topBar}><NavigationBackButton accessibilityLabel="루틴 종료" confirmDiscard fallbackHref="/routine" /><Text style={styles.progressLabel}>{stepIndex + 1} / {routine.steps.length}</Text><Pressable accessibilityRole="button" onPress={skip} style={styles.skipButton}><Text style={styles.skipText}>건너뛰기</Text></Pressable></View><View style={styles.progressTrack}><View style={[styles.progressFill, { width: `${progress}%` }]} /></View><View style={styles.body}>
    <Text style={styles.stepLabel}>STEP {stepIndex + 1}</Text><Text style={styles.title}>{step.title}</Text><Text style={styles.instruction}>{step.instruction}</Text><View style={styles.illustration}><RoutineIllustration size={230} step={step} /></View><Text accessibilityLiveRegion="polite" style={styles.timer}>{String(Math.floor(remaining / 60)).padStart(2, '0')}:{String(remaining % 60).padStart(2, '0')}</Text><Text style={styles.breathe}>{paused ? '잠시 쉬고 있어요' : '호흡을 멈추지 말고 천천히 움직여요'}</Text>
  </View><View style={[styles.actions, { paddingBottom: Math.max(insets.bottom, 18) }]}><Pressable accessibilityRole="button" onPress={togglePause} style={({ pressed }) => [styles.pauseButton, pressed && styles.pressed]}><Text style={styles.pauseIcon}>{paused ? '▶' : 'Ⅱ'}</Text><Text style={styles.pauseText}>{paused ? '계속하기' : '일시정지'}</Text></Pressable></View></SafeAreaView>;
}
