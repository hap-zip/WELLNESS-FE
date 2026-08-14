import { useLocalSearchParams, useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { SubScreenHeader } from '@/components/ui/sub-screen-header';
import { LEGAL_DOCUMENTS, isLegalDocumentId } from '@/legal/legal-documents';
import { text } from '@/theme/typography';
import { usePalette } from '@/theme/use-palette';

export default function LegalDocumentScreen() {
  const c = usePalette();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { documentId } = useLocalSearchParams<{ documentId?: string }>();
  const document = isLegalDocumentId(documentId) ? LEGAL_DOCUMENTS[documentId] : null;

  if (!document) return <SafeAreaView edges={['top']} style={[s.screen, { backgroundColor: c.bg }]}><SubScreenHeader backLabel="이전 화면으로 돌아가기" fallback={() => router.back()} title="정책 문서"/><View style={[s.empty, { backgroundColor: c.card }]}><Text style={[text({ size: 15, weight: 600 }), { color: c.g700 }]}>문서를 찾을 수 없어요.</Text></View></SafeAreaView>;

  return <SafeAreaView edges={['top']} style={[s.screen, { backgroundColor: c.bg }]}>
    <SubScreenHeader backLabel="이전 화면으로 돌아가기" fallback={() => router.back()} title={document.title}/>
    <ScrollView contentContainerStyle={[s.content, { paddingBottom: insets.bottom + 36 }]} showsVerticalScrollIndicator={false}>
      <View style={[s.hero, { backgroundColor: c.card }]}>
        <Text accessibilityRole="header" style={[text({ size: 24, weight: 700, tracking: -0.04, leading: 1.35 }), { color: c.g900 }]}>{document.title}</Text>
        <Text style={[text({ size: 13.5, leading: 1.7 }), s.summary, { color: c.g600 }]}>{document.summary}</Text>
        <Text style={[text({ size: 11.5, weight: 600 }), s.date, { color: c.g500 }]}>시행일 {document.effectiveDate}</Text>
      </View>
      <View style={[s.sections, { backgroundColor: c.card }]}>
        {document.sections.map((section, index) => <View key={section.heading} style={[s.section, index > 0 && { borderTopWidth: 1, borderTopColor: c.g200 }]}><Text style={[text({ size: 16, weight: 700, tracking: -0.025 }), { color: c.g900 }]}>{section.heading}</Text><Text selectable style={[text({ size: 14, leading: 1.85 }), s.body, { color: c.g700 }]}>{section.body}</Text></View>)}
      </View>
      <View style={[s.draftNotice, { backgroundColor: c.priLightest }]}><Text style={[text({ size: 12, leading: 1.7 }), { color: c.priDk }]}>운영 이메일, 실제 서버·수탁업체·국외 이전 여부가 확정되면 출시 전에 해당 내용을 반드시 갱신해야 합니다.</Text></View>
    </ScrollView>
  </SafeAreaView>;
}

const s = StyleSheet.create({ screen: { flex: 1 }, content: { gap: 10 }, hero: { padding: 24, paddingTop: 26 }, summary: { marginTop: 10 }, date: { marginTop: 14 }, sections: { paddingHorizontal: 20 }, section: { paddingVertical: 22 }, body: { marginTop: 10 }, draftNotice: { marginHorizontal: 20, padding: 16, borderRadius: 16 }, empty: { padding: 24 } });
