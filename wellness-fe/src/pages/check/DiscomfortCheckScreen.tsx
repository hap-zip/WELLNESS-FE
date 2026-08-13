import { useRouter } from 'expo-router';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CheckFlowHeader, CheckIntro } from '@/components/ui/check-screen-header';
import { useDailyCheck } from '@/context/daily-check-context';

import { styles } from './discomfort-check.styles';
import { BODY_ZONE_LABELS, SelectableBodyMap } from './SelectableBodyMap';

const LEVELS = [1, 2, 3, 4, 5] as const;
const FEELINGS = ['뻐근함', '찌릿함', '당김', '묵직함', '화끈함'] as const;

export default function DiscomfortCheckScreen() {
  const router = useRouter();
  const { completeStep, draft, updateDraft } = useDailyCheck();
  const allComplete = draft.bodyParts.length === 0 || draft.bodyParts.every((id) => Boolean(draft.bodyAreaIntensities[id]));
  const toggleBodyPart = (zone: { id: string }) => {
    if (draft.bodyParts.includes(zone.id)) {
      const nextIntensities = { ...draft.bodyAreaIntensities };
      const nextFeelings = { ...draft.bodyAreaFeelings };
      delete nextIntensities[zone.id];
      delete nextFeelings[zone.id];
      updateDraft({
        bodyParts: draft.bodyParts.filter((item) => item !== zone.id),
        bodyAreaIntensities: nextIntensities,
        bodyAreaFeelings: nextFeelings,
        discomfortFeelings: [...new Set(Object.values(nextFeelings).flat())],
        intensity: Math.max(0, ...Object.values(nextIntensities)) || null,
      });
    } else updateDraft({ bodyParts: [...draft.bodyParts, zone.id] });
  };
  const setLevel = (id: string, level: number) => {
    const bodyAreaIntensities = { ...draft.bodyAreaIntensities, [id]: level };
    const max = Math.max(...Object.values(bodyAreaIntensities));
    const condition = max <= 1 ? 'great' : max === 2 ? 'good' : max === 3 ? 'okay' : max === 4 ? 'bad' : 'awful';
    updateDraft({ bodyAreaIntensities, intensity: max, condition });
  };
  const toggleFeeling = (id: string, feeling: string) => {
    const current = draft.bodyAreaFeelings[id] ?? [];
    const next = current.includes(feeling) ? current.filter((item) => item !== feeling) : [...current, feeling];
    const bodyAreaFeelings = { ...draft.bodyAreaFeelings, [id]: next };
    updateDraft({ bodyAreaFeelings, discomfortFeelings: [...new Set(Object.values(bodyAreaFeelings).flat())] });
  };

  return <SafeAreaView edges={['top', 'bottom']} style={styles.screen}>
    <CheckFlowHeader backLabel="자동 수집 확인으로 돌아가기" fallbackHref="/check/auto" step={2} />
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <CheckIntro description="부위를 고른 뒤 강도와 느낌을 함께 남겨주세요." inset={false} step={2} title="어디가 불편한가요?" />
      <Text style={styles.sectionTitle}>불편한 부위</Text>
      <SelectableBodyMap onChangeView={(bodyView) => updateDraft({ bodyView })} onToggle={toggleBodyPart} selected={draft.bodyParts} view={draft.bodyView} />

      {draft.bodyParts.map((id) => {
        const level = draft.bodyAreaIntensities[id];
        const feelings = draft.bodyAreaFeelings[id] ?? [];
        return <View key={id} style={styles.areaCard}><View style={styles.areaHeading}><Text style={styles.areaTitle}>{BODY_ZONE_LABELS[id] ?? '선택한 부위'}</Text><Pressable accessibilityLabel={`${BODY_ZONE_LABELS[id] ?? '선택한 부위'} 삭제`} accessibilityRole="button" hitSlop={10} onPress={() => toggleBodyPart({ id })}><Text style={styles.removeText}>삭제</Text></Pressable></View><View accessibilityRole="radiogroup" style={styles.scaleRow}>{LEVELS.map((value) => <Pressable accessibilityRole="radio" accessibilityState={{ checked: level === value }} key={value} onPress={() => setLevel(id, value)} style={[styles.scaleButton, level === value && styles.selectedScaleButton]}><Text style={[styles.scaleText, level === value && styles.selectedScaleText]}>{value}</Text></Pressable>)}</View><View style={styles.scaleLabels}><Text style={styles.scaleLabel}>약함</Text><Text style={styles.scaleLabel}>심함</Text></View><Text style={styles.feelTitle}>어떤 느낌인가요? <Text style={styles.optional}>(여러 개 선택)</Text></Text><View style={styles.chipGroup}>{FEELINGS.map((feeling) => <Pressable accessibilityRole="checkbox" accessibilityState={{ checked: feelings.includes(feeling) }} key={feeling} onPress={() => toggleFeeling(id, feeling)} style={[styles.chip, feelings.includes(feeling) && styles.selectedChip]}><Text style={[styles.chipText, feelings.includes(feeling) && styles.selectedChipText]}>{feeling}</Text></Pressable>)}</View></View>;
      })}
      {draft.bodyParts.length > 0 ? <Pressable accessibilityRole="switch" accessibilityState={{ checked: draft.headache }} onPress={() => updateDraft({ headache: !draft.headache })} style={styles.headache}><View><Text style={styles.headacheTitle}>두통이 함께 있었나요?</Text><Text style={styles.headacheDescription}>불편 부위와 함께 기록해요.</Text></View><View style={[styles.toggle, draft.headache && styles.toggleOn]}><View style={[styles.knob, draft.headache && styles.knobOn]} /></View></Pressable> : null}
    </ScrollView>
    <View style={styles.footer}><Pressable accessibilityRole="button" accessibilityState={{ disabled: !allComplete }} disabled={!allComplete} onPress={() => { completeStep('discomfort'); router.push('/check/sleep'); }} style={({ pressed }) => [styles.nextButton, !allComplete && styles.disabledButton, pressed && styles.pressed]}><Text style={[styles.nextText, !allComplete && styles.disabledText]}>{draft.bodyParts.length ? '다음' : '불편 없이 넘어가기'}</Text></Pressable></View>
  </SafeAreaView>;
}
