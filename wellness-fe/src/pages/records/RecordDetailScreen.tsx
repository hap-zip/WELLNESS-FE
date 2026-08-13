import { useCallback } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import NavigationBackButton from '@/components/navigation-back-button';
import HomeAvatar from '@/pages/home/HomeAvatar';
import { AppIcon } from '@/components/app-icon';
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
  const dateLabel = date ? new Intl.DateTimeFormat('ko-KR', { month: 'long', day: 'numeric', weekday: 'long' }).format(new Date(`${date}T12:00:00`)) : '';
  const edit = () => router.push({ pathname: '/check/auto', params: { date, mode: 'edit' } });
  const remove = () => Alert.alert('이 날 기록을 삭제할까요?', '삭제한 기록은 되돌릴 수 없어요.', [{ text: '취소', style: 'cancel' }, { text: '삭제', style: 'destructive', onPress: () => void wellnessApi.deleteDailyCheck(date).then(() => router.dismissTo('/(tabs)/records')) }]);

  if (isLoading) return <SafeAreaView edges={['top', 'bottom']} style={styles.center}><ActivityIndicator color={colors.primary} /><Text style={styles.centerText}>기록을 불러오는 중</Text></SafeAreaView>;
  if (error) return <SafeAreaView edges={['top', 'bottom']} style={styles.center}><Text style={styles.errorTitle}>기록을 불러오지 못했어요</Text><Pressable accessibilityRole="button" onPress={() => void reload().catch(() => undefined)} style={styles.retryButton}><Text style={styles.retryText}>다시 시도</Text></Pressable></SafeAreaView>;
  if (!record) return <SafeAreaView edges={['top', 'bottom']} style={styles.center}><Text style={styles.errorTitle}>해당 날짜의 기록이 없어요</Text><Pressable accessibilityRole="button" onPress={() => router.dismissTo('/(tabs)/records')} style={styles.retryButton}><Text style={styles.retryText}>기록 캘린더로</Text></Pressable></SafeAreaView>;

  return (
    <SafeAreaView edges={['top']} style={styles.screen}>
      <View style={styles.topBar}><NavigationBackButton accessibilityLabel="기록 캘린더로 돌아가기" fallbackHref="/(tabs)/records"/><Text accessibilityRole="header" style={styles.topTitle}>{dateLabel}</Text><Pressable accessibilityRole="button" onPress={edit} style={styles.topAction}><Text style={styles.topActionText}>수정</Text></Pressable></View>
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 36 }]} showsVerticalScrollIndicator={false}>
        <View style={styles.bodyOverview}><View style={styles.bodyFigure}><HomeAvatar defaultFill={colors.surfaceStrong} defaultStroke={colors.border} highlights={[]} hideHint onMarkerPress={() => undefined} scale={.34} stageStyle={{ height: 148 }} wrapStyle={{ minHeight: 148 }}/></View><View style={styles.bodySummary}><Text style={styles.discomfortBadge}>뚜렷한 불편</Text>{record.bodyParts.length ? record.bodyParts.map((part) => <View key={part} style={styles.bodyPartRow}><View style={styles.bodyDot}/><Text style={styles.bodyPartText}>{part} · {record.intensity ?? 0}단계</Text></View>) : <Text style={styles.bodyPartText}>기록된 불편 없음</Text>}</View></View>

        <Section icon="heart" source="Apple 건강" title="자동 수집"><InfoRow label="수면 시간" value={record.sleepDuration} /><InfoRow label="잠든 시각" value={record.bedtime} /><InfoRow label="걸음 수" value={record.steps} /></Section>
        <Section danger icon="person" source="직접 입력" title="불편"><InfoRow danger label="부위" value={record.bodyParts.join(', ') || '없음'} /><InfoRow danger label="강도" value={record.intensity ? `${record.intensity}단계` : '기록 없음'} /><InfoRow label="느낌" value={record.feelings.join(', ') || '선택 안 함'} /></Section>
        <Section icon="heart" source="직접 입력" title="수면"><InfoRow label="수면 자세" value={record.sleepPosture} /><InfoRow label="베개 높이" value={record.pillow} /></Section>
        <Section icon="trend-up" source="기록됨" title="활동·피부"><InfoRow label="활동량" value={record.activityLabel} /><InfoRow label="피부 상태" value={record.skinStates.join(', ') || '기록 없음'} /></Section>
        {record.completedRoutine ? <Section icon="play" source="완료" title="실행한 루틴"><InfoRow label={record.completedRoutine.title} value={record.completedRoutine.completedAt} /></Section> : null}
        {record.nextDayFeedback ? <Section icon="check" source="기록됨" title="다음 날 효과 확인"><InfoRow label="변화" value={effectLabel(record.nextDayFeedback.effect)} /><InfoRow label="남은 불편" value={`${record.nextDayFeedback.discomfortLevel}단계`} /></Section> : null}
        {record.memo ? <View style={styles.memoCard}><Text style={styles.sectionTitle}>메모</Text><Text style={styles.memoText}>{record.memo}</Text></View> : null}
        <Pressable accessibilityRole="button" onPress={() => router.push('/reports/setup')} style={({ pressed }) => [styles.reportEntry, pressed && styles.pressed]}><View style={styles.reportCopy}><Text style={styles.reportTitle}>이 기록을 요약에 포함하기</Text><Text style={styles.reportDescription}>선택한 기간의 변화를 전문가에게 보여줄 수 있게 정리해요.</Text></View><AppIcon color={colors.primary} name="chevron-right" size={19}/></Pressable>
        <View style={styles.recordActions}><Pressable accessibilityRole="button" onPress={edit} style={({pressed})=>[styles.editRecord,pressed&&styles.pressed]}><Text style={styles.editRecordText}>이 날 기록 수정</Text></Pressable><Pressable accessibilityRole="button" onPress={remove} style={({pressed})=>[styles.deleteRecord,pressed&&styles.pressed]}><Text style={styles.deleteRecordText}>이 날 기록 삭제</Text></Pressable></View>
      </ScrollView>
    </SafeAreaView>
  );
}

function effectLabel(effect: 'better' | 'same' | 'worse' | 'unknown') { return effect === 'better' ? '한결 편해요' : effect === 'same' ? '비슷해요' : effect === 'worse' ? '더 불편해요' : '잘 모르겠어요'; }

function Section({ children, danger, icon, source, title }: { children: React.ReactNode; danger?: boolean; icon: React.ComponentProps<typeof AppIcon>['name']; source: string; title: string }) {
  return <View style={styles.section}><View style={styles.sectionHead}><View style={[styles.sectionIcon,danger&&styles.sectionIconDanger]}><AppIcon color={danger?colors.danger:colors.primaryPressed} name={icon} size={18}/></View><Text style={styles.sectionTitle}>{title}</Text><Text style={styles.sourceBadge}>{source}</Text></View><View style={styles.sectionBody}>{children}</View></View>;
}

function InfoRow({ danger, label, value }: { danger?: boolean; label: string; value: string }) {
  return <View style={styles.infoRow}><Text style={styles.infoLabel}>{label}</Text><Text style={[styles.infoValue,danger&&value!=='없음'&&value!=='기록 없음'&&styles.infoDanger]}>{value}</Text></View>;
}
