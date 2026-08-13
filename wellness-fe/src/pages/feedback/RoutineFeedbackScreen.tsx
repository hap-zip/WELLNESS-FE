import { useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, useWindowDimensions, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppIcon, type AppIconName } from '@/components/app-icon';
import type { RoutineEffect } from '@/domain/wellness';
import { wellnessApi } from '@/services/wellness-api';
import { colors } from '@/theme/tokens';

import { styles } from './feedback.styles';

const EFFECTS: { id: RoutineEffect; icon: AppIconName; label: string }[] = [
  { id: 'better', icon: 'trend-up', label: '나아졌어요' },
  { id: 'same', icon: 'minus', label: '비슷해요' },
  { id: 'worse', icon: 'trend-down', label: '더 불편해요' },
];
const EFFECT_COPY: Partial<Record<RoutineEffect,string>>={better:'좋아요. 이 루틴을 어깨 불편이 있는 날에 더 자주 추천할게요.',same:'조금 더 지켜볼게요. 같은 루틴을 며칠 더 제안해요.',worse:'이 루틴 추천을 줄이고, 다른 방식의 동작을 먼저 제안할게요.'};

export default function RoutineFeedbackScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  const { routineId = '' } = useLocalSearchParams<{ routineId?: string }>();
  const [effect, setEffect] = useState<RoutineEffect | null>(null);
  const [level, setLevel] = useState<number | null>(null);
  const [memo, setMemo] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const canSubmit = Boolean(effect);

  const selectEffect = (next: RoutineEffect) => {
    setEffect(next);
    if (next === 'unknown') setLevel(null);
  };

  const submit = async () => {
    if (!effect) return;
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
        <ScrollView automaticallyAdjustKeyboardInsets contentContainerStyle={[styles.content, height < 700 && styles.compactContent, { minHeight: Math.max(480, height - (height < 700 ? 72 : 192)), paddingBottom: insets.bottom + 120 }]} keyboardDismissMode="interactive" keyboardShouldPersistTaps="handled">
          <Text style={styles.eyebrow}>어제 오후 9:20 · 목 주변 가볍게 이완하기</Text>
          <Text accessibilityRole="header" style={styles.title}>어제 루틴이 도움이 됐나요?</Text>
          <Text style={styles.description}>답을 모아 다음 추천의 동작과 강도를 조정해요.</Text>
          <View accessibilityRole="radiogroup" style={styles.effectRow}>{EFFECTS.map((item) => { const selected = effect === item.id; return <Pressable accessibilityRole="radio" accessibilityState={{ checked: selected }} key={item.id} onPress={() => selectEffect(item.id)} style={({ pressed }) => [styles.effectCard, selected && styles.selected, pressed && styles.pressed]}><AppIcon color={selected ? colors.recovery : colors.textSecondary} name={item.icon} size={22}/><Text style={[styles.effectText, selected && styles.selectedText]}>{item.label}</Text></Pressable>; })}</View>
          {effect ? <Text style={styles.response}>{EFFECT_COPY[effect]}</Text> : null}<Text accessibilityRole="header" style={styles.sectionTitle}>메모 <Text style={styles.optional}>(선택)</Text></Text><TextInput accessibilityLabel="루틴 효과 메모" maxLength={100} multiline onChangeText={setMemo} placeholder="느낀 변화가 있다면 적어주세요" placeholderTextColor={colors.textMuted} style={styles.input} value={memo} /><Text accessibilityLabel={`${memo.length}자 입력됨, 최대 100자`} style={styles.memoCount}>{memo.length}/100</Text>
          {error ? <Text accessibilityLiveRegion="polite" style={styles.error}>{error}</Text> : null}
        </ScrollView>
        <View style={[styles.action, { paddingBottom: Math.max(insets.bottom, 12) }]}><Pressable accessibilityRole="button" accessibilityState={{ disabled: !canSubmit, busy: saving }} disabled={!canSubmit || saving} onPress={() => void submit()} style={({ pressed }) => [styles.button, (!canSubmit || saving) && styles.disabled, pressed && styles.pressed]}>{saving ? <ActivityIndicator color={colors.primaryText} /> : <Text style={styles.buttonText}>답변 보내기</Text>}</Pressable></View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
