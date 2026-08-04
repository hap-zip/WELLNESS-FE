import DateTimePicker from '@react-native-community/datetimepicker';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Modal, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import NavigationBackButton from '@/components/navigation-back-button';
import type { BaselineProfile } from '@/domain/wellness';
import { wellnessApi } from '@/services/wellness-api';

import { styles } from './baseline.styles';

type TimeField = 'bedtime' | 'wakeTime' | 'notificationTime';
const AREAS = ['목', '어깨', '허리', '무릎', '손목'] as const;
const ACTIVITY_LEVELS = ['낮음', '보통', '높음'] as const;

const atTime = (hours: number, minutes: number) => {
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  return date;
};

const formatTime = (value: Date) => value.toLocaleTimeString('ko-KR', { hour: 'numeric', minute: '2-digit' });

export default function BaselineSetupScreen() {
  const router = useRouter();
  const [activePicker, setActivePicker] = useState<TimeField | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [profile, setProfile] = useState<BaselineProfile>({
    bedtime: atTime(0, 30),
    wakeTime: atTime(7, 0),
    discomfortAreas: ['목', '어깨'],
    activityLevel: '보통',
    notificationTime: atTime(21, 0),
  });

  const updateTime = (value: Date) => {
    if (activePicker) setProfile((current) => ({ ...current, [activePicker]: value }));
  };
  const toggleArea = (area: string) => setProfile((current) => ({
    ...current,
    discomfortAreas: current.discomfortAreas.includes(area)
      ? current.discomfortAreas.filter((item) => item !== area)
      : [...current.discomfortAreas, area],
  }));
  const submit = async () => {
    setIsSaving(true);
    try {
      await wellnessApi.saveBaseline(profile);
      router.push('/(onboarding)/health-connect');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.screen}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.backButton}><NavigationBackButton accessibilityLabel="민감정보 동의로 돌아가기" fallbackHref="/(onboarding)/consent" /></View>
        <View style={styles.header}><Text style={styles.title}>기본 상태를{`\n`}알려주세요</Text><Text style={styles.description}>나의 평소 상태와 비교할 기준을 만들어요. 나중에 언제든 바꿀 수 있어요.</Text></View>

        <View style={styles.rows}>
          <Text style={styles.sectionLabel}>평소 수면 시간</Text>
          <Pressable accessibilityRole="button" onPress={() => setActivePicker('bedtime')} style={({ pressed }) => [styles.row, pressed && styles.pressed]}><Text style={styles.rowLabel}>취침 시간</Text><Text style={styles.rowValue}>{formatTime(profile.bedtime)}</Text><Text style={styles.chevron}>›</Text></Pressable>
          <Pressable accessibilityRole="button" onPress={() => setActivePicker('wakeTime')} style={({ pressed }) => [styles.row, pressed && styles.pressed]}><Text style={styles.rowLabel}>기상 시간</Text><Text style={styles.rowValue}>{formatTime(profile.wakeTime)}</Text><Text style={styles.chevron}>›</Text></Pressable>

          <Text style={styles.sectionLabel}>주로 불편한 부위</Text>
          <View style={styles.chips}>{AREAS.map((area) => { const selected = profile.discomfortAreas.includes(area); return <Pressable accessibilityRole="checkbox" accessibilityState={{ checked: selected }} key={area} onPress={() => toggleArea(area)} style={({ pressed }) => [styles.chip, selected && styles.selectedChip, pressed && styles.pressed]}><Text style={[styles.chipText, selected && styles.selectedChipText]}>{area}</Text></Pressable>; })}</View>

          <Text style={styles.sectionLabel}>평소 활동 수준</Text>
          <View accessibilityRole="radiogroup" style={styles.segment}>{ACTIVITY_LEVELS.map((level) => { const selected = profile.activityLevel === level; return <Pressable accessibilityRole="radio" accessibilityState={{ checked: selected }} key={level} onPress={() => setProfile((current) => ({ ...current, activityLevel: level }))} style={({ pressed }) => [styles.segmentItem, selected && styles.selectedSegmentItem, pressed && styles.pressed]}><Text style={[styles.segmentText, selected && styles.selectedSegmentText]}>{level}</Text></Pressable>; })}</View>

          <Text style={styles.sectionLabel}>기록 알림</Text>
          <Pressable accessibilityRole="button" onPress={() => setActivePicker('notificationTime')} style={({ pressed }) => [styles.row, pressed && styles.pressed]}><Text style={styles.rowLabel}>알림 받을 시간</Text><Text style={styles.rowValue}>{formatTime(profile.notificationTime)}</Text><Text style={styles.chevron}>›</Text></Pressable>
        </View>
        <View style={styles.notice}><Text style={styles.noticeText}>질환이나 복용 약처럼 민감한 정보는 지금 받지 않아요.</Text></View>
      </ScrollView>

      <View style={styles.footer}><Pressable accessibilityRole="button" accessibilityState={{ busy: isSaving }} disabled={isSaving} onPress={() => void submit()} style={({ pressed }) => [styles.nextButton, isSaving && styles.disabledButton, pressed && styles.pressed]}><Text style={styles.nextButtonText}>{isSaving ? '저장 중…' : '다음'}</Text></Pressable></View>

      <Modal animationType="slide" onRequestClose={() => setActivePicker(null)} transparent visible={activePicker !== null}>
        <Pressable style={styles.modalOverlay} onPress={() => setActivePicker(null)}>
          <Pressable accessibilityRole="none" style={styles.pickerSheet} onPress={(event) => event.stopPropagation()}>
            <View style={styles.pickerHeader}><Text style={styles.pickerTitle}>시간 선택</Text><Pressable accessibilityRole="button" onPress={() => setActivePicker(null)} style={styles.doneButton}><Text style={styles.doneText}>완료</Text></Pressable></View>
            {activePicker ? <DateTimePicker display="spinner" locale="ko-KR" mode="time" onChange={(_, value) => { if (value) updateTime(value); }} value={profile[activePicker]} /> : null}
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}
