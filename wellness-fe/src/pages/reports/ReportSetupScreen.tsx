import { useState } from 'react';
import { Platform, Pressable, ScrollView, Text, View } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useRouter } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { PageHeader } from '@/components/ui/page-header';
import type { ReportOptions, ReportPeriod } from '@/domain/wellness';

import { setupStyles as styles } from './report.styles';

const PERIODS: [ReportPeriod, string][] = [['30days', '최근 30일'], ['90days', '최근 90일'], ['custom', '직접 선택']];
const DATA_OPTIONS = [
  ['sleep', '수면'], ['discomfort', '불편 부위'], ['details', '강도·느낌'], ['posture', '자세·베개'],
  ['activity', '활동'], ['skin', '피부·사진'], ['routines', '루틴'],
] as const;
type DataOption = typeof DATA_OPTIONS[number][0];
const dateId = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

export default function ReportSetupScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const today = new Date();
  const weekAgo = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 6);
  const [customStart, setCustomStart] = useState(weekAgo);
  const [customEnd, setCustomEnd] = useState(today);
  const [editingDate, setEditingDate] = useState<'start' | 'end' | null>(null);
  const [options, setOptions] = useState<ReportOptions>({ period: '30days', includeSleep: true, includeActivity: false, includeDiscomfort: true, includeRoutines: false, hidePersonalInfo: false });
  const [selectedData, setSelectedData] = useState<DataOption[]>(['sleep', 'discomfort', 'details']);
  const set = <K extends keyof ReportOptions>(key: K, value: ReportOptions[K]) => setOptions((current) => ({ ...current, [key]: value }));
  const count = selectedData.length;
  const invalidRange = options.period === 'custom' && customStart.getTime() > customEnd.getTime();
  const toggleData = (id: DataOption) => setSelectedData((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  const next = () => router.push({ pathname: '/reports/preview', params: { period: options.period, start: dateId(customStart), end: dateId(customEnd), sleep: String(selectedData.some((id) => id === 'sleep' || id === 'posture')), activity: String(selectedData.some((id) => id === 'activity' || id === 'skin')), discomfort: String(selectedData.some((id) => id === 'discomfort' || id === 'details')), routines: String(selectedData.includes('routines')), private: String(options.hidePersonalInfo) } });
  const periodLabel = PERIODS.find(([id]) => id === options.period)?.[1] ?? '최근 30일';

  return <SafeAreaView edges={['top']} style={styles.screen}>
    <PageHeader backLabel="이전 화면으로" fallbackHref="/(tabs)/records" title="요약 카드 만들기" />
    <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 120 }]}>
      <Text style={styles.sectionTitle}>기간</Text><View style={styles.periodRow}>{PERIODS.map(([id, label]) => <Pressable accessibilityRole="radio" accessibilityState={{ checked: options.period === id }} key={id} onPress={() => set('period', id)} style={[styles.period, options.period === id && styles.selectedPeriod]}><Text style={[styles.periodText, options.period === id && styles.selectedPeriodText]}>{label}</Text></Pressable>)}</View>
      {options.period === 'custom' ? <View style={styles.customDates}><DateField label="시작일" onPress={() => setEditingDate('start')} value={dateId(customStart)}/><DateField label="종료일" onPress={() => setEditingDate('end')} value={dateId(customEnd)}/>{invalidRange ? <Text accessibilityLiveRegion="polite" style={styles.dateError}>종료일은 시작일보다 빠를 수 없어요.</Text> : null}{editingDate ? <DateTimePicker display={Platform.OS === 'ios' ? 'inline' : 'default'} maximumDate={editingDate === 'start' ? customEnd : today} minimumDate={editingDate === 'end' ? customStart : undefined} mode="date" onChange={(_, date) => { if (date) { if (editingDate === 'start') setCustomStart(date); else setCustomEnd(date); } if (Platform.OS !== 'ios') setEditingDate(null); }} value={editingDate === 'start' ? customStart : customEnd}/> : null}{Platform.OS === 'ios' && editingDate ? <Pressable accessibilityRole="button" onPress={() => setEditingDate(null)} style={styles.dateDone}><Text style={styles.dateDoneText}>날짜 선택 완료</Text></Pressable> : null}</View> : null}
      <View style={styles.dataHead}><Text style={styles.sectionTitle}>포함할 데이터</Text><Text style={styles.dataCount}>{count}개</Text></View><View style={styles.dataChips}>{DATA_OPTIONS.map(([id,label])=><Option key={id} label={label} value={selectedData.includes(id)} onChange={()=>toggleData(id)}/>)}</View>
      <View style={styles.previewSection}><Text style={styles.previewLabel}>미리보기</Text><View style={styles.previewCard}><View style={styles.previewTop}><Text style={styles.previewBrand}>몸기록 요약</Text><Text style={styles.previewDate}>{periodLabel}</Text></View><Text style={styles.previewHeadline}>어깨 앞 불편이 반복 기록됨</Text><View style={styles.previewRow}><Text style={styles.previewKey}>기록한 날</Text><Text style={styles.previewValue}>27 / 30일</Text></View><View style={styles.previewRow}><Text style={styles.previewKey}>가장 많이 기록된 부위</Text><Text style={styles.previewValue}>어깨 앞 (14일)</Text></View><View style={styles.previewRow}><Text style={styles.previewKey}>평균 수면</Text><Text style={styles.previewValue}>6시간 22분</Text></View><View style={styles.previewRow}><Text style={styles.previewKey}>불편 2단계 이상</Text><Text style={styles.previewValue}>9일</Text></View><Text style={styles.previewNote}>사용자가 직접 기록한 값과 건강 데이터를 정리한 자료예요. 진단 목적의 자료가 아닙니다.</Text></View></View>
    </ScrollView>
    <View style={[styles.action, { paddingBottom: Math.max(insets.bottom, 12) }]}><Text style={styles.shareLabel}>공유</Text><Pressable accessibilityRole="button" accessibilityState={{ disabled: count === 0 || invalidRange }} disabled={count === 0 || invalidRange} onPress={next} style={[styles.primary, (count === 0 || invalidRange) && styles.disabled]}><Text style={styles.primaryText}>공유 링크 만들기</Text></Pressable></View>
  </SafeAreaView>;
}

function DateField({ label, onPress, value }: { label: string; onPress: () => void; value: string }) { return <Pressable accessibilityRole="button" onPress={onPress} style={styles.dateField}><Text style={styles.dateLabel}>{label}</Text><Text style={styles.dateValue}>{value}</Text></Pressable>; }
function Option({ label, value, onChange }: { label: string; value: boolean; onChange: (value: boolean) => void }) { return <Pressable accessibilityRole="checkbox" accessibilityState={{ checked: value }} onPress={() => onChange(!value)} style={[styles.dataChip, value && styles.dataChipSelected]}><Text style={[styles.dataChipText, value && styles.dataChipTextSelected]}>{label}</Text></Pressable>; }
