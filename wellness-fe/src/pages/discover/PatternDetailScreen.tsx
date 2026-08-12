import { useCallback } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { WellnessLineChart } from '@/components/charts/wellness-charts';
import NavigationBackButton from '@/components/navigation-back-button';
import type { PatternDetail } from '@/domain/wellness';
import { useAsyncData } from '@/hooks/use-async-data';
import { wellnessApi } from '@/services/wellness-api';
import { colors, dataColors } from '@/theme/tokens';

import { patternStyles as styles } from './pattern-detail.styles';

export default function PatternDetailScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ patternId?: string; endDate?: string }>();
  const patternId = typeof params.patternId === 'string' ? params.patternId : '';
  const endDate = typeof params.endDate === 'string' ? params.endDate : '';
  const loader = useCallback(() => wellnessApi.getPatternDetail(patternId, endDate), [endDate, patternId]);
  const { data, error, isLoading, reload } = useAsyncData<PatternDetail | null>(loader, null);

  if (isLoading) return <SafeAreaView edges={['top', 'bottom']} style={styles.center}><ActivityIndicator color={colors.primary} /><Text style={styles.centerText}>패턴 근거를 확인하는 중</Text></SafeAreaView>;
  if (error) return <SafeAreaView edges={['top', 'bottom']} style={styles.center}><Text accessibilityLiveRegion="polite" style={styles.errorTitle}>패턴을 불러오지 못했어요</Text><Pressable accessibilityRole="button" onPress={() => void reload().catch(() => undefined)} style={styles.retryButton}><Text style={styles.retryText}>다시 시도</Text></Pressable></SafeAreaView>;
  if (!data) return <SafeAreaView edges={['top', 'bottom']} style={styles.center}><Text style={styles.errorTitle}>해당 패턴을 찾을 수 없어요</Text><Pressable accessibilityRole="button" onPress={() => router.dismissTo('/(tabs)/discover')} style={styles.retryButton}><Text style={styles.retryText}>커넥션 뷰로 돌아가기</Text></Pressable></SafeAreaView>;

  return <SafeAreaView edges={['top']} style={styles.screen}><View style={styles.topBar}><NavigationBackButton accessibilityLabel="발견 화면으로 돌아가기" fallbackHref="/(tabs)/discover" /><Text style={styles.topTitle}>패턴 상세</Text><View style={styles.spacer} /></View><ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 36 }]} showsVerticalScrollIndicator={false}>
    <Text style={styles.title}>{data.title}</Text><Text style={styles.summary}>{data.summary}</Text><Text style={styles.meta}>{data.metric} · {data.confidenceLabel}</Text><Text style={styles.disclaimer}>이 결과는 생활 기록에서 함께 나타난 경향을 보여줍니다. 질병의 원인이나 진단을 의미하지 않습니다.</Text>
    <View style={styles.chartCard}><Text style={styles.comparison}>{data.comparisonLabel}</Text><View style={styles.legend}><Legend color={colors.primary} label="첫 번째 지표" /><Legend color={dataColors.discomfort} label="비교 지표" /></View><WellnessLineChart labels={data.labels} secondaryValues={data.secondaryValues} values={data.primaryValues} /></View>
    <View style={styles.section}><Text style={styles.sectionTitle}>이렇게 발견했어요</Text>{data.evidence.map((item, index) => <View key={item} style={styles.evidenceRow}><Text style={styles.evidenceIndex}>{index + 1}</Text><Text style={styles.evidenceText}>{item}</Text></View>)}</View>
    <View style={styles.suggestionCard}><Text style={styles.suggestionLabel}>오늘의 제안</Text><Text style={styles.suggestion}>{data.suggestion}</Text><Text style={styles.disclaimer}>기록을 기반으로 한 생활 참고 정보이며 의료 진단이 아니에요.</Text></View><View style={styles.actions}><Pressable accessibilityRole="button" onPress={()=>router.push('/(tabs)/records')} style={styles.secondaryAction}><Text style={styles.secondaryActionText}>관련 기록 보기</Text></Pressable><Pressable accessibilityRole="button" onPress={()=>router.push('/routine')} style={styles.primaryAction}><Text style={styles.primaryActionText}>오늘 루틴 보기</Text></Pressable></View>
  </ScrollView></SafeAreaView>;
}

function Legend({ color, label }: { color: string; label: string }) { return <View style={styles.legendItem}><View style={[styles.legendDot, { backgroundColor: color }]} /><Text style={styles.legendText}>{label}</Text></View>; }
