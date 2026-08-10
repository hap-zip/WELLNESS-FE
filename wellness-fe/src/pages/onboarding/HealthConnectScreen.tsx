import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Platform, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppIcon } from '@/components/app-icon';
import NavigationBackButton from '@/components/navigation-back-button';
import { SetupProgress } from '@/components/ui/auth-flow';
import { useAuth } from '@/context/auth-context';
import type { HealthConnectionSettings } from '@/domain/wellness';
import { appleHealthService } from '@/services/apple-health-service';
import { healthSyncService } from '@/services/health-sync-service';
import { wellnessApi } from '@/services/wellness-api';
import { colors } from '@/theme/tokens';

import { styles } from './health-connect.styles';

const provider: { id: HealthConnectionSettings['provider']; name: string; description: string } = Platform.OS === 'android'
  ? { id: 'health-connect', name: 'Health Connect', description: 'Android 건강 앱의 수면과 걸음 데이터를 불러와요.' }
  : { id: 'apple-health', name: 'Apple 건강', description: 'iPhone 건강 앱의 수면과 걸음 데이터를 불러와요.' };

const PERMISSIONS = [
  { label: '수면', description: '수면 시간과 취침 시각' },
  { label: '걸음', description: '하루 걸음 수' },
] as const;

export default function HealthConnectScreen() {
  const router = useRouter();
  const { completeOnboarding, session } = useAuth();
  const [selected, setSelected] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  const finish = async (connect: boolean) => {
    if (isSaving) return;
    setIsSaving(true); setError('');
    try {
      if (connect && provider.id === 'apple-health' && session?.mode !== 'demo') {
        await appleHealthService.requestReadAuthorization();
      }
      const settings: HealthConnectionSettings = { provider: provider.id, connected: connect, lastSyncedLabel: null, permissions: { sleep: connect, steps: connect, heartRate: false } };
      await wellnessApi.saveHealthConnection(settings);
      if (connect && provider.id === 'apple-health' && session?.mode !== 'demo') await healthSyncService.syncRecent(settings);
      await completeOnboarding();
      router.replace('/(tabs)/home');
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : connect ? '건강 데이터 연결을 저장하지 못했어요. 나중에 마이에서 다시 연결할 수 있어요.' : '시작 설정을 마치지 못했어요. 잠시 후 다시 시도해 주세요.');
    } finally { setIsSaving(false); }
  };

  return <SafeAreaView edges={['top', 'bottom']} style={styles.screen}>
    <View style={styles.topBar}><NavigationBackButton accessibilityLabel="기본 상태 설정으로 돌아가기" confirmDiscard={selected} fallbackHref="/(onboarding)/baseline"/><View style={styles.progressWrap}><SetupProgress current={3}/></View><View style={styles.topSpacer}/></View>
    <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      <View style={styles.header}><Text accessibilityRole="header" style={styles.title}>매일 적지 않아도 되는 값은{`\n`}자동으로 가져올 수 있어요.</Text><Text style={styles.description}>연결 여부와 가져올 항목은 언제든 바꿀 수 있어요. 연결하지 않아도 직접 기록할 수 있습니다.</Text></View>

      <View style={styles.providerSection}>
        <Pressable accessibilityLabel={`${provider.name} ${selected ? '연결 선택됨' : '연결 선택하기'}`} accessibilityRole="checkbox" accessibilityState={{ checked: selected }} onPress={() => setSelected((current) => !current)} style={({ pressed }) => [styles.providerHeader, selected && styles.selectedProvider, pressed && styles.pressed]}><View style={[styles.providerIcon, selected && styles.selectedProviderIcon]}><AppIcon color={selected ? colors.white : colors.brand} name={provider.id === 'apple-health' ? 'heart' : 'trend-up'} size={24}/></View><View style={styles.providerCopy}><Text style={styles.providerName}>{provider.name}</Text><Text style={styles.providerDescription}>{provider.description}</Text></View><View style={[styles.connectionState, selected && styles.connectionStateSelected]}><Text style={[styles.connectionStateText, selected && styles.connectionStateTextSelected]}>{selected ? '연결 선택' : '선택'}</Text></View></Pressable>
        <View style={styles.permissionList}><Text style={styles.permissionHeading}>가져오는 데이터</Text>{PERMISSIONS.map((item) => <View key={item.label} style={styles.permissionRow}><View style={styles.permissionCheck}><AppIcon color={colors.recovery} name="check" size={16} strokeWidth={2.4}/></View><View style={styles.permissionCopy}><Text style={styles.permissionLabel}>{item.label}</Text><Text style={styles.permissionDescription}>{item.description}</Text></View><Text style={styles.readOnly}>읽기만</Text></View>)}</View>
      </View>

      <View style={styles.privacy}><AppIcon color={colors.textMuted} name="lock" size={20}/><View style={styles.privacyCopy}><Text style={styles.privacyTitle}>연결 전 권한을 다시 확인해요</Text><Text style={styles.privacyText}>선택한 항목만 읽고, 몸기록에서 작성한 내용을 건강 앱에 임의로 쓰지 않아요.</Text></View></View>
      {error ? <Text accessibilityRole="alert" accessibilityLiveRegion="assertive" style={styles.errorText}>{error}</Text> : null}
    </ScrollView>
    <View style={styles.footer}>{!selected ? <Pressable accessibilityRole="button" disabled={isSaving} onPress={() => void finish(false)} style={({ pressed }) => [styles.laterButton, pressed && styles.pressed]}><Text style={styles.laterText}>연결 없이 시작하기</Text></Pressable> : null}<Pressable accessibilityRole="button" accessibilityState={{ busy: isSaving }} disabled={isSaving} onPress={() => void finish(selected)} style={({ pressed }) => [styles.startButton, isSaving && styles.disabledButton, pressed && styles.pressed]}>{isSaving ? <ActivityIndicator color={colors.white}/> : <Text style={styles.startText}>{selected ? `${provider.name} 연결하고 시작` : '몸기록 시작하기'}</Text>}</Pressable></View>
  </SafeAreaView>;
}
