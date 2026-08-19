import { useRouter, type Href } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { SubScreenHeader } from '@/components/ui/sub-screen-header';
import { text } from '@/theme/typography';
import { usePalette } from '@/theme/use-palette';
import { CONSENT_ROWS } from '@/pages/me/me.data';

const DOCUMENT_BY_LABEL = { '이용약관': 'terms', '개인정보 처리방침': 'privacy', '건강정보 처리 동의': 'sensitive-health', '마케팅 정보 수신': 'optional-data' } as const;

/**
 * `Momgirok v8.dc.html` → `isSubConsent` 를 그대로 옮긴 것.
 * 데이터 내려받기·삭제는 대응하는 백엔드 엔드포인트가 없어 화면에서 뺐다.
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
});
