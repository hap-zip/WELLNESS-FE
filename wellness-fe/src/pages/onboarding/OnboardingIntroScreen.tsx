import { useRouter } from 'expo-router';
import { Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { styles } from './onboarding-intro.styles';

const STEPS = [
  {
    number: '01',
    title: '기록해요',
    description: '불편·수면·활동·피부를 10초~1분 안에',
  },
  {
    number: '02',
    title: '연결해요',
    description: '내 평소와 비교해 반복되는 흐름을 확인',
  },
  {
    number: '03',
    title: '행동해요',
    description: '오늘 할 수 있는 짧은 루틴 하나로',
  },
] as const;

export default function OnboardingIntroScreen() {
  const router = useRouter();

  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.screen}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>
            가볍게 기록하고,{`\n`}반복되는 흐름을{`\n`}이해해요
          </Text>
        </View>

        <View style={styles.steps}>
          {STEPS.map((step, index) => (
            <View
              key={step.number}
              style={[styles.step, index === STEPS.length - 1 && styles.lastStep]}>
              <Text style={styles.stepNumber}>{step.number}</Text>
              <View style={styles.stepCopy}>
                <Text style={styles.stepTitle}>{step.title}</Text>
                <Text style={styles.stepDescription}>{step.description}</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.disclaimer}>
          <Text style={styles.disclaimerText}>
            이 앱은 특정 질환을 진단하거나 처방하지 않아요. 내 기록을 차분히 연결해 주는 도구예요.
          </Text>
        </View>
      </View>

      <View style={styles.footer}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="온보딩 시작하기"
          onPress={() => router.push('/(onboarding)/consent')}
          style={({ pressed }) => [styles.startButton, pressed && styles.pressed]}>
          <Text style={styles.startButtonText}>시작하기</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
