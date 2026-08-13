import { useRouter } from 'expo-router';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CheckFlowHeader, CheckIntro } from '@/components/ui/check-screen-header';
import { useDailyCheck } from '@/context/daily-check-context';

import { styles } from './sleep-check.styles';
import SleepPillowIllustration, { type PillowHeight } from './SleepPillowIllustration';
import SleepPostureIllustration, { type SleepPosture } from './SleepPostureIllustration';

const POSTURES: readonly SleepPosture[] = ['똑바로', '왼쪽으로', '엎드려서', '잘 모르겠어요'];
const PILLOWS: readonly { label: string; value: PillowHeight }[] = [
  { label: '낮았어요', value: 'low' },
  { label: '적당했어요', value: 'medium' },
  { label: '높았어요', value: 'high' },
];

export default function SleepCheckScreen() {
  const router = useRouter();
  const { completeStep, draft, updateDraft } = useDailyCheck();
  const canContinue = draft.sleepPosture !== null;
  return <SafeAreaView edges={['top', 'bottom']} style={styles.screen}>
    <CheckFlowHeader backLabel="불편 기록으로 돌아가기" fallbackHref="/check/discomfort" step={3} />
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <CheckIntro description="수면 시간은 건강 데이터에서 자동으로 가져왔어요." inset={false} step={3} title="잠든 자세를 알려주세요" />
      <Text style={styles.sectionTitle}>주로 어떤 자세로 잤나요?</Text>
      <View accessibilityRole="radiogroup" style={styles.postureGrid}>{POSTURES.map((item) => {
        const selected = draft.sleepPosture === item;
        return <Pressable accessibilityLabel={`수면 자세 ${item}`} accessibilityRole="radio" accessibilityState={{ checked: selected }} key={item} onPress={() => updateDraft({ sleepPosture: item })} style={({ pressed }) => [styles.postureCard, selected && styles.selectedPostureCard, pressed && styles.pressed]}><SleepPostureIllustration posture={item} selected={selected} /><View style={styles.postureLabelRow}><Text style={[styles.optionText, selected && styles.selectedOptionText]}>{item}</Text><View style={[styles.radio, selected && styles.selectedRadio]}>{selected ? <View style={styles.radioDot} /> : null}</View></View></Pressable>;
      })}</View>
      <Text style={styles.sectionTitle}>베개 높이는 어땠나요? <Text style={styles.optional}>(선택)</Text></Text>
      <View accessibilityRole="radiogroup" style={styles.pillowRow}>{PILLOWS.map(({ label, value }) => {
        const selected = draft.pillow === label;
        return <Pressable accessibilityLabel={`베개 높이 ${label}`} accessibilityRole="radio" accessibilityState={{ checked: selected }} key={value} onPress={() => updateDraft({ pillow: label })} style={({ pressed }) => [styles.pillow, selected && styles.selectedOption, pressed && styles.pressed]}><SleepPillowIllustration height={value} selected={selected} /><Text style={[styles.optionText, styles.pillowText, selected && styles.selectedOptionText]}>{label}</Text></Pressable>;
      })}</View>
    </ScrollView>
    <View style={styles.footer}><Pressable accessibilityRole="button" accessibilityState={{ disabled: !canContinue }} disabled={!canContinue} onPress={() => { completeStep('sleep'); router.push('/check/review'); }} style={({ pressed }) => [styles.nextButton, !canContinue && styles.disabledButton, pressed && styles.pressed]}><Text style={[styles.nextText, !canContinue && styles.disabledText]}>다음</Text></Pressable></View>
  </SafeAreaView>;
}
