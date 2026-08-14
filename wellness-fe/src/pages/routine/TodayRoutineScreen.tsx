import { useRouter } from 'expo-router';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { HkGlyph, MoveGlyph, PlayGlyph } from '@/components/glyphs';
import { SubScreenHeader } from '@/components/ui/sub-screen-header';
import { useStretchMap } from '@/hooks/use-stretch-map';
import { text } from '@/theme/typography';
import { usePalette } from '@/theme/use-palette';
import { ROUTINE_META, ROUTINE_MOVES, ROUTINE_REASON, ROUTINE_TITLE } from './routine.data';

/**
 * `Momgirok v8.dc.html` → `isRoutineDetail` 을 그대로 옮긴 것.
 * 동작 카드의 그림은 손그림 아이콘 대신, 외부 무료 API(ExerciseGymGifsDB)에서 받아온
 * 실제 스트레칭 GIF를 우선 보여준다 — 아직 못 받아왔거나 실패하면 손그림으로 대체한다.
 */
export default function TodayRoutineScreen() {
  const c = usePalette();
  const router = useRouter();
  const stretches = useStretchMap();

  return (
    <SafeAreaView edges={['top']} style={[s.screen, { backgroundColor: c.bg }]}>
      <SubScreenHeader backLabel="홈으로 돌아가기" fallback={() => router.replace('/(tabs)/home')} title="오늘의 루틴" />
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={[s.section, { backgroundColor: c.card }]}>
          <View style={[s.reasonCard, { backgroundColor: c.priLightest }]}>
            <View style={s.reasonHead}>
              <HkGlyph color={c.priDk} id="ache" size={15} />
              <Text style={[text({ size: 11.5, weight: 700 }), { color: c.priDk }]}>이 루틴을 추천한 이유</Text>
            </View>
            <Text style={[text({ size: 14, leading: 1.7 }), s.reasonBody, { color: c.g800 }]}>{ROUTINE_REASON}</Text>
          </View>

          <Text style={[text({ size: 25, weight: 700, tracking: -0.045, leading: 1.4 }), s.title, { color: c.g900 }]}>{ROUTINE_TITLE}</Text>

          <View style={s.metaGrid}>
            {ROUTINE_META.map((m) => (
              <View key={m.key} style={[s.metaCell, { borderColor: c.g200 }]}>
                <View style={s.metaHead}>
                  <View style={[s.metaIconWrap, { backgroundColor: c.g100 }]}>
                    <HkGlyph color={c.g600} id={m.icon} size={13} />
                  </View>
                  <Text style={[text({ size: 11, weight: 600 }), { color: c.g500 }]}>{m.label}</Text>
                </View>
                <Text style={[text({ size: 15, weight: 700, tracking: -0.03 }), s.metaValue, { color: c.g900 }]}>{m.value}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={[s.section, s.movesSection, { backgroundColor: c.card }]}>
          <View style={s.movesHead}>
            <Text style={[text({ size: 16, weight: 700, tracking: -0.03 }), { color: c.g900 }]}>동작 3개</Text>
            <Text style={[text({ size: 12, weight: 600 }), { color: c.g500 }]}>총 2분</Text>
          </View>
          <View style={s.moveList}>
            {ROUTINE_MOVES.map((m) => {
              const gif = stretches[m.stretchSlug];
              return (
              <View key={m.key} style={[s.moveRow, { borderColor: c.g200 }]}>
                <View style={[s.moveArt, { backgroundColor: c.g100 }]}>
                  {gif ? <Image source={{ uri: gif.gifUrl }} style={s.moveGif} /> : <MoveGlyph accent={c.pri} ink={c.g800} pose={m.pose} size={56} />}
                </View>
                <View style={s.flex1}>
                  <View style={s.moveTitleRow}>
                    <Text style={[text({ size: 11, weight: 700, tabular: true }), { color: c.g400 }]}>{m.n}</Text>
                    <Text numberOfLines={1} style={[text({ size: 14.5, weight: 700, tracking: -0.03 }), s.flex1, { color: c.g900 }]}>{m.name}</Text>
                    <Text style={[text({ size: 12, weight: 700, tabular: true }), { color: c.g600 }]}>{m.sec}</Text>
                  </View>
                  <Text style={[text({ size: 12, leading: 1.6 }), s.moveDesc, { color: c.g500 }]}>{m.desc}</Text>
                </View>
              </View>
              );
            })}
          </View>
        </View>
        <View style={{ height: 20 }} />
      </ScrollView>

      <View style={[s.footer, { backgroundColor: c.card, borderTopColor: c.g200 }]}>
        <Pressable accessibilityRole="button" onPress={() => router.push('/routine/session')} style={({ pressed }) => [s.startBtn, { backgroundColor: c.pri }, pressed && s.pressed]}>
          <PlayGlyph color="#fff" />
          <Text style={[text({ size: 16, weight: 700, tracking: -0.025 }), { color: '#fff' }]}>루틴 시작</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1 },
  flex1: { flex: 1, minWidth: 0 },
  pressed: { transform: [{ scale: 0.975 }] },

  section: { padding: 20 },
  reasonCard: { padding: 18, borderRadius: 20 },
  reasonHead: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  reasonBody: { marginTop: 9 },
  title: { marginTop: 20 },
  metaGrid: { marginTop: 18, flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  metaCell: { width: '47%', padding: 13, paddingHorizontal: 14, borderWidth: 1, borderRadius: 15 },
  metaHead: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  metaIconWrap: { width: 22, height: 22, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  metaValue: { marginTop: 7 },

  movesSection: { marginTop: 10, paddingBottom: 22 },
  movesHead: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' },
  moveList: { marginTop: 14, gap: 10 },
  moveRow: { flexDirection: 'row', alignItems: 'center', gap: 13, padding: 13, paddingHorizontal: 14, borderWidth: 1, borderRadius: 16 },
  moveArt: { width: 56, height: 56, borderRadius: 15, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  moveGif: { width: '100%', height: '100%' },
  moveTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  moveDesc: { marginTop: 5 },

  footer: { padding: 12, paddingHorizontal: 20, paddingBottom: 26, borderTopWidth: 1 },
  startBtn: { height: 54, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, borderRadius: 28 },
});
