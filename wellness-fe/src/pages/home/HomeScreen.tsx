import { useCallback, useMemo, useState } from 'react';
import { useFocusEffect, useRouter } from 'expo-router';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppIcon } from '@/components/app-icon';
import StateNotice from '@/components/state-notice';
import { useDailyCheck } from '@/context/daily-check-context';
import type { BodyMapPart, HomeSummary, RoutineEffect } from '@/domain/wellness';
import { useAsyncData } from '@/hooks/use-async-data';
import { wellnessApi } from '@/services/wellness-api';
import { colors } from '@/theme/tokens';
import { toLocalDateId } from '@/utils/date';

import HomeAvatar from './HomeAvatar';
import { styles } from './home.styles';

const EMPTY_HOME: HomeSummary = {
  dateLabel: '', conditionLabel: '', evidence: '', tags: [], recentRecords: [], tips: [],
  insight: { text: '', tags: [] }, routine: { title: '', description: '', duration: '', intensity: '' },
  sleepTrend: { values: [], averageLabel: '', periodLabel: '' }, bodyHighlights: [],
  bodyDetails: { neck:{title:'',lines:[]},shoulder:{title:'',lines:[]},chest:{title:'',lines:[]},upperArm:{title:'',lines:[]},forearm:{title:'',lines:[]},abdomen:{title:'',lines:[]},hip:{title:'',lines:[]},thigh:{title:'',lines:[]},knee:{title:'',lines:[]},calf:{title:'',lines:[]} },
  streakDays: 0, checkState: 'not-started',
};

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { updateDraft } = useDailyCheck();
  const [detailPart, setDetailPart] = useState<BodyMapPart | null>(null);
  const [feedbackSaving, setFeedbackSaving] = useState(false);
  const [feedbackSaved, setFeedbackSaved] = useState(false);
  const { data: response, error, isLoading, reload } = useAsyncData(wellnessApi.getHomeSummary, EMPTY_HOME);
  const home = useMemo(() => normalizeHome(response), [response]);
  const todayLabel = useMemo(() => formatToday(new Date()), []);
  const hasTodayRecord = home.checkState === 'completed';
  const sheet = detailPart ? home.bodyDetails[detailPart] : null;

  useFocusEffect(useCallback(() => { void reload().catch(() => undefined); }, [reload]));

  const submitFeedback = async (effect: RoutineEffect) => {
    if (!home.pendingFeedback || feedbackSaving) return;
    setFeedbackSaving(true);
    try {
      const levels: Record<RoutineEffect, number> = { better: 2, same: 3, worse: 5, unknown: 3 };
      await wellnessApi.saveRoutineFeedback({ routineId: home.pendingFeedback.routineId, effect, discomfortLevel: levels[effect], memo: '' });
      setFeedbackSaved(true);
      await reload();
    } finally { setFeedbackSaving(false); }
  };

  const startCheckForPart = () => {
    if (!detailPart) return;
    const targets: Record<BodyMapPart, { id: string; view: 'front' | 'back' }> = {
      neck:{id:'back-neck',view:'back'},shoulder:{id:'front-shoulder-left',view:'front'},chest:{id:'front-chest',view:'front'},upperArm:{id:'front-arm-left',view:'front'},forearm:{id:'front-arm-left',view:'front'},abdomen:{id:'front-abdomen',view:'front'},hip:{id:'back-lower',view:'back'},thigh:{id:'front-leg-left',view:'front'},knee:{id:'front-leg-left',view:'front'},calf:{id:'back-leg-left',view:'back'},
    };
    const target = targets[detailPart];
    updateDraft({ bodyParts: [target.id], bodyAreaIntensities: {}, intensity: null, bodyView: target.view });
    setDetailPart(null);
    router.push('/check/discomfort');
  };

  if (isLoading) return <HomeLoading />;
  if (error) return <SafeAreaView edges={['top']} style={styles.screen}><View style={styles.errorContent}><StateNotice actionLabel="다시 불러오기" description="작성 중인 기록은 그대로 있어요." icon="!" onAction={() => void reload().catch(() => undefined)} title="홈을 불러오지 못했어요" tone="error" /></View></SafeAreaView>;

  return (
    <SafeAreaView edges={['top']} style={styles.screen}>
      <ScrollView contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 116 }]} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View><Text style={styles.brand}>몸기록</Text><Text style={styles.date}>{todayLabel}</Text></View>
          <Pressable accessibilityLabel="알림 설정 열기" accessibilityRole="button" hitSlop={8} onPress={() => router.push('/settings/notifications')} style={({ pressed }) => [styles.headerIcon, pressed && styles.pressed]}><AppIcon color={colors.text} name="bell" size={22} /></Pressable>
        </View>

        {!hasTodayRecord ? (
          <>
            <View style={styles.entryScene}>
              <View style={styles.entryCopy}><View style={styles.contextLine} /><Text style={styles.entryTitle}>오늘의 몸을{`\n`}먼저 남겨주세요</Text><Text style={styles.entryDescription}>수면과 컨디션부터 불편한 부위까지, 지금 느끼는 상태를 3분 안에 기록해요.</Text></View>
              <View pointerEvents="none" style={styles.entryBody}><HomeAvatar highlights={[]} onMarkerPress={() => undefined} /></View>
            </View>
            <Pressable accessibilityHint="오늘의 몸 상태 기록을 시작합니다" accessibilityRole="button" onPress={() => router.push('/check/auto')} style={({ pressed }) => [styles.recordAction, pressed && styles.recordActionPressed]}><View><Text style={styles.recordActionTitle}>오늘 기록 시작</Text><Text style={styles.recordActionMeta}>{home.streakDays > 0 ? `완료하면 ${home.streakDays + 1}일 연속 기록` : '수면 · 컨디션 · 불편 · 활동'}</Text></View><AppIcon color={colors.white} name="arrow-up-right" size={23} /></Pressable>
            <RecentRecords records={home.recentRecords} onOpenAll={() => router.push('/(tabs)/records')} />
          </>
        ) : (
          <>
            <View style={styles.statusScene}>
              <View style={styles.statusTop}><Text style={styles.statusLabel}>오늘 기록 완료</Text><Pressable accessibilityRole="button" onPress={() => router.push({ pathname: '/check/auto', params: { date: toLocalDateId(), mode: 'edit' } })} style={({ pressed }) => [styles.editButton, pressed && styles.pressed]}><Text style={styles.editButtonText}>수정</Text></Pressable></View>
              <Text style={styles.statusTitle}>{home.conditionLabel || '오늘 상태를 기록했어요'}</Text>
              {home.evidence ? <Text style={styles.statusEvidence}>{home.evidence}</Text> : null}
              <Text style={styles.streak}>{home.streakDays > 0 ? `${home.streakDays}일째 이어서 기록 중` : '첫 기록을 남겼어요'}</Text>
            </View>

            <View style={styles.bodyLedger}>
              <View style={styles.sectionHead}><View><Text style={styles.sectionTitle}>몸에 남긴 표시</Text><Text style={styles.sectionDescription}>색이 있는 부위를 눌러 기록을 확인하세요.</Text></View><Text style={styles.sectionCount}>{home.bodyHighlights.length}</Text></View>
              {home.bodyHighlights.length > 0 ? <HomeAvatar highlights={home.bodyHighlights} onMarkerPress={setDetailPart} /> : <View style={styles.noBodyRecord}><Text style={styles.noBodyTitle}>불편 부위를 기록하지 않았어요</Text><Pressable accessibilityRole="button" onPress={() => router.push('/check/discomfort')} style={({ pressed }) => [styles.inlineAction, pressed && styles.pressed]}><Text style={styles.inlineActionText}>부위 추가</Text><AppIcon color={colors.body} name="arrow-up-right" size={17} /></Pressable></View>}
            </View>

            <View style={styles.nextSection}><Text style={styles.sectionTitle}>이어서 할 일</Text>
              {home.routine.title ? <ActionIndex color={colors.recovery} description={[home.routine.duration, home.routine.intensity].filter(Boolean).join(' · ')} onPress={() => router.push('/routine')} title={home.routine.title} /> : null}
              {home.insight.text ? <ActionIndex color={colors.data} description={home.insight.text} onPress={() => router.push('/(tabs)/discover')} title="최근 기록의 연결 보기" /> : null}
            </View>

            {home.pendingFeedback ? <View style={styles.feedbackLedger}><Text style={styles.feedbackTitle}>{home.pendingFeedback.question}</Text><View style={styles.feedbackOptions}><FeedbackOption disabled={feedbackSaving} label="나아졌어요" onPress={() => void submitFeedback('better')} /><FeedbackOption disabled={feedbackSaving} label="비슷해요" onPress={() => void submitFeedback('same')} /><FeedbackOption disabled={feedbackSaving} label="더 불편해요" onPress={() => void submitFeedback('worse')} /></View></View> : feedbackSaved ? <Text accessibilityLiveRegion="polite" style={styles.savedFeedback}>다음 루틴 추천에 반영했어요.</Text> : null}

            <RecentRecords records={home.recentRecords} onOpenAll={() => router.push('/(tabs)/records')} />
          </>
        )}
      </ScrollView>

      <Modal animationType="slide" onRequestClose={() => setDetailPart(null)} transparent visible={detailPart !== null}>
        <View style={styles.sheetOverlay}><Pressable accessibilityLabel="부위 상세 닫기" accessibilityRole="button" onPress={() => setDetailPart(null)} style={StyleSheet.absoluteFill} /><View accessibilityViewIsModal style={[styles.bottomSheet, { paddingBottom: Math.max(insets.bottom, 24) }]}><View style={styles.grabber} /><Text style={styles.sheetTitle}>{sheet?.title || '부위 기록'}</Text>{sheet?.lines.map((line) => <View key={line.label} style={styles.sheetRow}><Text style={styles.sheetLabel}>{line.label}</Text><Text style={styles.sheetValue}>{line.value}</Text></View>)}<View style={styles.sheetActions}><Pressable accessibilityRole="button" onPress={() => { setDetailPart(null); router.push('/(tabs)/records'); }} style={({ pressed }) => [styles.sheetSecondaryButton, pressed && styles.pressed]}><Text style={styles.sheetSecondaryText}>관련 기록</Text></Pressable><Pressable accessibilityRole="button" onPress={startCheckForPart} style={({ pressed }) => [styles.sheetPrimaryButton, pressed && styles.pressed]}><Text style={styles.sheetPrimaryText}>이 부위 수정</Text></Pressable></View></View></View>
      </Modal>
    </SafeAreaView>
  );
}

