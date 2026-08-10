import DateTimePicker from '@react-native-community/datetimepicker';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, AppState, Linking, Platform, Pressable, ScrollView, Switch, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import StateNotice from '@/components/state-notice';
import { PageHeader } from '@/components/ui/page-header';
import type { NotificationSettings } from '@/domain/wellness';
import { useAsyncData } from '@/hooks/use-async-data';
import { notificationService } from '@/services/notification-service';
import { colors } from '@/theme/tokens';
import { styles } from './settings.styles';

export default function NotificationSettingsScreen() {
  const insets = useSafeAreaInsets();
  const { data, error, isLoading, reload } = useAsyncData<NotificationSettings | null>(notificationService.getSettings, null);
  const [form, setForm] = useState<NotificationSettings | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testStatus, setTestStatus] = useState('');

  useEffect(() => { if (data) setForm(data); }, [data]);
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') void reload().catch(() => undefined);
    });
    return () => subscription.remove();
  }, [reload]);

  const timeValue = useMemo(() => {
    const date = new Date();
    const [hour, minute] = (form?.reminderTime ?? '21:30').split(':').map(Number);
    date.setHours(hour, minute, 0, 0);
    return date;
  }, [form?.reminderTime]);
  const set = <K extends keyof NotificationSettings>(key: K, value: NotificationSettings[K]) => setForm((current) => current ? { ...current, [key]: value } : current);
  const dirty = Boolean(data && form && JSON.stringify(data) !== JSON.stringify(form));

  const requestPermission = async () => {
    if (!form) return;
    if (form.osPermission === 'denied') {
      Alert.alert('기기 설정에서 알림을 허용해 주세요', '알림 권한이 차단되어 앱에서 다시 요청할 수 없어요.', [
        { text: '취소', style: 'cancel' },
        { text: '설정 열기', onPress: () => void Linking.openSettings() },
      ]);
      return;
    }
    const permission = await notificationService.requestPermission();
    set('osPermission', permission);
    if (permission === 'denied') setSaveError('기기에서 알림이 허용되지 않았어요. 설정에서 변경할 수 있어요.');
  };

  const save = async () => {
    if (!form) return;
    setSaving(true);
    setSaved(false);
    setSaveError('');
    try {
      let permission = form.osPermission;
      if (form.enabled && permission !== 'granted') permission = await notificationService.requestPermission();
      const next = { ...form, osPermission: permission };
      setForm(next);
      if (next.enabled && permission !== 'granted') {
        setSaveError('알림을 사용하려면 기기 알림 권한을 허용해 주세요.');
        return;
      }
      await notificationService.saveSettings(next);
      await reload();
      setSaved(true);
    } catch {
      setSaveError('알림을 예약하지 못했어요. 잠시 후 다시 시도해 주세요.');
    } finally {
      setSaving(false);
    }
  };

  const testNotification = async () => {
    setTesting(true);
    setTestStatus('');
    setSaveError('');
    try {
      await notificationService.scheduleTestNotification();
      set('osPermission', 'granted');
      setTestStatus('3초 후 테스트 알림이 도착해요. 앱을 닫거나 다른 화면으로 이동해 보세요.');
    } catch {
      setSaveError('테스트 알림을 예약하지 못했어요. 기기 알림 권한을 확인해 주세요.');
    } finally {
      setTesting(false);
    }
  };

  return <SafeAreaView edges={['top']} style={styles.screen}>
    <PageHeader backLabel="마이 화면으로 돌아가기" fallbackHref="/(tabs)/me" title="알림 설정" />
    <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 120 }]}>
      {isLoading ? <Center /> : error || !form ? <StateNotice actionLabel="다시 시도" description="알림 설정을 불러오지 못했어요." icon="!" onAction={() => void reload().catch(() => undefined)} title="불러오기 실패" tone="error" /> : <>
        <View style={styles.master}>
          <View style={styles.rowCopy}><Text style={styles.masterTitle}>기기 알림 권한</Text><Text style={styles.masterDescription}>{permissionLabel(form.osPermission)}</Text></View>
          <Pressable accessibilityRole="button" onPress={() => void requestPermission()} style={({ pressed }) => [styles.permissionButton, pressed && styles.pressed]}><Text style={styles.permissionButtonText}>{form.osPermission === 'denied' ? '설정 열기' : form.osPermission === 'granted' ? '허용됨' : '권한 허용'}</Text></Pressable>
        </View>
        <View style={styles.master}>
          <View style={styles.rowCopy}><Text style={styles.masterTitle}>알림 사용</Text><Text style={styles.masterDescription}>필요한 웰니스 알림만 선택해서 받아요</Text></View>
          <Switch accessibilityLabel="앱 알림 사용" onValueChange={(value) => set('enabled', value)} trackColor={{ false: colors.border, true: colors.primaryBorder }} thumbColor={form.enabled ? colors.primary : colors.white} value={form.enabled} />
        </View>
        <View style={!form.enabled && styles.dim}>
          <Text style={styles.sectionTitle}>알림 종류</Text>
          <View style={styles.group}>
            <Toggle disabled={!form.enabled} label="오늘 상태 기록" description="매일 설정한 시간에 기기에서 알림" value={form.dailyCheck} onChange={(value) => set('dailyCheck', value)} />
            <Toggle disabled={!form.enabled} label="추천 루틴" description="오늘의 루틴이 준비되면 알림" value={form.routine} onChange={(value) => set('routine', value)} />
            <Toggle disabled={!form.enabled} label="주간 기록 요약" description="매주 일요일에 변화 요약" value={form.weeklyReport} onChange={(value) => set('weeklyReport', value)} />
            <Toggle disabled={!form.enabled} label="다음 날 효과 확인" description="완료한 루틴의 변화를 확인" value={form.nextDayEffect} onChange={(value) => set('nextDayEffect', value)} />
            <Toggle disabled={!form.enabled} label="증상 지속 확인" description="같은 불편이 반복되면 확인" value={form.persistentSignal} onChange={(value) => set('persistentSignal', value)} />
          </View>
          <Text style={styles.sectionTitle}>기록 알림 시간</Text>
          <Pressable accessibilityLabel={`기록 알림 시간 ${form.reminderTime}`} accessibilityRole="button" disabled={!form.enabled || !form.dailyCheck} onPress={() => setShowTimePicker(true)} style={({ pressed }) => [styles.timePickerButton, pressed && styles.pressed]}>
            <View><Text style={styles.timePickerValue}>{form.reminderTime}</Text><Text style={styles.timePickerHint}>눌러서 시간을 선택하세요</Text></View><Text style={styles.timePickerAction}>변경</Text>
          </Pressable>
          {showTimePicker ? <View style={styles.timePickerPanel}><DateTimePicker display={Platform.OS === 'ios' ? 'spinner' : 'default'} locale="ko-KR" mode="time" onChange={(_, value) => {
            if (value) set('reminderTime', `${String(value.getHours()).padStart(2, '0')}:${String(value.getMinutes()).padStart(2, '0')}`);
            if (Platform.OS !== 'ios') setShowTimePicker(false);
          }} value={timeValue} />{Platform.OS === 'ios' ? <Pressable accessibilityRole="button" onPress={() => setShowTimePicker(false)} style={styles.pickerDone}><Text style={styles.pickerDoneText}>시간 선택 완료</Text></Pressable> : null}</View> : null}
        </View>
        {saved ? <Text accessibilityLiveRegion="polite" style={styles.saved}>알림 설정과 예약을 저장했어요.</Text> : null}
        {saveError ? <Text accessibilityLiveRegion="polite" style={styles.inlineError}>{saveError}</Text> : null}
        <View style={styles.testSection}><View style={styles.testCopy}><Text style={styles.testTitle}>알림 수신 확인</Text><Text style={styles.testDescription}>권한과 기기 표시 설정이 정상인지 바로 확인해 보세요.</Text></View><Pressable accessibilityRole="button" accessibilityState={{ busy: testing, disabled: testing }} disabled={testing} onPress={() => void testNotification()} style={({ pressed }) => [styles.testButton, testing && styles.disabledPrimary, pressed && styles.pressed]}>{testing ? <ActivityIndicator color={colors.primary} /> : <Text style={styles.testButtonText}>테스트 알림 보내기</Text>}</Pressable></View>
        {testStatus ? <Text accessibilityLiveRegion="polite" style={styles.testStatus}>{testStatus}</Text> : null}
        <View style={styles.info}><Text style={styles.infoText}>오늘 상태 기록은 이 기기에 직접 예약돼요. 추천 루틴과 지속 신호 등 기록 결과에 따라 달라지는 알림은 서버 연결 후 발송됩니다.</Text></View>
      </>}
    </ScrollView>
    {form ? <View style={[styles.action, { paddingBottom: Math.max(insets.bottom, 12) }]}><Pressable accessibilityRole="button" accessibilityState={{ busy: saving, disabled: saving || !dirty }} disabled={saving || !dirty} onPress={() => void save()} style={({ pressed }) => [styles.primary, (saving || !dirty) && styles.disabledPrimary, pressed && styles.pressed]}>{saving ? <ActivityIndicator color={colors.white} /> : <Text style={styles.primaryText}>{dirty ? '설정 저장하기' : '저장됨'}</Text>}</Pressable></View> : null}
  </SafeAreaView>;
}

function permissionLabel(permission: NotificationSettings['osPermission']) {
  if (permission === 'granted') return '기기에서 허용됨';
  if (permission === 'denied') return '기기 설정에서 차단됨';
  return '아직 요청하지 않음';
}

function Toggle({ description, disabled, label, onChange, value }: { description: string; disabled: boolean; label: string; onChange: (value: boolean) => void; value: boolean }) {
  return <View style={styles.row}><View style={styles.rowCopy}><Text style={styles.rowLabel}>{label}</Text><Text style={styles.rowDescription}>{description}</Text></View><Switch accessibilityLabel={label} disabled={disabled} onValueChange={onChange} trackColor={{ false: colors.border, true: colors.primaryBorder }} thumbColor={value ? colors.primary : colors.white} value={value} /></View>;
}

function Center() { return <View style={styles.center}><ActivityIndicator color={colors.primary} /></View>; }
