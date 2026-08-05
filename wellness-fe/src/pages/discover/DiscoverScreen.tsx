import { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { WellnessBarsChart, WellnessLineChart } from '@/components/charts/wellness-charts';
import type { DiscoverPattern, DiscoverSummary } from '@/domain/wellness';
import { useAsyncData } from '@/hooks/use-async-data';
import { wellnessApi } from '@/services/wellness-api';

import { styles } from './discover.styles';

function todayId() {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function dayLabel(dateId: string) {
  const [, month, day] = dateId.split('-').map(Number);
  return { day: `${day}`, weekday: ['일', '월', '화', '수', '목', '금', '토'][new Date(`${dateId}T12:00:00`).getDay()], month: `${month}월` };
}

export default function DiscoverScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [selectedDate, setSelectedDate] = useState(todayId);
  const loader = useCallback(() => wellnessApi.getDiscoverSummary(selectedDate), [selectedDate]);
  const { data, error, isLoading, reload } = useAsyncData<DiscoverSummary | null>(loader, null);

  return (
    <SafeAreaView edges={['top']} style={styles.screen}>
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 112 }]} showsVerticalScrollIndicator={false}>
        <Text style={styles.eyebrow}>나의 발견</Text>
        <Text style={styles.title}>기록 속 흐름을{`\n`}한눈에 확인해요</Text>
        <Text style={styles.description}>선택한 날짜까지의 최근 7일 기록을 함께 비교해요.</Text>

        <View style={styles.dateCard}>
          <Text style={styles.cardLabel}>기준 날짜</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.dateRow}>
            {(data?.availableDates ?? Array.from({ length: 7 }, (_, index) => {
              const date = new Date(); date.setDate(date.getDate() - 6 + index); return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
            })).map((date) => {
              const label = dayLabel(date);
              const selected = date === selectedDate;
              return <Pressable accessibilityLabel={`${label.month} ${label.day}일 ${label.weekday}요일`} accessibilityRole="button" accessibilityState={{ selected }} key={date} onPress={() => setSelectedDate(date)} style={({ pressed }) => [styles.dateButton, selected && styles.selectedDateButton, pressed && styles.pressed]}><Text style={[styles.weekday, selected && styles.selectedDateText]}>{label.weekday}</Text><Text style={[styles.day, selected && styles.selectedDateText]}>{label.day}</Text></Pressable>;
            })}
          </ScrollView>
        </View>

        {isLoading ? <StatusCard><ActivityIndicator color="#1257E0" /><Text style={styles.statusText}>선택한 기간을 분석하는 중</Text></StatusCard> : error ? <StatusCard><Text style={styles.errorTitle}>발견 내용을 불러오지 못했어요</Text><Pressable onPress={() => void reload().catch(() => undefined)} style={styles.retryButton}><Text style={styles.retryText}>다시 시도</Text></Pressable></StatusCard> : data ? <>
          <Text style={styles.period}>{data.periodLabel} · 모든 차트 동시 반영</Text>
          <ChartCard title="수면 시간" value={`${average(data.sleepValues).toFixed(1)}시간 평균`}><WellnessLineChart labels={data.labels} values={data.sleepValues} /></ChartCard>
          <ChartCard title="컨디션 점수" value={`${average(data.conditionValues).toFixed(1)} / 5`}><WellnessBarsChart color="#EF9A72" labels={data.labels} values={data.conditionValues} /></ChartCard>
          <ChartCard title="활동량" value={`${average(data.activityValues).toFixed(1)}천 보 평균`}><WellnessBarsChart labels={data.labels} values={data.activityValues} /></ChartCard>
          <View style={styles.patternHeading}><View><Text style={styles.sectionTitle}>발견한 패턴</Text><Text style={styles.sectionDescription}>기록이 쌓일수록 더 정확해져요.</Text></View><Text style={styles.count}>{data.patterns.length}개</Text></View>
          {data.patterns.map((pattern) => <PatternCard endDate={selectedDate} key={pattern.id} pattern={pattern} onPress={() => router.push({ pathname: '/discover/pattern/[patternId]', params: { patternId: pattern.id, endDate: selectedDate } })} />)}
        </> : <StatusCard><Text style={styles.errorTitle}>분석할 기록이 아직 없어요</Text><Text style={styles.statusText}>기록을 남기면 이곳에서 패턴을 보여드릴게요.</Text></StatusCard>}
      </ScrollView>
    </SafeAreaView>
  );
}

function average(values: readonly number[]) { return values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0; }
function StatusCard({ children }: { children: React.ReactNode }) { return <View style={styles.statusCard}>{children}</View>; }
function ChartCard({ children, title, value }: { children: React.ReactNode; title: string; value: string }) { return <View style={styles.chartCard}><View style={styles.chartHeader}><Text style={styles.chartTitle}>{title}</Text><Text style={styles.chartValue}>{value}</Text></View>{children}</View>; }
function PatternCard({ pattern, onPress }: { endDate: string; pattern: DiscoverPattern; onPress: () => void }) {
  return <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => [styles.patternCard, pressed && styles.pressed]}><View style={[styles.patternAccent, styles[`${pattern.tone}Accent`]]} /><View style={styles.patternBody}><View style={styles.patternTop}><Text style={styles.patternMetric}>{pattern.metric}</Text><Text style={styles.chevron}>›</Text></View><Text style={styles.patternTitle}>{pattern.title}</Text><Text style={styles.patternSummary}>{pattern.summary}</Text></View></Pressable>;
}
