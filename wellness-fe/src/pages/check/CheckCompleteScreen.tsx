import { useRouter } from 'expo-router';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useDailyCheck } from '@/context/daily-check-context';
import { AppIcon } from '@/components/app-icon';
import { colors } from '@/theme/tokens';
import { toLocalDateId, toMonthDayLabel } from '@/utils/date';

import { styles } from './check-complete.styles';

export default function CheckCompleteScreen() {
  const router = useRouter();
  const { completedCount, draft, resetDraft } = useDailyCheck();
  const dateLabel = toMonthDayLabel(draft.targetDate);
  const todayId = toLocalDateId();
  const isToday = draft.targetDate === todayId;

  const returnHome = () => {
    resetDraft();
    router.dismissTo(isToday ? '/(tabs)/home' : '/(tabs)/records');
  };

  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View accessibilityLabel="기록 완료" style={styles.checkCircle}><AppIcon color={colors.white} name="check" size={38} strokeWidth={2.4}/></View>
        <Text style={styles.eyebrow}>{dateLabel} 기록 {draft.mode === 'edit' ? '수정 완료' : '완료'}</Text>
        <Text accessibilityRole="header" style={styles.title}>{draft.mode === 'edit' ? '오늘 기록을 새 상태로 수정했어요' : '오늘의 몸 상태를 기록했어요'}</Text>
        <Text style={styles.description}>기록이 쌓이면 수면, 활동과 몸의 불편이 어떻게 이어지는지 살펴볼 수 있어요.</Text>
        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}><Text style={styles.summaryLabel}>기록한 항목</Text><Text style={styles.summaryValue}>{completedCount}개</Text></View>
          <View style={styles.divider} />
          <View style={styles.summaryRow}><Text style={styles.summaryLabel}>건너뛴 항목</Text><Text style={styles.summaryValue}>{draft.skippedSteps.length}개</Text></View>
        </View>
      </ScrollView>
      <View style={styles.footer}>
        <Pressable accessibilityRole="button" onPress={() => router.replace({ pathname: '/check/auto', params: { date: draft.targetDate ?? todayId, mode: 'edit' } })} style={({ pressed }) => [styles.editButton, pressed && styles.pressed]}><Text style={styles.editText}>기록 수정하기</Text></Pressable>
        <Pressable accessibilityRole="button" onPress={returnHome} style={({ pressed }) => [styles.homeButton, pressed && styles.pressed]}><Text style={styles.homeText}>{isToday?'오늘 화면으로':'기록 캘린더로'}</Text></Pressable>
      </View>
    </SafeAreaView>
  );
}
