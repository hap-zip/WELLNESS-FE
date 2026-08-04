import { useRouter } from 'expo-router';
import { Pressable, ScrollView, Text, View } from 'react-native';

import { styles } from './baseline.styles';

const BASELINE_ROWS = [
  { label: '평소 취침 시간', value: '오전 12:30' },
  { label: '평소 기상 시간', value: '오전 7:00' },
  { label: '주로 불편한 부위', value: '목 · 어깨' },
  { label: '평소 활동 수준', value: '보통' },
  { label: '알림 받을 시간', value: '밤 9:00' },
] as const;

export default function BaselineSetupScreen() {
  const router = useRouter();

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Pressable
          accessibilityLabel="민감정보 동의로 돌아가기"
          accessibilityRole="button"
          onPress={() => router.back()}
          style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}>
          <Text style={styles.backIcon}>‹</Text>
        </Pressable>

        <View style={styles.header}>
          <Text style={styles.title}>
            기본 상태를{`\n`}알려주세요
          </Text>
          <Text style={styles.description}>
            개인 기준선을 만들기 전 참고할 최소한의 정보만 받아요.
          </Text>
        </View>

        <View style={styles.rows}>
          {BASELINE_ROWS.map((row) => (
            <Pressable
              accessibilityRole="button"
              key={row.label}
              style={({ pressed }) => [styles.row, pressed && styles.pressed]}>
              <Text style={styles.rowLabel}>{row.label}</Text>
              <Text style={styles.rowValue}>{row.value}</Text>
              <Text accessibilityElementsHidden style={styles.chevron}>
                ›
              </Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.notice}>
          <Text style={styles.noticeText}>
            질환이나 복용 약처럼 민감한 정보는 지금 받지 않아요. 필요할 때 마이페이지에서 추가할 수 있어요.
          </Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Pressable
          accessibilityRole="button"
          onPress={() => undefined}
          style={({ pressed }) => [styles.nextButton, pressed && styles.pressed]}>
          <Text style={styles.nextButtonText}>다음</Text>
        </Pressable>
      </View>
    </View>
  );
}
