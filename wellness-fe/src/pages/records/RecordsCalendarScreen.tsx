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
  const todayId = useMemo(() => dateId(today.getFullYear(), today.getMonth() + 1, today.getDate()), [today]);
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
    const nextSelection = cursor.year === today.getFullYear() && cursor.month === today.getMonth() + 1
      ? todayId
      : data.records[0]?.date ?? dateId(cursor.year, cursor.month, 1);
    setSelectedDate(nextSelection);
  }, [cursor.month, cursor.year, data.month, data.records, data.year, isLoading, today, todayId]);

  const moveMonth = (delta: number) => {
    const next = new Date(cursor.year, cursor.month - 1 + delta, 1);
    setCursor({ year: next.getFullYear(), month: next.getMonth() + 1 });
  };

  const isCurrentOrFutureMonth = cursor.year > today.getFullYear() || (cursor.year === today.getFullYear() && cursor.month >= today.getMonth() + 1);
  const openCheck = (date: string, mode: 'create' | 'edit') => router.push({ pathname: '/check/auto', params: { date, mode } });
  const handleDatePress = (date: string, record: WellnessRecordSummary | undefined) => {
    if (!record) {
      openCheck(date, 'create');
      return;
    }
    if (date === todayId) {
      openCheck(date, 'edit');
      return;
    }
    setSelectedDate(date);
  };

  return (
    <SafeAreaView edges={['top']} style={styles.screen}>
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 116 }]} showsVerticalScrollIndicator={false}>
        <Text style={styles.kicker}>기록 보관함</Text>
        <Text style={styles.title}>몸의 변화를{`\n`}날짜로 읽어요.</Text>
        <Text style={styles.description}>기록한 날을 선택하면 몸 상태와 생활 데이터를 함께 확인할 수 있어요.</Text>
        <View style={styles.statsRow}>
          <StatCard index="01" label="기록한 날" value={`${data.stats.recordedDays}일`} />
          <StatCard index="02" label="평균 수면" value={data.stats.averageSleep} />
          <StatCard index="03" label="불편한 날" value={`${data.stats.discomfortDays}일`} />
        </View>

        <View style={styles.calendarCard}>
          <View style={styles.monthHeader}>
            <Pressable accessibilityLabel="이전 달" accessibilityRole="button" onPress={() => moveMonth(-1)} style={({ pressed }) => [styles.monthButton, pressed && styles.pressed]}><AppIcon color={colors.text} name="chevron-left" size={22}/></Pressable>
            <Text accessibilityRole="header" style={styles.monthTitle}>{cursor.year}년 {cursor.month}월</Text>
            <Pressable accessibilityLabel="다음 달" accessibilityRole="button" accessibilityState={{ disabled: isCurrentOrFutureMonth }} disabled={isCurrentOrFutureMonth} onPress={() => moveMonth(1)} style={({ pressed }) => [styles.monthButton, isCurrentOrFutureMonth && styles.disabledMonthButton, pressed && styles.pressed]}><AppIcon color={isCurrentOrFutureMonth?colors.textMuted:colors.text} name="chevron-right" size={22}/></Pressable>
          </View>

          <View style={styles.weekRow}>{WEEKDAYS.map((weekday, index) => <Text key={weekday} style={[styles.weekday, index === 0 && styles.sunday, index === 6 && styles.saturday]}>{weekday}</Text>)}</View>
          {isLoading ? <View style={styles.calendarLoading}><ActivityIndicator color={colors.primary} /><Text style={styles.loadingText}>기록을 불러오는 중</Text></View> : error ? <View style={styles.calendarLoading}><Text style={styles.errorText}>기록을 불러오지 못했어요.</Text><Pressable accessibilityRole="button" onPress={() => void reload().catch(() => undefined)} style={styles.retryButton}><Text style={styles.retryText}>다시 시도</Text></Pressable></View> : (
            <View style={styles.calendarGrid}>{calendarCells.map((day, index) => {
              if (day === null) return <View key={`empty-${index}`} style={styles.dayCell} />;
              const id = dateId(cursor.year, cursor.month, day);
              const record = recordMap.get(id);
              const selected = selectedDate === id;
              const isToday = id === todayId;
              const isFuture = id > todayId;
              const actionLabel = isFuture ? '선택할 수 없는 미래 날짜' : !record ? '기록하기' : isToday ? '오늘 기록 수정하기' : '기록 보기';
              return <Pressable accessibilityLabel={`${cursor.month}월 ${day}일, ${actionLabel}`} accessibilityRole="button" accessibilityState={{ disabled:isFuture, selected }} disabled={isFuture} key={id} onPress={() => handleDatePress(id, record)} style={({ pressed }) => [styles.dayCell, selected && styles.selectedDayCell, isFuture&&styles.futureDayCell, pressed && styles.pressed]}><Text style={[styles.dayText, index % 7 === 0 && styles.sunday, index % 7 === 6 && styles.saturday, selected && styles.selectedDayText, isFuture&&styles.futureDayText]}>{day}</Text>{record ? <View style={[styles.recordDot, record.conditionTone === 'danger' ? styles.dangerDot : record.conditionTone === 'caution' ? styles.cautionDot : styles.goodDot]} /> : isToday ? <View style={styles.todayDot} /> : null}</Pressable>;
            })}</View>
          )}
        </View>

        <RecordDetail date={selectedDate} isToday={selectedDate===todayId} onEdit={() => openCheck(selectedDate, 'edit')} onOpenDetail={() => router.push({ pathname: '/records/[date]', params: { date: selectedDate } })} onRecord={() => openCheck(selectedDate, 'create')} record={selectedRecord} />
        <Pressable accessibilityRole="button" onPress={() => router.push('/reports/setup')} style={({ pressed }) => [styles.reportEntry, pressed && styles.pressed]}><Text style={styles.reportEntryIndex}>요약</Text><View style={styles.reportEntryCopy}><Text style={styles.reportEntryTitle}>기록 요약 만들기</Text><Text style={styles.reportEntryDescription}>선택한 기간의 변화를 공유 가능한 한 장으로 정리해요.</Text></View><AppIcon color={colors.brand} name="arrow-up-right" size={20}/></Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

