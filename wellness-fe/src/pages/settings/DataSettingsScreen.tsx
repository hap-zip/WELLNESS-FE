import { useRouter, type Href } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { MonthNextGlyph } from '@/components/glyphs';
import { SubScreenHeader } from '@/components/ui/sub-screen-header';
import { text } from '@/theme/typography';
import { usePalette } from '@/theme/use-palette';
import { CONSENT_ROWS, DELETE_ROWS } from '@/pages/me/me.data';

const DOCUMENT_BY_LABEL = { '이용약관': 'terms', '개인정보 처리방침': 'privacy', '건강정보 처리 동의': 'sensitive-health', '마케팅 정보 수신': 'optional-data' } as const;

/**
 * `Momgirok v8.dc.html` → `isSubConsent` 를 그대로 옮긴 것.
 * "위험한 삭제 재확인 모달"은 README 의 "미구현 — 추가 작업 필요" 항목이라
 * 프로토타입에도 없다 — 여기서도 실제 삭제 동작은 붙이지 않는다.
 */
export default function DataSettingsScreen() {
  const c = usePalette();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <SafeAreaView edges={['top']} style={[s.screen, { backgroundColor: c.bg }]}>
      <SubScreenHeader backLabel="마이 화면으로 돌아가기" fallback={() => router.replace('/(tabs)/me')} title="동의·데이터 관리" />
      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 20 }} showsVerticalScrollIndicator={false}>
        <View style={[s.section, { backgroundColor: c.card }]}>
          <Text style={[text({ size: 12.5, weight: 700 }), { color: c.g500 }]}>동의 상태</Text>
          {CONSENT_ROWS.map((row, i) => (
            <View key={row.key} style={[s.consentRow, i < CONSENT_ROWS.length - 1 && { borderBottomWidth: 1, borderBottomColor: c.g200 }]}>
              <View style={s.flex1}>
                <View style={s.consentTitleRow}>
                  <View style={[s.reqBadge, { backgroundColor: row.req === '필수' ? c.priLightest : c.g100 }]}>
                    <Text style={[text({ size: 10, weight: 700 }), { color: row.req === '필수' ? c.priDk : c.g500 }]}>{row.req}</Text>
                  </View>
                  <Text style={[text({ size: 14.5, weight: 600, tracking: -0.025 }), { color: c.g900 }]}>{row.label}</Text>
                </View>
                <Text style={[text({ size: 11.5 }), s.consentDate, { color: c.g500 }]}>{row.date}</Text>
              </View>
              <Pressable accessibilityRole="button" onPress={() => router.push(`/settings/legal/${DOCUMENT_BY_LABEL[row.label as keyof typeof DOCUMENT_BY_LABEL]}` as Href)} style={s.viewBtn}>
                <Text style={[text({ size: 12.5, weight: 700 }), { color: c.g500 }]}>전문 보기</Text>
              </Pressable>
            </View>
          ))}
        </View>

        <View style={[s.section, s.dataSection, { backgroundColor: c.card }]}>
          <Text style={[text({ size: 12.5, weight: 700 }), { color: c.g500 }]}>내 데이터</Text>
          <View style={[s.dataRow, { borderBottomColor: c.g200 }]}>
            <View>
              <Text style={[text({ size: 14.5, weight: 600, tracking: -0.025 }), { color: c.g900 }]}>데이터 내려받기</Text>
              <Text style={[text({ size: 11.5 }), s.dataSub, { color: c.g500 }]}>전체 기록을 파일로 받아요</Text>
            </View>
            <MonthNextGlyph color={c.g400} size={17} />
          </View>
          {DELETE_ROWS.map((row, i) => (
            <Pressable key={row.key} accessibilityRole="button" style={[s.dataRow, i < DELETE_ROWS.length - 1 && { borderBottomColor: c.g200, borderBottomWidth: 1 }]}>
              <View>
                <Text style={[text({ size: 14.5, weight: 600, tracking: -0.025 }), { color: row.danger ? c.dangerDk : c.g900 }]}>{row.label}</Text>
                <Text style={[text({ size: 11.5 }), s.dataSub, { color: c.g500 }]}>{row.sub}</Text>
              </View>
              <MonthNextGlyph color={c.g400} size={17} />
            </Pressable>
          ))}
          <Text style={[text({ size: 11.5, leading: 1.7 }), s.caution, { color: c.g400 }]}>삭제는 되돌릴 수 없어요. 실행 전에 한 번 더 확인해요.</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1 },
  flex1: { flex: 1, minWidth: 0 },
  section: { paddingTop: 16, paddingHorizontal: 20, paddingBottom: 10 },
  consentRow: { minHeight: 66, flexDirection: 'row', alignItems: 'center', gap: 12 },
  consentTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  reqBadge: { paddingVertical: 3, paddingHorizontal: 7, borderRadius: 6, height: 20, alignItems: 'center', justifyContent: 'center' },
  consentDate: { marginTop: 4 },
  viewBtn: { minHeight: 36, paddingHorizontal: 4, alignItems: 'center', justifyContent: 'center' },

  dataSection: { marginTop: 10 },
  dataRow: { minHeight: 58, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  dataSub: { marginTop: 3 },
  caution: { paddingTop: 16, paddingBottom: 8 },
});
