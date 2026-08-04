import { useState } from 'react';
import { Modal, Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import HomeAvatar from './HomeAvatar';
import HomeSleepChart from './HomeSleepChart';
import { styles } from './home.styles';

type AvatarPart = 'neck' | 'shoulder';

const RECENT_RECORDS = [
  { date: '8월 10일', value: '수면 5시간 42분 · 목 4단계' },
  { date: '8월 9일', value: '수면 5시간 12분 · 목 4단계' },
  { date: '8월 8일', value: '수면 7시간 36분 · 불편 없음' },
] as const;

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const [avatarPart, setAvatarPart] = useState<AvatarPart | null>(null);

  const sheetTitle = avatarPart === 'shoulder' ? '어깨가 평소보다 올라가 있어요' : '목이 평소보다 불편해 보여요';
  const sheetLines =
    avatarPart === 'shoulder'
      ? [
          ['자세', '어깨 올라감 2단계'],
          ['활동', '4,230보'],
          ['루틴', '실행하지 않음'],
        ]
      : [
          ['수면 자세', '엎드려 자기'],
          ['수면 시간', '5시간 12분'],
          ['목 불편', '4단계'],
        ];

  return (
    <View style={styles.screen}>
      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 108 }]}
        showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View>
            <Text style={styles.brand}>몸기록</Text>
            <Text style={styles.date}>2025년 8월 10일</Text>
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
          <Text style={styles.statusValue}>꽤 불편해요</Text>
          <Text style={styles.statusEvidence}>목이 4단계로 기록됐어요</Text>
          <View style={styles.tagRow}>
            <Text style={[styles.tag, styles.blueTag]}>수면 부족</Text>
            <Text style={[styles.tag, styles.redTag]}>활동 적음</Text>
            <Text style={[styles.tag, styles.grayTag]}>목 4단계</Text>
          </View>
        </View>

        <View style={styles.avatarCard}>
          <HomeAvatar onMarkerPress={setAvatarPart} />
          <Text style={styles.avatarCaption}>몸의 부위를 눌러 그날의 기록을 확인할 수 있어요</Text>
        </View>

        <View style={styles.insightSection}>
          <Text style={styles.insightText}>최근보다 잠을 12분 덜 잤고, 목 불편이 2일 연속 기록됐어요</Text>
          <View style={styles.tagRow}>
            <Text style={[styles.tag, styles.blueTag]}>수면 -3%</Text>
            <Text style={[styles.tag, styles.redTag]}>목 불편 2일째</Text>
            <Text style={[styles.tag, styles.grayTag]}>걸음 수 3,400보</Text>
          </View>
        </View>

        <Pressable accessibilityRole="button" style={styles.recordCard}>
          <Text style={styles.cardTitle}>오늘 상태를 아직 기록하지 않았어요</Text>
          <Text style={styles.cardDescription}>10초 체크로 시작해 볼까요?</Text>
          <Text style={styles.cardButton}>기록하기</Text>
        </Pressable>

        <Pressable accessibilityRole="button" style={styles.routineCard}>
          <View style={styles.routineThumb}>
            <Text style={styles.routineFigure}>↗</Text>
          </View>
          <View style={styles.routineCopy}>
            <Text style={styles.cardTitle}>목 주변 가볍게 이완하기</Text>
            <Text style={styles.cardDescription}>오늘의 상태를 바탕으로 추천해요</Text>
            <View style={styles.metaRow}>
              <Text style={styles.metaTag}>예상 2분</Text>
              <Text style={styles.metaTag}>강도 가볍게</Text>
            </View>
          </View>
        </Pressable>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>오늘 함께 해보면 좋아요</Text>
          <Text style={styles.tip}>· 1시간마다 자리에서 일어나기</Text>
          <Text style={styles.tip}>· 목표 취침 시간 11:30</Text>
        </View>

        <View style={styles.chartCard}>
          <Text style={styles.chartLabel}>Charts</Text>
          <Text style={styles.chartTitle}>최근 7일 수면 흐름</Text>
          <HomeSleepChart />
          <View style={styles.chartFooter}>
            <Text style={styles.chartValue}>평균 6시간 22분</Text>
            <Text style={styles.chartPeriod}>최근 7일</Text>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>최근 기록</Text>
            <Text style={styles.viewAll}>전체보기</Text>
          </View>
          {RECENT_RECORDS.map((record) => (
            <View key={record.date} style={styles.recentRow}>
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

      <View style={[styles.tabBar, { paddingBottom: Math.max(insets.bottom, 12) }]}>
        <Text style={[styles.tabItem, styles.activeTab]}>⌂{`\n`}오늘</Text>
        <Text style={styles.tabItem}>▤{`\n`}기록</Text>
        <Text style={styles.tabItem}>⌁{`\n`}발견</Text>
        <Text style={styles.tabItem}>♙{`\n`}나</Text>
      </View>

      <Modal animationType="slide" transparent visible={avatarPart !== null} onRequestClose={() => setAvatarPart(null)}>
        <Pressable style={styles.sheetOverlay} onPress={() => setAvatarPart(null)}>
          <Pressable style={styles.bottomSheet} onPress={(event) => event.stopPropagation()}>
            <View style={styles.grabber} />
            <Text style={styles.sheetTitle}>{sheetTitle}</Text>
            <Text style={styles.sheetSubtitle}>어제 기록</Text>
            {sheetLines.map(([label, value]) => (
              <View key={label} style={styles.sheetRow}>
                <Text style={styles.sheetLabel}>{label}</Text>
                <Text style={styles.sheetValue}>{value}</Text>
              </View>
            ))}
            <View style={styles.sheetActions}>
              <Pressable style={styles.sheetSecondaryButton}>
                <Text style={styles.sheetSecondaryText}>관련 기록 보기</Text>
              </Pressable>
              <Pressable style={styles.sheetPrimaryButton}>
                <Text style={styles.sheetPrimaryText}>1분 루틴 시작</Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}
