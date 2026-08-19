import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'expo-router';
import { ActivityIndicator, Image, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ChevronMediumGlyph, MonthNextGlyph, MonthPrevGlyph } from '@/components/glyphs';
import { headerShadow, useScrollElevation } from '@/hooks/use-scroll-header';
import { CHEKI } from '@/lib/cheki';
import { text } from '@/theme/typography';
import { usePalette } from '@/theme/use-palette';
import type { Palette } from '@/theme/palette';
import { wellnessApi } from '@/services/wellness-api';
import type { AutoHealthRecord } from '@/domain/wellness';
import { useDailyCheck } from '@/context/daily-check-context';
import { FILTERS, LEGEND, loadDayRecord, loadMonthTones, loadRoutineDoneDays, TODAY, WEEKDAYS, type DayRecordView, type DayTone, type RecordFilter } from './records.data';

/**
 * `Momgirok v8.dc.html` → `<sc-if value="{{ isRecords }}">` 블록을 그대로 옮긴 것.
 * 다음 달 화살표가 프로토타입에서부터 `g400`(비활성 색)이고 `nextMonth: () => {}` 로
 * 아무 동작도 하지 않는다 — 오늘이 속한 달을 보고 있을 때는 더 미래로 갈 수 없다는
 * 뜻으로 해석해, "오늘이 속한 달 이상으로는 다음 달 이동 불가"로 일반화했다.
 */

const toneColor = (c: Palette, tone: DayTone) => (tone === 'ok' ? c.pri : tone === 'mid' ? '#F5A623' : c.danger);

