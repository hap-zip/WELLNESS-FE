import { useRouter } from 'expo-router';
import { Pressable, ScrollView, Text, View } from 'react-native';

import { useDailyCheck } from '@/context/daily-check-context';

import { styles } from './sleep-check.styles';

const POSTURES = ['똑바로', '왼쪽으로', '오른쪽으로', '엎드려서', '잘 모르겠어요'] as const;
const PILLOWS = ['낮았어요', '적당했어요', '높았어요'] as const;

export default function SleepCheckScreen() {
  const router = useRouter();
  const { completeStep, draft, skipStep, updateDraft } = useDailyCheck();
  const canContinue = draft.sleepSatisfaction !== null && draft.sleepPosture !== null;

  return (
    <View style={styles.screen}>
      <View style={styles.progressTrack}><View style={styles.progressValue} /></View>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.topBar}><Pressable accessibilityLabel="불편 부위 선택으로 돌아가기" accessibilityRole="button" onPress={() => router.back()} style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}><Text style={styles.backIcon}>‹</Text></Pressable><Pressable accessibilityRole="button" onPress={() => { skipStep('sleep'); router.push('/check/activity-skin'); }} style={({ pressed }) => [styles.skipButton, pressed && styles.pressed]}><Text style={styles.skipText}>건너뛰기</Text></Pressable></View>
        <Text style={styles.step}>오늘의 체크 4 / 5</Text><Text style={styles.title}>어젯밤 잠은{`\n`}어떠셨나요?</Text><Text style={styles.description}>잠든 자세와 베개 높이도 함께 기록해 보세요.</Text>

        <Text style={styles.sectionTitle}>수면 만족도</Text>
        <View accessibilityRole="radiogroup" style={styles.ratingRow}>{[1, 2, 3, 4, 5].map((value) => { const selected = draft.sleepSatisfaction === value; return <Pressable accessibilityLabel={`수면 만족도 ${value}`} accessibilityRole="radio" accessibilityState={{ checked: selected }} key={value} onPress={() => updateDraft({ sleepSatisfaction: value })} style={({ pressed }) => [styles.ratingButton, selected && styles.selectedRating, pressed && styles.pressed]}><Text style={[styles.ratingFace, selected && styles.selectedText]}>{['😣', '😕', '😐', '🙂', '😊'][value - 1]}</Text><Text style={[styles.ratingNumber, selected && styles.selectedText]}>{value}</Text></Pressable>; })}</View>

        <Text style={styles.sectionTitle}>주로 어떤 자세로 잤나요?</Text>
        <View accessibilityRole="radiogroup" style={styles.optionList}>{POSTURES.map((item) => { const selected = draft.sleepPosture === item; return <Pressable accessibilityRole="radio" accessibilityState={{ checked: selected }} key={item} onPress={() => updateDraft({ sleepPosture: item })} style={({ pressed }) => [styles.option, selected && styles.selectedOption, pressed && styles.pressed]}><Text style={[styles.optionText, selected && styles.selectedOptionText]}>{item}</Text><View style={[styles.radio, selected && styles.selectedRadio]}>{selected ? <View style={styles.radioDot} /> : null}</View></Pressable>; })}</View>

        <Text style={styles.sectionTitle}>베개 높이는 어땠나요? <Text style={styles.optional}>(선택)</Text></Text>
        <View accessibilityRole="radiogroup" style={styles.pillowRow}>{PILLOWS.map((item) => { const selected = draft.pillow === item; return <Pressable accessibilityRole="radio" accessibilityState={{ checked: selected }} key={item} onPress={() => updateDraft({ pillow: item })} style={({ pressed }) => [styles.pillow, selected && styles.selectedOption, pressed && styles.pressed]}><Text style={[styles.optionText, selected && styles.selectedOptionText]}>{item}</Text></Pressable>; })}</View>
      </ScrollView>
      <View style={styles.footer}><Pressable accessibilityRole="button" accessibilityState={{ disabled: !canContinue }} disabled={!canContinue} onPress={() => { completeStep('sleep'); router.push('/check/activity-skin'); }} style={({ pressed }) => [styles.nextButton, !canContinue && styles.disabledButton, pressed && styles.pressed]}><Text style={[styles.nextText, !canContinue && styles.disabledText]}>다음</Text></Pressable></View>
    </View>
  );
}
