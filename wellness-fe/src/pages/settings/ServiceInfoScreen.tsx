import { useRouter, type Href } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { ChevronSmallGlyph } from '@/components/glyphs';
import { SubScreenHeader } from '@/components/ui/sub-screen-header';
import { text } from '@/theme/typography';
import { usePalette } from '@/theme/use-palette';

/**
 * v8 프로토타입엔 없던 화면이라 pre-v8 레거시 컴포넌트(`PageHeader`/`AppIcon`,
 * `@/theme/tokens`)로 남아 있었다 — 그 tokens 시스템은 다크 모드가 실제로 연결돼
 * 있지 않아 이 화면만 라이트로 고정돼 있었다. 다른 마이 하위 화면들과 같은
 * `usePalette()` 방식으로 옮겨 화면 모드를 따라가게 했다.
 */
const ITEMS = [
  { title: '개인정보처리방침', route: '/settings/legal/privacy' },
  { title: '건강·민감정보 처리 동의', route: '/settings/legal/sensitive-health' },
  { title: '선택정보 및 알림 동의', route: '/settings/legal/optional-data' },
  { title: '서비스 이용약관', route: '/settings/legal/terms' },
] as const;

export default function ServiceInfoScreen() {
  const c = usePalette();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <SafeAreaView edges={['top']} style={[s.screen, { backgroundColor: c.bg }]}>
      <SubScreenHeader backLabel="마이 화면으로 돌아가기" fallback={() => router.replace('/(tabs)/me')} title="서비스 정보" />
      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 20 }} showsVerticalScrollIndicator={false}>
        <View style={[s.section, { backgroundColor: c.card }]}> 
          <Text style={[text({ size: 12.5, weight: 700 }), { color: c.g500 }]}>안내 및 정책</Text>
          <View style={[s.serviceIntro, { backgroundColor: c.g100 }]}><Text style={[text({ size: 13, leading: 1.7 }), { color: c.g700 }]}>하음은 몸과 생활 기록의 흐름을 이해하도록 돕는 하음 팀의 웰니스 서비스이며, 의료 진단이나 처방을 제공하지 않습니다.</Text></View>
          {ITEMS.map((item, i) => <Pressable accessibilityRole="button" key={item.title} onPress={() => router.push(item.route as Href)} style={[s.row, i < ITEMS.length - 1 && { borderBottomWidth: 1, borderBottomColor: c.g200 }]}><Text style={[text({ size: 14.5, weight: 600, tracking: -0.025 }), s.flex1, { color: c.g900 }]}>{item.title}</Text><ChevronSmallGlyph color={c.g400}/></Pressable>)}
        </View>

        <View style={[s.section, s.contactSection, { backgroundColor: c.card }]}>
          <Text style={[text({ size: 12.5, weight: 700 }), { color: c.g500 }]}>문의하기</Text>
          <View style={s.row}><Text style={[text({ size: 14.5, weight: 600, tracking: -0.025 }), s.flex1, { color: c.g900 }]}>하음 팀 운영 이메일 등록 예정</Text></View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1 },
  flex1: { flex: 1, minWidth: 0 },
  section: { paddingTop: 16, paddingHorizontal: 20, paddingBottom: 8 },
  contactSection: { marginTop: 10, paddingBottom: 20 },
  row: { minHeight: 54, flexDirection: 'row', alignItems: 'center', gap: 12 },
  serviceIntro: { marginTop: 12, marginBottom: 6, padding: 15, borderRadius: 14 },
});
