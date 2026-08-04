import { useRouter } from 'expo-router';
import { Pressable, ScrollView, Text, View } from 'react-native';

import { useDailyCheck } from '@/context/daily-check-context';

import { styles } from './discomfort-check.styles';

const BODY_PARTS = ['목', '어깨', '허리', '무릎', '손목', '기타'] as const;
const FEELINGS = ['뻐근해요', '쑤셔요', '저려요', '당겨요', '화끈거려요'] as const;

export default function DiscomfortCheckScreen() {
  const router = useRouter();
  const { completeStep, draft, skipStep, updateDraft } = useDailyCheck();

  const toggleBodyPart = (value: string) => updateDraft({ bodyParts: draft.bodyParts.includes(value) ? draft.bodyParts.filter((item) => item !== value) : [...draft.bodyParts, value] });
  const toggleFeeling = (value: string) => updateDraft({ discomfortFeelings: draft.discomfortFeelings.includes(value) ? draft.discomfortFeelings.filter((item) => item !== value) : [...draft.discomfortFeelings, value] });
  const canContinue = draft.bodyParts.length > 0 && draft.intensity !== null;

  return (
    <View style={styles.screen}>
      <View style={styles.progressTrack}><View style={styles.progressValue} /></View>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.topBar}>
          <Pressable accessibilityLabel="컨디션 선택으로 돌아가기" accessibilityRole="button" onPress={() => router.back()} style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}><Text style={styles.backIcon}>‹</Text></Pressable>
          <Pressable accessibilityRole="button" onPress={() => { skipStep('discomfort'); router.push('/check/sleep'); }} style={({ pressed }) => [styles.skipButton, pressed && styles.pressed]}><Text style={styles.skipText}>건너뛰기</Text></Pressable>
        </View>
        <Text style={styles.step}>오늘의 체크 3 / 5</Text>
        <Text style={styles.title}>불편한 곳이{`\n`}있나요?</Text>
        <Text style={styles.description}>여러 부위를 선택해도 괜찮아요.</Text>

        <Text style={styles.sectionTitle}>불편한 부위</Text>
        <View style={styles.chipGroup}>
          {BODY_PARTS.map((part) => {
            const selected = draft.bodyParts.includes(part);
            return <Pressable accessibilityRole="checkbox" accessibilityState={{ checked: selected }} key={part} onPress={() => toggleBodyPart(part)} style={({ pressed }) => [styles.chip, selected && styles.selectedChip, pressed && styles.pressed]}><Text style={[styles.chipText, selected && styles.selectedChipText]}>{part}</Text></Pressable>;
          })}
        </View>

        <Text style={styles.sectionTitle}>불편함 강도</Text>
        <View style={styles.scaleRow}>
          {[1, 2, 3, 4, 5].map((value) => {
            const selected = draft.intensity === value;
            return <Pressable accessibilityLabel={`불편함 강도 ${value}`} accessibilityRole="radio" accessibilityState={{ checked: selected }} key={value} onPress={() => updateDraft({ intensity: value })} style={({ pressed }) => [styles.scaleButton, selected && styles.selectedScaleButton, pressed && styles.pressed]}><Text style={[styles.scaleText, selected && styles.selectedScaleText]}>{value}</Text></Pressable>;
          })}
        </View>
        <View style={styles.scaleLabels}><Text style={styles.scaleLabel}>거의 없어요</Text><Text style={styles.scaleLabel}>매우 불편해요</Text></View>

        <Text style={styles.sectionTitle}>어떤 느낌인가요? <Text style={styles.optional}>(선택)</Text></Text>
        <View style={styles.chipGroup}>
          {FEELINGS.map((feeling) => {
            const selected = draft.discomfortFeelings.includes(feeling);
            return <Pressable accessibilityRole="checkbox" accessibilityState={{ checked: selected }} key={feeling} onPress={() => toggleFeeling(feeling)} style={({ pressed }) => [styles.chip, selected && styles.selectedChip, pressed && styles.pressed]}><Text style={[styles.chipText, selected && styles.selectedChipText]}>{feeling}</Text></Pressable>;
          })}
        </View>
      </ScrollView>
      <View style={styles.footer}><Pressable accessibilityRole="button" accessibilityState={{ disabled: !canContinue }} disabled={!canContinue} onPress={() => { completeStep('discomfort'); router.push('/check/sleep'); }} style={({ pressed }) => [styles.nextButton, !canContinue && styles.disabledButton, pressed && styles.pressed]}><Text style={[styles.nextText, !canContinue && styles.disabledText]}>다음</Text></Pressable></View>
    </View>
  );
}
