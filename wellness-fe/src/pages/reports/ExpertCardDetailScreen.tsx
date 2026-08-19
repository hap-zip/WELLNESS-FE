import { useEffect, useState } from 'react';
import { useLocalSearchParams, useRouter, type Href } from 'expo-router';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { SubScreenHeader } from '@/components/ui/sub-screen-header';
import type { HealthReport } from '@/domain/wellness';
import { wellnessApi } from '@/services/wellness-api';
import { text } from '@/theme/typography';
import { usePalette } from '@/theme/use-palette';

// 방금 추가된 중첩 라우트라 expo-router 타입 생성이 아직 `/reports/cards`를 index로
// 정리하지 못했다 — 실제 경로는 맞으니 타입만 우회한다.
const CARD_LIST_ROUTE = '/reports/cards' as Href;

/** `/api/v1/expert-cards/{cardId}` 상세 조회 + 삭제. */
export default function ExpertCardDetailScreen() {
  const c = usePalette();
  const router = useRouter();
  const params = useLocalSearchParams<{ cardId?: string }>();
  const cardId = params.cardId ?? '';
  const [card, setCard] = useState<HealthReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(true);
    void wellnessApi.getHealthReport(cardId).then((result) => { if (active) setCard(result); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [cardId]);

  const remove = () => {
    Alert.alert('이 카드를 삭제할까요?', '삭제한 카드는 되돌릴 수 없어요.', [
      { text: '취소', style: 'cancel' },
      { text: '삭제', style: 'destructive', onPress: () => void deleteCard() },
    ]);
  };
  const deleteCard = async () => {
    if (deleting) return;
    setDeleting(true);
    try {
      await wellnessApi.deleteHealthReport(cardId);
      router.replace(CARD_LIST_ROUTE);
    } catch (reason) {
      Alert.alert('삭제하지 못했어요', reason instanceof Error ? reason.message : '다시 시도해 주세요.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <SafeAreaView edges={['top']} style={[s.screen, { backgroundColor: c.bg }]}>
      <SubScreenHeader backLabel="카드 목록으로 돌아가기" fallback={() => router.replace(CARD_LIST_ROUTE)} title="카드 상세" />
      {loading ? (
        <View style={s.center}><ActivityIndicator color={c.pri} /></View>
      ) : !card ? (
        <View style={s.center}><Text style={[text({ size: 14, weight: 700 }), { color: c.g700 }]}>이 카드를 찾을 수 없어요</Text></View>
      ) : (
        <ScrollView contentContainerStyle={s.body} showsVerticalScrollIndicator={false}>
          <View style={[s.card, { borderColor: c.g200, backgroundColor: c.card }]}>
            <View style={s.head}>
              <Text style={[text({ size: 11, weight: 700, tracking: 0.06 }), { color: c.g500 }]}>하음 요약</Text>
              <Text style={[text({ size: 11, weight: 600, tabular: true }), { color: c.g500 }]}>{card.periodLabel || card.createdAtLabel}</Text>
            </View>
            <Text style={[text({ size: 18, weight: 700, tracking: -0.035 }), s.headline, { color: c.g900 }]}>{card.headline || '요약할 기록이 없어요'}</Text>

            {card.highlights.length > 0 ? (
              <View style={s.rows}>
                {card.highlights.map((h, i) => (
                  <View key={`${h.label}-${i}`} style={[s.row, i < card.highlights.length - 1 && { borderBottomWidth: 1, borderBottomColor: c.g200 }]}>
                    <Text style={[text({ size: 13 }), { color: c.g600 }]}>{h.label}</Text>
                    <Text style={[text({ size: 13.5, weight: 700, tabular: true }), { color: c.g900 }]}>{h.value}</Text>
                  </View>
                ))}
              </View>
            ) : null}

            {card.discomfortAreas.length > 0 ? <InfoLine c={c} label="불편 부위" value={card.discomfortAreas.join(', ')} /> : null}
            {card.sleepPostures.length > 0 ? <InfoLine c={c} label="수면 자세" value={card.sleepPostures.join(', ')} /> : null}
            {card.routineCount > 0 ? <InfoLine c={c} label="완료한 루틴" value={`${card.routineCount}회`} /> : null}
            {card.feedbackSummary ? <Text style={[text({ size: 12.5, leading: 1.6 }), s.feedback, { color: c.g600 }]}>{card.feedbackSummary}</Text> : null}
            {card.discoveredPatterns.length > 0 ? <InfoLine c={c} label="발견된 패턴" value={card.discoveredPatterns.join(', ')} /> : null}
            <Text style={[text({ size: 10.5, leading: 1.65 }), s.disclaimer, { color: c.g400 }]}>{card.note || '사용자가 직접 기록한 값과 건강 데이터를 정리한 자료예요. 진단 목적으로 사용할 수 없어요.'}</Text>
          </View>

          <Pressable accessibilityRole="button" accessibilityState={{ disabled: deleting }} disabled={deleting} onPress={remove} style={[s.deleteBtn, { borderColor: '#E8C4C4', opacity: deleting ? 0.6 : 1 }]}>
            <Text style={[text({ size: 14, weight: 700 }), { color: c.dangerDk }]}>{deleting ? '삭제하는 중…' : '이 카드 삭제'}</Text>
          </Pressable>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

function InfoLine({ c, label, value }: { c: ReturnType<typeof usePalette>; label: string; value: string }) {
  return (
    <View style={s.infoLine}>
      <Text style={[text({ size: 12.5, weight: 700 }), { color: c.g500 }]}>{label}</Text>
      <Text style={[text({ size: 13, leading: 1.6 }), { color: c.g700 }]}>{value}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  body: { padding: 20, paddingBottom: 40 },

  card: { padding: 18, borderWidth: 1, borderRadius: 20 },
  head: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headline: { marginTop: 14 },
  rows: { marginTop: 12 },
  row: { minHeight: 38, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  infoLine: { marginTop: 12 },
  feedback: { marginTop: 12 },
  disclaimer: { marginTop: 14, paddingTop: 12, borderTopWidth: 1, borderTopColor: 'transparent' },

  deleteBtn: { marginTop: 16, minHeight: 50, borderWidth: 1, borderRadius: 25, alignItems: 'center', justifyContent: 'center' },
});
