import { useRouter } from 'expo-router';
import { Pressable, ScrollView, Text, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useDailyCheck } from '@/context/daily-check-context';
import { Momi } from '@/components/momi';
import { toLocalDateId, toMonthDayLabel } from '@/utils/date';
import { BODY_ZONE_LABELS } from './SelectableBodyMap';

import { styles } from './check-complete.styles';

export default function CheckCompleteScreen() {
  const router = useRouter();
  const { height } = useWindowDimensions();
  const { draft, resetDraft } = useDailyCheck();
  const dateLabel = toMonthDayLabel(draft.targetDate);
  const todayId = toLocalDateId();
  const isToday = draft.targetDate === todayId;

  const returnHome = () => {
    resetDraft();
    router.dismissTo(isToday ? '/(tabs)/home' : '/(tabs)/records');
  };

  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.screen}>
      <ScrollView contentContainerStyle={[styles.content, height < 700 && styles.compactContent]} showsVerticalScrollIndicator={false}>
        <View accessibilityLabel="기록 완료" style={[styles.checkCircle,height<700&&styles.compactCheckCircle]}><Momi mood="cheer" showShadow size={height<700?96:120}/></View>
        <Text style={styles.eyebrow}>{draft.mode === 'edit' ? `${dateLabel} 기록 수정 완료` : '8일 연속 기록'}</Text>
        <Text accessibilityRole="header" style={[styles.title,height<700&&styles.compactTitle]}>{draft.mode === 'edit' ? '오늘 기록을 새 상태로 수정했어요' : '오늘의 몸을 기록했어요'}</Text>
        <View style={[styles.summaryCard,height<700&&styles.compactSummary]}>
          <View style={styles.summaryRow}><Text style={styles.summaryLabel}>자세·베개</Text><Text style={styles.summaryValue}>{[draft.sleepPosture, draft.pillow].filter(Boolean).join(' · ') || '입력 안 함'}</Text></View>
          <View style={styles.divider} />
          <View style={styles.summaryRow}><Text style={styles.summaryLabel}>수면</Text><Text style={styles.summaryValue}>{draft.autoRecords.sleepDuration || '기록 없음'}</Text></View>
          <View style={styles.divider} />
          <View style={styles.summaryRow}><Text style={styles.summaryLabel}>불편</Text><Text style={styles.summaryDanger}>{draft.bodyParts.length ? `${draft.bodyParts.map((id) => BODY_ZONE_LABELS[id] ?? '선택한 부위').join(', ')} ${draft.intensity ?? ''}단계` : '없음'}</Text></View>
        </View>
        <Pressable accessibilityRole="button" onPress={() => router.push('/routine')} style={({ pressed }) => [styles.recommendation, pressed && styles.pressed]}><Text style={styles.recommendationKicker}>오늘의 추천 루틴</Text><Text style={styles.recommendationTitle}>목 주변 가볍게 이완하기</Text><Text style={styles.recommendationMeta}>2분 · 3개 동작 · 어깨 중심</Text></Pressable>
      </ScrollView>
      <View style={styles.footer}>
        <Pressable accessibilityRole="button" onPress={returnHome} style={({ pressed }) => [styles.editButton, pressed && styles.pressed]}><Text style={styles.editText}>홈으로</Text></Pressable>
        <Pressable accessibilityRole="button" onPress={() => router.push('/routine')} style={({ pressed }) => [styles.homeButton, pressed && styles.pressed]}><Text style={styles.homeText}>루틴 시작하기</Text></Pressable>
      </View>
    </SafeAreaView>
  );
}
