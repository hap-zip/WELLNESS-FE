import { useCallback } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import NavigationBackButton from '@/components/navigation-back-button';
import { AppIcon, type AppIconName } from '@/components/app-icon';
import type { PatternDetail } from '@/domain/wellness';
import { useAsyncData } from '@/hooks/use-async-data';
import { wellnessApi } from '@/services/wellness-api';
import { colors } from '@/theme/tokens';

import { patternStyles as styles } from './pattern-detail.styles';

export default function PatternDetailScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ patternId?: string; endDate?: string }>();
  const patternId = typeof params.patternId === 'string' ? params.patternId : '';
  const endDate = typeof params.endDate === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(params.endDate) ? params.endDate : new Date().toISOString().slice(0, 10);
  const loader = useCallback(() => wellnessApi.getPatternDetail(patternId, endDate), [endDate, patternId]);
  const { data, error, isLoading, reload } = useAsyncData<PatternDetail | null>(loader, null);

  if (isLoading) return <SafeAreaView edges={['top', 'bottom']} style={styles.center}><ActivityIndicator color={colors.primary} /><Text style={styles.centerText}>패턴 근거를 확인하는 중</Text></SafeAreaView>;
  if (error) return <SafeAreaView edges={['top', 'bottom']} style={styles.center}><Text accessibilityLiveRegion="polite" style={styles.errorTitle}>패턴을 불러오지 못했어요</Text><Pressable accessibilityRole="button" onPress={() => void reload().catch(() => undefined)} style={styles.retryButton}><Text style={styles.retryText}>다시 시도</Text></Pressable></SafeAreaView>;
  if (!data) return <SafeAreaView edges={['top', 'bottom']} style={styles.center}><Text style={styles.errorTitle}>해당 패턴을 찾을 수 없어요</Text><Pressable accessibilityRole="button" onPress={() => router.dismissTo('/(tabs)/discover')} style={styles.retryButton}><Text style={styles.retryText}>커넥션 뷰로 돌아가기</Text></Pressable></SafeAreaView>;

  return <SafeAreaView edges={['top']} style={styles.screen}><View style={styles.topBar}><NavigationBackButton accessibilityLabel="발견 화면으로 돌아가기" fallbackHref="/(tabs)/discover" /><Text style={styles.topTitle}>패턴 상세</Text><View style={styles.spacer} /></View><ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 36 }]} showsVerticalScrollIndicator={false}>
    <Text style={styles.badge}>가장 뚜렷한 연결</Text><Text style={styles.title}>{data.title}</Text><Text style={styles.summary}>{data.summary} 최근 기록을 함께 비교해 본 결과예요.</Text><Text style={styles.disclaimer}>같은 날 함께 기록됐다는 뜻이에요. 원인을 확정하거나 진단하는 정보가 아니에요.</Text>
    <View style={styles.usedSection}><Text style={styles.usedHeading}>사용한 데이터</Text><View style={styles.dataCard}><DataRow label="기간" value="2026.07.15 – 08.13"/><DataRow label="기록한 날" value="30일 중 27일"/><DataRow label="사용한 항목" value="수면 시간 · 불편 강도"/><DataRow label="해당 / 예외" value="6일 / 3일"/></View></View>
    <View style={styles.matchSection}><View style={styles.matchHead}><Text style={styles.usedHeading}>해당한 날 · 6일</Text><Text style={styles.matchHint}>날짜를 누르면 기록으로 이동</Text></View>{['8월 10일   수면 5시간 40분 → 어깨 2단계','8월 8일   수면 5시간 10분 → 어깨 2단계','8월 5일   수면 5시간 50분 → 어깨 3단계'].map((item)=><Pressable accessibilityRole="button" key={item} onPress={()=>router.push('/records/2026-08-10')} style={styles.matchRow}><View style={styles.matchDot}/><Text style={styles.matchText}>{item}</Text><Text style={styles.matchArrow}>›</Text></Pressable>)}</View>
    <View style={styles.exceptionSection}><Text style={styles.usedHeading}>예외였던 날 · 3일</Text><Text style={styles.exceptionIntro}>수면이 짧았지만 불편이 낮았던 날도 함께 보여드려요.</Text>{['8월 6일   수면 5시간 55분 → 불편 없음','7월 29일   수면 5시간 45분 → 어깨 1단계'].map((item)=><View key={item} style={styles.exceptionRow}><View style={styles.exceptionDot}/><Text style={styles.exceptionText}>{item}</Text></View>)}</View>
    <View style={styles.actionSection}><Text style={styles.actionHeading}>해볼 수 있는 것</Text><PatternAction icon="play" label="목·어깨 루틴 시작하기" onPress={()=>router.push('/routine')}/><PatternAction icon="message" label="웰니스 챗에서 더 묻기" onPress={()=>router.push('/assistant')}/><PatternAction icon="document" label="요약 카드 만들기" onPress={()=>router.push('/reports/setup')}/></View>
  </ScrollView></SafeAreaView>;
}
function DataRow({ label, value }: { label: string; value: string }) { return <View style={styles.dataRow}><Text style={styles.dataLabel}>{label}</Text><Text style={styles.dataValue}>{value}</Text></View>; }
function PatternAction({ icon, label, onPress }: { icon: AppIconName; label: string; onPress: () => void }) { return <Pressable accessibilityRole="button" onPress={onPress} style={({pressed})=>[styles.actionRow,pressed&&styles.pressed]}><View style={styles.actionIcon}><AppIcon color={colors.primaryPressed} name={icon} size={19}/></View><Text style={styles.actionLabel}>{label}</Text><AppIcon color={colors.textMuted} name="chevron-right" size={18}/></Pressable>; }
