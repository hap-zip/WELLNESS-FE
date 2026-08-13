import { useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppIcon } from '@/components/app-icon';
import { CheckFlowHeader, CheckIntro } from '@/components/ui/check-screen-header';
import { useDailyCheck } from '@/context/daily-check-context';
import { wellnessApi } from '@/services/wellness-api';
import { colors } from '@/theme/tokens';
import { toLocalDateId } from '@/utils/date';

import { BODY_ZONE_LABELS } from './SelectableBodyMap';
import { reviewStyles as styles } from './review.styles';

export default function CheckReviewScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { draft } = useDailyCheck();
  const [saving, setSaving] = useState(false);
  const source = draft.autoSource === 'apple-health' ? 'Apple 건강' : draft.autoSource === 'health-connect' ? 'Health Connect' : '이전 기록';
  const parts = draft.bodyParts.map((id) => BODY_ZONE_LABELS[id] ?? '선택한 부위').join(', ') || '불편 없음';
  const save = async () => {
    if (saving) return;
    setSaving(true);
    try {
      await wellnessApi.saveDailyCheck({
        date: draft.targetDate ?? toLocalDateId(),
        autoRecords: { ...draft.autoRecords, source: draft.autoSource },
        condition: draft.condition,
        conditionTags: draft.conditionTags,
        discomfort: {
          bodyParts: [...draft.bodyParts],
          intensity: draft.intensity,
          feelings: draft.discomfortFeelings,
          headache: draft.headache,
          areas: draft.bodyParts.map((id) => ({ id, label: BODY_ZONE_LABELS[id] ?? '선택한 부위', view: id.startsWith('back-') ? 'back' : 'front', intensity: draft.bodyAreaIntensities[id] ?? 1, feelings: draft.bodyAreaFeelings[id] ?? [] })),
        },
        sleep: { satisfaction: null, posture: draft.sleepPosture, pillow: draft.pillow },
        activitySkin: { activity: null, activities: [], skinStates: [], trouble: false, troubleSpots: [], memo: '', photoUri: null },
        skippedSteps: [...new Set([...draft.skippedSteps.filter((step) => step !== 'condition'), 'activitySkin'])],
      });
      router.replace('/check/complete');
    } catch {
      Alert.alert('저장하지 못했어요', '네트워크 상태를 확인하고 다시 시도해 주세요.');
    } finally {
      setSaving(false);
    }
  };

  return <SafeAreaView edges={['top', 'bottom']} style={styles.screen}>
    <CheckFlowHeader backLabel="자세와 베개 기록으로 돌아가기" fallbackHref="/check/sleep" step={4} />
    <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 116 }]} showsVerticalScrollIndicator={false}>
      <CheckIntro description="자동 수집 값과 직접 남긴 기록을 확인해 주세요." inset={false} step={4} title="이렇게 저장할까요?" />
      <Group icon="moon" onEdit={() => router.push('/check/auto')} source={source} title="자동 수집" rows={[[ '수면 시간', draft.autoRecords.sleepDuration || '기록 없음' ], [ '걸음 수', draft.autoRecords.steps || '기록 없음' ], [ '활동 에너지', draft.autoRecords.activityEnergy || '기록 없음' ]]}/>
      <Group icon="person" onEdit={() => router.push('/check/discomfort')} source="직접 입력" title="불편" rows={[[ '부위', parts ], [ '강도', draft.intensity ? `${draft.intensity}단계` : '없음' ], [ '느낌', draft.discomfortFeelings.join(', ') || '선택 안 함' ]]}/>
      <Group icon="moon" onEdit={() => router.push('/check/sleep')} source="직접 입력" title="자세·베개" rows={[[ '잠든 자세', draft.sleepPosture || '미입력' ], [ '베개 높이', draft.pillow || '선택 안 함' ]]}/>
    </ScrollView>
    <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 12) }]}><Pressable accessibilityRole="button" accessibilityState={{ busy: saving, disabled: saving }} disabled={saving} onPress={() => void save()} style={[styles.saveButton, saving && styles.saveButtonDisabled]}>{saving ? <ActivityIndicator color={colors.primaryText}/> : <Text style={styles.saveText}>기록 저장하기</Text>}</Pressable></View>
  </SafeAreaView>;
}

function Group({ icon, onEdit, rows, source, title }: { icon: React.ComponentProps<typeof AppIcon>['name']; onEdit: () => void; rows: string[][]; source: string; title: string }) {
  return <View style={styles.group}><View style={styles.groupHead}><View style={[styles.groupIcon, title === '불편' && styles.groupIconDanger]}><AppIcon color={title === '불편' ? colors.danger : colors.primaryPressed} name={icon} size={18}/></View><Text style={styles.groupTitle}>{title}</Text><Text style={styles.source}>{source}</Text><Pressable accessibilityLabel={`${title} 기록 수정`} accessibilityRole="button" hitSlop={8} onPress={onEdit}><Text style={styles.edit}>수정</Text></Pressable></View>{rows.map(([label, value]) => <View key={label} style={styles.row}><Text style={styles.label}>{label}</Text><Text style={[styles.value, value === '미입력' && styles.missing]}>{value}</Text></View>)}</View>;
}
