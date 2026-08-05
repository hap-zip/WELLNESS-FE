import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';

import type { RecordsMonth, WellnessRecordSummary } from '@/domain/wellness';
import { useAsyncData } from '@/hooks/use-async-data';
import { wellnessApi } from '@/services/wellness-api';
import { AppIcon } from '@/components/app-icon';
import { colors } from '@/theme/tokens';

import { styles } from './records-calendar.styles';

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'] as const;
const EMPTY_MONTH: RecordsMonth = { year: 0, month: 0, records: [], stats: { recordedDays: 0, averageSleep: '-', discomfortDays: 0 } };

function dateId(year: number, month: number, day: number) {
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

export default function RecordsCalendarScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const today = useMemo(() => new Date(), []);
  const [cursor, setCursor] = useState({ year: today.getFullYear(), month: today.getMonth() + 1 });
  const [selectedDate, setSelectedDate] = useState(dateId(today.getFullYear(), today.getMonth() + 1, today.getDate()));
  const loader = useCallback(() => wellnessApi.getRecordsMonth(cursor.year, cursor.month), [cursor.month, cursor.year]);
  const { data, error, isLoading, reload } = useAsyncData(loader, EMPTY_MONTH);

  useFocusEffect(useCallback(() => {
    void reload().catch(() => undefined);
  }, [reload]));

  const recordMap = useMemo(() => new Map(data.records.map((record) => [record.date, record])), [data.records]);
  const selectedRecord = recordMap.get(selectedDate) ?? null;
  const daysInMonth = new Date(cursor.year, cursor.month, 0).getDate();
  const leadingDays = new Date(cursor.year, cursor.month - 1, 1).getDay();
  const calendarCells = Array.from({ length: leadingDays + daysInMonth }, (_, index) => index < leadingDays ? null : index - leadingDays + 1);
  while (calendarCells.length % 7 !== 0) calendarCells.push(null);

  useEffect(() => {
    if (isLoading || data.year !== cursor.year || data.month !== cursor.month) return;
    const todayId = dateId(today.getFullYear(), today.getMonth() + 1, today.getDate());
    const nextSelection = cursor.year === today.getFullYear() && cursor.month === today.getMonth() + 1
      ? todayId
      : data.records[0]?.date ?? dateId(cursor.year, cursor.month, 1);
    setSelectedDate(nextSelection);
  }, [cursor.month, cursor.year, data.month, data.records, data.year, isLoading, today]);

  const moveMonth = (delta: number) => {
    const next = new Date(cursor.year, cursor.month - 1 + delta, 1);
    setCursor({ year: next.getFullYear(), month: next.getMonth() + 1 });
  };

  const isCurrentOrFutureMonth = cursor.year > today.getFullYear() || (cursor.year === today.getFullYear() && cursor.month >= today.getMonth() + 1);

  return (
    <SafeAreaView edges={['top']} style={styles.screen}>
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 116 }]} showsVerticalScrollIndicator={false}>
        <Text style={styles.eyebrow}>나의 변화</Text>
        <Text style={styles.title}>기록</Text>
        <Text style={styles.description}>날짜를 눌러 그날의 몸 상태를 확인해 보세요.</Text>
        <View style={styles.statsRow}>
          <StatCard label="기록한 날" value={`${data.stats.recordedDays}일`} />
          <StatCard label="평균 수면" value={data.stats.averageSleep} />
          <StatCard label="불편한 날" value={`${data.stats.discomfortDays}일`} />
        </View>

        <View style={styles.calendarCard}>
          <View style={styles.monthHeader}>
            <Pressable accessibilityLabel="이전 달" accessibilityRole="button" onPress={() => moveMonth(-1)} style={({ pressed }) => [styles.monthButton, pressed && styles.pressed]}><AppIcon color={colors.text} name="chevron-left" size={22}/></Pressable>
            <Text accessibilityRole="header" style={styles.monthTitle}>{cursor.year}년 {cursor.month}월</Text>
            <Pressable accessibilityLabel="다음 달" accessibilityRole="button" accessibilityState={{ disabled: isCurrentOrFutureMonth }} disabled={isCurrentOrFutureMonth} onPress={() => moveMonth(1)} style={({ pressed }) => [styles.monthButton, isCurrentOrFutureMonth && styles.disabledMonthButton, pressed && styles.pressed]}><AppIcon color={isCurrentOrFutureMonth?colors.textMuted:colors.text} name="chevron-right" size={22}/></Pressable>
          </View>

          <View style={styles.weekRow}>{WEEKDAYS.map((weekday, index) => <Text key={weekday} style={[styles.weekday, index === 0 && styles.sunday, index === 6 && styles.saturday]}>{weekday}</Text>)}</View>
          {isLoading ? <View style={styles.calendarLoading}><ActivityIndicator color="#1257E0" /><Text style={styles.loadingText}>기록을 불러오는 중</Text></View> : error ? <View style={styles.calendarLoading}><Text style={styles.errorText}>기록을 불러오지 못했어요.</Text><Pressable accessibilityRole="button" onPress={() => void reload().catch(() => undefined)} style={styles.retryButton}><Text style={styles.retryText}>다시 시도</Text></Pressable></View> : (
            <View style={styles.calendarGrid}>{calendarCells.map((day, index) => {
              if (day === null) return <View key={`empty-${index}`} style={styles.dayCell} />;
              const id = dateId(cursor.year, cursor.month, day);
              const record = recordMap.get(id);
              const selected = selectedDate === id;
              const isToday = id === dateId(today.getFullYear(), today.getMonth() + 1, today.getDate());
              return <Pressable accessibilityLabel={`${cursor.month}월 ${day}일${record ? ', 기록 있음' : ', 기록 없음'}`} accessibilityRole="button" accessibilityState={{ selected }} key={id} onPress={() => setSelectedDate(id)} style={({ pressed }) => [styles.dayCell, selected && styles.selectedDayCell, pressed && styles.pressed]}><Text style={[styles.dayText, index % 7 === 0 && styles.sunday, index % 7 === 6 && styles.saturday, selected && styles.selectedDayText]}>{day}</Text>{record ? <View style={[styles.recordDot, record.conditionTone === 'danger' ? styles.dangerDot : record.conditionTone === 'caution' ? styles.cautionDot : styles.goodDot]} /> : isToday ? <View style={styles.todayDot} /> : null}</Pressable>;
            })}</View>
          )}
        </View>

        <RecordDetail date={selectedDate} onOpenDetail={() => router.push({ pathname: '/records/[date]', params: { date: selectedDate } })} onRecord={() => router.push('/check/auto')} record={selectedRecord} />
        <Pressable accessibilityRole="button" onPress={() => router.push('/reports/setup')} style={({ pressed }) => [styles.reportEntry, pressed && styles.pressed]}><View><Text style={styles.reportEntryTitle}>기록 요약 만들기</Text><Text style={styles.reportEntryDescription}>선택한 기간의 변화를 전문가에게 보여줄 수 있게 정리해요</Text></View><AppIcon color={colors.white} name="chevron-right" size={20}/></Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return <View style={styles.statCard}><Text style={styles.statValue}>{value}</Text><Text style={styles.statLabel}>{label}</Text></View>;
}

