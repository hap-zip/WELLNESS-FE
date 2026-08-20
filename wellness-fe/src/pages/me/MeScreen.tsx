import { useCallback, useState } from 'react';
import { useFocusEffect, useRouter, type Href } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { MonthNextGlyph } from '@/components/glyphs';
import { useAuth } from '@/context/auth-context';
import { useThemePreference } from '@/context/theme-context';
import { text } from '@/theme/typography';
import { usePalette } from '@/theme/use-palette';
import type { Palette } from '@/theme/palette';
import { wellnessApi } from '@/services/wellness-api';
import { notificationService } from '@/services/notification-service';
import { EMPTY_ME_STATS, loadMeStats, ME_CARE, ME_MENU, type MeStats } from './me.data';

/**
 * `Momgirok v8.dc.html` → `<sc-if value="{{ isMe }}">` 를 그대로 옮긴 것.
 * "화면 모드"(라이트/다크)는 프로토타입에 없는 항목이다 — 이 세션에서 실제
 * 시스템 설정과 분리해 추가한 기능이라 "건강 관리" 섹션 끝에 얹었다.
 */

export default function MeScreen() {
  const c = usePalette();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { scheme } = useThemePreference();
  const { session } = useAuth();
  const [healthConnected, setHealthConnected] = useState<boolean | null>(null);
  const [notificationLabel, setNotificationLabel] = useState('확인 중');
  const [stats, setStats] = useState<MeStats>(EMPTY_ME_STATS);

  useFocusEffect(useCallback(() => {
    let active = true;
    void Promise.all([wellnessApi.getHealthConnection(), notificationService.getSettings(), loadMeStats()]).then(([health, notifications, meStats]) => {
      if (!active) return;
      setHealthConnected(health.connected);
      setNotificationLabel(notifications.enabled && notifications.osPermission === 'granted' ? formatReminderTime(notifications.reminderTime) : '꺼짐');
      setStats(meStats);
    });
    return () => { active = false; };
  }, []));

  const displayName = session?.name?.trim() || session?.email || '사용자';
  const avatarInitial = displayName.charAt(0);
  const meStatEntries = [
    { key: 'streak', n: `${stats.streakDays}일`, l: '연속 기록' },
    { key: 'recorded', n: `${stats.recordedDays}일`, l: '기록한 날' },
    { key: 'routine', n: `${stats.completedRoutines}회`, l: '완료 루틴' },
  ];

  return (
    <ScrollView style={[s.screen, { backgroundColor: c.bg }]} contentContainerStyle={{ paddingTop: insets.top }} showsVerticalScrollIndicator={false}>
      <View style={[s.header, { backgroundColor: c.card, borderBottomColor: c.g200 }]}>
        <Text style={[text({ size: 20, weight: 700, tracking: -0.035 }), { color: c.g900 }]}>마이</Text>
      </View>

      {/* 프로필 + 통계 — padding:6px 20px 20px */}
      <View style={[s.profileSection, { backgroundColor: c.card }]}>
        <Pressable accessibilityRole="button" onPress={() => router.push('/settings/account')} style={s.profileRow}>
          <View style={[s.avatar, { backgroundColor: c.priLightest }]}>
            <Text style={[text({ size: 19, weight: 700, tracking: -0.02 }), { color: c.priDk }]}>{avatarInitial}</Text>
          </View>
          <View style={s.flex1}>
            <Text style={[text({ size: 17, weight: 700, tracking: -0.035 }), { color: c.g900 }]}>{displayName}</Text>
            {session?.email ? <Text style={[text({ size: 12.5 }), s.profileEmail, { color: c.g500 }]}>{session.email}</Text> : null}
          </View>
          <MonthNextGlyph color={c.g400} size={18} />
        </Pressable>

        <View style={[s.statsRow, { backgroundColor: c.g100 }]}>
          {meStatEntries.map((stat, i) => (
            <View key={stat.key} style={[s.statCell, i < 2 && { borderRightWidth: 1, borderRightColor: c.g200 }]}>
              <Text style={[text({ size: 20, weight: 700, tracking: -0.04, tabular: true }), { color: c.g900 }]}>{stat.n}</Text>
              <Text style={[text({ size: 11.5 }), s.statLabel, { color: c.g500 }]}>{stat.l}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* 건강 관리 — padding:16px 20px 8px */}
      <MenuSection c={c} title="건강 관리">
        {ME_CARE.map((item, i) => (
          <MenuRow border={i < ME_CARE.length - 1} c={c} key={item.key} label={item.label} onPress={() => router.push(item.to as Href)} value={item.key === 'health' ? healthConnected === null ? '확인 중' : healthConnected ? '연결됨' : '연결 안 됨' : notificationLabel} />
        ))}
        <MenuRow c={c} label="화면 모드" onPress={() => router.push('/settings/appearance')} value={scheme === 'dark' ? '다크' : '라이트'} />
      </MenuSection>

      {/* 기록과 정보 — padding:16px 20px 8px */}
      <MenuSection c={c} title="기록과 정보">
        {ME_MENU.map((item) => (
          <MenuRow border c={c} key={item.key} label={item.label} onPress={() => router.push(item.to as Href)} />
        ))}
        <MenuRow c={c} label="핵심 기능 다시 보기" onPress={() => router.push('/(onboarding)/intro?preview=1')} />
        <Text style={[text({ size: 11.5 }), s.version, { color: c.g400 }]}>하음 1.0.0</Text>
      </MenuSection>

      <View style={{ height: 112 }} />
    </ScrollView>
  );
}

function MenuSection({ c, title, children }: { c: Palette; title: string; children: React.ReactNode }) {
  return (
    <View style={[s.menuSection, { backgroundColor: c.card }]}>
      <Text style={[text({ size: 12.5, weight: 700 }), { color: c.g500 }]}>{title}</Text>
      {children}
    </View>
  );
}

function MenuRow({ c, label, value, onPress, border }: { c: Palette; label: string; value?: string; onPress: () => void; border?: boolean }) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={[s.menuRow, border && { borderBottomWidth: 1, borderBottomColor: c.g200 }]}>
      <Text style={[text({ size: 15, weight: 600, tracking: -0.025 }), { color: c.g900 }]}>{label}</Text>
      <View style={s.menuRowRight}>
        {value ? <Text style={[text({ size: 13, weight: 600 }), { color: c.g500 }]}>{value}</Text> : null}
        <MonthNextGlyph color={c.g400} size={17} />
      </View>
    </Pressable>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1 },
  flex1: { flex: 1, minWidth: 0 },

  header: { height: 52, justifyContent: 'center', paddingHorizontal: 20, borderBottomWidth: StyleSheet.hairlineWidth },

  profileSection: { paddingTop: 6, paddingHorizontal: 20, paddingBottom: 20 },
  profileRow: { minHeight: 64, flexDirection: 'row', alignItems: 'center', gap: 13 },
  avatar: { width: 52, height: 52, borderRadius: 27, alignItems: 'center', justifyContent: 'center' },
  profileEmail: { marginTop: 3 },
  statsRow: { marginTop: 16, paddingVertical: 16, paddingHorizontal: 4, borderRadius: 16, flexDirection: 'row' },
  statCell: { flex: 1, alignItems: 'center' },
  statLabel: { marginTop: 4 },

  menuSection: { marginTop: 10, paddingTop: 16, paddingHorizontal: 20, paddingBottom: 8 },
  menuRow: { minHeight: 56, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  menuRowRight: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  version: { paddingVertical: 10, paddingTop: 16 },
});

function formatReminderTime(value: string) {
  const [hour, minute] = value.split(':').map(Number);
  const date = new Date();
  date.setHours(hour || 0, minute || 0, 0, 0);
  return new Intl.DateTimeFormat('ko-KR', { hour: 'numeric', minute: '2-digit' }).format(date);
}
