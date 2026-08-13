import { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Switch, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppIcon } from '@/components/app-icon';
import StateNotice from '@/components/state-notice';
import { PageHeader } from '@/components/ui/page-header';
import { useAuth } from '@/context/auth-context';
import type { HealthConnectionSettings } from '@/domain/wellness';
import { useAsyncData } from '@/hooks/use-async-data';
import { appleHealthService, type AppleHealthDiagnostic } from '@/services/apple-health-service';
import { healthSyncService } from '@/services/health-sync-service';
import { wellnessApi } from '@/services/wellness-api';
import { colors } from '@/theme/tokens';
import { toLocalDateId } from '@/utils/date';

import { styles } from './settings.styles';

export default function HealthSettingsScreen() {
  const insets = useSafeAreaInsets();
  const { session } = useAuth();
  const isDemo = session?.mode === 'demo';
  const { data, error, isLoading, reload } = useAsyncData<HealthConnectionSettings | null>(wellnessApi.getHealthConnection, null);
  const [busy, setBusy] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [diagnostic, setDiagnostic] = useState<AppleHealthDiagnostic | null>(null);
  const [diagnosing, setDiagnosing] = useState(false);

  const update = async (next: HealthConnectionSettings) => {
    if (busy) return;
    setBusy(true);
    setSaveError('');
    try {
      const shouldRequestApplePermission = next.provider === 'apple-health' && next.connected && !data?.connected && !isDemo;
      if (shouldRequestApplePermission) await appleHealthService.requestReadAuthorization(next.permissions);
      let verifiedSettings = next;
      if (!isDemo && next.provider === 'apple-health') {
        if (next.connected) {
          await appleHealthService.configureBackgroundSync(next.permissions);
          const syncedCount = await healthSyncService.syncRecent(next);
          verifiedSettings = { ...next, lastSyncedLabel: syncedCount > 0 ? '방금 동기화' : null };
        }
        else await healthSyncService.stop();
      }
      await wellnessApi.saveHealthConnection(verifiedSettings);
      await reload();
    } catch (reason) {
      setSaveError(reason instanceof Error ? reason.message : '설정을 저장하지 못했어요. 다시 시도해 주세요.');
    } finally {
      setBusy(false);
    }
  };

  const diagnose = async (settings: HealthConnectionSettings) => {
    if (diagnosing) return;
    setDiagnosing(true);
    setSaveError('');
    try {
      setDiagnostic(await appleHealthService.diagnoseDailyRead(toLocalDateId(), settings.permissions));
    } catch (reason) {
      setSaveError(reason instanceof Error ? reason.message : 'Apple 건강 진단을 실행하지 못했어요.');
      setDiagnostic(null);
    } finally {
      setDiagnosing(false);
    }
  };

  return (
    <SafeAreaView edges={['top']} style={styles.screen}>
      <PageHeader backLabel="마이 화면으로 돌아가기" fallbackHref="/(tabs)/me" title="건강 데이터 연결" />
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 36 }]}>
        {isLoading ? <Center /> : error || !data ? (
          <StateNotice
            actionLabel="다시 시도"
            description="연결 상태를 확인하지 못했어요."
            icon="!"
            onAction={() => void reload().catch(() => undefined)}
            title="불러오기 실패"
            tone="error"
          />
        ) : (
          <>
            {isDemo ? <View style={styles.mockNotice}><Text style={styles.mockText}>체험 모드에서는 연결 과정과 설정만 미리 확인할 수 있어요. 실제 건강 앱 데이터는 읽지 않습니다.</Text></View> : null}
            <View style={styles.hero}>
              <View style={styles.heroIcon}><AppIcon color={colors.brand} name="heart" size={23} /></View>
              <View style={styles.heroCopy}>
                <Text style={styles.heroTitle}>{data.provider === 'apple-health' ? 'Apple 건강' : 'Health Connect'}</Text>
                <Text style={styles.heroDescription}>{data.connected ? data.lastSyncedLabel ?? '연결 설정됨 · 읽을 데이터 확인 필요' : '수면과 활동 데이터를 자동으로 가져와요'}</Text>
              </View>
              {data.connected ? (
                <Pressable accessibilityRole="button" disabled={busy} onPress={() => void update(data)} style={styles.resyncButton}><Text style={styles.resyncText}>다시 동기화</Text></Pressable>
              ) : (
                <Switch accessibilityLabel="건강 데이터 연결" disabled={busy} onValueChange={(connected) => void update({ ...data, connected })} thumbColor={data.connected ? colors.primary : colors.white} trackColor={{ false: colors.border, true: colors.primaryBorder }} value={data.connected}/>
              )}
            </View>
            {saveError ? <Text accessibilityLiveRegion="polite" style={styles.inlineError}>{saveError}</Text> : null}
            {!data.connected ? (
              <StateNotice
                actionLabel={isDemo ? '연결 과정 미리보기' : 'Apple 건강 연결하기'}
                description={isDemo ? '실제 연동 전 선택 화면을 체험할 수 있어요.' : '연결하면 수면과 걸음 기록을 자동으로 가져와요.'}
                icon="＋"
                onAction={() => void update({ ...data, connected: true, permissions: { sleep: true, steps: true, activityEnergy: true, heartRate: false } })}
                title="연결된 건강 데이터가 없어요"
              />
            ) : (
              <>
                <Text style={styles.sectionTitle}>수집 항목별 권한</Text>
                <View style={styles.group}>
                  <Toggle label="수면 분석" value={data.permissions.sleep} onChange={(value) => void update({ ...data, permissions: { ...data.permissions, sleep: value } })} />
                  <Toggle label="걸음 수" value={data.permissions.steps} onChange={(value) => void update({ ...data, permissions: { ...data.permissions, steps: value } })} />
                  <Toggle label="활동 에너지" value={data.permissions.activityEnergy} onChange={(value) => void update({ ...data, permissions: { ...data.permissions, activityEnergy: value } })} />
                  <PermissionStatus label="활동 에너지" status="거부" tone="warning"/><PermissionStatus label="운동 기록" status="없음" tone="muted"/>
                </View>
                <View style={styles.info}><Text style={styles.infoText}>앱은 선택한 항목만 읽고 건강 앱의 원본 데이터는 수정하지 않아요.</Text></View>
                {!data.lastSyncedLabel ? <View style={styles.info}><Text style={styles.infoText}>Apple 건강에서 수면·걸음 수 읽기 권한이 켜져 있는지, 오늘 또는 어제 기록이 실제로 존재하는지 확인해 주세요.</Text></View> : null}
                <View style={styles.testSection}>
                  <View style={styles.testCopy}><Text style={styles.testTitle}>실제 데이터 연결 진단</Text><Text style={styles.testDescription}>오늘 값과 HealthKit의 가장 최근 샘플을 직접 조회해요.</Text></View>
                  <Pressable accessibilityRole="button" accessibilityState={{ busy: diagnosing }} disabled={diagnosing} onPress={() => void diagnose(data)} style={({ pressed }) => [styles.testButton, pressed && styles.pressed]}><Text style={styles.testButtonText}>{diagnosing ? '조회 중…' : '지금 데이터 확인'}</Text></Pressable>
                  {diagnostic ? <HealthDiagnosticResult diagnostic={diagnostic} /> : null}
                </View>
                <Pressable accessibilityRole="button" disabled={busy} onPress={() => void update({ ...data, connected: false })} style={styles.dangerOutline}>
                  <Text style={styles.dangerOutlineText}>연결 해제</Text>
                </Pressable>
              </>
            )}
          </>
        )}
      </ScrollView>
      {busy ? <View accessibilityLiveRegion="polite" style={styles.busy}><ActivityIndicator color={colors.primary} /><Text style={styles.busyText}>설정을 저장하는 중</Text></View> : null}
    </SafeAreaView>
  );
}

