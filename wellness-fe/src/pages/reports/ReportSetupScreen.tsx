import { useState } from 'react';
import { Platform, Pressable, ScrollView, Switch, Text, View } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useRouter } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import NavigationBackButton from '@/components/navigation-back-button';
import type { ReportOptions, ReportPeriod } from '@/domain/wellness';
import { colors } from '@/theme/tokens';

import { setupStyles as styles } from './report.styles';

const PERIODS: [ReportPeriod, string][] = [['3days', '3일'], ['7days', '7일'], ['14days', '14일'], ['custom', '직접 선택']];
const dateId = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

export default function ReportSetupScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const today = new Date();
  const weekAgo = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 6);
  const [customStart, setCustomStart] = useState(weekAgo);
  const [customEnd, setCustomEnd] = useState(today);
  const [editingDate, setEditingDate] = useState<'start' | 'end' | null>(null);
  const [options, setOptions] = useState<ReportOptions>({ period: '7days', includeSleep: true, includeActivity: true, includeDiscomfort: true, includeRoutines: true, hidePersonalInfo: false });
  const set = <K extends keyof ReportOptions>(key: K, value: ReportOptions[K]) => setOptions((current) => ({ ...current, [key]: value }));
  const count = [options.includeSleep, options.includeActivity, options.includeDiscomfort, options.includeRoutines].filter(Boolean).length;
  const next = () => router.push({ pathname: '/reports/preview', params: { period: options.period, start: dateId(customStart), end: dateId(customEnd), sleep: String(options.includeSleep), activity: String(options.includeActivity), discomfort: String(options.includeDiscomfort), routines: String(options.includeRoutines), private: String(options.hidePersonalInfo) } });

  return <SafeAreaView edges={['top']} style={styles.screen}>
    <View style={styles.topBar}><NavigationBackButton accessibilityLabel="이전 화면으로" fallbackHref="/(tabs)/records"/><Text style={styles.topTitle}>요약 설정</Text><View style={styles.spacer}/></View>
    <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 120 }]}>
      <Text style={styles.eyebrow}>전문가와 함께 보기</Text><Text style={styles.title}>필요한 기록만{`\n`}한눈에 정리해요</Text><Text style={styles.description}>진료나 상담 전에 변화 흐름을 설명하는 참고 자료로 사용할 수 있어요.</Text>
      <Text style={styles.sectionTitle}>기간</Text><View style={styles.periodRow}>{PERIODS.map(([id, label]) => <Pressable accessibilityRole="radio" accessibilityState={{ checked: options.period === id }} key={id} onPress={() => set('period', id)} style={[styles.period, options.period === id && styles.selectedPeriod]}><Text style={[styles.periodText, options.period === id && styles.selectedPeriodText]}>{label}</Text></Pressable>)}</View>
      {options.period === 'custom' ? <View style={styles.customDates}><DateField label="시작일" onPress={() => setEditingDate('start')} value={dateId(customStart)}/><DateField label="종료일" onPress={() => setEditingDate('end')} value={dateId(customEnd)}/>{editingDate ? <DateTimePicker display={Platform.OS === 'ios' ? 'inline' : 'default'} maximumDate={today} mode="date" onChange={(_, date) => { if (date) { if (editingDate === 'start') setCustomStart(date); else setCustomEnd(date); } if (Platform.OS !== 'ios') setEditingDate(null); }} value={editingDate === 'start' ? customStart : customEnd}/> : null}{Platform.OS === 'ios' && editingDate ? <Pressable onPress={() => setEditingDate(null)} style={styles.dateDone}><Text style={styles.dateDoneText}>날짜 선택 완료</Text></Pressable> : null}</View> : null}
      <Text style={styles.sectionTitle}>포함할 내용</Text><View style={styles.options}><Option label="수면 시간과 자세" value={options.includeSleep} onChange={(value) => set('includeSleep', value)}/><Option label="걸음 수와 활동량" value={options.includeActivity} onChange={(value) => set('includeActivity', value)}/><Option label="불편 부위와 강도 변화" value={options.includeDiscomfort} onChange={(value) => set('includeDiscomfort', value)}/><Option label="루틴과 효과 피드백" value={options.includeRoutines} onChange={(value) => set('includeRoutines', value)}/></View>
      <Text style={styles.sectionTitle}>개인정보</Text><View style={styles.options}><Option description="이름과 계정 정보 대신 ‘사용자’로 표시해요." label="개인정보 숨기기" value={options.hidePersonalInfo} onChange={(value) => set('hidePersonalInfo', value)}/></View>
      <View style={styles.privacy}><Text style={styles.privacyTitle}>의료 문서가 아니에요</Text><Text style={styles.privacyText}>직접 기록한 생활 데이터를 읽기 쉽게 정리한 참고 자료이며 진단서나 의료 소견을 대신하지 않아요.</Text></View>
    </ScrollView>
    <View style={[styles.action, { paddingBottom: Math.max(insets.bottom, 12) }]}><Pressable accessibilityRole="button" disabled={count === 0} onPress={next} style={[styles.primary, count === 0 && styles.disabled]}><Text style={styles.primaryText}>요약 미리보기 · {count}개 항목</Text></Pressable></View>
  </SafeAreaView>;
}

function DateField({ label, onPress, value }: { label: string; onPress: () => void; value: string }) { return <Pressable accessibilityRole="button" onPress={onPress} style={styles.dateField}><Text style={styles.dateLabel}>{label}</Text><Text style={styles.dateValue}>{value}</Text></Pressable>; }
function Option({ description, label, value, onChange }: { description?: string; label: string; value: boolean; onChange: (value: boolean) => void }) { return <View style={styles.option}><View style={styles.optionCopy}><Text style={styles.optionLabel}>{label}</Text>{description ? <Text style={styles.optionDescription}>{description}</Text> : null}</View><Switch accessibilityLabel={label} onValueChange={onChange} trackColor={{ false: colors.border, true: colors.primaryBorder }} thumbColor={value ? colors.primary : colors.white} value={value}/></View>; }
