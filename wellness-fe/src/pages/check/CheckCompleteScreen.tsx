import { useRouter } from 'expo-router';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { BigCheckGlyph } from '@/components/glyphs';
import { CHEKI } from '@/lib/cheki';
import { useDailyCheck } from '@/context/daily-check-context';
import { text } from '@/theme/typography';
import { usePalette } from '@/theme/use-palette';
import { CONDITION_OPTIONS, fmtSleep, PILLOW_LABELS, resolvedSleepMin, SLEEP_POSES, ZONE_LABELS } from './check.data';

/**
 * `Momgirok v8.dc.html` → `<sc-if value="{{ isDone }}">` 을 그대로 옮긴 것.
 * "8일 연속 기록"·추천 루틴 카드는 프로토타입의 고정 시연 문구다 — 실제 연속
 * 기록 계산과 루틴 추천 로직이 붙기 전까지는 이 값 그대로 둔다.
 */

export default function CheckCompleteScreen() {
  const c = usePalette();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { draft, resetDraft } = useDailyCheck();

  const poseLabel = draft.pose ? SLEEP_POSES.find((p) => p.id === draft.pose)?.label ?? '미입력' : '미입력';
  const pillowLabel = draft.pillow !== null ? PILLOW_LABELS[draft.pillow] : '미입력';
  const partsLabel = draft.parts.length
    ? draft.parts.map((p) => `${ZONE_LABELS[p] ?? p} ${draft.levels[p] ?? 2}단계`).join(', ')
    : '없음';

  const conditionLabel = draft.condition ? CONDITION_OPTIONS.find((o) => o.id === draft.condition)?.label ?? '미입력' : '미입력';

  const doneRows = [
    { key: 'condition', label: '컨디션', value: conditionLabel, tone: false },
    { key: 'pose', label: '자세·베개', value: `${poseLabel} · 베개 ${pillowLabel}`, tone: false },
    { key: 'sleep', label: '수면', value: fmtSleep(resolvedSleepMin(draft.hk, draft.hkManual, draft.hkAuto)), tone: false },
    { key: 'ache', label: '불편', value: partsLabel, tone: true },
  ];

  const goHome = () => { resetDraft(); router.dismissTo('/(tabs)/home'); };
  const goRoutine = () => router.replace('/routine');
  /** 완료 화면에서도 기록을 고칠 수 있어야 한다 — 초안은 아직 메모리에 남아 있으니
   * 검토 단계로 돌아가면 각 항목의 "수정"으로 원하는 단계에 바로 들어갈 수 있다. */
  const goEdit = () => router.replace('/check/review');

  return (
    <SafeAreaView edges={['top']} style={[s.screen, { backgroundColor: c.card }]}>
      <ScrollView contentContainerStyle={s.body} showsVerticalScrollIndicator={false}>
        <View style={s.completeHero}>
          <View style={[s.completeHeroCircle, { backgroundColor: c.priLightest }]} />
          <Image accessibilityIgnoresInvertColors resizeMode="contain" source={CHEKI.welcome} style={s.completeMascot} />
          <View style={[s.completeBadge, { backgroundColor: c.pri, borderColor: c.card }]}>
            <BigCheckGlyph size={17} strokeWidth={3.2} />
          </View>
        </View>

        <View style={s.headCopy}>
          <View style={[s.badge, { backgroundColor: c.priLightest }]}>
            <Text style={[text({ size: 12, weight: 700 }), { color: c.priDk }]}>8일 연속 기록</Text>
          </View>
          <Text style={[text({ size: 26, weight: 700, tracking: -0.04, leading: 1.4 }), s.title, { color: c.g900 }]}>오늘의 몸을{'\n'}기록했어요</Text>
        </View>

        <View style={s.summaryHead}>
          <Text style={[text({ size: 13, weight: 700 }), { color: c.g600 }]}>오늘 기록</Text>
          <Pressable accessibilityRole="button" onPress={goEdit} style={[s.editPill, { borderColor: c.g300 }]}>
            <Text style={[text({ size: 12, weight: 700 }), { color: c.g700 }]}>수정</Text>
          </Pressable>
        </View>
        <View style={[s.summaryCard, { borderColor: c.g200 }]}>
          {doneRows.map((row, i) => (
            <View key={row.key} style={[s.summaryRow, i < doneRows.length - 1 && { borderBottomWidth: 1, borderBottomColor: c.g200 }]}>
              <Text style={[text({ size: 13.5 }), { color: c.g600 }]}>{row.label}</Text>
              <Text numberOfLines={1} style={[text({ size: 14, weight: 700, tracking: -0.03 }), s.summaryValue, { color: row.tone ? c.danger : c.g900 }]}>{row.value}</Text>
            </View>
          ))}
        </View>

        <Pressable
          accessibilityRole="button"
          onPress={goRoutine}
          style={({ pressed }) => [s.routineCard, { backgroundColor: c.priDk, experimental_backgroundImage: `linear-gradient(140deg, ${c.pri}, ${c.priDk})` }, pressed && s.pressed]}>
          <Text style={[text({ size: 11.5, weight: 700 }), { color: 'rgba(255,255,255,.85)' }]}>오늘의 추천 루틴</Text>
          <Text style={[text({ size: 18, weight: 700, tracking: -0.035 }), s.routineTitle, { color: '#fff' }]}>목 주변 가볍게 이완하기</Text>
          <Text style={[text({ size: 12.5 }), s.routineMeta, { color: 'rgba(255,255,255,.85)' }]}>2분 · 3개 동작 · 어깨 중심</Text>
        </Pressable>
      </ScrollView>

      <View style={[s.footer, { paddingBottom: 26 + insets.bottom }]}>
        <Pressable accessibilityRole="button" onPress={goHome} style={[s.homeBtn, { borderColor: c.g300 }]}>
          <Text style={[text({ size: 15, weight: 700 }), { color: c.g800 }]}>홈으로</Text>
        </Pressable>
        <Pressable accessibilityRole="button" onPress={goRoutine} style={({ pressed }) => [s.routineBtn, { backgroundColor: c.pri }, pressed && s.pressed]}>
          <Text style={[text({ size: 16, weight: 700 }), { color: '#fff' }]}>루틴 시작하기</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1 },
  body: { paddingTop: 40, paddingHorizontal: 20, paddingBottom: 20 },
  pressed: { transform: [{ scale: 0.975 }] },

  completeHero: { position: 'relative', alignSelf: 'center', width: 150, height: 130, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'center' },
  completeHeroCircle: { position: 'absolute', left: '50%', bottom: 6, marginLeft: -59, width: 118, height: 118, borderRadius: 60 },
  completeMascot: { width: 132, height: 132 },
  completeBadge: { position: 'absolute', right: 8, top: 12, width: 34, height: 34, borderRadius: 18, borderWidth: 3, alignItems: 'center', justifyContent: 'center' },

  headCopy: { marginTop: 20, alignItems: 'center' },
  badge: { height: 28, paddingHorizontal: 12, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  title: { marginTop: 14, textAlign: 'center' },

  summaryHead: { marginTop: 24, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  editPill: { height: 30, paddingHorizontal: 13, borderWidth: 1, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  summaryCard: { marginTop: 10, paddingHorizontal: 16, borderWidth: 1, borderRadius: 18 },
  summaryRow: { minHeight: 50, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  summaryValue: { flexShrink: 1, textAlign: 'right' },

  routineCard: { marginTop: 12, padding: 16, borderRadius: 18 },
  routineTitle: { marginTop: 7 },
  routineMeta: { marginTop: 5 },

  footer: { paddingHorizontal: 20, paddingTop: 12, flexDirection: 'row', gap: 10 },
  homeBtn: { flexBasis: 100, flexGrow: 0, height: 54, borderWidth: 1, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
  routineBtn: { flex: 1, height: 54, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
});
