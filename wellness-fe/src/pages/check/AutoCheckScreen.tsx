import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Platform, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppIcon, type AppIconName } from '@/components/app-icon';
import NavigationBackButton from '@/components/navigation-back-button';
import { CheckScreenHeader } from '@/components/ui/check-screen-header';
import { useAuth } from '@/context/auth-context';
import { useDailyCheck } from '@/context/daily-check-context';
import { healthSyncService } from '@/services/health-sync-service';
import { wellnessApi } from '@/services/wellness-api';
import { colors } from '@/theme/tokens';
import { toLocalDateId } from '@/utils/date';

import { styles } from './auto-check.styles';

const RECORDS = [
  { icon: 'moon', key: 'sleepDuration', label: '수면 시간' },
  { icon: 'steps', key: 'steps', label: '걸음 수' },
  { icon: 'flame', key: 'activityEnergy', label: '활동 에너지' },
] as const;

export default function AutoCheckScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ date?: string; mode?: string }>();
  const { session } = useAuth();
  const { completeStep, draft, startDraft, updateDraft } = useDailyCheck();
  const todayId = toLocalDateId();
  const requestedDate = typeof params.date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(params.date) ? params.date : todayId;
  const requestedMode = params.mode === 'edit' ? 'edit' as const : 'create' as const;
  const initialized = draft.targetDate === requestedDate && draft.mode === requestedMode;
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    if (initialized) return;
    let mounted = true;
    setIsLoading(true);
    setLoadError('');
    const prepare = requestedMode === 'edit' ? wellnessApi.getDailyCheck(requestedDate) : Promise.resolve(null);
    void prepare.then((submission) => {
      if (!mounted) return;
      if (requestedMode === 'edit' && !submission) {
        setLoadError('수정할 기록을 찾지 못했어요.');
        setIsLoading(false);
        return;
      }
      startDraft(requestedDate, requestedMode, submission);
    }).catch(() => {
      if (mounted) setLoadError('수정할 기록을 불러오지 못했어요.');
    });
    return () => { mounted = false; };
  }, [initialized, requestedDate, requestedMode, startDraft]);

  const loadAutoRecord = () => {
    if (!initialized) return () => undefined;
    if (draft.autoConfirmed) { setIsLoading(false); return () => undefined; }
    let mounted = true;
    setIsLoading(true);
    setLoadError('');
    const request = session?.mode === 'demo' || (__DEV__ && Platform.OS === 'web')
      ? wellnessApi.getAutoHealthRecord(requestedDate)
      : wellnessApi.getHealthConnection().then((settings) => {
        if (!settings.connected || settings.provider !== 'apple-health') throw new Error('먼저 건강 데이터 설정에서 Apple 건강을 연결해 주세요.');
        return healthSyncService.getDailyRecord(requestedDate, settings);
      });
    void request.then((record) => {
      if (mounted) {
        updateDraft({ autoRecords: { sleepDuration: record.sleepDuration, bedtime: record.bedtime, steps: record.steps, activityEnergy: record.activityEnergy }, autoSource: record.source });
        setIsLoading(false);
      }
    }).catch((reason: unknown) => {
      if (mounted) {
        setLoadError(reason instanceof Error ? reason.message : '건강 데이터를 불러오지 못했어요.');
        setIsLoading(false);
      }
    });
    return () => { mounted = false; };
  };

  useEffect(() => {
    const cleanup = loadAutoRecord();
    return cleanup;
    // 첫 진입 시에만 자동 데이터를 요청한다.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draft.autoConfirmed, initialized, requestedDate, updateDraft]);

  const closeCheck = () => Alert.alert('기록 작성을 닫을까요?', '작성 중인 내용은 앱을 사용하는 동안 임시로 남아 있어요.', [
    { text: '계속 기록', style: 'cancel' },
    { text: '닫기', onPress: () => router.dismissTo(requestedDate === todayId ? '/(tabs)/home' : '/(tabs)/records') },
  ]);
  const [, month, day] = requestedDate.split('-').map(Number);

  return <SafeAreaView edges={['top', 'bottom']} style={styles.screen}>
    <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      <CheckScreenHeader
        description="Apple 건강에서 가져온 값이에요. 확인만 해주세요."
        leading={<NavigationBackButton accessibilityLabel="오늘 화면으로 돌아가기" fallbackHref="/(tabs)/home" />}
        onClose={closeCheck}
        step={1}
        title={requestedMode === 'edit' ? `${month}월 ${day}일 기록을 수정해요` : '어젯밤 데이터를 가져왔어요'}
      />
      {isLoading ? <View accessibilityLabel="건강 데이터를 불러오는 중" accessibilityRole="progressbar" style={styles.loadingState}><ActivityIndicator color={colors.primary}/><Text style={styles.loadingText}>건강 데이터를 불러오는 중</Text></View> : loadError ? <View accessibilityLiveRegion="polite" style={styles.errorState}><AppIcon color={colors.danger} name="alert" size={24}/><Text style={styles.errorTitle}>{loadError}</Text><Text style={styles.errorDescription}>수면 시간은 직접 입력하지 않아요. 건강 데이터 연결을 확인한 뒤 다시 불러와 주세요.</Text><View style={styles.errorActions}><Pressable accessibilityRole="button" onPress={() => router.push('/settings/health')} style={({ pressed }) => [styles.errorPrimary, pressed && styles.pressed]}><Text style={styles.errorPrimaryText}>건강 데이터 연결</Text></Pressable><Pressable accessibilityRole="button" onPress={loadAutoRecord} style={({ pressed }) => [styles.errorSecondary, pressed && styles.pressed]}><Text style={styles.errorSecondaryText}>다시 불러오기</Text></Pressable></View></View> : <>
        <View accessibilityLabel="자동 수집 상태 정상" style={styles.statusRow}><View style={[styles.statusChip, styles.statusChipActive]}><Text style={[styles.statusText, styles.statusTextActive]}>정상</Text></View>{['동기화 중', '권한 부족', '데이터 없음', '오류'].map((label) => <View key={label} style={styles.statusChip}><Text style={styles.statusText}>{label}</Text></View>)}</View>
        <View style={styles.recordList}>{RECORDS.map((record) => <View accessibilityLabel={`${record.label} ${draft.autoRecords[record.key] || '기록 없음'}`} key={record.label} style={styles.recordRow}><View style={styles.recordIcon}><AppIcon color={colors.textSecondary} name={record.icon as AppIconName} size={19}/></View><View style={styles.recordCopy}><Text style={styles.recordLabel}>{record.label}</Text><Text style={styles.recordSource}>{draft.autoSource === 'manual' ? '이전 기록' : `${draft.autoSource === 'apple-health' ? 'Apple 건강' : 'Health Connect'} · 오전 7:02 동기화`}</Text></View><Text style={styles.recordValue}>{draft.autoRecords[record.key] || '기록 없음'}</Text></View>)}</View>
        <Text style={styles.guide}>수면·걸음·활동 에너지는 연결된 건강 데이터에서 자동으로 가져와요.</Text>
      </>}
    </ScrollView>
    {!isLoading && !loadError ? <View style={styles.footer}><Pressable accessibilityRole="button" onPress={() => { updateDraft({ autoConfirmed: true }); completeStep('auto'); router.push('/check/discomfort'); }} style={({ pressed }) => [styles.confirmButton, pressed && styles.pressed]}><Text style={styles.confirmText}>다음</Text></Pressable></View> : null}
  </SafeAreaView>;
}