export default function RecordsCalendarScreen() {
  const c = usePalette();
  const router = useRouter();
  const { startDraft } = useDailyCheck();
  const insets = useSafeAreaInsets();

  const [filter, setFilter] = useState<RecordFilter>('전체');
  const [year, setYear] = useState(TODAY.year);
  const [month, setMonth] = useState(TODAY.month);
  const [selDay, setSelDay] = useState(TODAY.day);
  const [refreshing, setRefreshing] = useState(false);
  const [healthRecord, setHealthRecord] = useState<AutoHealthRecord | null>(null);
  const [healthLoading, setHealthLoading] = useState(false);
  const [healthMessage, setHealthMessage] = useState('');
  const [dayRecord, setDayRecord] = useState<DayRecordView | null>(null);
  const [monthTones, setMonthTones] = useState<Record<number, DayTone>>({});
  const [routineDoneDays, setRoutineDoneDays] = useState<number[]>([]);
  const [reloadKey, setReloadKey] = useState(0);
  const { elevated, onScroll } = useScrollElevation();

  const onRefresh = async () => {
    setRefreshing(true);
    setReloadKey((value) => value + 1);
    setRefreshing(false);
  };

  const canGoNext = year < TODAY.year || (year === TODAY.year && month < TODAY.month);

  const goPrevMonth = () => {
    const d = new Date(year, month - 2, 1);
    setYear(d.getFullYear()); setMonth(d.getMonth() + 1); setSelDay(1);
  };
  const goNextMonth = () => {
    if (!canGoNext) return;
    const d = new Date(year, month, 1);
    setYear(d.getFullYear()); setMonth(d.getMonth() + 1); setSelDay(1);
  };

  useEffect(() => {
    let active = true;
    void loadMonthTones(year, month).then((tones) => { if (active) setMonthTones(tones); });
    void loadRoutineDoneDays(year, month).then((days) => { if (active) setRoutineDoneDays(days); });
    return () => { active = false; };
  }, [year, month, reloadKey]);

  const cells = useMemo(() => buildCells({ year, month, selDay, today: TODAY, tones: monthTones, routineDoneDays, filter }), [year, month, selDay, monthTones, routineDoneDays, filter]);

  const selectedDateId = `${year}-${String(month).padStart(2, '0')}-${String(selDay).padStart(2, '0')}`;
  const dayTone = dayRecord?.tone;
  const hasHealthData = healthRecord ? [healthRecord.sleepDuration, healthRecord.steps, healthRecord.activityEnergy].some((value) => value !== '기록 없음') : false;
  const hasRecord = Boolean(dayRecord) || hasHealthData;
  const selWeekday = WEEKDAYS[new Date(year, month - 1, selDay).getDay()];
  const selTagLabel = hasRecord ? (dayTone === 'ok' ? '불편 없음' : dayTone === 'mid' ? '가벼운 불편' : '뚜렷한 불편') : '미기록';
  const tagTone = hasRecord ? (dayTone ?? null) : null;

  const startCheckForDate = (dateId: string) => {
    startDraft(dateId, 'create');
    router.push('/check/auto');
  };

  const openDate = async (day: number) => {
    setSelDay(day);
    const dateId = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    try {
      const savedRecord = await wellnessApi.getRecordDetail(dateId);
      if (!savedRecord) startCheckForDate(dateId);
    } catch {
      startCheckForDate(dateId);
    }
  };

  useEffect(() => {
    let active = true;
    setHealthLoading(true); setHealthRecord(null); setHealthMessage(''); setDayRecord(null);
    void wellnessApi.getAutoHealthRecord(selectedDateId).then((record) => {
      if (!active) return;
      setHealthRecord(record);
      if (![record.sleepDuration, record.steps, record.activityEnergy].some((value) => value !== '기록 없음')) setHealthMessage('Apple 건강에도 이 날짜에 저장된 데이터가 없어요.');
    }).catch((reason) => {
      if (active) setHealthMessage(reason instanceof Error ? reason.message : '이 날짜의 건강 데이터를 불러오지 못했어요.');
    }).finally(() => { if (active) setHealthLoading(false); });
    void loadDayRecord(selectedDateId).then((record) => { if (active) setDayRecord(record); });
    return () => { active = false; };
  }, [reloadKey, selectedDateId]);

  return (
    <View style={[s.screen, { backgroundColor: c.bg }]}>
      {/* 헤더 — height:52; padding:0 12px 0 20px */}
      <View style={[s.headerSurface, { backgroundColor: c.card, borderBottomColor: c.g200, paddingTop: insets.top }, elevated && headerShadow]}>
        <View style={s.header}>
          <Text style={[text({ size: 20, weight: 700, tracking: -0.035 }), { color: c.g900 }]}>기록</Text>
          <Pressable accessibilityRole="button" onPress={() => router.push('/reports/setup')} style={[s.summaryBtn, { borderColor: c.g300 }]}>
            <Text style={[text({ size: 12.5, weight: 700 }), { color: c.g700 }]}>요약 만들기</Text>
          </Pressable>
        </View>
      </View>

      <ScrollView
        onScroll={onScroll}
        refreshControl={<RefreshControl onRefresh={() => void onRefresh()} refreshing={refreshing} tintColor={c.pri} />}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        style={s.body}>

      {/* 필터 — padding:14px 20px 16px */}
      <View style={[s.filterRow, { backgroundColor: c.card }]}>
        <Text style={[text({ size: 13, weight: 700 }), { color: c.g700 }]}>보기</Text>
        <View style={s.filterPills}>
          {FILTERS.map((f) => {
            const active = f === filter;
            return (
              <Pressable
                key={f}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
                onPress={() => setFilter(f)}
                style={[s.pill, { borderColor: active ? c.g900 : c.g300, backgroundColor: active ? c.g900 : c.card }]}>
                <Text style={[text({ size: 13, weight: active ? 700 : 500 }), { color: active ? c.card : c.g600 }]}>{f}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* 캘린더 — margin-top:10; padding:18px 20px 20px */}
      <View style={[s.section, { backgroundColor: c.card }]}>
        <View style={s.monthRow}>
          <Pressable accessibilityLabel="이전 달" accessibilityRole="button" onPress={goPrevMonth} style={s.monthBtn}>
            <MonthPrevGlyph color={c.g800} />
          </Pressable>
          <Text style={[text({ size: 17, weight: 700, tracking: -0.03 }), { color: c.g900 }]}>{year}년 {month}월</Text>
          <Pressable accessibilityLabel="다음 달" accessibilityRole="button" disabled={!canGoNext} onPress={goNextMonth} style={s.monthBtn}>
            <MonthNextGlyph color={canGoNext ? c.g800 : c.g400} />
          </Pressable>
        </View>

        <View style={s.weekdayRow}>
          {WEEKDAYS.map((w, i) => (
            <View key={w} style={s.weekdayCell}>
              <Text style={[text({ size: 12, weight: 600 }), { color: i === 0 ? c.danger : i === 6 ? c.info : c.g500 }]}>{w}</Text>
            </View>
          ))}
        </View>

        <View style={s.grid}>
          {cells.map((cell) => (
            <Pressable
              key={cell.key}
              accessibilityRole={cell.day ? 'button' : undefined}
              accessibilityState={cell.day ? { selected: cell.day === selDay, disabled: cell.future } : undefined}
              disabled={!cell.day || cell.future}
              onPress={cell.day && !cell.future ? () => void openDate(cell.day!) : undefined}
              style={[s.cell, cell.future && s.cellFuture, Boolean(cell.day) && !cell.matched && s.cellDimmed]}>
              {cell.day ? (
                <>
                  <View style={[s.cellNum, cell.day === selDay && { backgroundColor: c.pri }]}>
                    <Text style={[
                      text({ size: 14, weight: cell.day === selDay ? 700 : 500, tabular: true }),
                      { color: cell.day === selDay ? '#fff' : cell.dow === 0 ? c.danger : cell.dow === 6 ? c.info : c.g900 },
                    ]}>
                      {cell.day}
                    </Text>
                  </View>
                  <View style={[s.cellDot, { backgroundColor: cell.tone && cell.matched ? toneColor(c, cell.tone) : 'transparent' }]} />
                </>
              ) : null}
            </Pressable>
          ))}
        </View>

        <View style={[s.legend, { borderTopColor: c.g200 }]}>
          {LEGEND.map((item) => (
            <View key={item.tone} style={s.legendItem}>
              <View style={[s.legendDot, { backgroundColor: toneColor(c, item.tone) }]} />
              <Text style={[text({ size: 11.5, weight: 600 }), { color: c.g600 }]}>{item.label}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* 선택일 상세 — margin-top:10; padding:18px 20px 22px */}
      <View style={[s.section, s.daySection, { backgroundColor: c.card }]}>
        <View style={s.dayHeader}>
          <Text style={[text({ size: 17, weight: 700, tracking: -0.03 }), { color: c.g900 }]}>{month}월 {selDay}일 {selWeekday}요일</Text>
          <View style={[s.tag, { backgroundColor: tagTone === 'bad' ? c.dangerBg : tagTone === 'ok' ? c.priLightest : c.g200 }]}>
            <Text style={[text({ size: 12, weight: 700 }), { color: tagTone === 'bad' ? c.dangerDk : tagTone === 'ok' ? c.priDk : c.g600 }]}>{selTagLabel}</Text>
          </View>
        </View>

        {healthLoading ? <View style={[s.loadingBox, { backgroundColor: c.g100 }]}><ActivityIndicator color={c.pri}/><Text style={[text({ size: 12.5 }), { color: c.g600 }]}>이 날짜의 건강 데이터를 불러오는 중이에요</Text></View> : hasRecord ? (
          <>
            <View style={s.dayRows}>
              {(dayRecord ? [
                ...dayRecord.areas.map((area) => ({ key: `area-${area.id}`, label: area.name, value: `${area.intensity}단계`, tone: area.intensity >= 3 })),
                { key: 'sleep', label: '수면', value: dayRecord.autoRecords.sleepDuration, tone: false },
                { key: 'steps', label: '걸음 수', value: dayRecord.autoRecords.steps, tone: false },
                ...(dayRecord.sleepSatisfactionLabel ? [{ key: 'sleepQ', label: '수면 만족도', value: dayRecord.sleepSatisfactionLabel, tone: false }] : []),
                ...(dayRecord.activity ? [{ key: 'activity', label: '활동', value: dayRecord.activity, tone: false }] : []),
              ] : [
                { key: 'sleep', label: '수면', value: healthRecord?.sleepDuration ?? '기록 없음', tone: false },
                { key: 'bedtime', label: '취침 시각', value: healthRecord?.bedtime ?? '기록 없음', tone: false },
                { key: 'steps', label: '걸음 수', value: healthRecord?.steps ?? '기록 없음', tone: false },
                { key: 'energy', label: '활동 에너지', value: healthRecord?.activityEnergy ?? '기록 없음', tone: false },
              ]).map((row, i, rows) => (
                <View key={row.key} style={[s.dayRow, i < rows.length - 1 && { borderBottomWidth: 1, borderBottomColor: c.g200 }]}>
                  <Text style={[text({ size: 13.5 }), { color: c.g600 }]}>{row.label}</Text>
                  <Text style={[text({ size: 14, weight: 700, tracking: -0.03 }), { color: row.tone ? c.danger : c.g900 }]}>{row.value}</Text>
                </View>
              ))}
            </View>
            {dayRecord?.memo ? <View style={[s.memoBox, { backgroundColor: c.g100 }]}>
              <Text style={[text({ size: 11.5, weight: 700 }), { color: c.g500 }]}>메모</Text>
              <Text style={[text({ size: 13.5, leading: 1.7 }), s.memoText, { color: c.g700 }]}>{dayRecord.memo}</Text>
            </View> : null}
            <Pressable accessibilityRole="button" onPress={() => router.push(`/records/${selectedDateId}`)} style={[s.openDayBtn, { borderColor: c.g300 }]}> 
              <Text style={[text({ size: 14, weight: 700 }), { color: c.g800 }]}>이 날 기록 전체 보기</Text>
              <ChevronMediumGlyph color={c.g800} />
            </Pressable>
          </>
        ) : (
          <View style={[s.emptyBox, { backgroundColor: c.g100 }]}>
            <Image accessible={false} resizeMode="contain" source={CHEKI.recording} style={s.emptyMascot} />
            <Text style={[text({ size: 14.5, weight: 700 }), s.emptyTitle, { color: c.g800 }]}>이 날의 기록이 없어요</Text>
            <Text style={[text({ size: 12.5 }), s.emptyBody, { color: c.g500 }]}>{healthMessage || '기억나는 상태를 지금 남길 수 있어요'}</Text>
            <Pressable accessibilityRole="button" onPress={() => startCheckForDate(selectedDateId)} style={[s.emptyCta, { backgroundColor: c.pri }]}>
              <Text style={[text({ size: 14, weight: 700 }), { color: '#fff' }]}>이 날 기록하기</Text>
            </Pressable>
          </View>
        )}
      </View>

      {/* 탭바에 가리지 않기 위한 여백 */}
      <View style={{ height: 112 }} />
      </ScrollView>
    </View>
  );
}

function buildCells({ year, month, selDay, today, tones, routineDoneDays, filter }: {
  year: number; month: number; selDay: number;
  today: typeof TODAY; tones: Record<number, DayTone>; routineDoneDays: number[]; filter: RecordFilter;
}) {
  const isTodayMonth = year === today.year && month === today.month;
  const first = new Date(year, month - 1, 1).getDay();
  const total = new Date(year, month, 0).getDate();
  const matchesFilter = (day: number, tone: DayTone | undefined) =>
    filter === '전체' ? true
    : filter === '불편 있음' ? tone !== undefined && tone !== 'ok'
    : routineDoneDays.includes(day);
  const cells: { key: string; day: number | null; dow: number; future: boolean; tone: DayTone | undefined; matched: boolean }[] = [];
  for (let i = 0; i < first; i++) cells.push({ key: `b${i}`, day: null, dow: -1, future: false, tone: undefined, matched: true });
  for (let d = 1; d <= total; d++) {
    const dow = new Date(year, month - 1, d).getDay();
    const future = isTodayMonth ? d > today.day : year > today.year || (year === today.year && month > today.month);
    const tone = tones[d];
    cells.push({ key: `d${d}`, day: d, dow, future, tone, matched: matchesFilter(d, tone) });
  }
  return cells;
}

const s = StyleSheet.create({
  screen: { flex: 1 },
  body: { flex: 1 },

  header: { height: 52, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingLeft: 20, paddingRight: 12 },
  headerSurface: { zIndex: 2, borderBottomWidth: StyleSheet.hairlineWidth },
  summaryBtn: { height: 34, paddingHorizontal: 14, borderWidth: 1, borderRadius: 18, alignItems: 'center', justifyContent: 'center', marginRight: 8 },

  filterRow: { paddingTop: 14, paddingHorizontal: 20, paddingBottom: 16, flexDirection: 'row', alignItems: 'center', gap: 10 },
  filterPills: { flexDirection: 'row', gap: 7 },
  pill: { height: 36, paddingHorizontal: 16, borderRadius: 19, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },

  section: { marginTop: 10, paddingTop: 18, paddingHorizontal: 20, paddingBottom: 20 },
  daySection: { paddingBottom: 22 },

  monthRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  monthBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },

  weekdayRow: { marginTop: 14, flexDirection: 'row' },
  weekdayCell: { flex: 1, height: 30, alignItems: 'center', justifyContent: 'center' },

  // CSS: grid-template-columns:repeat(7,1fr); row-gap:4px — flexWrap 로 흉내낼 때는
  // row-gap 이 자동으로 안 생기므로 명시해야 한다.
  grid: { marginTop: 4, flexDirection: 'row', flexWrap: 'wrap', rowGap: 4 },
  cell: { width: `${100 / 7}%`, height: 46, alignItems: 'center', justifyContent: 'center', gap: 3 },
  cellFuture: { opacity: 0.32 },
  cellDimmed: { opacity: 0.35 },
  cellNum: { width: 30, height: 30, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  cellDot: { width: 5, height: 5, borderRadius: 3 },

  legend: { marginTop: 16, paddingTop: 14, borderTopWidth: 1, flexDirection: 'row', gap: 16 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 7, height: 7, borderRadius: 4 },

  dayHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  tag: { height: 28, paddingHorizontal: 12, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },

  dayRows: { marginTop: 14 },
  dayRow: { minHeight: 50, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },

  memoBox: { marginTop: 16, padding: 14, borderRadius: 14 },
  memoText: { marginTop: 6 },

  openDayBtn: { marginTop: 14, minHeight: 50, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5, borderWidth: 1, borderRadius: 26 },

  emptyBox: { marginTop: 16, paddingVertical: 24, paddingHorizontal: 16, borderRadius: 16, alignItems: 'center' },
  loadingBox: { marginTop: 16, minHeight: 120, borderRadius: 16, alignItems: 'center', justifyContent: 'center', gap: 12 },
  emptyMascot: { width: 124, height: 124, marginTop: -10, marginBottom: -6 },
  emptyTitle: { marginTop: 6 },
  emptyBody: { marginTop: 4 },
  emptyCta: { marginTop: 14, height: 44, paddingHorizontal: 22, borderRadius: 23, alignItems: 'center', justifyContent: 'center' },
});
