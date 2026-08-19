import { useCallback, useState } from 'react';
import { useFocusEffect, useRouter, type Href } from 'expo-router';
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { ChevronMediumGlyph } from '@/components/glyphs';
import { SubScreenHeader } from '@/components/ui/sub-screen-header';
import type { HealthReport } from '@/domain/wellness';
import { wellnessApi } from '@/services/wellness-api';
import { text } from '@/theme/typography';
import { usePalette } from '@/theme/use-palette';

/** `/api/v1/expert-cards` 목록 조회 — 내가 만든 요약 카드들을 보여준다. */
export default function ExpertCardListScreen() {
  const c = usePalette();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [cards, setCards] = useState<HealthReport[] | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try {
      const result = await wellnessApi.listHealthReports();
      setCards(result);
      setError('');
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : '카드 목록을 불러오지 못했어요.');
    }
  }, []);

  useFocusEffect(useCallback(() => { void load(); }, [load]));

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  return (
    <SafeAreaView edges={['top']} style={[s.screen, { backgroundColor: c.bg }]}>
      <SubScreenHeader backLabel="마이 화면으로 돌아가기" fallback={() => router.replace('/(tabs)/me')} title="내가 만든 카드" />
      <ScrollView
        contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 20 }}
        refreshControl={<RefreshControl onRefresh={() => void onRefresh()} refreshing={refreshing} tintColor={c.pri} />}
        showsVerticalScrollIndicator={false}>
        {cards === null ? (
          <View style={s.center}><ActivityIndicator color={c.pri} /></View>
        ) : error ? (
          <View style={s.center}><Text style={[text({ size: 13, weight: 600 }), { color: c.danger }]}>{error}</Text></View>
        ) : cards.length === 0 ? (
          <View style={s.center}>
            <Text style={[text({ size: 14, weight: 700 }), { color: c.g700 }]}>아직 만든 카드가 없어요</Text>
            <Pressable accessibilityRole="button" onPress={() => router.push('/reports/setup')} style={[s.makeBtn, { backgroundColor: c.pri }]}>
              <Text style={[text({ size: 14, weight: 700 }), { color: '#fff' }]}>요약 카드 만들기</Text>
            </Pressable>
          </View>
        ) : (
          <View style={s.list}>
            {cards.map((card) => (
              <Pressable key={card.id} accessibilityRole="button" onPress={() => router.push(`/reports/cards/${card.id}` as Href)} style={[s.card, { borderColor: c.g200, backgroundColor: c.card }]}>
                <View style={s.flex1}>
                  <Text numberOfLines={1} style={[text({ size: 15, weight: 700, tracking: -0.03 }), { color: c.g900 }]}>{card.headline || '요약 카드'}</Text>
                  <Text style={[text({ size: 12, weight: 600 }), s.meta, { color: c.g500 }]}>{card.periodLabel} · {card.createdAtLabel}</Text>
                </View>
                <ChevronMediumGlyph color={c.g400} size={16} />
              </Pressable>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1 },
  flex1: { flex: 1, minWidth: 0 },
  center: { paddingTop: 80, alignItems: 'center', gap: 14 },
  makeBtn: { minHeight: 46, paddingHorizontal: 20, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },

  list: { gap: 8 },
  card: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16, borderWidth: 1, borderRadius: 16 },
  meta: { marginTop: 5 },
});
