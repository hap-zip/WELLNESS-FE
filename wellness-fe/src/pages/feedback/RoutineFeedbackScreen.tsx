import { useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import NavigationBackButton from '@/components/navigation-back-button';
import { AppIcon, type AppIconName } from '@/components/app-icon';
import type { RoutineEffect } from '@/domain/wellness';
import { wellnessApi } from '@/services/wellness-api';
import { colors } from '@/theme/tokens';

import { styles } from './feedback.styles';

const EFFECTS: { id: RoutineEffect; icon: AppIconName; label: string }[] = [
  { id: 'better', icon: 'trend-up', label: '한결 편해요' },
  { id: 'same', icon: 'minus', label: '비슷해요' },
  { id: 'worse', icon: 'trend-down', label: '더 불편해요' },
  { id: 'unknown', icon: 'help', label: '잘 모르겠어요' },
];

export default function RoutineFeedbackScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { routineId = '' } = useLocalSearchParams<{ routineId?: string }>();
  const [effect, setEffect] = useState<RoutineEffect | null>(null);
  const [level, setLevel] = useState<number | null>(null);
  const [memo, setMemo] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const canSubmit = Boolean(effect && (effect === 'unknown' || level));

  const selectEffect = (next: RoutineEffect) => {
    setEffect(next);
    if (next === 'unknown') setLevel(null);
  };

  const submit = async () => {
    if (!effect || (effect !== 'unknown' && !level)) return;
    setSaving(true);
    setError('');
    try {
      const result = await wellnessApi.saveRoutineFeedback({ routineId, effect, discomfortLevel: level ?? 3, memo: memo.trim() });
      if (result.shouldShowSignal) router.replace('/safety/signal');
      else router.dismissTo('/(tabs)/home');
    } catch {
      setError('피드백을 저장하지 못했어요. 다시 시도해 주세요.');
      setSaving(false);
    }
  };

  return (
    <SafeAreaView edges={['top']} style={styles.screen}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
        <View style={styles.topBar}><NavigationBackButton accessibilityLabel="루틴 완료로 돌아가기" fallbackHref="/(tabs)/home" /><Text style={styles.topTitle}>효과 피드백</Text><View style={styles.spacer} /></View>
        <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 120 }]} keyboardShouldPersistTaps="handled">
          <Text style={styles.eyebrow}>루틴 후 체크</Text>
          <Text style={styles.title}>지금 몸은{`\n`}어떻게 느껴지나요?</Text>
          <Text style={styles.description}>이 답변은 다음 루틴의 강도와 구성을 조정하는 데 사용돼요.</Text>
          <Text style={styles.sectionTitle}>루틴 전과 비교하면</Text>
          <View style={styles.effectRow}>{EFFECTS.map((item) => { const selected = effect === item.id; return <Pressable accessibilityRole="radio" accessibilityState={{ checked: selected }} key={item.id} onPress={() => selectEffect(item.id)} style={[styles.effectCard, selected && styles.selected]}><AppIcon color={selected ? colors.white : colors.textSecondary} name={item.icon} size={23}/><Text style={[styles.effectText, selected && styles.selectedText]}>{item.label}</Text></Pressable>; })}</View>
          {effect && effect !== 'unknown' ? <>
            <Text style={styles.sectionTitle}>지금 남아 있는 불편 강도</Text>
            <View accessibilityRole="radiogroup" style={styles.levelRow}>{[1, 2, 3, 4, 5].map((value) => <Pressable accessibilityLabel={`불편 강도 ${value}단계`} accessibilityRole="radio" accessibilityState={{ checked: level === value }} key={value} onPress={() => setLevel(value)} style={[styles.level, level === value && styles.selectedLevel]}><Text style={[styles.levelText, level === value && styles.selectedText]}>{value}</Text></Pressable>)}</View>
            <View style={styles.scaleLabels}><Text style={styles.scaleText}>거의 없음</Text><Text style={styles.scaleText}>매우 불편</Text></View>
          </> : null}
          {effect ? <><Text style={styles.sectionTitle}>메모 <Text style={styles.optional}>(선택)</Text></Text><TextInput accessibilityLabel="루틴 효과 메모" maxLength={200} multiline onChangeText={setMemo} placeholder="어떤 점이 달라졌는지 남겨보세요." placeholderTextColor="#6E776F" style={styles.input} value={memo} /></> : null}
          {error ? <Text accessibilityLiveRegion="polite" style={styles.error}>{error}</Text> : null}
        </ScrollView>
        <View style={[styles.action, { paddingBottom: Math.max(insets.bottom, 12) }]}><Pressable accessibilityRole="button" accessibilityState={{ disabled: !canSubmit, busy: saving }} disabled={!canSubmit || saving} onPress={() => void submit()} style={[styles.button, (!canSubmit || saving) && styles.disabled]}>{saving ? <ActivityIndicator color={colors.white} /> : <Text style={styles.buttonText}>피드백 저장하기</Text>}</Pressable></View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
