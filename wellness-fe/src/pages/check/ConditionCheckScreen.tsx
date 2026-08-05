import { useRouter } from 'expo-router';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import NavigationBackButton from '@/components/navigation-back-button';
import { useDailyCheck } from '@/context/daily-check-context';

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

  const moveToNextStep = () => router.push('/check/sleep');
  const toggleTag = (tag: string) => updateDraft({
    conditionTags: draft.conditionTags.includes(tag)
      ? draft.conditionTags.filter((item) => item !== tag)
      : [...draft.conditionTags, tag],
  });

  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.screen}>
      <View style={styles.progressTrack}>
        <View style={styles.progressValue} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.topBar}>
          <View style={styles.backButton}><NavigationBackButton accessibilityLabel="자동 수집 확인으로 돌아가기" fallbackHref="/check/auto" /></View>
          <Pressable
            accessibilityRole="button"
            onPress={() => { skipStep('condition'); moveToNextStep(); }}
            style={({ pressed }) => [styles.skipButton, pressed && styles.pressed]}>
            <Text style={styles.skipText}>건너뛰기</Text>
          </Pressable>
        </View>

        <View style={styles.header}>
          <Text style={styles.step}>오늘의 체크 2 / 5</Text>
          <Text style={styles.title}>오늘 컨디션은{`\n`}어떠세요?</Text>
          <Text style={styles.description}>지금 느껴지는 상태와 가장 가까운 항목을 골라주세요.</Text>
        </View>

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
                <View style={[styles.radio, selected && styles.selectedRadio]}>
                  {selected ? <View style={styles.radioDot} /> : null}
                </View>
                <View style={styles.conditionCopy}>
                  <Text style={styles.conditionTitle}>{condition.title}</Text>
                  <Text style={styles.conditionDescription}>{condition.description}</Text>
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
                <Text style={[styles.tagText, draft.conditionTags.includes(tag) && styles.selectedTagText]}># {tag}</Text>
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