function RecordDetail({ date, onOpenDetail, onRecord, record }: { date: string; onOpenDetail: () => void; onRecord: () => void; record: WellnessRecordSummary | null }) {
  const [, month, day] = date.split('-').map(Number);
  if (!record) return <View style={styles.emptyDetail}><Text style={styles.detailDate}>{month}월 {day}일</Text><Text style={styles.emptyTitle}>아직 기록이 없어요</Text><Text style={styles.emptyDescription}>오늘의 상태를 남기면 변화 흐름을 확인할 수 있어요.</Text><Pressable accessibilityRole="button" onPress={onRecord} style={({ pressed }) => [styles.recordButton, pressed && styles.pressed]}><Text style={styles.recordButtonText}>상태 기록하기</Text></Pressable></View>;
  return <View style={styles.detailCard}><View style={styles.detailHeader}><View><Text style={styles.detailDate}>{month}월 {day}일</Text><Text style={styles.detailCondition}>{record.condition}</Text></View><View style={[styles.conditionBadge, record.conditionTone === 'danger' ? styles.dangerBadge : record.conditionTone === 'caution' ? styles.cautionBadge : styles.goodBadge]}><Text style={styles.conditionBadgeText}>{record.bodyParts.length > 0 ? `${record.bodyParts.join(', ')} ${record.intensity ?? '-'}단계` : '불편 없음'}</Text></View></View><View style={styles.detailDivider} /><DetailRow label="수면" value={record.sleepDuration} /><DetailRow label="걸음 수" value={record.steps} /><DetailRow label="불편 부위" value={record.bodyParts.join(', ') || '없음'} />{record.memo ? <View style={styles.memoBox}><Text style={styles.memoLabel}>메모</Text><Text style={styles.memoText}>{record.memo}</Text></View> : null}<Pressable accessibilityRole="button" onPress={onOpenDetail} style={({ pressed }) => [styles.detailButton, pressed && styles.pressed]}><Text style={styles.detailButtonText}>전체 기록 보기</Text><AppIcon color={colors.primary} name="chevron-right" size={17}/></Pressable></View>;
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return <View style={styles.detailRow}><Text style={styles.detailLabel}>{label}</Text><Text style={styles.detailValue}>{value}</Text></View>;
}
