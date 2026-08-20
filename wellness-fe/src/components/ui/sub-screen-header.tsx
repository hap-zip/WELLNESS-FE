import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { MonthPrevGlyph } from '@/components/glyphs';
import { text } from '@/theme/typography';
import { usePalette } from '@/theme/use-palette';

/**
 * `Momgirok v8.dc.html` 의 스택 화면 공용 헤더 — 마이 하위 5화면·날짜별 상세·
 * 루틴 상세 등에서 반복되는 형태. height:52; padding:0 8px; border-bottom:1px;
 * 제목은 가운데 정렬이 아니라 뒤로가기 옆에 왼쪽 정렬로 붙는다.
 */
export function SubScreenHeader({ title, backLabel, fallback }: { title: string; backLabel: string; fallback: () => void }) {
  const c = usePalette();
  const router = useRouter();

  const goBack = () => (router.canGoBack() ? router.back() : fallback());

  return (
    <View style={[s.header, { backgroundColor: c.card, borderBottomColor: c.g200 }]}>
      <Pressable accessibilityLabel={backLabel} accessibilityRole="button" onPress={goBack} style={s.backBtn}>
        <MonthPrevGlyph color={c.g800} size={20} />
      </Pressable>
      <Text style={[text({ size: 16, weight: 700, tracking: -0.03 }), { color: c.g900 }]}>{title}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  header: { height: 52, flexDirection: 'row', alignItems: 'center', gap: 2, paddingHorizontal: 8, borderBottomWidth: 1 },
  backBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
});
