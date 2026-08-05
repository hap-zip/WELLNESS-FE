import { useCallback, useState } from 'react';
import { useFocusEffect, useRouter } from 'expo-router';
import { Modal, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import type { BodyMapPart, HomeSummary, RoutineEffect } from '@/domain/wellness';
import { ChatbotIcon } from '@/components/chatbot-icon';
import { AppIcon } from '@/components/app-icon';
import StateNotice from '@/components/state-notice';
import { useAsyncData } from '@/hooks/use-async-data';
import { wellnessApi } from '@/services/wellness-api';
import { colors } from '@/theme/tokens';

import HomeAvatar from './HomeAvatar';
import HomeSleepChart from './HomeSleepChart';
import { styles } from './home.styles';

const EMPTY_HOME: HomeSummary = {
  dateLabel: '', conditionLabel: '', evidence: '', tags: [], recentRecords: [], tips: [],
  insight: { text: '', tags: [] }, routine: { title: '', description: '', duration: '', intensity: '' },
  sleepTrend: { values: [], averageLabel: '', periodLabel: '' },
  bodyHighlights: [],
  bodyDetails: {
    neck: { title: '', lines: [] }, shoulder: { title: '', lines: [] }, chest: { title: '', lines: [] },
    upperArm: { title: '', lines: [] }, forearm: { title: '', lines: [] }, abdomen: { title: '', lines: [] },
    hip: { title: '', lines: [] }, thigh: { title: '', lines: [] }, knee: { title: '', lines: [] }, calf: { title: '', lines: [] },
  },
  streakDays: 0, checkState: 'not-started',
};

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [detailPart, setDetailPart] = useState<BodyMapPart | null>(null);
  const [feedbackResult, setFeedbackResult] = useState<{ shouldShowSignal: boolean } | null>(null);
  const [feedbackSaving, setFeedbackSaving] = useState(false);
  const { data: home, error, isLoading, reload } = useAsyncData(wellnessApi.getHomeSummary, EMPTY_HOME);

  useFocusEffect(useCallback(() => {
    void reload().catch(() => undefined);
  }, [reload]));

  const sheet = home.bodyDetails[detailPart ?? 'neck'];
  const submitFeedback = async (effect: RoutineEffect) => {
    if (!home.pendingFeedback || feedbackSaving) return;
    setFeedbackSaving(true);
    try {
      const levels: Record<RoutineEffect, number> = { better: 2, same: 3, worse: 5, unknown: 3 };
      const result = await wellnessApi.saveRoutineFeedback({ routineId: home.pendingFeedback.routineId, effect, discomfortLevel: levels[effect], memo: '' });
      setFeedbackResult(result);
      await reload();
    } finally { setFeedbackSaving(false); }
  };

  if (isLoading) {
    return <SafeAreaView edges={['top']} style={styles.screen}><View accessibilityLabel="오늘 상태를 불러오는 중" accessibilityRole="progressbar" style={styles.loadingContent}><View style={styles.loadingHeader}/><View style={styles.loadingTitle}/><View style={styles.loadingBody}/><View style={styles.loadingCard}/><View style={styles.loadingCardSmall}/></View></SafeAreaView>;
  }

  if (error) {
    return <SafeAreaView edges={['top']} style={styles.screen}><View style={styles.errorContent}><StateNotice actionLabel="다시 불러오기" description="작성한 기록은 그대로 있어요. 네트워크 상태를 확인한 뒤 다시 시도해 주세요." icon="!" onAction={()=>void reload().catch(()=>undefined)} title="오늘 상태를 불러오지 못했어요" tone="error"/></View></SafeAreaView>;
  }

  return (
    <SafeAreaView edges={['top']} style={styles.screen}>
      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 108 }]}
        showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View>
            <Text style={styles.brand}>몸기록</Text>
            <Text style={styles.date}>{home.dateLabel}</Text>
          </View>
          <View style={styles.headerActions}>
            <Pressable accessibilityLabel="웰니스 챗 열기" accessibilityRole="button" onPress={()=>router.push('/(tabs)/chat')} style={({pressed})=>[styles.headerIcon,pressed&&styles.pressed]}>
              <ChatbotIcon size={22}/>
            </Pressable>
            <Pressable accessibilityLabel="알림" style={styles.headerIcon}>
              <AppIcon color={colors.text} name="bell" size={22} />
              <View style={styles.notificationDot} />
            </Pressable>
          </View>
        </View>

        <View style={styles.todayPanel}>
        <View style={styles.statusSection}>
          <Text style={styles.statusQuestion}>오늘 몸은 어떤가요?</Text>
          <Text style={styles.statusValue}>{home.conditionLabel}</Text>
          <Text style={styles.statusEvidence}>{home.evidence}</Text>
          <Text style={styles.streak}>연속 {home.streakDays}일 기록 중</Text>
          <View style={styles.tagRow}>
            {home.tags.map((tag) => <Text key={tag.id} style={[styles.tag, tag.tone === 'primary' ? styles.blueTag : tag.tone === 'danger' ? styles.redTag : styles.grayTag]}>{tag.label}</Text>)}
          </View>
        </View>

        <View style={styles.avatarCard}>
          <HomeAvatar highlights={home.bodyHighlights} onMarkerPress={setDetailPart} />
          <Text style={styles.avatarCaption}>몸의 부위를 눌러 그날의 기록을 확인할 수 있어요</Text>
        </View>
        </View>

        <Pressable accessibilityRole="button" onPress={() => router.push('/check/auto')} style={({ pressed }) => [styles.recordCard, pressed && styles.pressed]}>
          <Text style={styles.primaryActionEyebrow}>{home.checkState === 'completed' ? '오늘 기록 완료' : '오늘의 기록'}</Text>
          <Text style={styles.primaryActionTitle}>{home.checkState === 'completed' ? '오늘 기록을 확인하거나 수정하세요' : '지금 상태를 짧게 남겨보세요'}</Text>
          <Text style={styles.primaryActionDescription}>{home.checkState === 'completed' ? '수정한 내용은 오늘의 패턴과 요약에 다시 반영돼요.' : '기록이 쌓일수록 내 평소 상태와 변화를 더 정확히 비교할 수 있어요.'}</Text>
          <Text style={styles.cardButton}>{home.checkState === 'completed' ? '기록 수정' : '기록하기'}</Text>
        </Pressable>

        <Pressable accessibilityRole="button" onPress={() => router.push('/routine')} style={({ pressed }) => [styles.routineCard, pressed && styles.pressed]}>
          <View style={styles.routineThumb}>
            <AppIcon color={colors.text} name="trend-up" size={26} />
          </View>
          <View style={styles.routineCopy}>
            <Text style={styles.cardTitle}>{home.routine.title}</Text>
            <Text style={styles.cardDescription}>{home.routine.description}</Text>
            <View style={styles.metaRow}>
              <Text style={styles.metaTag}>{home.routine.duration}</Text>
              <Text style={styles.metaTag}>{home.routine.intensity}</Text>
            </View>
            {home.routineEffectLabel ? <Text style={styles.routineEffect}>{home.routineEffectLabel}</Text> : null}
          </View>
        </Pressable>

        {home.pendingFeedback ? <View style={styles.feedbackCard}><Text style={styles.feedbackEyebrow}>{home.pendingFeedback.title}</Text><Text style={styles.feedbackQuestion}>{home.pendingFeedback.question}</Text><View style={styles.feedbackOptions}><FeedbackOption disabled={feedbackSaving} label="나아졌어요" onPress={() => void submitFeedback('better')} /><FeedbackOption disabled={feedbackSaving} label="비슷해요" onPress={() => void submitFeedback('same')} /><FeedbackOption disabled={feedbackSaving} label="더 불편해요" onPress={() => void submitFeedback('worse')} tone="danger" /><FeedbackOption disabled={feedbackSaving} label="잘 모르겠어요" onPress={() => void submitFeedback('unknown')} /></View></View> : feedbackResult ? <View style={styles.feedbackDone}><Text style={styles.feedbackDoneTitle}>답변을 기록했어요</Text><Text style={styles.feedbackDoneText}>앞으로 루틴 추천에 반영할게요.</Text>{feedbackResult.shouldShowSignal ? <Pressable accessibilityRole="button" onPress={() => router.push('/safety/signal')} style={styles.signalLink}><Text style={styles.signalLinkText}>지속 신호 확인하기</Text></Pressable> : null}</View> : null}

        <View style={styles.insightSection}>
          <Text style={styles.insightLabel}>최근 기록에서</Text>
          <Text style={styles.insightText}>{home.insight.text}</Text>
          <View style={styles.tagRow}>
            {home.insight.tags.map((tag) => <Text key={tag.id} style={[styles.tag, tag.tone === 'primary' ? styles.blueTag : tag.tone === 'danger' ? styles.redTag : styles.grayTag]}>{tag.label}</Text>)}
          </View>
        </View>

        <Pressable accessibilityRole="button" onPress={() => router.push('/reports/setup')} style={({ pressed }) => [styles.reportEntry, pressed && styles.pressed]}><View><Text style={styles.reportEntryTitle}>상태 요약 만들기</Text><Text style={styles.reportEntryText}>전문가에게 보여줄 기록을 정리해요</Text></View><AppIcon color={colors.primary} name="chevron-right" size={20}/></Pressable>
        {home.recentPattern ? <Pressable accessibilityRole="button" onPress={() => router.push('/(tabs)/discover')} style={({ pressed }) => [styles.patternEntry, pressed && styles.pressed]}><Text style={styles.patternLabel}>최근 발견한 흐름</Text><Text style={styles.patternTitle}>{home.recentPattern.title}</Text><Text style={styles.patternText}>{home.recentPattern.description}</Text></Pressable> : null}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>오늘 함께 해보면 좋아요</Text>
          {home.tips.map((tip) => <Text key={tip} style={styles.tip}>· {tip}</Text>)}
        </View>

        <View style={styles.chartCard}>
          <Text style={styles.chartLabel}>수면 기록</Text>
          <Text style={styles.chartTitle}>최근 7일 수면 흐름</Text>
          <HomeSleepChart values={home.sleepTrend.values} />
          <View style={styles.chartFooter}>
            <Text style={styles.chartValue}>{home.sleepTrend.averageLabel}</Text>
            <Text style={styles.chartPeriod}>{home.sleepTrend.periodLabel}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>최근 기록</Text>
            <Pressable accessibilityRole="button" onPress={()=>router.push('/(tabs)/records')} style={({pressed})=>pressed&&styles.pressed}><Text style={styles.viewAll}>전체보기</Text></Pressable>
          </View>
          {home.recentRecords.map((record) => (
            <Pressable accessibilityRole="button" key={record.id} onPress={()=>router.push({pathname:'/records/[date]',params:{date:record.id}})} style={({pressed})=>[styles.recentRow,pressed&&styles.pressed]}>
              <Text style={styles.recentDate}>{record.date}</Text>
              <Text style={styles.recentValue}>{record.value}</Text>
              <AppIcon color={colors.textMuted} name="chevron-right" size={18}/>
            </Pressable>
          ))}
        </View>
      </ScrollView>

      <Modal animationType="slide" transparent visible={detailPart !== null} onRequestClose={() => setDetailPart(null)}>
        <Pressable style={styles.sheetOverlay} onPress={() => setDetailPart(null)}>
          <Pressable style={styles.bottomSheet} onPress={(event) => event.stopPropagation()}>
            <View style={styles.grabber} />
            <Text style={styles.sheetTitle}>{sheet.title}</Text>
            <Text style={styles.sheetSubtitle}>어제 기록</Text>
            {sheet.lines.map((line) => (
              <View key={line.label} style={styles.sheetRow}>
                <Text style={styles.sheetLabel}>{line.label}</Text>
                <Text style={styles.sheetValue}>{line.value}</Text>
              </View>
            ))}
            <View style={styles.sheetActions}>
              <Pressable onPress={() => setDetailPart(null)} style={({ pressed }) => [styles.sheetSecondaryButton, pressed && styles.pressed]}>
                <Text style={styles.sheetSecondaryText}>관련 기록 보기</Text>
              </Pressable>
              <Pressable onPress={() => { setDetailPart(null); router.push('/routine'); }} style={styles.sheetPrimaryButton}>
                <Text style={styles.sheetPrimaryText}>1분 루틴 시작</Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

function FeedbackOption({ disabled, label, onPress, tone = 'neutral' }: { disabled: boolean; label: string; onPress: () => void; tone?: 'neutral' | 'danger' }) {
  return <Pressable accessibilityRole="button" disabled={disabled} onPress={onPress} style={({ pressed }) => [styles.feedbackOption, tone === 'danger' && styles.feedbackDanger, (pressed || disabled) && styles.pressed]}><Text style={[styles.feedbackOptionText, tone === 'danger' && styles.feedbackDangerText]}>{label}</Text></Pressable>;
}
