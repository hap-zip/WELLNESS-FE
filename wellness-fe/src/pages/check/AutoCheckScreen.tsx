import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';

import { useDailyCheck } from '@/context/daily-check-context';

import { styles } from './auto-check.styles';

const RECORDS = [
  { key: 'sleepDuration', label: '수면 시간' },
  { key: 'bedtime', label: '취침 시간' },
  { key: 'steps', label: '걸음 수' },
] as const;

export default function AutoCheckScreen() {
  const router = useRouter();
  const { completeStep, draft, skipStep, updateDraft } = useDailyCheck();
  const [isEditing, setIsEditing] = useState(false);

  const moveToCondition = () => router.push('/check/condition');

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
          <Pressable accessibilityRole="button" onPress={() => { skipStep('auto'); moveToCondition(); }} style={({ pressed }) => [styles.skipButton, pressed && styles.pressed]}>
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
          <Text style={styles.sourceIcon}>♥</Text>
          <Text style={styles.sourceText}>Apple 건강에서 자동으로 가져왔어요</Text>
        </View>
      </ScrollView>
      <View style={styles.footer}>
        <Pressable accessibilityRole="button" onPress={() => setIsEditing((current) => !current)} style={({ pressed }) => [styles.editButton, pressed && styles.pressed]}>
          <Text style={styles.editText}>{isEditing ? '수정 완료' : '수정하기'}</Text>
        </Pressable>
        <Pressable accessibilityRole="button" onPress={() => { updateDraft({ autoConfirmed: true }); completeStep('auto'); moveToCondition(); }} style={({ pressed }) => [styles.confirmButton, pressed && styles.pressed]}>
          <Text style={styles.confirmText}>맞아요</Text>
        </Pressable>
      </View>
    </View>
  );
}
