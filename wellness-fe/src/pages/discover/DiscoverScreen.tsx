import { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import ConnectionOverlayChart from '@/components/charts/connection-overlay-chart';
import { AppIcon } from '@/components/app-icon';
import type { ConnectionMetricId, DiscoverSummary } from '@/domain/wellness';
import { useAsyncData } from '@/hooks/use-async-data';
import { wellnessApi } from '@/services/wellness-api';
import { colors, dataColors } from '@/theme/tokens';
import { styles } from './connection-view.styles';

type Period = '7' | '14' | '30';
const EMPTY: DiscoverSummary = { startDate: '', endDate: '', availableDates: [], periodLabel: '', labels: [], sleepValues: [], conditionValues: [], activityValues: [], metrics: [], patterns: [], dayDetails: [], lowRelations: [], moreDataGuide: '', analysisReadiness: { ready: false, recordedDays: 0, requiredDays: 30 }, baseline: { ready: false, recordedDays: 0, targetDays: 14, averageSleep: '', averageSteps: '', averageBedtime: '', discomfortFrequency: '', comparison: '' } };
function dateId() { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; }

export default function DiscoverScreen() {
  const router = useRouter(); const insets = useSafeAreaInsets(); const [period, setPeriod] = useState<Period>('14'); const [selected, setSelected] = useState<ConnectionMetricId[]>(['sleep', 'discomfort']); const [point, setPoint] = useState<number | null>(null);
  const loader = useCallback(() => wellnessApi.getDiscoverSummary(dateId(), Number(period)), [period]);
  const { data, error, isLoading, reload } = useAsyncData<DiscoverSummary | null>(loader, null);
  const metrics = useMemo(() => data?.metrics.map((metric) => ({ ...metric, color: dataColors[metric.id] })).filter((metric) => selected.includes(metric.id)) ?? [], [data, selected]);
  const toggle = (id: ConnectionMetricId) => setSelected((current) => current.includes(id) ? (current.length === 1 ? current : current.filter((item) => item !== id)) : current.length < 3 ? [...current, id] : current);
  const leadingPattern = data?.patterns[0] ?? null;
  const morePatterns = data?.patterns.slice(1) ?? [];

  return <SafeAreaView edges={['top']} style={styles.screen}><ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 140 }]} showsVerticalScrollIndicator={false}>
    {isLoading ? <View style={styles.statusCard}><ActivityIndicator color={colors.primary} /><Text style={styles.statusText}>기록의 관계를 읽고 있어요</Text></View> : error || !data ? <View style={styles.statusCard}><Text style={styles.statusTitle}>커넥션을 불러오지 못했어요</Text><Text style={styles.statusText}>잠시 후 다시 시도해 주세요.</Text><Pressable onPress={() => void reload().catch(() => undefined)} style={styles.retryButton}><Text style={styles.retryText}>다시 시도</Text></Pressable></View> : <>

      {/* 가장 중요한 발견 — 분석 도구가 아니라 결과가 화면의 첫 시선을 받는다. */}
      {leadingPattern ? (
        <View style={styles.findingHero}>
          <Text style={styles.findingEyebrow}>{leadingPattern.metric} · {leadingPattern.confidenceLabel}</Text>
          <Text style={styles.findingTitle}>{leadingPattern.title}</Text>
          <Text style={styles.findingSummary}>{leadingPattern.summary}</Text>
          <Pressable accessibilityRole="button" onPress={() => router.push({ pathname: '/discover/pattern/[patternId]', params: { patternId: leadingPattern.id, endDate: dateId() } })} style={({ pressed }) => [styles.findingLink, pressed && styles.pressed]}>
            <Text style={styles.findingLinkText}>근거 자세히 보기</Text>
            <AppIcon color={colors.primary} name="arrow-up-right" size={16} />
          </Pressable>
        </View>
      ) : (
        <View style={styles.findingHero}>
          <Text style={styles.findingEyebrow}>패턴을 찾는 중</Text>
          <Text style={styles.findingTitle}>{data.analysisReadiness.recordedDays}/{data.analysisReadiness.requiredDays}일 기록됐어요</Text>
          <Text style={styles.findingSummary}>기록이 더 쌓이면 생활과 몸 사이의 반복을 보여드려요.</Text>
          <View style={styles.baselineRule}><View style={[styles.baselineFill, { width: `${Math.min(100, (data.analysisReadiness.recordedDays / Math.max(1, data.analysisReadiness.requiredDays)) * 100)}%` }]} /></View>
        </View>
      )}

      {/* 기간·지표 컨트롤 — 화면의 첫 초점이 아니라 차트를 위한 보조 도구로 후퇴. */}
      <View style={styles.controls}>
        <View style={styles.controlsHead}>
          <Text style={styles.controlsTitle}>기록 겹쳐보기</Text>
          <View style={styles.periods}>{(['7', '14', '30'] as Period[]).map((value) => <Pressable key={value} accessibilityRole="button" accessibilityState={{ selected: period === value }} onPress={() => setPeriod(value)} style={[styles.period, period === value && styles.periodSelected]}><Text style={[styles.periodText, period === value && styles.periodTextSelected]}>{value}일</Text></Pressable>)}</View>
        </View>
        <View style={styles.metricList}>{data.metrics.map((metric, index) => <Pressable key={metric.id} onPress={() => toggle(metric.id)} style={[styles.metricRow, selected.includes(metric.id) && styles.metricRowSelected]}><View style={[styles.metricDot, { backgroundColor: dataColors[metric.id] }]} /><Text style={styles.metricName}>{metric.label}</Text><Text style={styles.metricState}>{selected.includes(metric.id) ? '선택됨' : '추가'}</Text></Pressable>)}</View>
        <View style={styles.chart}><ConnectionOverlayChart labels={data.labels} metrics={metrics} onPointPress={setPoint} selectedIndex={point} /></View>
        <Text style={styles.chartHint}>날짜를 선택하면 그날의 기록을 확인할 수 있어요.</Text>
      </View>

      {/* 근거 데이터 — 평소 상태와의 비교를 차트 바로 다음에, 캡션 무게로. */}
      {leadingPattern && data.baseline.ready && data.baseline.comparison ? (
        <View style={styles.baselineFooter}>
          <Text style={styles.baselineFooterLabel}>나의 평소 상태</Text>
          <Text style={styles.baselineFooterText}>{data.baseline.comparison}</Text>
        </View>
      ) : null}

      {morePatterns.length ? (
        <View style={styles.patternSection}>
          <View style={styles.patternSectionHead}><Text style={styles.patternSectionTitle}>더 발견된 흐름</Text><Text style={styles.patternCount}>{morePatterns.length}개</Text></View>
          {morePatterns.map((pattern) => <Pressable key={pattern.id} onPress={() => router.push({ pathname: '/discover/pattern/[patternId]', params: { patternId: pattern.id, endDate: dateId() } })} style={styles.pattern}><View style={[styles.patternBar, { backgroundColor: pattern.tone === 'danger' ? colors.body : colors.primary }]} /><View style={styles.patternCopy}><Text style={styles.patternMeta}>{pattern.metric} · {pattern.confidenceLabel}</Text><Text style={styles.patternTitle}>{pattern.title}</Text><Text style={styles.patternSummary}>{pattern.summary}</Text></View><AppIcon color={colors.textMuted} name="arrow-up-right" size={18} /></Pressable>)}
        </View>
      ) : null}

      <Pressable onPress={() => router.push('/reports/setup')} style={styles.report}><View><Text style={styles.reportTitle}>이 기간의 기록 요약 만들기</Text><Text style={styles.reportCopy}>선택한 기록을 한 장의 리포트로 정리합니다.</Text></View><AppIcon color={colors.primary} name="arrow-up-right" size={18} /></Pressable>
    </>}
  </ScrollView></SafeAreaView>;
}
