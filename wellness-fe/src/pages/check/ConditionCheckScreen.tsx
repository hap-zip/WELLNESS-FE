import { useRouter } from 'expo-router';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CheckScreenHeader } from '@/components/ui/check-screen-header';
import { useDailyCheck } from '@/context/daily-check-context';
import { BODY_ZONE_LABELS } from './SelectableBodyMap';
import { styles } from './condition-check.styles';

const LEVELS = [1, 2, 3, 4, 5] as const;
const FEELS = ['뻐근함', '찌릿함', '당김', '묵직함', '화끈함'] as const;

export default function ConditionCheckScreen() {
  const router = useRouter();
  const { completeStep, draft, skipStep, updateDraft } = useDailyCheck();
  const allComplete = draft.bodyParts.length === 0 || draft.bodyParts.every((id) => Boolean(draft.bodyAreaIntensities[id]));
  const setLevel = (id: string, level: number) => {
    const bodyAreaIntensities = { ...draft.bodyAreaIntensities, [id]: level };
    const max = Math.max(...Object.values(bodyAreaIntensities));
    const condition = max <= 1 ? 'great' : max === 2 ? 'good' : max === 3 ? 'okay' : max === 4 ? 'bad' : 'awful';
    updateDraft({ bodyAreaIntensities, intensity: max, condition });
  };
  const toggleFeel = (id: string, feel: string) => {
    const current = draft.bodyAreaFeelings[id] ?? [];
    const next = current.includes(feel) ? current.filter((item) => item !== feel) : [...current, feel];
    const bodyAreaFeelings = { ...draft.bodyAreaFeelings, [id]: next };
    updateDraft({ bodyAreaFeelings, discomfortFeelings: [...new Set(Object.values(bodyAreaFeelings).flat())] });
  };
  const next = () => { if (draft.bodyParts.length === 0) skipStep('condition'); else completeStep('condition'); router.push('/check/sleep'); };

  return <SafeAreaView edges={['top', 'bottom']} style={styles.screen}>
    <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      <CheckScreenHeader backLabel="불편 부위 선택으로 돌아가기" description="선택한 부위마다 강도와 느낌을 남겨주세요." fallbackHref="/check/discomfort" step={3} title="어느 정도로\n불편했나요?" />
      <View style={styles.cards}>{draft.bodyParts.length === 0 ? <View style={styles.empty}><Text style={styles.emptyTitle}>선택한 부위가 없어요</Text><Text style={styles.emptyBody}>이 단계는 건너뛰어도 괜찮아요.</Text></View> : draft.bodyParts.map((id) => {
        const level = draft.bodyAreaIntensities[id]; const feelings = draft.bodyAreaFeelings[id] ?? [];
        return <View key={id} style={styles.areaCard}><View style={styles.areaHead}><View style={styles.areaNameRow}><View style={styles.areaDot}/><Text style={styles.areaName}>{BODY_ZONE_LABELS[id] ?? id}</Text></View><Text style={styles.areaLevel}>{level ? `${level}단계` : '강도 선택'}</Text></View><View accessibilityRole="radiogroup" style={styles.levels}>{LEVELS.map((value) => <Pressable accessibilityRole="radio" accessibilityState={{ checked: level === value }} key={value} onPress={() => setLevel(id, value)} style={[styles.level, level === value && styles.levelSelected]}><Text style={[styles.levelText, level === value && styles.levelTextSelected]}>{value}</Text></Pressable>)}</View><Text style={styles.feelLabel}>어떤 느낌이었나요? <Text style={styles.optional}>(여러 개 선택)</Text></Text><View style={styles.feels}>{FEELS.map((feel) => <Pressable accessibilityRole="checkbox" accessibilityState={{ checked: feelings.includes(feel) }} key={feel} onPress={() => toggleFeel(id, feel)} style={[styles.feel, feelings.includes(feel) && styles.feelSelected]}><Text style={[styles.feelText, feelings.includes(feel) && styles.feelTextSelected]}>{feel}</Text></Pressable>)}</View></View>;
      })}<Pressable accessibilityRole="switch" accessibilityState={{ checked: draft.headache }} onPress={() => updateDraft({ headache: !draft.headache })} style={styles.headache}><View><Text style={styles.headacheTitle}>두통이 있었나요?</Text><Text style={styles.headacheBody}>불편과 함께 느낀 두통을 기록해요.</Text></View><View style={[styles.toggle, draft.headache && styles.toggleOn]}><View style={[styles.knob, draft.headache && styles.knobOn]}/></View></Pressable></View>
    </ScrollView><View style={styles.footer}><Pressable accessibilityRole="button" accessibilityState={{ disabled: !allComplete }} disabled={!allComplete} onPress={next} style={[styles.nextButton, !allComplete && styles.disabledNextButton]}><Text style={[styles.nextButtonText, !allComplete && styles.disabledNextButtonText]}>다음</Text></Pressable></View>
  </SafeAreaView>;
}
