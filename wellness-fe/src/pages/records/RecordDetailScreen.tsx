import { useCallback } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import NavigationBackButton from '@/components/navigation-back-button';
import type { RecordDetail } from '@/domain/wellness';
import { useAsyncData } from '@/hooks/use-async-data';
import { wellnessApi } from '@/services/wellness-api';
import { colors } from '@/theme/tokens';

import { detailStyles as styles } from './record-detail.styles';

export default function RecordDetailScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ date?: string }>();
  const date = typeof params.date === 'string' ? params.date : '';
  const loader = useCallback(() => wellnessApi.getRecordDetail(date), [date]);
  const { data: record, error, isLoading, reload } = useAsyncData<RecordDetail | null>(loader, null);
  const [year, month, day] = date.split('-').map(Number);

  if (isLoading) return <SafeAreaView edges={['top', 'bottom']} style={styles.center}><ActivityIndicator color={colors.primary} /><Text style={styles.centerText}>기록을 불러오는 중</Text></SafeAreaView>;
  if (error) return <SafeAreaView edges={['top', 'bottom']} style={styles.center}><Text style={styles.errorTitle}>기록을 불러오지 못했어요</Text><Pressable accessibilityRole="button" onPress={() => void reload().catch(() => undefined)} style={styles.retryButton}><Text style={styles.retryText}>다시 시도</Text></Pressable></SafeAreaView>;
  if (!record) return <SafeAreaView edges={['top', 'bottom']} style={styles.center}><Text style={styles.errorTitle}>해당 날짜의 기록이 없어요</Text><Pressable accessibilityRole="button" onPress={() => router.dismissTo('/(tabs)/records')} style={styles.retryButton}><Text style={styles.retryText}>기록 캘린더로</Text></Pressable></SafeAreaView>;

  return (
    <SafeAreaView edges={['top']} style={styles.screen}>
      <View style={styles.topBar}><NavigationBackButton accessibilityLabel="기록 캘린더로 돌아가기" fallbackHref="/(tabs)/records" /><Text style={styles.topTitle}>날짜별 기록</Text><View style={styles.topSpacer} /></View>
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 36 }]} showsVerticalScrollIndicator={false}>
        <Text style={styles.date}>{year}년 {month}월 {day}일</Text>
        <Text style={styles.condition}>{record.condition}</Text>
        <View style={styles.tagRow}>{record.conditionTags.map((tag) => <Text key={tag} style={styles.tag}># {tag}</Text>)}</View>

        <Section title="자동 기록"><InfoRow label="수면 시간" value={record.sleepDuration} /><InfoRow label="잠든 시각" value={record.bedtime} /><InfoRow label="걸음 수" value={record.steps} /></Section>
        <Section title="불편 부위"><InfoRow label="부위" value={record.bodyParts.join(', ') || '없음'} /><InfoRow label="강도" value={record.intensity ? `${record.intensity}단계` : '기록 없음'} /><InfoRow label="느낌" value={record.feelings.join(', ') || '선택 안 함'} /></Section>
        <Section title="수면"><InfoRow label="수면 자세" value={record.sleepPosture} /><InfoRow label="베개 높이" value={record.pillow} /></Section>
        <Section title="활동·피부"><InfoRow label="활동량" value={record.activityLabel} /><InfoRow label="피부 상태" value={record.skinStates.join(', ') || '기록 없음'} /></Section>
        {record.completedRoutine ? <Section title="완료한 루틴"><InfoRow label={record.completedRoutine.title} value={record.completedRoutine.completedAt} /></Section> : null}
        {record.nextDayFeedback ? <Section title="다음 날 효과 확인"><InfoRow label="변화" value={effectLabel(record.nextDayFeedback.effect)} /><InfoRow label="남은 불편" value={`${record.nextDayFeedback.discomfortLevel}단계`} /></Section> : null}
        {record.memo ? <View style={styles.memoCard}><Text style={styles.sectionTitle}>메모</Text><Text style={styles.memoText}>{record.memo}</Text></View> : null}
      </ScrollView>
    </SafeAreaView>
  );
}

function effectLabel(effect: 'better' | 'same' | 'worse' | 'unknown') { return effect === 'better' ? '한결 편해요' : effect === 'same' ? '비슷해요' : effect === 'worse' ? '더 불편해요' : '잘 모르겠어요'; }

function Section({ children, title }: { children: React.ReactNode; title: string }) {
  return <View style={styles.section}><Text style={styles.sectionTitle}>{title}</Text><View style={styles.sectionBody}>{children}</View></View>;
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return <View style={styles.infoRow}><Text style={styles.infoLabel}>{label}</Text><Text style={styles.infoValue}>{value}</Text></View>;
}
