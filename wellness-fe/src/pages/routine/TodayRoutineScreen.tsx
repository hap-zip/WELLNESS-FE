import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { ActivityIndicator, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { HkGlyph, PlayGlyph } from '@/components/glyphs';
import { SubScreenHeader } from '@/components/ui/sub-screen-header';
import { useRoutineSession } from '@/context/routine-session-context';
import { useStretchList } from '@/hooks/use-stretch-map';
import { pickStretchFor, stableSeed } from '@/services/exercise-gifs-api';
import { text } from '@/theme/typography';
import { usePalette } from '@/theme/use-palette';

/** `Momgirok v8.dc.html` → `isRoutineDetail` 을 실제 `/api/routines/today` 데이터로 다시 짠 것. */
export default function TodayRoutineScreen() {
  const c = usePalette();
  const router = useRouter();
  const { plan, loading, loadError, loadPlan, beginSession } = useRoutineSession();
  const stretches = useStretchList();

  useEffect(() => { void loadPlan(); }, [loadPlan]);

  const start = () => {
    beginSession();
    router.push('/routine/session');
  };

  if (loading) {
    return <SafeAreaView edges={['top']} style={[s.screen, { backgroundColor: c.bg }]}>
      <SubScreenHeader backLabel="홈으로 돌아가기" fallback={() => router.replace('/(tabs)/home')} title="오늘의 루틴" />
      <View style={s.center}><ActivityIndicator color={c.pri} /></View>
    </SafeAreaView>;
  }

  if (loadError || !plan) {
    return <SafeAreaView edges={['top']} style={[s.screen, { backgroundColor: c.bg }]}>
      <SubScreenHeader backLabel="홈으로 돌아가기" fallback={() => router.replace('/(tabs)/home')} title="오늘의 루틴" />
      <View style={s.center}>
        <Text style={[text({ size: 14, weight: 700 }), { color: c.g700 }]}>{loadError || '오늘의 루틴을 찾을 수 없어요'}</Text>
        <Pressable accessibilityRole="button" onPress={() => void loadPlan()} style={[s.retryBtn, { borderColor: c.g300 }]}>
          <Text style={[text({ size: 13.5, weight: 700 }), { color: c.g700 }]}>다시 시도</Text>
        </Pressable>
      </View>
    </SafeAreaView>;
  }

  const totalMinutes = Math.round(plan.totalSeconds / 60) || Math.ceil(plan.totalSeconds / 60);
  const meta = [
    { key: 'time', label: '예상 시간', value: plan.totalSeconds >= 60 ? `${totalMinutes}분` : `${plan.totalSeconds}초`, icon: 'routine' as const },
    { key: 'intensity', label: '강도', value: plan.intensity, icon: 'flame' as const },
    { key: 'area', label: '적용 부위', value: plan.targetArea || '전신', icon: 'ache' as const },
  ];

  return (
    <SafeAreaView edges={['top']} style={[s.screen, { backgroundColor: c.bg }]}>
      <SubScreenHeader backLabel="홈으로 돌아가기" fallback={() => router.replace('/(tabs)/home')} title="오늘의 루틴" />
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={[s.section, { backgroundColor: c.card }]}>
          {plan.reason ? (
            <View style={[s.reasonCard, { backgroundColor: c.priLightest }]}>
              <View style={s.reasonHead}>
                <HkGlyph color={c.priDk} id="ache" size={15} />
                <Text style={[text({ size: 11.5, weight: 700 }), { color: c.priDk }]}>이 루틴을 추천한 이유</Text>
              </View>
              <Text style={[text({ size: 14, leading: 1.7 }), s.reasonBody, { color: c.g800 }]}>{plan.reason}</Text>
            </View>
          ) : null}

          <Text style={[text({ size: 25, weight: 700, tracking: -0.045, leading: 1.4 }), s.title, { color: c.g900 }]}>{plan.title}</Text>
          {plan.description ? <Text style={[text({ size: 13.5, leading: 1.7 }), s.description, { color: c.g600 }]}>{plan.description}</Text> : null}

          <View style={s.metaGrid}>
            {meta.map((m) => (
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
          {plan.caution ? <Text style={[text({ size: 12, leading: 1.6 }), s.caution, { color: c.g500 }]}>{plan.caution}</Text> : null}
        </View>

        <View style={[s.section, s.movesSection, { backgroundColor: c.card }]}>
          <View style={s.movesHead}>
            <Text style={[text({ size: 16, weight: 700, tracking: -0.03 }), { color: c.g900 }]}>동작 {plan.steps.length}개</Text>
            <Text style={[text({ size: 12, weight: 600 }), { color: c.g500 }]}>총 {totalMinutes > 0 ? `${totalMinutes}분` : `${plan.totalSeconds}초`}</Text>
          </View>
          <View style={s.moveList}>
            {plan.steps.map((step, i) => {
              // 단계 번호가 아니라 루틴 기준으로 seed를 고정한다 — stepsData는 서로 다른
              // 동작이 아니라 한 스트레칭을 설명하는 문장들이라, 단계마다 다른 GIF가
              // 나오면 안 된다(같은 루틴이면 항상 같은 GIF).
              const gif = stretches.length > 0 ? pickStretchFor(stretches, `${plan.targetArea} ${step.title} ${step.instruction}`, stableSeed(plan.targetArea || plan.id)) : undefined;
              return (
              <View key={step.id} style={[s.moveRow, { borderColor: c.g200 }]}>
                <View style={[s.moveArt, { backgroundColor: c.g100 }]}>
                  {gif ? <Image source={{ uri: gif.gifUrl }} style={s.moveGif} /> : <Text style={[text({ size: 18, weight: 700 }), { color: c.g500 }]}>{i + 1}</Text>}
                </View>
                <View style={s.flex1}>
                  <View style={s.moveTitleRow}>
                    <Text numberOfLines={1} style={[text({ size: 14.5, weight: 700, tracking: -0.03 }), s.flex1, { color: c.g900 }]}>{step.title}</Text>
                    <Text style={[text({ size: 12, weight: 700, tabular: true }), { color: c.g600 }]}>{step.durationSeconds}초</Text>
                  </View>
                  <Text style={[text({ size: 12, leading: 1.6 }), s.moveDesc, { color: c.g500 }]}>{step.instruction}</Text>
                </View>
              </View>
              );
            })}
          </View>
        </View>
        <View style={{ height: 20 }} />
      </ScrollView>

      <View style={[s.footer, { backgroundColor: c.card, borderTopColor: c.g200 }]}>
        <Pressable accessibilityRole="button" disabled={plan.steps.length === 0} onPress={start} style={({ pressed }) => [s.startBtn, { backgroundColor: c.pri, opacity: plan.steps.length === 0 ? 0.5 : 1 }, pressed && s.pressed]}>
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
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 14, paddingHorizontal: 30 },
  retryBtn: { minHeight: 44, paddingHorizontal: 20, borderWidth: 1, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },

  section: { padding: 20 },
  reasonCard: { padding: 18, borderRadius: 20 },
  reasonHead: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  reasonBody: { marginTop: 9 },
  title: { marginTop: 20 },
  description: { marginTop: 8 },
  metaGrid: { marginTop: 18, flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  metaCell: { width: '47%', padding: 13, paddingHorizontal: 14, borderWidth: 1, borderRadius: 15 },
  metaHead: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  metaIconWrap: { width: 22, height: 22, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  metaValue: { marginTop: 7 },
  caution: { marginTop: 14 },

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
