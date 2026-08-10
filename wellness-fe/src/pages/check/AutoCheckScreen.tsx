import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useDailyCheck } from '@/context/daily-check-context';
import { useAuth } from '@/context/auth-context';
import { AppIcon } from '@/components/app-icon';
import { healthSyncService } from '@/services/health-sync-service';
import { wellnessApi } from '@/services/wellness-api';
import { colors } from '@/theme/tokens';
import { CheckScreenHeader } from '@/components/ui/check-screen-header';
import { toLocalDateId } from '@/utils/date';

import { styles } from './auto-check.styles';

const RECORDS = [
  { key: 'sleepDuration', label: '수면 시간' },
  { key: 'bedtime', label: '취침 시간' },
  { key: 'steps', label: '걸음 수' },
] as const;

export default function AutoCheckScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ date?: string; mode?: string }>();
  const { session } = useAuth();
  const { completeStep, draft, resetDraft, skipStep, startDraft, updateDraft } = useDailyCheck();
  const todayId = toLocalDateId();
  const requestedDate = typeof params.date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(params.date) ? params.date : todayId;
  const requestedMode = params.mode === 'edit' ? 'edit' as const : 'create' as const;
  const initialized = draft.targetDate === requestedDate && draft.mode === requestedMode;
  const [isEditing, setIsEditing] = useState(false);
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
      setIsEditing(Boolean(submission));
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
    const request = session?.mode === 'demo'
      ? wellnessApi.getAutoHealthRecord(requestedDate)
      : wellnessApi.getHealthConnection().then((settings) => {
        if (!settings.connected || settings.provider !== 'apple-health') throw new Error('먼저 건강 데이터 설정에서 Apple 건강을 연결해 주세요.');
        return healthSyncService.getDailyRecord(requestedDate, settings);
      });
    void request.then((record) => {
      if (mounted) { updateDraft({ autoRecords: { sleepDuration: record.sleepDuration, bedtime: record.bedtime, steps: record.steps }, autoSource: record.source }); setIsLoading(false); }
    }).catch((reason: unknown) => { if (mounted) { setLoadError(reason instanceof Error ? reason.message : '건강 데이터를 불러오지 못했어요.'); setIsLoading(false); } });
    return () => { mounted = false; };
  };
  useEffect(() => {
    const cleanup = loadAutoRecord();
    return cleanup;
    // 첫 진입 시에만 자동 데이터를 요청한다.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draft.autoConfirmed, initialized, requestedDate, updateDraft]);

  const useManualInput = () => { updateDraft({ autoRecords: { sleepDuration: '', bedtime: '', steps: '' }, autoSource: 'manual' }); setLoadError(''); setIsEditing(true); };

  const moveToCondition = () => router.push('/check/condition');
  const closeCheck = () => Alert.alert('기록 작성을 그만할까요?', '저장하지 않은 변경 내용은 사라져요.', [
    { text: '계속 기록', style: 'cancel' },
    { text: '나가기', style: 'destructive', onPress: () => { resetDraft(); router.dismissTo(requestedDate === todayId ? '/(tabs)/home' : '/(tabs)/records'); } },
  ]);
  const [, month, day] = requestedDate.split('-').map(Number);

  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.screen}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <CheckScreenHeader
          description="값이 다르면 바로 수정할 수 있어요."
          leading={<Pressable accessibilityLabel="데일리 체크 닫기" accessibilityRole="button" hitSlop={8} onPress={closeCheck} style={({ pressed }) => [styles.closeButton, pressed && styles.pressed]}>
            <AppIcon color={colors.text} name="close" size={23}/>
          </Pressable>}
          onSkip={() => { skipStep('auto'); moveToCondition(); }}
          step={1}
          title={requestedMode === 'edit' ? `${month}월 ${day}일 기록을\n수정해요` : `${month}월 ${day}일 기록을\n시작해요`}
        />
        {isLoading ? <View accessibilityLabel="건강 데이터를 불러오는 중" accessibilityRole="progressbar" style={styles.loadingState}><ActivityIndicator color={colors.primary}/><Text style={styles.loadingText}>건강 데이터를 불러오는 중</Text></View> : loadError ? <View accessibilityLiveRegion="polite" style={styles.errorState}><AppIcon color={colors.danger} name="alert" size={24}/><Text style={styles.errorTitle}>{loadError}</Text><Text style={styles.errorDescription}>직접 입력해 계속하거나 건강 데이터 연결 상태를 확인할 수 있어요.</Text><View style={styles.errorActions}><Pressable accessibilityRole="button" onPress={useManualInput} style={({pressed})=>[styles.errorPrimary,pressed&&styles.pressed]}><Text style={styles.errorPrimaryText}>직접 입력하기</Text></Pressable><Pressable accessibilityRole="button" onPress={()=>router.push('/settings/health')} style={({pressed})=>[styles.errorSecondary,pressed&&styles.pressed]}><Text style={styles.errorSecondaryText}>연결 설정</Text></Pressable></View><Pressable accessibilityRole="button" onPress={loadAutoRecord} style={({pressed})=>[styles.retryLink,pressed&&styles.pressed]}><Text style={styles.retryText}>다시 불러오기</Text></Pressable></View> : <>
        <View style={styles.recordCard}>
          {RECORDS.map((record, index) => (
            <View key={record.label} style={[styles.recordRow, index === RECORDS.length - 1 && styles.lastRecordRow]}>
              <Text style={styles.recordLabel}>{record.label}</Text>
              {isEditing ? (
                <TextInput
                  accessibilityLabel={`${record.label} 수정`}
                  onChangeText={(value) => updateDraft({ autoRecords: { ...draft.autoRecords, [record.key]: value } })}
                  selectTextOnFocus
                  style={styles.recordInput}
                  value={draft.autoRecords[record.key]}
                />
              ) : <Text style={styles.recordValue}>{draft.autoRecords[record.key]}</Text>}
            </View>
          ))}
        </View>
        <View style={styles.sourceRow}>
          <AppIcon color={colors.primary} name="heart" size={18}/>
          <Text style={styles.sourceText}>{draft.autoSource === 'apple-health' ? 'Apple 건강' : draft.autoSource === 'health-connect' ? 'Health Connect' : '직접 입력'}에서 가져왔어요</Text>
        </View>
        </>}
      </ScrollView>
      {!isLoading && !loadError ? <View style={styles.footer}>
        <Pressable accessibilityRole="button" onPress={() => setIsEditing((current) => !current)} style={({ pressed }) => [styles.editButton, pressed && styles.pressed]}>
          <Text style={styles.editText}>{isEditing ? '수정 완료' : '수정하기'}</Text>
        </Pressable>
        <Pressable accessibilityRole="button" onPress={() => { updateDraft({ autoConfirmed: true }); completeStep('auto'); moveToCondition(); }} style={({ pressed }) => [styles.confirmButton, pressed && styles.pressed]}>
          <Text style={styles.confirmText}>맞아요</Text>
        </Pressable>
      </View> : null}
    </SafeAreaView>
  );
}
