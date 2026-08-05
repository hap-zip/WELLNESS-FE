import { useCallback, useState } from 'react';
import { useFocusEffect, useRouter } from 'expo-router';
import { Modal, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import type { BodyMapPart, HomeSummary } from '@/domain/wellness';
import { useAsyncData } from '@/hooks/use-async-data';
import { wellnessApi } from '@/services/wellness-api';

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
};

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [detailPart, setDetailPart] = useState<BodyMapPart | null>(null);
  const { data: home, isLoading, reload } = useAsyncData(wellnessApi.getHomeSummary, EMPTY_HOME);

  useFocusEffect(useCallback(() => {
    void reload().catch(() => undefined);
  }, [reload]));

  const sheet = home.bodyDetails[detailPart ?? 'neck'];

  return (
    <SafeAreaView edges={['top']} style={styles.screen}>
      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 108 }]}
        showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View>
            <Text style={styles.brand}>몸기록</Text>
            <Text style={styles.date}>{isLoading ? '불러오는 중…' : home.dateLabel}</Text>
          </View>
          <View style={styles.headerActions}>
            <Pressable accessibilityLabel="알림" style={styles.headerIcon}>
              <Text style={styles.bell}>♧</Text>
              <View style={styles.notificationDot} />
            </Pressable>
            <Pressable accessibilityLabel="프로필" style={styles.headerIcon}>
              <View style={styles.profileIcon} />
            </Pressable>
          </View>
        </View>

        <View style={styles.statusSection}>
          <Text style={styles.statusQuestion}>오늘 몸은 어떤가요?</Text>
          <Text style={styles.statusValue}>{home.conditionLabel}</Text>
          <Text style={styles.statusEvidence}>{home.evidence}</Text>
          <View style={styles.tagRow}>
            {home.tags.map((tag) => <Text key={tag.id} style={[styles.tag, tag.tone === 'primary' ? styles.blueTag : tag.tone === 'danger' ? styles.redTag : styles.grayTag]}>{tag.label}</Text>)}
          </View>
        </View>

        <View style={styles.avatarCard}>
          <HomeAvatar highlights={home.bodyHighlights} onMarkerPress={setDetailPart} />
          <Text style={styles.avatarCaption}>몸의 부위를 눌러 그날의 기록을 확인할 수 있어요</Text>
        </View>

        <View style={styles.insightSection}>
          <Text style={styles.insightText}>{home.insight.text}</Text>
          <View style={styles.tagRow}>
            {home.insight.tags.map((tag) => <Text key={tag.id} style={[styles.tag, tag.tone === 'primary' ? styles.blueTag : tag.tone === 'danger' ? styles.redTag : styles.grayTag]}>{tag.label}</Text>)}
          </View>
        </View>

        <Pressable accessibilityRole="button" onPress={() => router.push('/check/auto')} style={({ pressed }) => [styles.recordCard, pressed && styles.pressed]}>
          <Text style={styles.cardTitle}>오늘 상태를 아직 기록하지 않았어요</Text>
          <Text style={styles.cardDescription}>10초 체크로 시작해 볼까요?</Text>
          <Text style={styles.cardButton}>기록하기</Text>
        </Pressable>

        <Pressable accessibilityRole="button" style={styles.routineCard}>
          <View style={styles.routineThumb}>
            <Text style={styles.routineFigure}>↗</Text>
          </View>
          <View style={styles.routineCopy}>
            <Text style={styles.cardTitle}>{home.routine.title}</Text>
            <Text style={styles.cardDescription}>{home.routine.description}</Text>
            <View style={styles.metaRow}>
              <Text style={styles.metaTag}>{home.routine.duration}</Text>
              <Text style={styles.metaTag}>{home.routine.intensity}</Text>
            </View>
          </View>
        </Pressable>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>오늘 함께 해보면 좋아요</Text>
          {home.tips.map((tip) => <Text key={tip} style={styles.tip}>· {tip}</Text>)}
        </View>

        <View style={styles.chartCard}>
          <Text style={styles.chartLabel}>Charts</Text>
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
            <Text style={styles.viewAll}>전체보기</Text>
          </View>
          {home.recentRecords.map((record) => (
            <View key={record.id} style={styles.recentRow}>
              <Text style={styles.recentDate}>{record.date}</Text>
              <Text style={styles.recentValue}>{record.value}</Text>
              <Text style={styles.chevron}>›</Text>
            </View>
          ))}
        </View>
      </ScrollView>

      <Pressable accessibilityRole="button" style={styles.helperButton}>
        <Text style={styles.helperIcon}>▱</Text>
        <Text style={styles.helperText}>기록 도우미</Text>
      </Pressable>

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
              <Pressable style={styles.sheetPrimaryButton}>
                <Text style={styles.sheetPrimaryText}>1분 루틴 시작</Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}
