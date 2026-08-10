import { useRouter } from 'expo-router';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useDailyCheck } from '@/context/daily-check-context';
import { CheckScreenHeader } from '@/components/ui/check-screen-header';
import { toMonthDayLabel } from '@/utils/date';

import { styles } from './condition-check.styles';

const CONDITIONS = [
  { id: 'great', title: '매우 좋아요', description: '몸도 마음도 가벼워요' },
  { id: 'good', title: '좋아요', description: '무리 없이 괜찮은 하루예요' },
  { id: 'okay', title: '보통이에요', description: '평소와 비슷한 상태예요' },
  { id: 'bad', title: '별로예요', description: '조금 피곤하거나 불편해요' },
  { id: 'awful', title: '많이 안 좋아요', description: '쉬어가고 싶은 상태예요' },
] as const;

const RECENT_TAGS = ['피곤해요', '무기력해요', '상쾌해요'] as const;

export default function ConditionCheckScreen() {
  const router = useRouter();
  const { completeStep, draft, skipStep, updateDraft } = useDailyCheck();
  const dateLabel = toMonthDayLabel(draft.targetDate);

  const moveToNextStep = () => router.push('/check/sleep');
  const toggleTag = (tag: string) => updateDraft({
    conditionTags: draft.conditionTags.includes(tag)
      ? draft.conditionTags.filter((item) => item !== tag)
      : [...draft.conditionTags, tag],
  });

  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.screen}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <CheckScreenHeader
          backLabel="자동 수집 확인으로 돌아가기"
          description="지금 느껴지는 상태와 가장 가까운 항목을 골라주세요."
          fallbackHref="/check/auto"
          onSkip={() => { skipStep('condition'); moveToNextStep(); }}
          step={2}
          title={`${dateLabel} 컨디션은\n어떠셨나요?`}
        />

        <View accessibilityRole="radiogroup" style={styles.conditionList}>
          {CONDITIONS.map((condition) => {
            const selected = draft.condition === condition.id;

            return (
              <Pressable
                accessibilityLabel={`${condition.title}, ${condition.description}`}
                accessibilityRole="radio"
                accessibilityState={{ checked: selected }}
                key={condition.id}
                onPress={() => updateDraft({ condition: condition.id })}
                style={({ pressed }) => [
                  styles.conditionCard,
                  selected && styles.selectedConditionCard,
                  pressed && styles.pressed,
                ]}>
                <View style={[styles.radio, selected && styles.selectedRadio]}>{selected ? <View style={styles.radioDot}/> : null}</View>
                <View style={styles.conditionCopy}>
                  <Text style={[styles.conditionTitle, selected && styles.selectedConditionTitle]}>{condition.title}</Text>
                  <Text style={[styles.conditionDescription, selected && styles.selectedConditionDescription]}>{condition.description}</Text>
                </View>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.recentSection}>
          <Text style={styles.recentTitle}>최근 자주 기록한 상태</Text>
          <View style={styles.tags}>
            {RECENT_TAGS.map((tag) => (
              <Pressable
                accessibilityRole="checkbox"
                accessibilityState={{ checked: draft.conditionTags.includes(tag) }}
                key={tag}
                onPress={() => toggleTag(tag)}
                style={({ pressed }) => [styles.tag, draft.conditionTags.includes(tag) && styles.selectedTag, pressed && styles.pressed]}>
                <Text style={[styles.tagText, draft.conditionTags.includes(tag) && styles.selectedTagText]}>{tag}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ disabled: draft.condition === null }}
          disabled={draft.condition === null}
          onPress={() => { completeStep('condition'); moveToNextStep(); }}
          style={({ pressed }) => [
            styles.nextButton,
            draft.condition === null && styles.disabledNextButton,
            pressed && styles.pressed,
          ]}>
          <Text style={[styles.nextButtonText, draft.condition === null && styles.disabledNextButtonText]}>다음</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