function StatCard({ index, label, value }: { index: string; label: string; value: string }) {
  return <View style={styles.statCard}><Text style={styles.statIndex}>{index}</Text><Text style={styles.statValue}>{value}</Text><Text style={styles.statLabel}>{label}</Text></View>;
}

function RecordDetail({ date, isToday, onEdit, onOpenDetail, onRecord, record }: { date: string; isToday: boolean; onEdit: () => void; onOpenDetail: () => void; onRecord: () => void; record: WellnessRecordSummary | null }) {
  const [, month, day] = date.split('-').map(Number);
  if (!record) return <View accessibilityRole="summary" style={styles.emptyDetail}><Text style={styles.detailDate}>{month}월 {day}일</Text><View style={styles.emptyRule}/><Text style={styles.emptyTitle}>{isToday?'오늘 기록을 시작해 주세요.':'이 날짜의 상태를 기록해 보세요.'}</Text><Text style={styles.emptyDescription}>{isToday?'지금 상태를 남기면 오늘부터 변화 흐름을 확인할 수 있어요.':'비어 있는 지난 날짜에도 기억나는 상태를 남길 수 있어요.'}</Text><Pressable accessibilityRole="button" onPress={onRecord} style={({ pressed }) => [styles.recordButton, pressed && styles.pressed]}><Text style={styles.recordButtonText}>{isToday?'오늘 상태 기록하기':`${month}월 ${day}일 기록하기`}</Text><AppIcon color={colors.white} name="arrow-up-right" size={18}/></Pressable></View>;
  return <View style={styles.detailCard}><View style={styles.detailHeader}><View><Text style={styles.detailDate}>{month}월 {day}일의 기록</Text><Text style={styles.detailCondition}>{record.condition}</Text></View><Text style={[styles.conditionText, record.conditionTone === 'danger' ? styles.dangerText : record.conditionTone === 'caution' ? styles.cautionText : styles.goodText]}>{record.bodyParts.length > 0 ? `${record.bodyParts.join(', ')} · ${record.intensity ?? '-'}단계` : '불편 없음'}</Text></View><View style={styles.detailRows}><DetailRow label="01 / 수면" value={record.sleepDuration} /><DetailRow label="02 / 걸음 수" value={record.steps} /><DetailRow label="03 / 불편 부위" value={record.bodyParts.join(', ') || '없음'} /></View>{record.memo ? <View style={styles.memoBox}><Text style={styles.memoLabel}>MEMO</Text><Text style={styles.memoText}>{record.memo}</Text></View> : null}{isToday?<Pressable accessibilityRole="button" onPress={onEdit} style={({ pressed }) => [styles.editRecordButton, pressed && styles.pressed]}><Text style={styles.editRecordButtonText}>오늘 기록 수정하기</Text><AppIcon color={colors.white} name="arrow-up-right" size={17}/></Pressable>:null}<Pressable accessibilityRole="button" onPress={onOpenDetail} style={({ pressed }) => [styles.detailButton, pressed && styles.pressed]}><Text style={styles.detailButtonText}>전체 기록 보기</Text><AppIcon color={colors.brand} name="arrow-up-right" size={17}/></Pressable></View>;
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return <View style={styles.detailRow}><Text style={styles.detailLabel}>{label}</Text><Text style={styles.detailValue}>{value}</Text></View>;
}
