import { useState } from 'react';
import { useRouter } from 'expo-router';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ClockGlyph } from '@/components/glyphs';
import { CHEKI } from '@/lib/cheki';
import { text } from '@/theme/typography';
import { usePalette } from '@/theme/use-palette';
import type { Palette } from '@/theme/palette';
import { AFTER_FEEL_LABELS, DONE_ROWS } from './routine.data';

/** `Momgirok v8.dc.html` → `isRoutineDone` 을 그대로 옮긴 것. */
export default function RoutineCompleteScreen() {
  const c = usePalette();
  const router = useRouter();
  const [after, setAfter] = useState<number | null>(null);

  return (
    <SafeAreaView edges={['top']} style={[s.screen, { backgroundColor: c.card }]}>
      <ScrollView contentContainerStyle={s.body} showsVerticalScrollIndicator={false}>
        <View style={s.completeHero}>
          <View style={[s.completeHeroCircle, { backgroundColor: c.priLightest }]} />
          <Image accessible={false} resizeMode="contain" source={CHEKI.sleep} style={s.completeMascot} />
        </View>

        <View style={s.headCopy}>
          <View style={[s.badge, { backgroundColor: c.priLightest }]}>
            <Text style={[text({ size: 12, weight: 700 }), { color: c.priDk }]}>이번 주 3번째 루틴</Text>
          </View>
          <Text style={[text({ size: 25, weight: 700, tracking: -0.04, leading: 1.4 }), s.title, { color: c.g900 }]}>루틴을 마쳤어요</Text>
        </View>

        <View style={[s.summaryCard, { borderColor: c.g200 }]}>
          {DONE_ROWS.map((row, i) => (
            <View key={row.key} style={[s.summaryRow, i < DONE_ROWS.length - 1 && { borderBottomWidth: 1, borderBottomColor: c.g200 }]}>
              <Text style={[text({ size: 13.5 }), { color: c.g600 }]}>{row.k}</Text>
              <Text style={[text({ size: 14, weight: 700, tracking: -0.03, tabular: true }), { color: c.g900 }]}>{row.v}</Text>
            </View>
          ))}
        </View>

        <Text style={[text({ size: 13.5, weight: 700 }), s.feelLabel, { color: c.g700 }]}>지금 몸은 어떤가요?</Text>
        <View style={s.feelRow}>
          {AFTER_FEEL_LABELS.map((l, i) => {
            const on = after === i;
            return (
              <Pressable key={l} accessibilityRole="button" accessibilityState={{ selected: on }} onPress={() => setAfter(i)} style={[s.feelBtn, { borderColor: on ? c.pri : c.g200, backgroundColor: on ? c.priLightest : 'transparent' }]}>
                <Text style={[text({ size: 12.5, weight: on ? 700 : 500 }), { color: on ? c.priDk : c.g600 }]}>{l}</Text>
              </Pressable>
            );
          })}
        </View>

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

function NoteCard({ c }: { c: Palette }) {
  return (
    <View style={[s.noteCard, { backgroundColor: c.g100 }]}>
      <ClockGlyph color={c.g500} size={17} />
      <Text style={[text({ size: 12.5, leading: 1.7 }), s.flex1, { color: c.g600 }]}>내일 아침에 "어제 루틴이 도움이 됐나요?"라고 한 번 더 물어볼게요. 답을 모아 다음 추천에 반영해요.</Text>
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

  summaryCard: { marginTop: 22, paddingHorizontal: 16, borderWidth: 1, borderRadius: 18 },
  summaryRow: { minHeight: 48, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },

  feelLabel: { marginTop: 20 },
  feelRow: { marginTop: 10, flexDirection: 'row', gap: 8 },
  feelBtn: { flex: 1, minHeight: 48, borderWidth: 1.5, borderRadius: 25, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4 },

  noteCard: { marginTop: 20, padding: 14, paddingHorizontal: 16, borderRadius: 16, flexDirection: 'row', gap: 10 },

  footer: { padding: 12, paddingHorizontal: 20, paddingBottom: 26, flexDirection: 'row', gap: 10 },
  feedbackBtn: { flexBasis: 116, flexGrow: 0, height: 54, borderWidth: 1, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
  homeBtn: { flex: 1, height: 54, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
});
