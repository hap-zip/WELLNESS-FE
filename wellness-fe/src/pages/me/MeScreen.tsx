import { useCallback } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppIcon } from '@/components/app-icon';
import { Momi } from '@/components/momi';
import StateNotice from '@/components/state-notice';
import type { UserProfileSummary } from '@/domain/wellness';
import { useAsyncData } from '@/hooks/use-async-data';
import { wellnessApi } from '@/services/wellness-api';
import { colors } from '@/theme/tokens';
import { styles } from './me.styles';

export default function MeScreen() {
  const router = useRouter(); const insets = useSafeAreaInsets(); const { data, error, isLoading, reload } = useAsyncData<UserProfileSummary | null>(wellnessApi.getUserProfile, null);
  useFocusEffect(useCallback(() => { void reload().catch(() => undefined); }, [reload]));
  return <SafeAreaView edges={['top']} style={styles.screen}><ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 108 }]} showsVerticalScrollIndicator={false}>
    <View style={styles.header}><Text accessibilityRole="header" style={styles.headerTitle}>마이</Text></View>
    {isLoading ? <View style={styles.center}><ActivityIndicator color={colors.primary} /></View> : error || !data ? <StateNotice actionLabel="다시 시도" description="네트워크 상태를 확인해 주세요." icon="!" onAction={() => void reload().catch(() => undefined)} title="프로필을 불러오지 못했어요" tone="error" /> : <>
      <Pressable accessibilityRole="button" onPress={() => router.push('/settings/account')} style={({ pressed }) => [styles.identity, pressed && styles.pressed]}><View style={styles.avatar}><Momi mood="happy" size={36} /></View><View style={styles.identityCopy}><Text style={styles.name}>{data.name}</Text><Text style={styles.email}>{data.email}</Text></View><AppIcon color={colors.textMuted} name="chevron-right" size={20} /></Pressable>
      <View style={styles.stats}><Stat label="연속 기록" value={`${data.recordDays}일`} /><Stat label="기록한 날" value={`${data.recordDays}일`} /><Stat label="완료 루틴" value={`${data.routineCount}회`} /></View>
      <MenuSection title="건강 관리"><Menu icon="heart" label="건강 데이터 연결" description="연결 상태와 항목별 권한을 확인해요" value={data.healthConnected ? '연결됨' : '연결하기'} onPress={() => router.push('/settings/health')} /><Menu icon="bell" label="알림 설정" description="오늘 기록과 루틴 알림 시간을 정해요" value={data.notificationEnabled ? '사용 중' : '꺼짐'} onPress={() => router.push('/settings/notifications')} /></MenuSection>
      <MenuSection title="기록과 정보"><Menu icon="document" label="기록 요약 만들기" description="선택한 기간을 한 장의 요약으로 정리해요" onPress={() => router.push('/reports/setup')} /><Menu icon="check" label="동의·데이터 관리" description="동의 내역과 저장된 데이터를 관리해요" onPress={() => router.push('/settings/data')} /><Menu icon="lock" label="계정 관리" description="비밀번호와 로그인 상태를 관리해요" onPress={() => router.push('/settings/account')} /></MenuSection>
      <MenuSection title="도움말"><Menu icon="info" label="서비스 정보·문의" description="버전, 약관, 문의 채널" onPress={() => router.push('/settings/info')} /></MenuSection><Text style={styles.version}>MOMGIROK · VERSION 1.0.0</Text>
    </>}
  </ScrollView></SafeAreaView>;
}
function Stat({ label, value }: { label: string; value: string }) { return <View style={styles.stat}><Text style={styles.statValue}>{value}</Text><Text style={styles.statLabel}>{label}</Text></View>; }
function MenuSection({ children, title }: { children: React.ReactNode; title: string }) { return <View style={styles.section}><Text style={styles.sectionTitle}>{title}</Text><View style={styles.menuGroup}>{children}</View></View>; }
function Menu({ description, icon, label, onPress, value }: { description: string; icon: React.ComponentProps<typeof AppIcon>['name']; label: string; onPress: () => void; value?: string }) { return <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => [styles.menu, pressed && styles.pressed]}><View style={styles.menuIndex}><AppIcon color={colors.primaryText} name={icon} size={18} /></View><View style={styles.menuCopy}><View style={styles.menuTitleRow}><Text style={styles.menuLabel}>{label}</Text>{value ? <Text style={styles.menuValue}>{value}</Text> : null}</View><Text style={styles.menuDescription}>{description}</Text></View><AppIcon color={colors.textMuted} name="chevron-right" size={17} /></Pressable>; }