function Toggle({ label, value, onChange }: { label: string; value: boolean; onChange: (value: boolean) => void }) {
  return <View style={styles.row}><Text style={styles.rowLabel}>{label}</Text><Switch accessibilityLabel={label} onValueChange={onChange} thumbColor={value ? colors.primary : colors.white} trackColor={{ false: colors.border, true: colors.primaryBorder }} value={value} /></View>;
}

function PermissionStatus({ label, status, tone }: { label: string; status: string; tone: 'warning' | 'muted' }) { return <View style={styles.row}><Text style={styles.rowLabel}>{label}</Text><Text style={tone === 'warning' ? styles.permissionWarning : styles.permissionMuted}>{status}</Text></View>; }

function Center() {
  return <View style={styles.center}><ActivityIndicator color={colors.primary} /></View>;
}

function HealthDiagnosticResult({ diagnostic }: { diagnostic: AppleHealthDiagnostic }) {
  const readable = diagnostic.result === 'readable';
  const title = readable ? 'HealthKit 실제 조회 성공' : diagnostic.result === 'query-error' ? 'HealthKit 쿼리 오류' : '조회 결과가 비어 있어요';
  const description = readable
    ? '앱이 Apple 건강의 실제 샘플을 읽을 수 있어요.'
    : diagnostic.result === 'query-error'
      ? '아래 쿼리 오류를 확인해 주세요.'
      : 'Apple 정책상 권한 거부와 실제 데이터 없음은 앱에서 구분할 수 없어요. 건강 앱의 권한과 원본 데이터를 확인해 주세요.';
  return <View accessibilityLiveRegion="polite" style={styles.diagnostic}>
    <View style={styles.diagnosticHeader}><AppIcon color={readable ? colors.success : colors.warning} name={readable ? 'check' : 'alert'} size={19}/><View style={styles.diagnosticCopy}><Text style={styles.diagnosticTitle}>{title}</Text><Text style={styles.diagnosticDescription}>{description}</Text></View></View>
    <DiagnosticRow label="오늘 걸음 수" value={diagnostic.steps.dailyValue === null ? '조회값 없음' : `${Math.round(diagnostic.steps.dailyValue).toLocaleString('ko-KR')}보`} />
    <DiagnosticRow label="오늘 수면 샘플" value={`${diagnostic.sleep.asleepSamples}개`} />
    <DiagnosticRow label="최근 걸음 샘플" value={formatSampleDate(diagnostic.steps.latestSampleAt)} />
    <DiagnosticRow label="최근 수면 샘플" value={formatSampleDate(diagnostic.sleep.latestSampleAt)} />
    {diagnostic.steps.error ? <Text style={styles.diagnosticError}>걸음 수: {diagnostic.steps.error}</Text> : null}
    {diagnostic.sleep.error ? <Text style={styles.diagnosticError}>수면: {diagnostic.sleep.error}</Text> : null}
  </View>;
}

function DiagnosticRow({ label, value }: { label: string; value: string }) {
  return <View style={styles.diagnosticRow}><Text style={styles.diagnosticLabel}>{label}</Text><Text style={styles.diagnosticValue}>{value}</Text></View>;
}

function formatSampleDate(value: string | null) {
  if (!value) return '조회값 없음';
  return new Intl.DateTimeFormat('ko-KR', { month: 'numeric', day: 'numeric', hour: 'numeric', minute: '2-digit' }).format(new Date(value));
}
