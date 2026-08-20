import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { HkGlyph, ShieldCheckGlyph } from '@/components/glyphs';
import { useAuth } from '@/context/auth-context';
import { text } from '@/theme/typography';
import { usePalette } from '@/theme/use-palette';
import { HC_ITEMS } from '@/pages/auth/auth.data';
import { appleHealthService } from '@/services/apple-health-service';
import { healthSyncService } from '@/services/health-sync-service';
import { wellnessApi } from '@/services/wellness-api';
import { toLocalDateId } from '@/utils/date';
import type { HealthConnectionSettings } from '@/domain/wellness';

/**
 * `Momgirok v8.dc.html` → `isHealthConnect` 를 그대로 옮긴 것.
 * 온보딩의 마지막 단계라 여기서 `completeOnboarding` 을 호출해야 다음부터
 * 스플래시가 홈으로 바로 보낸다 — 이전에는 이 호출이 없어 온보딩을 나갔다
 * 들어오면 계속 온보딩으로 되돌아오는 막다른 흐름이었다.
 */
export default function HealthConnectScreen() {
  const c = usePalette();
  const router = useRouter();
  const { completeOnboarding } = useAuth();
  const [settings, setSettings] = useState<HealthConnectionSettings | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { let active = true; void wellnessApi.getHealthConnection().then((value) => { if (active) setSettings(value); }); return () => { active = false; }; }, []);

  const goHome = async () => {
    await completeOnboarding();
    router.dismissAll();
    router.replace('/(tabs)/home');
  };
  const connect = async () => {
    if (!settings || connecting) return;
    setConnecting(true); setError('');
    try {
      if (settings.provider !== 'apple-health') throw new Error('현재 빌드에서는 Apple 건강 연결만 지원해요.');
      await appleHealthService.requestReadAuthorization(settings.permissions);
      await appleHealthService.configureBackgroundSync(settings.permissions);
      const connected = { ...settings, connected: true, lastSyncedLabel: null };
      await wellnessApi.saveHealthConnection(connected);
      try { await healthSyncService.syncAll(connected); await healthSyncService.getDailyRecord(toLocalDateId(), connected); } catch { /* 데이터가 없는 날도 권한 연결 자체는 유효하다. */ }
      await goHome();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Apple 건강 권한을 요청하지 못했어요.');
    } finally { setConnecting(false); }
  };

  return (
    <SafeAreaView edges={['top']} style={[s.screen, { backgroundColor: c.card }]}>
      <ScrollView contentContainerStyle={s.body} showsVerticalScrollIndicator={false}>
        <View style={[s.iconWrap, { backgroundColor: c.priLightest }]}>
          <HkGlyph color={c.priDk} id="health" size={30} />
        </View>
        <Text style={[text({ size: 25, weight: 700, tracking: -0.045, leading: 1.4 }), s.title, { color: c.g900 }]}>Apple 건강과{'\n'}연결할까요?</Text>
        <Text style={[text({ size: 13.5, leading: 1.75 }), s.sub, { color: c.g600 }]}>연결하면 매일 직접 입력할 항목이 줄어들어요. 아래 세 가지만 읽고, 하음이 건강 앱에 값을 쓰지는 않아요.</Text>

        <View style={[s.itemCard, { borderColor: c.g200 }]}>
          {HC_ITEMS.map((item, i) => (
            <View key={item.key} style={[s.itemRow, i < HC_ITEMS.length - 1 && { borderBottomWidth: 1, borderBottomColor: c.g200 }]}>
              <View style={[s.itemIconWrap, { backgroundColor: c.g100 }]}>
                <HkGlyph color={c.g700} id={item.icon} size={18} />
              </View>
              <View style={s.flex1}>
                <Text style={[text({ size: 14.5, weight: 700, tracking: -0.025 }), { color: c.g900 }]}>{item.k}</Text>
                <Text style={[text({ size: 11.5, leading: 1.55 }), s.itemWhy, { color: c.g500 }]}>{item.why}</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={[s.noteBox, { backgroundColor: c.g100 }]}> 
          <ShieldCheckGlyph color={c.g500} size={16} />
          <Text style={[text({ size: 12, leading: 1.7 }), s.flex1, { color: c.g600 }]}>항목별로 따로 허용할 수 있어요. 일부만 허용하면 나머지는 기록 단계에서 직접 입력하면 돼요.</Text>
        </View>
        {error ? <Text accessibilityRole="alert" style={[s.error, { color: c.dangerDk }]}>{error}</Text> : null}
      </ScrollView>

      <View style={s.footer}>
        <Pressable accessibilityRole="button" accessibilityState={{ busy: connecting, disabled: connecting || !settings }} disabled={connecting || !settings} onPress={() => void connect()} style={({ pressed }) => [s.connectBtn, { backgroundColor: c.pri, opacity: connecting || !settings ? 0.6 : 1 }, pressed && s.pressed]}>
          {connecting ? <ActivityIndicator color="#fff"/> : <Text style={[text({ size: 16, weight: 700 }), { color: '#fff' }]}>Apple 건강 권한 요청</Text>}
        </Pressable>
        <Pressable accessibilityRole="button" disabled={connecting} onPress={() => void goHome()} style={s.laterBtn}>
          <Text style={[text({ size: 14, weight: 700 }), { color: c.g600 }]}>나중에 하기</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1 },
  flex1: { flex: 1, minWidth: 0 },
  pressed: { transform: [{ scale: 0.975 }] },

  body: { paddingTop: 36, paddingHorizontal: 20, paddingBottom: 20 },
  iconWrap: { width: 56, height: 56, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
  title: { marginTop: 20 },
  sub: { marginTop: 10 },

  itemCard: { marginTop: 22, paddingHorizontal: 16, borderWidth: 1, borderRadius: 18 },
  itemRow: { minHeight: 66, flexDirection: 'row', alignItems: 'center', gap: 12 },
  itemIconWrap: { width: 36, height: 36, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  itemWhy: { marginTop: 3 },

  noteBox: { marginTop: 16, padding: 14, paddingHorizontal: 16, borderRadius: 16, flexDirection: 'row', gap: 10 },
  error: { marginTop: 14, fontFamily: 'Pretendard-Medium', fontSize: 12.5, lineHeight: 19 },

  footer: { padding: 12, paddingHorizontal: 20, paddingBottom: 26, gap: 9 },
  connectBtn: { height: 54, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
  laterBtn: { height: 50, alignItems: 'center', justifyContent: 'center' },
});