function ActionIndex({ color, description, onPress, title }: { color: string; description: string; onPress: () => void; title: string }) { return <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => [styles.actionIndex, pressed && styles.pressed]}><View style={[styles.actionIcon, { backgroundColor: `${color}16` }]}><AppIcon color={color} name="arrow-up-right" size={18} /></View><View style={styles.actionCopy}><Text style={styles.actionTitle}>{title}</Text><Text numberOfLines={2} style={styles.actionDescription}>{description}</Text></View><AppIcon color={colors.textMuted} name="chevron-right" size={18} /></Pressable>; }
function RecentRecords({ onOpenAll, records }: { onOpenAll: () => void; records: HomeSummary['recentRecords'] }) { if (!records.length) return null; return <View style={styles.recentSection}><View style={styles.sectionHead}><Text style={styles.sectionTitle}>최근 기록</Text><Pressable accessibilityRole="button" onPress={onOpenAll} style={({ pressed }) => pressed && styles.pressed}><Text style={styles.viewAll}>전체 보기</Text></Pressable></View><View style={styles.recentIndex}>{records.slice(0,3).map((record)=><View key={record.id} style={styles.recentRow}><View style={styles.recentDot}/><Text style={styles.recentDate}>{record.date}</Text><Text numberOfLines={1} style={styles.recentValue}>{record.value}</Text></View>)}</View></View>; }
function FeedbackOption({ disabled, label, onPress }: { disabled: boolean; label: string; onPress: () => void }) { return <Pressable accessibilityRole="button" disabled={disabled} onPress={onPress} style={({ pressed }) => [styles.feedbackOption, (pressed || disabled) && styles.pressed]}><Text style={styles.feedbackOptionText}>{label}</Text></Pressable>; }
function HomeLoading() { return <SafeAreaView edges={['top']} style={styles.screen}><View accessibilityLabel="홈을 불러오는 중" accessibilityRole="progressbar" style={styles.loadingContent}><View style={styles.loadingHeader} /><View style={styles.loadingTitle} /><View style={styles.loadingBody} /><View style={styles.loadingCard} /></View></SafeAreaView>; }
function formatToday(date: Date) { return new Intl.DateTimeFormat('ko-KR',{month:'long',day:'numeric',weekday:'long'}).format(date); }
function normalizeHome(value?: Partial<HomeSummary>|null):HomeSummary { return {...EMPTY_HOME,...value,tags:value?.tags??[],recentRecords:value?.recentRecords??[],tips:value?.tips??[],insight:{...EMPTY_HOME.insight,...value?.insight,tags:value?.insight?.tags??[]},routine:{...EMPTY_HOME.routine,...value?.routine},sleepTrend:{...EMPTY_HOME.sleepTrend,...value?.sleepTrend,values:value?.sleepTrend?.values??[]},bodyHighlights:value?.bodyHighlights??[],bodyDetails:{...EMPTY_HOME.bodyDetails,...value?.bodyDetails}}; }
