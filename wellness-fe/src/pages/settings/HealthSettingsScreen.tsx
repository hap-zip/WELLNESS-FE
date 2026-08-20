import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'expo-router';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { HkGlyph, RetryGlyph } from '@/components/glyphs';
import { SubScreenHeader } from '@/components/ui/sub-screen-header';
import { text } from '@/theme/typography';
import { usePalette } from '@/theme/use-palette';
import { wellnessApi } from '@/services/wellness-api';
import { healthSyncService } from '@/services/health-sync-service';
import { appleHealthService } from '@/services/apple-health-service';
import { toLocalDateId } from '@/utils/date';
import type { HealthConnectionSettings } from '@/domain/wellness';

/** `Momgirok v8.dc.html` → `isSubHealth` 를 그대로 옮긴 것. */
export default function HealthSettingsScreen() {
  const c = usePalette();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [syncing, setSyncing] = useState(false);
  const [settings, setSettings] = useState<HealthConnectionSettings | null>(null);
  const [syncMessage, setSyncMessage] = useState('');
  const [syncError, setSyncError] = useState('');

  useEffect(() => {
    let active = true;
    void wellnessApi.getHealthConnection().then((value) => { if (active) setSettings(value); });
    return () => { active = false; };
  }, []);

  const permissionRows = useMemo(() => settings ? [
    { key: 'sleep', icon: 'sleep' as const, label: '수면', enabled: settings.permissions.sleep },
    { key: 'steps', icon: 'steps' as const, label: '걸음 수', enabled: settings.permissions.steps },
    { key: 'energy', icon: 'flame' as const, label: '활동 에너지', enabled: settings.permissions.activityEnergy },
  ] : [], [settings]);

  const resync = async () => {
    if (!settings?.connected || syncing) return;
    setSyncing(true);
    setSyncMessage('');
    setSyncError('');
    try {
      const syncedDays = await healthSyncService.syncAll(settings);
      const record = await healthSyncService.getDailyRecord(toLocalDateId(), settings);
      const syncedAt = new Date();
      const lastSyncedLabel = formatSyncTime(syncedAt);
      const next = { ...settings, lastSyncedLabel };
      await wellnessApi.saveHealthConnection(next);
      setSettings(next);
      const fields = [record.sleepDuration !== '기록 없음' ? '수면' : null, record.steps !== '기록 없음' ? '걸음' : null, record.activityEnergy !== '기록 없음' ? '활동 에너지' : null].filter(Boolean);
      setSyncMessage(syncedDays > 0 ? `Apple 건강의 과거 기록 ${syncedDays}일을 동기화했어요.${fields.length ? ` 오늘: ${fields.join(' · ')}` : ''}` : '접근 가능한 과거 건강 기록이 없어요. 건강 앱의 데이터와 허용 범위를 확인해 주세요.');
    } catch (error) {
      setSyncError(error instanceof Error ? error.message : '건강 데이터를 동기화하지 못했어요.');
    } finally {
      setSyncing(false);
    }
  };
  const connect = async () => {
    if (!settings || syncing) return;
    setSyncing(true);
    setSyncMessage('');
    setSyncError('');
    try {
      if (settings.provider !== 'apple-health') throw new Error('현재 빌드에서는 Apple 건강 연결만 지원해요.');
      await appleHealthService.requestReadAuthorization(settings.permissions);
      await appleHealthService.configureBackgroundSync(settings.permissions);
      const connected = { ...settings, connected: true, lastSyncedLabel: null };
      await wellnessApi.saveHealthConnection(connected);
      setSettings(connected);
      try {
        await healthSyncService.syncAll(connected);
        const record = await healthSyncService.getDailyRecord(toLocalDateId(), connected);
        const lastSyncedLabel = formatSyncTime(new Date());
        const synced = { ...connected, lastSyncedLabel };
        await wellnessApi.saveHealthConnection(synced);
        setSettings(synced);
        const fields = presentHealthFields(record);
        setSyncMessage(`Apple 건강에 연결하고 ${fields.join(' · ')} 데이터를 확인했어요.`);
      } catch (error) {
        setSyncMessage('Apple 건강 연결을 완료했어요.');
        setSyncError(error instanceof Error ? error.message : '오늘 저장된 건강 데이터는 확인하지 못했어요.');
      }
    } catch (error) {
      setSyncError(error instanceof Error ? error.message : 'Apple 건강 연결을 완료하지 못했어요.');
    } finally {
      setSyncing(false);
    }
  };
  const disconnect = () => {
    Alert.alert('연결 해제', 'Apple 건강 연결을 해제할까요? 이후 자동 수집 대신 직접 입력이 필요해요.', [
      { text: '취소', style: 'cancel' },
      { text: '연결 해제', style: 'destructive', onPress: () => { void (async () => { if (settings) await wellnessApi.saveHealthConnection({ ...settings, connected: false, lastSyncedLabel: null }); await healthSyncService.stop(); router.dismissTo('/(tabs)/me'); })(); } },
    ]);
  };

  return (
    <SafeAreaView edges={['top']} style={[s.screen, { backgroundColor: c.bg }]}>
      <SubScreenHeader backLabel="마이 화면으로 돌아가기" fallback={() => router.replace('/(tabs)/me')} title="건강 데이터 연결" />
      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 20 }} showsVerticalScrollIndicator={false}>
        <View style={[s.section, { backgroundColor: c.card }]}>
          <View style={[s.heroCard, { backgroundColor: c.priLightest }]}>
            <View style={s.heroHead}>
              <View style={[s.heroIconWrap, { backgroundColor: c.card }]}>
                <HkGlyph color={c.priDk} id="health" size={19} />
              </View>
              <View style={s.flex1}>
                <Text style={[text({ size: 15, weight: 700, tracking: -0.03 }), { color: c.g900 }]}>{settings?.connected ? 'Apple 건강 연결됨' : 'Apple 건강 연결 안 됨'}</Text>
                <Text style={[text({ size: 12 }), s.syncText, { color: c.priDk }]}>최근 동기화 {settings?.lastSyncedLabel ?? '기록 없음'}</Text>
              </View>
            </View>
            <Pressable accessibilityRole="button" accessibilityState={{ busy: syncing, disabled: !settings }} disabled={syncing || !settings} onPress={() => void (settings?.connected ? resync() : connect())} style={[s.resyncBtn, { backgroundColor: c.card, opacity: syncing || !settings ? 0.6 : 1 }]}>
              {settings?.connected ? <RetryGlyph color={c.g800} size={15} /> : <HkGlyph color={c.g800} id="health" size={16} />}
              <Text style={[text({ size: 13, weight: 700 }), { color: c.g800 }]}>{syncing ? (settings?.connected ? '동기화하는 중…' : '연결하는 중…') : (settings?.connected ? '다시 동기화' : 'Apple 건강 연결')}</Text>
            </Pressable>
            {syncMessage ? <Text accessibilityLiveRegion="polite" style={[s.syncResult, { color: c.priDk }]}>{syncMessage}</Text> : null}
            {syncError ? <Text accessibilityLiveRegion="polite" style={[s.syncResult, { color: c.dangerDk }]}>{syncError}</Text> : null}
          </View>
        </View>

        <View style={[s.section, s.permSection, { backgroundColor: c.card }]}>
          <Text style={[text({ size: 12.5, weight: 700 }), { color: c.g500 }]}>수집 항목별 권한</Text>
          {permissionRows.map((row, i) => {
            const warn = !row.enabled;
            const tagBg = row.enabled ? c.priLightest : '#FFF6E5';
            const tagColor = row.enabled ? c.priDk : '#A2761E';
            return (
              <View key={row.key} style={[s.permRow, i < permissionRows.length - 1 && { borderBottomWidth: 1, borderBottomColor: c.g200 }]}>
                <View style={s.permLeft}>
                  <View style={[s.permIconWrap, { backgroundColor: c.g100 }]}>
                    <HkGlyph color={warn ? '#A2761E' : c.g600} id={row.icon} size={18} />
                  </View>
                  <View style={s.flex1}>
                    <Text style={[text({ size: 14.5, weight: 600, tracking: -0.025 }), { color: c.g900 }]}>{row.label}</Text>
                    <Text style={[text({ size: 11.5 }), s.permSub, { color: warn ? '#A2761E' : c.g500 }]}>{row.enabled ? '앱에서 실제 조회하도록 설정됨' : '앱의 수집 설정에서 꺼짐'}</Text>
                  </View>
                </View>
                <View style={[s.permTag, { backgroundColor: tagBg }]}>
                  <Text style={[text({ size: 11.5, weight: 700 }), { color: tagColor }]}>{row.enabled ? '조회 설정' : '꺼짐'}</Text>
                </View>
              </View>
            );
          })}
        </View>

        <View style={[s.section, s.footerSection, { backgroundColor: c.card }]}>
          <View style={[s.noteBox, { backgroundColor: c.g100 }]}>
            <Text style={[text({ size: 12, leading: 1.7 }), { color: c.g600 }]}>권한이 꺼진 항목은 기록 단계에서 직접 입력할 수 있어요. 데이터가 아예 없는 것과 권한이 없는 것은 따로 표시해요.</Text>
          </View>
          {settings?.connected ? <Pressable accessibilityRole="button" onPress={disconnect} style={[s.disconnectBtn, { borderColor: '#E8C4C4' }]}>
            <Text style={[text({ size: 13.5, weight: 700 }), { color: c.dangerDk }]}>연결 해제</Text>
          </Pressable> : null}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1 },
  flex1: { flex: 1, minWidth: 0 },
  section: { padding: 20 },
  heroCard: { padding: 18, borderRadius: 20 },
  heroHead: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  heroIconWrap: { width: 34, height: 34, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  syncText: { marginTop: 3 },
  syncResult: { marginTop: 10, fontSize: 11.5, lineHeight: 17, fontWeight: '600' },
  resyncBtn: { marginTop: 14, minHeight: 44, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, borderRadius: 23 },

  permSection: { marginTop: 10, paddingTop: 16, paddingBottom: 8 },
  permRow: { minHeight: 64, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  permLeft: { flex: 1, minWidth: 0, flexDirection: 'row', alignItems: 'center', gap: 10 },
  permIconWrap: { width: 36, height: 36, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  permSub: { marginTop: 3 },
  permTag: { height: 26, paddingHorizontal: 10, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },

  footerSection: { marginTop: 10, paddingTop: 16, paddingBottom: 22 },
  noteBox: { padding: 14, paddingHorizontal: 16, borderRadius: 16 },
  disconnectBtn: { marginTop: 14, minHeight: 48, borderWidth: 1, borderRadius: 25, alignItems: 'center', justifyContent: 'center' },
});

function formatSyncTime(date: Date) {
  const day = new Intl.DateTimeFormat('ko-KR', { month: 'long', day: 'numeric' }).format(date);
  const time = new Intl.DateTimeFormat('ko-KR', { hour: 'numeric', minute: '2-digit', second: '2-digit' }).format(date);
  return `${day} ${time}`;
}

function presentHealthFields(record: { sleepDuration: string; steps: string; activityEnergy: string }) {
  return [
    record.sleepDuration !== '기록 없음' ? '수면' : null,
    record.steps !== '기록 없음' ? '걸음' : null,
    record.activityEnergy !== '기록 없음' ? '활동 에너지' : null,
  ].filter((field): field is string => field !== null);
}
