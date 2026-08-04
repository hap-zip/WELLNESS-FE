import { useRouter } from 'expo-router';
import { Pressable, ScrollView, Text, View } from 'react-native';

import { styles } from './auto-check.styles';

const RECORDS = [
  { label: '수면 시간', value: '5시간 42분' },
  { label: '취침 시간', value: '오전 1:18' },
  { label: '걸음 수', value: '4,230보' },
] as const;

export default function AutoCheckScreen() {
  const router = useRouter();

  return (
    <View style={styles.screen}>
      <View style={styles.progressTrack}>
        <View style={styles.progressValue} />
      </View>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.topBar}>
          <Pressable accessibilityLabel="데일리 체크 닫기" accessibilityRole="button" onPress={() => router.back()} style={({ pressed }) => [styles.closeButton, pressed && styles.pressed]}>
            <Text style={styles.closeIcon}>×</Text>
          </Pressable>
          <Pressable accessibilityRole="button" style={styles.skipButton}>
            <Text style={styles.skipText}>건너뛰기</Text>
          </Pressable>
        </View>
        <View style={styles.header}>
          <Text style={styles.step}>오늘의 체크 1 / 5</Text>
          <Text style={styles.title}>어제 기록을{`\n`}불러왔어요</Text>
          <Text style={styles.description}>값이 다르면 수정할 수 있어요.</Text>
        </View>
        <View style={styles.recordCard}>
          {RECORDS.map((record, index) => (
            <View key={record.label} style={[styles.recordRow, index === RECORDS.length - 1 && styles.lastRecordRow]}>
              <Text style={styles.recordLabel}>{record.label}</Text>
              <Text style={styles.recordValue}>{record.value}</Text>
            </View>
          ))}
        </View>
        <View style={styles.sourceRow}>
          <Text style={styles.sourceIcon}>♥</Text>
          <Text style={styles.sourceText}>Apple 건강에서 자동으로 가져왔어요</Text>
        </View>
      </ScrollView>
      <View style={styles.footer}>
        <Pressable accessibilityRole="button" style={({ pressed }) => [styles.editButton, pressed && styles.pressed]}>
          <Text style={styles.editText}>수정하기</Text>
        </Pressable>
        <Pressable accessibilityRole="button" onPress={() => router.push('/check/condition')} style={({ pressed }) => [styles.confirmButton, pressed && styles.pressed]}>
          <Text style={styles.confirmText}>맞아요</Text>
        </Pressable>
      </View>
    </View>
  );
}
