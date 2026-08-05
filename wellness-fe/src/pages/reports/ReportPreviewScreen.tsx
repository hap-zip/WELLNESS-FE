import { useCallback, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Modal, Pressable, ScrollView, Share, Text, View } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import * as MediaLibrary from 'expo-media-library';
import { useLocalSearchParams } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { captureRef } from 'react-native-view-shot';

import { AppIcon } from '@/components/app-icon';
import NavigationBackButton from '@/components/navigation-back-button';
import type { HealthReport, ReportOptions, ReportPeriod } from '@/domain/wellness';
import { useAsyncData } from '@/hooks/use-async-data';
import { wellnessApi } from '@/services/wellness-api';
import { colors } from '@/theme/tokens';

import { previewStyles as styles } from './report.styles';

export default function ReportPreviewScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ period?: string; start?: string; end?: string; sleep?: string; activity?: string; discomfort?: string; routines?: string; private?: string }>();
  const options = useMemo<ReportOptions>(() => ({ period: (params.period as ReportPeriod) || '7days', customStartDate: params.start, customEndDate: params.end, includeSleep: params.sleep !== 'false', includeActivity: params.activity !== 'false', includeDiscomfort: params.discomfort !== 'false', includeRoutines: params.routines !== 'false', hidePersonalInfo: params.private === 'true' }), [params.activity, params.discomfort, params.end, params.period, params.private, params.routines, params.sleep, params.start]);
  const loader = useCallback(() => wellnessApi.createHealthReport(options), [options]);
  const { data, error, isLoading, reload } = useAsyncData<HealthReport | null>(loader, null);
  const cardRef = useRef<View>(null);
  const [expertMode, setExpertMode] = useState(false);
  const [status, setStatus] = useState('');
  const reportText = data ? makeReportText(data) : '';
  const copy = async () => { await Clipboard.setStringAsync(reportText); setStatus('요약 텍스트를 복사했어요.'); };
  const share = async () => { if (data) await Share.share({ title: '몸기록 요약', message: reportText }); };
  const saveImage = async () => {
    if (!cardRef.current) return;
    const permission = await MediaLibrary.requestPermissionsAsync();
    if (!permission.granted) { Alert.alert('사진 저장 권한이 필요해요', '설정에서 사진 추가 권한을 허용해 주세요.'); return; }
    const uri = await captureRef(cardRef, { format: 'png', quality: 1, result: 'tmpfile' });
    await MediaLibrary.saveToLibraryAsync(uri);
    setStatus('요약 이미지를 사진에 저장했어요.');
  };

  return <SafeAreaView edges={['top']} style={styles.screen}>
    <View style={styles.topBar}><NavigationBackButton accessibilityLabel="요약 설정으로 돌아가기" fallbackHref="/reports/setup"/><Text style={styles.topTitle}>요약 미리보기</Text><View style={styles.spacer}/></View>
    {isLoading ? <View style={styles.center}><ActivityIndicator color={colors.primary}/><Text style={styles.loading}>요약을 만드는 중</Text></View> : error || !data ? <View style={styles.center}><Text style={styles.errorTitle}>요약을 만들지 못했어요</Text><Pressable accessibilityRole="button" onPress={() => void reload().catch(() => undefined)} style={styles.retry}><Text style={styles.retryText}>다시 시도</Text></Pressable></View> : <>
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 150 }]}><ReportCard data={data} reportRef={cardRef}/><Pressable accessibilityRole="button" onPress={() => setExpertMode(true)} style={styles.expertButton}><Text style={styles.expertButtonText}>전문가에게 전체화면으로 보여주기</Text><AppIcon color={colors.primary} name="chevron-right" size={18}/></Pressable><Text style={styles.shareInfo}>공유와 저장은 사용자가 버튼을 누른 경우에만 실행돼요.</Text>{status ? <Text accessibilityLiveRegion="polite" style={styles.status}>{status}</Text> : null}</ScrollView>
      <View style={[styles.action, { paddingBottom: Math.max(insets.bottom, 12) }]}><View style={styles.actionRow}><Action icon="download" label="이미지 저장" onPress={() => void saveImage()}/><Action icon="copy" label="텍스트 복사" onPress={() => void copy()}/><Action icon="share" label="공유" onPress={() => void share()}/></View></View>
      <Modal animationType="slide" visible={expertMode} onRequestClose={() => setExpertMode(false)}><SafeAreaView edges={['top', 'bottom']} style={styles.expertScreen}><View style={styles.expertTop}><Text style={styles.expertTitle}>전문가에게 보여주기</Text><Pressable accessibilityLabel="전체화면 닫기" accessibilityRole="button" onPress={() => setExpertMode(false)} style={styles.closeButton}><AppIcon color={colors.text} name="close" size={24}/></Pressable></View><ScrollView contentContainerStyle={styles.expertContent}><ReportCard data={data}/></ScrollView></SafeAreaView></Modal>
    </>}
  </SafeAreaView>;
}

function ReportCard({ data, reportRef }: { data: HealthReport; reportRef?: React.RefObject<View | null> }) { return <View collapsable={false} ref={reportRef} style={styles.reportCard}><View style={styles.brandRow}><Text style={styles.brand}>몸기록</Text><Text style={styles.period}>{data.periodLabel}</Text></View><Text style={styles.userName}>{data.options.hidePersonalInfo ? '사용자' : data.userName}</Text><Text style={styles.created}>{data.createdAtLabel} 생성</Text><Text style={styles.headline}>{data.headline}</Text><View style={styles.divider}/>{data.highlights.map((item) => <View key={item.label} style={styles.metric}><Text style={styles.metricLabel}>{item.label}</Text><Text style={styles.metricValue}>{item.value}</Text><Text style={styles.change}>{item.change}</Text></View>)}{data.options.includeSleep ? <InfoBlock label="주로 기록된 수면 자세" values={data.sleepPostures}/> : null}{data.options.includeDiscomfort ? <InfoBlock label="주요 불편 부위" values={data.discomfortAreas}/> : null}{data.options.includeRoutines ? <><View style={styles.routineRow}><Text style={styles.routineLabel}>루틴 실행</Text><Text style={styles.routineValue}>{data.routineCount}회</Text></View><Text style={styles.feedback}>{data.feedbackSummary}</Text></> : null}<InfoBlock label="발견한 흐름" values={data.discoveredPatterns}/><Text style={styles.note}>{data.note}</Text></View>; }
function InfoBlock({ label, values }: { label: string; values: string[] }) { return <View style={styles.areaBox}><Text style={styles.areaLabel}>{label}</Text><View style={styles.tags}>{values.map((value) => <Text key={value} style={styles.tag}>{value}</Text>)}</View></View>; }
function Action({ icon, label, onPress }: { icon: 'copy' | 'download' | 'share'; label: string; onPress: () => void }) { return <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => [styles.actionItem, pressed && styles.pressed]}><AppIcon color={colors.text} name={icon} size={21}/><Text style={styles.actionText}>{label}</Text></Pressable>; }
function makeReportText(data: HealthReport) { const metrics = data.highlights.map((item) => `${item.label}: ${item.value} (${item.change})`).join('\n'); return `몸기록 ${data.periodLabel} 요약\n${data.options.hidePersonalInfo ? '사용자' : data.userName}\n${data.headline}\n${metrics}\n수면 자세: ${data.sleepPostures.join(', ')}\n불편 부위: ${data.discomfortAreas.join(', ')}\n루틴 ${data.routineCount}회 · ${data.feedbackSummary}\n발견한 흐름: ${data.discoveredPatterns.join(', ')}\n\n${data.note}`; }
