import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ClockGlyph } from '@/components/glyphs';
import { useRoutineSession } from '@/context/routine-session-context';
import { getCompletionsByPeriod } from '@/services/backend/routine-completion';
import { CHEKI } from '@/lib/cheki';
import { addDays, toLocalDateId } from '@/utils/date';
import { text } from '@/theme/typography';
import { usePalette } from '@/theme/use-palette';

function formatElapsed(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return m > 0 ? `${m}분 ${s}초` : `${s}초`;
}

/** 이번 주(월요일~오늘)에 실제로 완료한 루틴 횟수 — 배지에 쓴다. */
async function loadWeeklyCompletionCount(): Promise<number> {
  const todayId = toLocalDateId();
  const dow = new Date().getDay();
  const daysSinceMonday = dow === 0 ? 6 : dow - 1;
  const start = addDays(todayId, -daysSinceMonday);
  try {
    const completions = await getCompletionsByPeriod(start, todayId);
    return completions.length;
  } catch {
    return 0;
  }
}

/** `Momgirok v8.dc.html` → `isRoutineDone` 을 실제 완료 결과로 다시 짠 것. */
export default function RoutineCompleteScreen() {
  const c = usePalette();
  const router = useRouter();
  const { plan, completion, completeError } = useRoutineSession();
  const [weeklyCount, setWeeklyCount] = useState<number | null>(null);

  useEffect(() => { void loadWeeklyCompletionCount().then(setWeeklyCount); }, []);

  const doneRows = plan && completion ? [
    { key: '실행 시간', k: '실행 시간', v: formatElapsed(completion.completedSeconds) },
    { key: '완료한 동작', k: '완료한 동작', v: `${completion.completedSteps} / ${plan.steps.length}` },
    { key: '적용 부위', k: '적용 부위', v: plan.targetArea || '전신' },
  ] : [];

  return (
    <SafeAreaView edges={['top']} style={[s.screen, { backgroundColor: c.card }]}>
      <ScrollView contentContainerStyle={s.body} showsVerticalScrollIndicator={false}>
        <View style={s.completeHero}>
          <View style={[s.completeHeroCircle, { backgroundColor: c.priLightest }]} />
          <Image accessible={false} resizeMode="contain" source={CHEKI.sleep} style={s.completeMascot} />
        </View>

        <View style={s.headCopy}>
          {weeklyCount ? (
            <View style={[s.badge, { backgroundColor: c.priLightest }]}>
              <Text style={[text({ size: 12, weight: 700 }), { color: c.priDk }]}>이번 주 {weeklyCount}번째 루틴</Text>
            </View>
          ) : null}
          <Text style={[text({ size: 25, weight: 700, tracking: -0.04, leading: 1.4 }), s.title, { color: c.g900 }]}>루틴을 마쳤어요</Text>
        </View>

        {completeError ? <Text style={[text({ size: 12.5, weight: 600 }), s.errorText, { color: c.danger }]}>{completeError}</Text> : null}

        {doneRows.length > 0 ? (
          <View style={[s.summaryCard, { borderColor: c.g200 }]}>
            {doneRows.map((row, i) => (
              <View key={row.key} style={[s.summaryRow, i < doneRows.length - 1 && { borderBottomWidth: 1, borderBottomColor: c.g200 }]}>
                <Text style={[text({ size: 13.5 }), { color: c.g600 }]}>{row.k}</Text>
                <Text style={[text({ size: 14, weight: 700, tracking: -0.03, tabular: true }), { color: c.g900 }]}>{row.v}</Text>
              </View>
            ))}
          </View>
        ) : null}

        <NoteCard c={c} />
      </ScrollView>

      <View style={s.footer}>
        <Pressable accessibilityRole="button" onPress={() => router.push('/routine/feedback')} style={[s.feedbackBtn, { borderColor: c.g300 }]}>
          <Text style={[text({ size: 14, weight: 700 }), { color: c.g800 }]}>효과 미리 답하기</Text>
        </Pressable>
        <Pressable accessibilityRole="button" onPress={() => router.dismissTo('/(tabs)/home')} style={[s.homeBtn, { backgroundColor: c.pri }]}>
          <Text style={[text({ size: 16, weight: 700 }), { color: '#fff' }]}>홈으로</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

function NoteCard({ c }: { c: ReturnType<typeof usePalette> }) {
  return (
    <View style={[s.noteCard, { backgroundColor: c.g100 }]}>
      <ClockGlyph color={c.g500} size={17} />
      <Text style={[text({ size: 12.5, leading: 1.7 }), s.flex1, { color: c.g600 }]}>내일 아침에 &quot;어제 루틴이 도움이 됐나요?&quot;라고 한 번 더 물어볼게요. 답을 모아 다음 추천에 반영해요.</Text>
    </View>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1 },
  flex1: { flex: 1, minWidth: 0 },
  body: { paddingTop: 36, paddingHorizontal: 20, paddingBottom: 20 },

  completeHero: { position: 'relative', alignSelf: 'center', width: 132, height: 110, alignItems: 'center', justifyContent: 'center' },
  completeHeroCircle: { position: 'absolute', width: 104, height: 104, borderRadius: 54 },
  completeMascot: { width: 124, height: 124 },

  headCopy: { marginTop: 18, alignItems: 'center' },
  badge: { height: 28, paddingHorizontal: 12, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  title: { marginTop: 14 },
  errorText: { marginTop: 14, textAlign: 'center' },

  summaryCard: { marginTop: 22, paddingHorizontal: 16, borderWidth: 1, borderRadius: 18 },
  summaryRow: { minHeight: 48, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },

  noteCard: { marginTop: 20, padding: 14, paddingHorizontal: 16, borderRadius: 16, flexDirection: 'row', gap: 10 },

  footer: { padding: 12, paddingHorizontal: 20, paddingBottom: 26, flexDirection: 'row', gap: 10 },
  feedbackBtn: { flexBasis: 116, flexGrow: 0, height: 54, borderWidth: 1, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
  homeBtn: { flex: 1, height: 54, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
});
