import { useRouter } from 'expo-router';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import NavigationBackButton from '@/components/navigation-back-button';
import { useDailyCheck } from '@/context/daily-check-context';

import { styles } from './discomfort-check.styles';
import { BODY_ZONE_LABELS, SelectableBodyMap } from './SelectableBodyMap';
import { CheckIntro, CheckProgress } from '@/components/ui/check-screen-header';
import { toMonthDayLabel } from '@/utils/date';

const FEELINGS = ['뻐근해요', '쑤셔요', '저려요', '당겨요', '화끈거려요'] as const;
const INTENSITY_HELP = ['거의 느껴지지 않아요', '조금 신경 쓰여요', '움직일 때 불편해요', '일상에 영향을 줘요', '활동하기 매우 어려워요'];

export default function DiscomfortCheckScreen() {
  const router = useRouter();
  const { completeStep, draft, skipStep, updateDraft } = useDailyCheck();
  const dateLabel = toMonthDayLabel(draft.targetDate);
  const toggleBodyPart = (zone: { id: string }) => {
    if (draft.bodyParts.includes(zone.id)) {
      const nextIntensities = { ...draft.bodyAreaIntensities };
      delete nextIntensities[zone.id];
      const nextParts = draft.bodyParts.filter((item) => item !== zone.id);
      updateDraft({ bodyParts: nextParts, bodyAreaIntensities: nextIntensities, intensity: Math.max(0, ...Object.values(nextIntensities)) || null });
    } else updateDraft({ bodyParts: [...draft.bodyParts, zone.id] });
  };
  const setAreaIntensity = (part: string, value: number) => {
    const next = { ...draft.bodyAreaIntensities, [part]: value };
    updateDraft({ bodyAreaIntensities: next, intensity: Math.max(...Object.values(next)) });
  };
  const toggleFeeling = (value: string) => updateDraft({ discomfortFeelings: draft.discomfortFeelings.includes(value) ? draft.discomfortFeelings.filter((item) => item !== value) : [...draft.discomfortFeelings, value] });
  const canContinue = draft.bodyParts.length > 0 && draft.bodyParts.every((part) => draft.bodyAreaIntensities[part] !== undefined);

  return <SafeAreaView edges={['top', 'bottom']} style={styles.screen}>
    <CheckProgress step={4} />
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.topBar}><View style={styles.backButton}><NavigationBackButton accessibilityLabel="수면 체크로 돌아가기" fallbackHref="/check/sleep" /></View><Pressable accessibilityRole="button" onPress={() => { skipStep('discomfort'); router.push('/check/activity-skin'); }} style={({ pressed }) => [styles.skipButton, pressed && styles.pressed]}><Text style={styles.skipText}>불편한 곳 없음</Text></Pressable></View>
      <CheckIntro description="앞·뒤와 좌우를 구분해 여러 부위를 선택할 수 있어요." inset={false} step={4} title={`${dateLabel} 불편한 곳을\n표시해 주세요`} />
      <Text style={styles.sectionTitle}>불편한 부위</Text>
      <SelectableBodyMap onChangeView={(bodyView) => updateDraft({ bodyView })} onToggle={toggleBodyPart} selected={draft.bodyParts} view={draft.bodyView} />

      {draft.bodyParts.length > 0 ? <><Text style={styles.sectionTitle}>부위별 불편 강도</Text><Text style={styles.sectionDescription}>선택한 곳마다 현재 느끼는 강도를 기록해 주세요.</Text>{draft.bodyParts.map((part) => { const value = draft.bodyAreaIntensities[part]; return <View key={part} style={styles.intensityBlock}><View style={styles.areaHeading}><Text style={styles.areaTitle}>{BODY_ZONE_LABELS[part] ?? part}</Text><Text style={styles.areaValue}>{value ? `${value}단계` : '선택 필요'}</Text></View><View accessibilityRole="radiogroup" style={styles.scaleRow}>{[1, 2, 3, 4, 5].map((level) => <Pressable accessibilityLabel={`${BODY_ZONE_LABELS[part] ?? part} 불편 강도 ${level}, ${INTENSITY_HELP[level - 1]}`} accessibilityRole="radio" accessibilityState={{ checked: value === level }} key={level} onPress={() => setAreaIntensity(part, level)} style={({ pressed }) => [styles.scaleButton, value === level && styles.selectedScaleButton, pressed && styles.pressed]}><Text style={[styles.scaleText, value === level && styles.selectedScaleText]}>{level}</Text></Pressable>)}</View>{value ? <Text style={styles.intensityHelp}>{INTENSITY_HELP[value - 1]}</Text> : null}</View>; })}</> : null}

      <Text style={styles.sectionTitle}>어떤 느낌인가요? <Text style={styles.optional}>(선택)</Text></Text>
      <View style={styles.chipGroup}>{FEELINGS.map((feeling) => { const selected = draft.discomfortFeelings.includes(feeling); return <Pressable accessibilityRole="checkbox" accessibilityState={{ checked: selected }} key={feeling} onPress={() => toggleFeeling(feeling)} style={({ pressed }) => [styles.chip, selected && styles.selectedChip, pressed && styles.pressed]}><Text style={[styles.chipText, selected && styles.selectedChipText]}>{feeling}</Text></Pressable>; })}</View>
    </ScrollView>
    <View style={styles.footer}><Pressable accessibilityRole="button" accessibilityState={{ disabled: !canContinue }} disabled={!canContinue} onPress={() => { completeStep('discomfort'); router.push('/check/activity-skin'); }} style={({ pressed }) => [styles.nextButton, !canContinue && styles.disabledButton, pressed && styles.pressed]}><Text style={[styles.nextText, !canContinue && styles.disabledText]}>다음</Text></Pressable></View>
  </SafeAreaView>;
}
