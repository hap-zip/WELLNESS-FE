import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import NavigationBackButton from '@/components/navigation-back-button';
import { styles } from './health-connect.styles';

const PROVIDERS = [
  { name: 'Apple 건강', icon: '♥', iconStyle: 'heart' as const },
  { name: 'Health Connect', icon: '⌁', iconStyle: 'pulse' as const },
] as const;

export default function HealthConnectScreen() {
  const router = useRouter();
  const [connectedProvider, setConnectedProvider] = useState<string | null>(null);

  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.screen}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.backButton}><NavigationBackButton accessibilityLabel="기본 상태 설정으로 돌아가기" confirmDiscard={connectedProvider !== null} fallbackHref="/(onboarding)/baseline" /></View>

        <View style={styles.header}>
          <Text style={styles.title}>
            건강 데이터를{`\n`}연결할까요?
          </Text>
          <Text style={styles.description}>
            수면·걸음을 자동으로 불러오면 기록이 더 쉬워져요. 연결하지 않아도 계속할 수 있어요.
          </Text>
        </View>

        <View style={styles.providers}>
          {PROVIDERS.map((provider, index) => (
            <Pressable
              accessibilityRole="button"
              key={provider.name}
              onPress={() => setConnectedProvider((current) => current === provider.name ? null : provider.name)}
              style={({ pressed }) => [
                styles.providerRow,
                index === PROVIDERS.length - 1 && styles.lastProviderRow,
                pressed && styles.pressed,
              ]}>
              <Text style={[styles.providerIcon, provider.iconStyle === 'pulse' && styles.pulseIcon]}>
                {provider.icon}
              </Text>
              <Text style={styles.providerName}>{provider.name}</Text>
              <Text style={styles.connectText}>{connectedProvider === provider.name ? '연결됨' : '연결하기'}</Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Pressable
          accessibilityRole="button"
          onPress={() => router.replace('/(tabs)/home')}
          style={({ pressed }) => [styles.laterButton, pressed && styles.pressed]}>
          <Text style={styles.laterText}>나중에 연결하기</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          onPress={() => router.replace('/(tabs)/home')}
          style={({ pressed }) => [styles.startButton, pressed && styles.pressed]}>
          <Text style={styles.startText}>시작하기</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
