import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Platform, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppIcon } from '@/components/app-icon';
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
  { label: '수면 분석', description: '어젯밤 잠든 시간과 깬 시간을 자동으로 채워요' },
  { label: '걸음 수', description: '활동량이 불편과 어떻게 겹치는지 볼 때 써요' },
  { label: '활동 에너지', description: '많이 움직인 날을 구분하는 데 써요' },
  { label: '운동 기록', description: '운동한 날 다음의 몸 상태를 비교해요' },
] as const;

export default function HealthConnectScreen() {
  const router = useRouter();
  const { completeOnboarding, session } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  const finish = async (connect: boolean) => {
    if (isSaving) return;
    setIsSaving(true); setError('');
    try {
      if (connect && provider.id === 'apple-health' && session?.mode !== 'demo') {
        await appleHealthService.requestReadAuthorization();
      }
      const settings: HealthConnectionSettings = { provider: provider.id, connected: connect, lastSyncedLabel: null, permissions: { sleep: connect, steps: connect, activityEnergy: connect, heartRate: false } };
      await wellnessApi.saveHealthConnection(settings);
      if (connect && provider.id === 'apple-health' && session?.mode !== 'demo') await healthSyncService.syncRecent(settings);
      await completeOnboarding();
      router.replace('/(tabs)/home');
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : connect ? '건강 데이터 연결을 저장하지 못했어요. 나중에 마이에서 다시 연결할 수 있어요.' : '시작 설정을 마치지 못했어요. 잠시 후 다시 시도해 주세요.');
    } finally { setIsSaving(false); }
  };

  return <SafeAreaView edges={['top', 'bottom']} style={styles.screen}>
    <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      <View style={styles.header}><View style={styles.heroIcon}><AppIcon color={colors.brand} name="heart" size={29}/></View><Text accessibilityRole="header" style={styles.title}>Apple 건강과{`\n`}연결할까요?</Text><Text style={styles.description}>연결하면 매일 직접 입력할 항목이 줄어들어요. 아래 네 가지만 읽고, 몸기록이 건강 앱에 값을 쓰지는 않아요.</Text></View>

      <View style={styles.providerSection}>
        <View style={styles.permissionList}><Text style={styles.permissionHeading}>가져오는 데이터</Text>{PERMISSIONS.map((item) => <View key={item.label} style={styles.permissionRow}><View style={styles.permissionCheck}><AppIcon color={colors.recovery} name="check" size={16} strokeWidth={2.4}/></View><View style={styles.permissionCopy}><Text style={styles.permissionLabel}>{item.label}</Text><Text style={styles.permissionDescription}>{item.description}</Text></View><Text style={styles.readOnly}>읽기만</Text></View>)}</View>
      </View>

      <View style={styles.privacy}><AppIcon color={colors.textMuted} name="lock" size={20}/><View style={styles.privacyCopy}><Text style={styles.privacyTitle}>연결 전 권한을 다시 확인해요</Text><Text style={styles.privacyText}>선택한 항목만 읽고, 몸기록에서 작성한 내용을 건강 앱에 임의로 쓰지 않아요.</Text></View></View>
      {error ? <Text accessibilityRole="alert" accessibilityLiveRegion="assertive" style={styles.errorText}>{error}</Text> : null}
    </ScrollView>
    <View style={styles.footer}><Pressable accessibilityRole="button" accessibilityState={{ busy: isSaving }} disabled={isSaving} onPress={() => void finish(true)} style={({ pressed }) => [styles.startButton, isSaving && styles.disabledButton, pressed && styles.pressed]}>{isSaving ? <ActivityIndicator color={colors.primaryText}/> : <Text style={styles.startText}>연결하기</Text>}</Pressable><Pressable accessibilityRole="button" disabled={isSaving} onPress={() => void finish(false)} style={({ pressed }) => [styles.laterButton, pressed && styles.pressed]}><Text style={styles.laterText}>나중에 하기</Text></Pressable></View>
  </SafeAreaView>;
}
