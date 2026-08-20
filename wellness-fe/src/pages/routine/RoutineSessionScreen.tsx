import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'expo-router';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle } from 'react-native-svg';

import { CloseGlyph } from '@/components/glyphs';
import { useRoutineSession } from '@/context/routine-session-context';
import { useStretchList } from '@/hooks/use-stretch-map';
import { pickStretchFor, stableSeed } from '@/services/exercise-gifs-api';
import { text } from '@/theme/typography';

const R = 98;
const CIRC = 2 * Math.PI * R; // ≈616

/**
 * `Momgirok v8.dc.html` → `isRoutine` 을 그대로 옮긴 것.
 * CLAUDE.md 지시대로 절대 시각 기준으로 계산한다 — setInterval 틱 카운트가
 * 아니라 "언제 끝나야 하는가"(endAt) 를 들고 있다가 화면이 꺼졌다 켜져도
 * Date.now() 와의 차이로 남은 시간을 다시 구한다.
 * 동작 내용·소요 시간은 오늘의 루틴 API 응답(plan.steps)을 그대로 쓴다.
 */
export default function RoutineSessionScreen() {
  const router = useRouter();
  const { plan, moveIndex, goToMove, completeSession } = useRoutineSession();
  const stretches = useStretchList();
  const step = plan?.steps[moveIndex];
  // moveIndex가 아니라 루틴 기준 seed — 실행 화면을 다음 단계로 넘겨도 같은 루틴이면
  // GIF가 계속 바뀌지 않고 유지돼야 한다(단계는 한 스트레칭의 진행 문장일 뿐이다).
  const gif = step && plan && stretches.length > 0 ? pickStretchFor(stretches, `${plan.targetArea} ${step.title} ${step.instruction}`, stableSeed(plan.targetArea || plan.id)) : undefined;
  const moveSeconds = step?.durationSeconds ?? 0;
  const [endAt, setEndAt] = useState(() => Date.now() + moveSeconds * 1000);
  const [running, setRunning] = useState(true);
  const [remaining, setRemaining] = useState(moveSeconds);
  const tick = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!plan) router.replace('/routine');
  }, [plan, router]);

  useEffect(() => {
    setEndAt(Date.now() + moveSeconds * 1000);
    setRemaining(moveSeconds);
    setRunning(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [moveIndex]);

  useEffect(() => {
    tick.current = setInterval(() => {
      setRemaining(running ? Math.max(0, Math.ceil((endAt - Date.now()) / 1000)) : remaining);
    }, 250);
    return () => { if (tick.current) clearInterval(tick.current); };
  }, [endAt, running, remaining]);

  const next = useCallback(() => {
    if (!plan) return;
    if (moveIndex >= plan.steps.length - 1) {
      void completeSession(plan.steps.length);
      router.replace('/routine/complete');
      return;
    }
    goToMove(moveIndex + 1);
  }, [completeSession, goToMove, moveIndex, plan, router]);

  // 타이머가 0에 닿으면(정지 상태가 아닐 때만) 자동으로 다음 동작으로 넘어간다.
  // remaining은 위 인터벌에서 0 밑으로 안 내려가게 clamp돼 있어서, 값이 실제로
  // 0이 되는 순간에만 이 effect가 다시 돌아 next()가 정확히 한 번만 불린다.
  useEffect(() => {
    if (running && remaining <= 0 && moveSeconds > 0) next();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [remaining, running]);

  if (!plan || !step) return null;

  const mm = String(Math.floor(remaining / 60)).padStart(2, '0');
  const ss = String(remaining % 60).padStart(2, '0');
  const ringOffset = CIRC * (1 - (moveSeconds ? remaining / moveSeconds : 0));

  const toggle = () => {
    if (running) {
      setRemaining(Math.max(0, Math.ceil((endAt - Date.now()) / 1000)));
      setRunning(false);
    } else {
      setEndAt(Date.now() + remaining * 1000);
      setRunning(true);
    }
  };

  return (
    <SafeAreaView edges={['top', 'bottom']} style={s.screen}>
      <View style={s.header}>
        <Pressable accessibilityLabel="루틴 종료" accessibilityRole="button" onPress={() => router.dismissTo('/(tabs)/home')} style={s.closeBtn}>
          <CloseGlyph color="#fff" size={20} />
        </Pressable>
        <Text style={[text({ size: 13, weight: 700 }), { color: 'rgba(255,255,255,.6)' }]}>{moveIndex + 1} / {plan.steps.length} · {plan.title}</Text>
        <View style={s.spacer} />
      </View>

      <View style={s.center}>
        {gif ? <Image source={{ uri: gif.gifUrl }} style={s.moveGif} /> : null}
        <View style={s.ringWrap}>
          <Svg height={216} style={s.ringRotate} viewBox="0 0 216 216" width={216}>
            <Circle cx={108} cy={108} fill="none" r={R} stroke="rgba(255,255,255,.13)" strokeWidth={8} />
            <Circle cx={108} cy={108} fill="none" r={R} stroke="#93C90F" strokeDasharray={CIRC} strokeDashoffset={ringOffset} strokeLinecap="round" strokeWidth={8} />
          </Svg>
          <View style={s.ringInner}>
            <Text style={[text({ size: 48, weight: 700, tracking: -0.055, tabular: true }), { color: '#fff' }]}>{mm}:{ss}</Text>
            <Text style={[text({ size: 12, weight: 600 }), s.remainLabel, { color: 'rgba(255,255,255,.5)' }]}>남은 시간</Text>
          </View>
        </View>
        <Text style={[text({ size: 23, weight: 700, tracking: -0.04 }), s.moveName, { color: '#fff' }]}>{step.title}</Text>
        <Text style={[text({ size: 14, leading: 1.75 }), s.moveDesc, { color: 'rgba(255,255,255,.6)' }]}>{step.instruction}</Text>
      </View>

      <View style={s.footer}>
        <Pressable accessibilityRole="button" onPress={toggle} style={s.timerBtn}>
          <Text style={[text({ size: 16, weight: 700 }), { color: '#fff' }]}>{running ? '일시정지' : '이어서 하기'}</Text>
        </Pressable>
        <Pressable accessibilityRole="button" onPress={next} style={s.nextBtn}>
          <Text style={[text({ size: 15, weight: 700 }), { color: '#fff' }]}>다음</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#16191D' },
  header: { height: 52, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 8, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: 'rgba(255,255,255,.14)' },
  closeBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  spacer: { width: 44 },

  center: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 28 },
  moveGif: { width: 120, height: 120, borderRadius: 20, marginBottom: 20, backgroundColor: 'rgba(255,255,255,.06)' },
  ringWrap: { width: 216, height: 216 },
  ringRotate: { transform: [{ rotate: '-90deg' }] },
  ringInner: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center' },
  remainLabel: { marginTop: 4 },
  moveName: { marginTop: 34, textAlign: 'center' },
  moveDesc: { marginTop: 11, maxWidth: 276, textAlign: 'center' },

  footer: { paddingHorizontal: 20, paddingBottom: 36, flexDirection: 'row', alignItems: 'center', gap: 10 },
  timerBtn: { flex: 1, height: 56, borderRadius: 29, alignItems: 'center', justifyContent: 'center', backgroundColor: '#93C90F' },
  nextBtn: { width: 92, height: 56, borderRadius: 29, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,.25)' },
});
