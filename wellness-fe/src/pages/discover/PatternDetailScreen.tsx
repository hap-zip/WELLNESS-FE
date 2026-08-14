import { useLocalSearchParams, useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ChevronGlyph, ChevronMediumGlyph, HkGlyph } from '@/components/glyphs';
import { SubScreenHeader } from '@/components/ui/sub-screen-header';
import { text } from '@/theme/typography';
import { usePalette } from '@/theme/use-palette';
import {
  isPatternId, PATTERN_ACTIONS, PATTERN_BODY, PATTERN_EXCEPTIONS, PATTERN_EX_COUNT,
  PATTERN_MATCHES, PATTERN_MATCH_COUNT, PATTERN_TAG, patternDataRows,
} from './pattern.data';

/** `Momgirok v8.dc.html` → `<sc-if value="{{ isPattern }}">` 를 그대로 옮긴 것. */
export default function PatternDetailScreen() {
  const c = usePalette();
  const router = useRouter();
  const params = useLocalSearchParams<{ patternId?: string }>();
  const id = isPatternId(params.patternId ?? '') ? (params.patternId as 'a' | 'b') : 'a';

  const danger = id === 'a';
  const rows = patternDataRows(id);
  const matches = PATTERN_MATCHES[id];
  const exceptions = PATTERN_EXCEPTIONS[id];

  return (
    <SafeAreaView edges={['top']} style={[s.screen, { backgroundColor: c.bg }]}>
      <SubScreenHeader backLabel="커넥션으로 돌아가기" fallback={() => router.replace('/(tabs)/discover')} title="패턴 상세" />
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={[s.section, { backgroundColor: c.card }]}>
          <View style={[s.tag, { backgroundColor: danger ? c.dangerBg : c.priLightest }]}>
            <Text style={[text({ size: 11.5, weight: 700 }), { color: danger ? c.dangerDk : c.priDk }]}>{PATTERN_TAG[id]}</Text>
          </View>
          <Text style={[text({ size: 24, weight: 700, tracking: -0.04, leading: 1.45 }), s.title, { color: c.g900 }]}>{
            id === 'b' ? '루틴을 한 날은 다음 날 불편 강도가 1단계 낮았어요' : '수면이 6시간보다 짧았던 다음 날, 어깨 불편이 함께 기록됐어요'
          }</Text>
          <Text style={[text({ size: 13.5, leading: 1.75 }), s.body, { color: c.g600 }]}>{PATTERN_BODY[id]}</Text>
          <View style={[s.noteBox, { backgroundColor: c.g100 }]}>
            <Text style={[text({ size: 11.5, leading: 1.7 }), { color: c.g600 }]}>같은 날 함께 기록됐다는 뜻이에요. 원인을 확정하거나 진단하는 정보가 아니에요.</Text>
          </View>
        </View>

        <View style={[s.section, s.dataSection, { backgroundColor: c.card }]}>
          <Text style={[text({ size: 12.5, weight: 700 }), { color: c.g500 }]}>사용한 데이터</Text>
          <View style={[s.dataCard, { borderColor: c.g200 }]}>
            {rows.map((row, i) => (
              <View key={row.key} style={[s.dataRow, i < rows.length - 1 && { borderBottomWidth: 1, borderBottomColor: c.g200 }]}>
                <Text style={[text({ size: 13 }), { color: c.g600 }]}>{row.k}</Text>
                <Text style={[text({ size: 13.5, weight: 700, tracking: -0.025, tabular: true }), { color: c.g900 }]}>{row.v}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={[s.section, s.matchesSection, { backgroundColor: c.card }]}>
          <View style={s.matchesHead}>
            <Text style={[text({ size: 12.5, weight: 700 }), { color: c.g500 }]}>해당한 날 · {PATTERN_MATCH_COUNT[id]}일</Text>
            <Text style={[text({ size: 11.5, weight: 600 }), { color: c.g400 }]}>날짜를 누르면 기록으로 이동</Text>
          </View>
          <View style={s.matchList}>
            {matches.map((m) => (
              <Pressable key={m.date} accessibilityRole="button" onPress={() => router.dismissTo('/(tabs)/records')} style={[s.matchRow, { borderColor: c.g200 }]}>
                <View style={[s.matchDot, { backgroundColor: c.danger }]} />
                <Text style={[text({ size: 13.5, weight: 700, tabular: true }), { color: c.g900 }]}>{m.date}</Text>
                <Text numberOfLines={1} style={[text({ size: 12.5 }), s.flex1, { color: c.g600 }]}>{m.detail}</Text>
                <ChevronGlyph color={c.g400} />
              </Pressable>
            ))}
          </View>

          <Text style={[text({ size: 12.5, weight: 700 }), s.exHead, { color: c.g500 }]}>예외였던 날 · {PATTERN_EX_COUNT[id]}일</Text>
          <View style={s.exList}>
            {exceptions.map((m) => (
              <View key={m.date} style={[s.exRow, { backgroundColor: c.g100 }]}>
                <View style={[s.matchDot, { backgroundColor: c.g400 }]} />
                <Text style={[text({ size: 13, weight: 700, tabular: true }), { color: c.g700 }]}>{m.date}</Text>
                <Text style={[text({ size: 12, leading: 1.5 }), s.flex1, { color: c.g500 }]}>{m.detail}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={[s.section, s.actionsSection, { backgroundColor: c.card }]}>
          <Text style={[text({ size: 12.5, weight: 700 }), { color: c.g500 }]}>해볼 수 있는 것</Text>
          <View style={s.actionList}>
            {PATTERN_ACTIONS.map((a) => (
              <Pressable key={a.key} accessibilityRole="button" onPress={() => router.push(a.to)} style={[s.actionRow, { borderColor: c.g200 }]}>
                <View style={[s.actionIconWrap, { backgroundColor: c.priLightest }]}>
                  <HkGlyph color={c.priDk} id={a.icon} size={19} />
                </View>
                <View style={s.flex1}>
                  <Text style={[text({ size: 14.5, weight: 700, tracking: -0.03 }), { color: c.g900 }]}>{a.title}</Text>
                  <Text style={[text({ size: 11.5 }), s.actionMeta, { color: c.g500 }]}>{a.meta}</Text>
                </View>
                <ChevronMediumGlyph color={c.g400} size={16} />
              </Pressable>
            ))}
          </View>
        </View>
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1 },
  flex1: { flex: 1, minWidth: 0 },
  section: { padding: 20 },

  tag: { alignSelf: 'flex-start', height: 26, paddingHorizontal: 11, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  title: { marginTop: 14 },
  body: { marginTop: 10 },
  noteBox: { marginTop: 16, padding: 13, paddingHorizontal: 15, borderRadius: 14 },

  dataSection: { marginTop: 10, paddingBottom: 20 },
  dataCard: { marginTop: 12, paddingHorizontal: 16, borderWidth: 1, borderRadius: 16 },
  dataRow: { minHeight: 46, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },

  matchesSection: { marginTop: 10, paddingBottom: 20 },
  matchesHead: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' },
  matchList: { marginTop: 12, gap: 8 },
  matchRow: { flexDirection: 'row', alignItems: 'center', gap: 11, padding: 13, paddingHorizontal: 14, borderWidth: 1, borderRadius: 15 },
  matchDot: { width: 8, height: 8, borderRadius: 5 },
  exHead: { marginTop: 20 },
  exList: { marginTop: 10, gap: 8 },
  exRow: { flexDirection: 'row', alignItems: 'center', gap: 11, padding: 12, paddingHorizontal: 14, borderRadius: 15 },

  actionsSection: { marginTop: 10, paddingBottom: 22 },
  actionList: { marginTop: 12, gap: 8 },
  actionRow: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderWidth: 1, borderRadius: 16 },
  actionIconWrap: { width: 40, height: 40, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  actionMeta: { marginTop: 3 },
});
