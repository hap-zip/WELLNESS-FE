import { useEffect, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ChevronMediumGlyph, HkGlyph } from '@/components/glyphs';
import { SubScreenHeader } from '@/components/ui/sub-screen-header';
import { text } from '@/theme/typography';
import { usePalette } from '@/theme/use-palette';
import { loadPatternDetail, PATTERN_ACTIONS, type PatternDetailView } from './pattern.data';

/** `Momgirok v8.dc.html` → `<sc-if value="{{ isPattern }}">` 를 실제 패턴 상세 데이터로 다시 짠 것. */
export default function PatternDetailScreen() {
  const c = usePalette();
  const router = useRouter();
  const params = useLocalSearchParams<{ patternId?: string }>();
  const patternId = params.patternId ?? '';
  const [pattern, setPattern] = useState<PatternDetailView | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    void loadPatternDetail(patternId).then((result) => { if (active) setPattern(result); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [patternId]);

  const rows = pattern ? [
    { key: '기간', k: '기간', v: pattern.periodLabel || '기록 없음' },
    { key: '사용한 항목', k: '사용한 항목', v: [pattern.sourceMetric, pattern.targetMetric].filter(Boolean).join(' → ') || '정보 없음' },
    { key: '방향', k: '방향', v: pattern.relationDirection || '정보 없음' },
    { key: '상태', k: '상태', v: pattern.status || '정보 없음' },
  ] : [];

  return (
    <SafeAreaView edges={['top']} style={[s.screen, { backgroundColor: c.bg }]}>
      <SubScreenHeader backLabel="커넥션으로 돌아가기" fallback={() => router.replace('/(tabs)/discover')} title="패턴 상세" />
      {loading ? (
        <View style={s.loading}><ActivityIndicator color={c.pri} /></View>
      ) : !pattern ? (
        <View style={s.loading}>
          <Text style={[text({ size: 15, weight: 700 }), { color: c.g800 }]}>이 패턴을 찾을 수 없어요</Text>
        </View>
      ) : (
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={[s.section, { backgroundColor: c.card }]}>
          <View style={[s.tag, { backgroundColor: c.priLightest }]}>
            <Text style={[text({ size: 11.5, weight: 700 }), { color: c.priDk }]}>발견된 패턴</Text>
          </View>
          <Text style={[text({ size: 24, weight: 700, tracking: -0.04, leading: 1.45 }), s.title, { color: c.g900 }]}>{pattern.title}</Text>
          <View style={[s.noteBox, { backgroundColor: c.g100 }]}>
            <Text style={[text({ size: 11.5, leading: 1.7 }), { color: c.g600 }]}>같은 기간 함께 기록됐다는 뜻이에요. 원인을 확정하거나 진단하는 정보가 아니에요.</Text>
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
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1 },
  flex1: { flex: 1, minWidth: 0 },
  section: { padding: 20 },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },

  tag: { alignSelf: 'flex-start', height: 26, paddingHorizontal: 11, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  title: { marginTop: 14 },
  noteBox: { marginTop: 16, padding: 13, paddingHorizontal: 15, borderRadius: 14 },

  dataSection: { marginTop: 10, paddingBottom: 20 },
  dataCard: { marginTop: 12, paddingHorizontal: 16, borderWidth: 1, borderRadius: 16 },
  dataRow: { minHeight: 46, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },

  actionsSection: { marginTop: 10, paddingBottom: 22 },
  actionList: { marginTop: 12, gap: 8 },
  actionRow: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderWidth: 1, borderRadius: 16 },
  actionIconWrap: { width: 40, height: 40, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  actionMeta: { marginTop: 3 },
});
