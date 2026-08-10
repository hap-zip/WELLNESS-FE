import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppIcon } from '@/components/app-icon';
import { PageHeader } from '@/components/ui/page-header';
import type { SignalSummary } from '@/domain/wellness';
import { useAsyncData } from '@/hooks/use-async-data';
import { wellnessApi } from '@/services/wellness-api';
import { colors } from '@/theme/tokens';
import { styles } from './signal.styles';

export default function SignalScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { data, error, isLoading, reload } = useAsyncData<SignalSummary | null>(wellnessApi.getSignalSummary, null);

  if (isLoading) return <SafeAreaView edges={['top', 'bottom']} style={styles.center}><ActivityIndicator color={colors.warning}/><Text style={styles.loadingText}>반복된 기록을 확인하고 있어요</Text></SafeAreaView>;
  if (error || !data) return <SafeAreaView edges={['top', 'bottom']} style={styles.center}><AppIcon color={colors.textMuted} name="alert" size={32}/><Text style={styles.errorTitle}>안내를 불러오지 못했어요</Text><Text style={styles.errorDescription}>연결 상태를 확인한 뒤 다시 시도해 주세요.</Text><Pressable accessibilityRole="button" onPress={() => void reload().catch(() => undefined)} style={({ pressed }) => [styles.retry, pressed && styles.pressed]}><Text style={styles.retryText}>다시 시도</Text></Pressable></SafeAreaView>;

  return <SafeAreaView edges={['top']} style={styles.screen}>
    <PageHeader backLabel="이전 화면으로" fallbackHref="/(tabs)/home" title="지속 신호" />
    <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 40 }]} showsVerticalScrollIndicator={false}>
      <View style={styles.signalIcon}><AppIcon color={colors.warning} name="alert" size={26}/></View>
      <Text style={styles.eyebrow}>기록에서 확인된 신호</Text><Text accessibilityRole="header" style={styles.title}>{data.title}</Text><Text style={styles.description}>{data.description}</Text>
      <View accessibilityLabel={`${data.durationLabel}, 반복 기록 ${data.occurrences}회`} style={styles.metric}><Text style={styles.metricValue}>{data.durationLabel}</Text><Text style={styles.metricLabel}>반복 기록 {data.occurrences}회</Text></View>
      <Section title="확인된 기록">{data.evidence.map(item => <Row key={item} text={item}/>)}</Section>
      <Section title="이렇게 대응해 보세요">{data.guidance.map(item => <Row key={item} text={item}/>)}</Section>
      <View style={styles.notice}><AppIcon color={colors.textMuted} name="info" size={18}/><Text style={styles.noticeText}>이 안내는 진단이 아니라 기록에서 반복된 흐름을 알려드리는 기능이에요.</Text></View>
      <Pressable accessibilityRole="button" onPress={() => router.push('/reports/setup')} style={({ pressed }) => [styles.reportButton, pressed && styles.pressed]}><Text style={styles.reportText}>기록 요약 만들기</Text></Pressable>
      <Pressable accessibilityRole="button" onPress={() => router.dismissTo('/(tabs)/home')} style={({ pressed }) => [styles.homeButton, pressed && styles.pressed]}><Text style={styles.homeText}>오늘 화면으로</Text></Pressable>
    </ScrollView>
  </SafeAreaView>;
}

function Section({children, title}: {children: React.ReactNode; title: string}) { return <View style={styles.section}><Text style={styles.sectionTitle}>{title}</Text>{children}</View>; }
function Row({text}: {text: string}) { return <View style={styles.row}><View style={styles.rowIcon}><AppIcon color={colors.primary} name="check" size={14}/></View><Text style={styles.rowText}>{text}</Text></View>; }
