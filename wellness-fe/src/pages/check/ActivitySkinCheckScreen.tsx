import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Linking, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { SafeAreaView } from 'react-native-safe-area-context';

import NavigationBackButton from '@/components/navigation-back-button';
import { AppIcon } from '@/components/app-icon';
import { useDailyCheck } from '@/context/daily-check-context';
import { wellnessApi } from '@/services/wellness-api';
import { colors } from '@/theme/tokens';

import { styles } from './activity-skin-check.styles';
import { CheckIntro, CheckProgress } from '@/components/ui/check-screen-header';
import { BODY_ZONE_LABELS } from './SelectableBodyMap';
import { toLocalDateId, toMonthDayLabel } from '@/utils/date';

const ACTIVITIES = [
  { id: 'low', title: '거의 움직이지 않았어요', detail: '주로 앉거나 누워 있었어요' },
  { id: 'normal', title: '가볍게 움직였어요', detail: '평소와 비슷한 활동량이에요' },
  { id: 'high', title: '활동량이 많았어요', detail: '운동하거나 오래 걸었어요' },
] as const;
const SKIN_STATES = ['괜찮아요', '건조해요', '가려워요', '붉어졌어요', '트러블이 있어요'] as const;

export default function ActivitySkinCheckScreen() {
  const router = useRouter();
  const { completeStep, draft, skipStep, updateDraft } = useDailyCheck();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [photoError, setPhotoError] = useState('');
  const dateLabel = toMonthDayLabel(draft.targetDate);

  const toggleSkin = (value: string) => {
    if (value === '괜찮아요') {
      updateDraft({ skinStates: draft.skinStates.includes(value) ? [] : [value] });
      return;
    }
    const symptoms = draft.skinStates.filter((item) => item !== '괜찮아요');
    updateDraft({ skinStates: symptoms.includes(value) ? symptoms.filter((item) => item !== value) : [...symptoms, value] });
  };
  const canComplete = draft.activity !== null && draft.skinStates.length > 0;
  const chooseSkinPhoto = async (source: 'camera' | 'library') => {
    setPhotoError('');
    try {
      const permission = source === 'camera' ? await ImagePicker.requestCameraPermissionsAsync() : await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('권한이 필요해요', source === 'camera' ? '기기 설정에서 카메라 접근을 허용해 주세요.' : '기기 설정에서 사진 접근을 허용해 주세요.', [{text:'취소',style:'cancel'},{text:'설정 열기',onPress:()=>void Linking.openSettings()}]);
        return;
      }
      const result = source === 'camera'
        ? await ImagePicker.launchCameraAsync({ mediaTypes: ['images'], allowsEditing: true, quality: 0.75 })
        : await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsEditing: true, quality: 0.75 });
      if (!result.canceled && result.assets[0]?.uri) updateDraft({ skinPhotoUri: result.assets[0].uri });
    } catch {
      setPhotoError(source === 'camera' ? '카메라를 열지 못했어요. 상태 선택만으로도 기록할 수 있어요.' : '사진을 불러오지 못했어요. 다른 사진을 선택하거나 사진 없이 계속해 주세요.');
    }
  };
  const submit = async (skipped = false) => {
    if ((!canComplete && !skipped) || isSubmitting) return;
    setIsSubmitting(true);
    try {
      await wellnessApi.saveDailyCheck({
        date: draft.targetDate ?? toLocalDateId(),
        autoRecords: { ...draft.autoRecords, source: draft.autoSource },
        condition: draft.condition,
        conditionTags: draft.conditionTags,
        discomfort: { bodyParts: draft.bodyParts.map((part) => part), intensity: draft.intensity, feelings: draft.discomfortFeelings, areas: draft.bodyParts.map((id) => ({ id, label: BODY_ZONE_LABELS[id] ?? id, view: id.startsWith('back-') ? 'back' : 'front', intensity: draft.bodyAreaIntensities[id] })) },
        sleep: { satisfaction: draft.sleepSatisfaction, posture: draft.sleepPosture, pillow: draft.pillow },
        activitySkin: skipped ? { activity: null, skinStates: [], memo: '', photoUri: null } : { activity: draft.activity, skinStates: draft.skinStates, memo: draft.memo, photoUri: draft.skinPhotoUri },
        skippedSteps: skipped && !draft.skippedSteps.includes('activitySkin') ? [...draft.skippedSteps, 'activitySkin'] : draft.skippedSteps,
      });
      if (skipped) skipStep('activitySkin'); else completeStep('activitySkin');
      router.replace('/check/complete');
    } catch {
      Alert.alert('저장하지 못했어요', '네트워크 상태를 확인하고 다시 시도해 주세요.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.screen}>
      <CheckProgress step={5} />
      <ScrollView automaticallyAdjustKeyboardInsets contentContainerStyle={styles.content} keyboardDismissMode="interactive" keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <View style={styles.topBar}><View style={styles.backButton}><NavigationBackButton accessibilityLabel="불편 부위 체크로 돌아가기" fallbackHref="/check/discomfort" /></View><Pressable accessibilityRole="button" disabled={isSubmitting} onPress={() => void submit(true)} style={({ pressed }) => [styles.skipButton, pressed && styles.pressed]}><Text style={styles.skipText}>건너뛰기</Text></Pressable></View>
        <CheckIntro description="작은 변화도 쌓이면 내 몸의 패턴을 찾는 데 도움이 돼요." inset={false} step={5} title={`${dateLabel} 활동과 피부는\n어땠나요?`} />

        <Text style={styles.sectionTitle}>활동량</Text>
        <View accessibilityRole="radiogroup" style={styles.cardList}>{ACTIVITIES.map((item) => { const selected = draft.activity === item.id; return <Pressable accessibilityRole="radio" accessibilityState={{ checked: selected }} key={item.id} onPress={() => updateDraft({ activity: item.id })} style={({ pressed }) => [styles.card, selected && styles.selectedCard, pressed && styles.pressed]}><View style={[styles.radio,selected&&styles.selectedRadio]}>{selected?<View style={styles.radioDot}/>:null}</View><View style={styles.cardCopy}><Text style={[styles.cardTitle, selected && styles.selectedCardTitle]}>{item.title}</Text><Text style={[styles.cardDetail, selected && styles.selectedCardDetail]}>{item.detail}</Text></View></Pressable>; })}</View>

        <Text style={styles.sectionTitle}>피부 상태</Text>
        <View style={styles.chips}>{SKIN_STATES.map((item) => { const selected = draft.skinStates.includes(item); return <Pressable accessibilityRole="checkbox" accessibilityState={{ checked: selected }} key={item} onPress={() => toggleSkin(item)} style={({ pressed }) => [styles.chip, selected && styles.selectedChip, pressed && styles.pressed]}><Text style={[styles.chipText, selected && styles.selectedChipText]}>{item}</Text></Pressable>; })}</View>

        <Text style={styles.sectionTitle}>피부 사진 <Text style={styles.optional}>(선택)</Text></Text>
        <Text style={styles.photoHelp}>사진은 변화 비교를 위한 기록이며 상태 선택만으로도 완료할 수 있어요.</Text>
        {draft.skinPhotoUri ? <View style={styles.photoPreview}><Image accessibilityLabel="선택한 피부 상태 사진" contentFit="cover" onError={()=>setPhotoError('사진을 표시하지 못했어요. 삭제한 뒤 다시 선택해 주세요.')} source={{ uri: draft.skinPhotoUri }} style={styles.photo}/><Pressable accessibilityLabel="피부 사진 삭제" accessibilityRole="button" onPress={() => {updateDraft({ skinPhotoUri: null });setPhotoError('');}} style={({ pressed }) => [styles.removePhoto, pressed && styles.pressed]}><AppIcon color={colors.white} name="close" size={18}/></Pressable></View> : <View style={styles.photoActions}><Pressable accessibilityLabel="피부 사진 촬영하기" accessibilityRole="button" onPress={() => void chooseSkinPhoto('camera')} style={({ pressed }) => [styles.photoAction, pressed && styles.pressed]}><AppIcon color={colors.primary} name="camera" size={22}/><Text style={styles.photoActionText}>촬영하기</Text></Pressable><Pressable accessibilityLabel="앨범에서 피부 사진 선택" accessibilityRole="button" onPress={() => void chooseSkinPhoto('library')} style={({ pressed }) => [styles.photoAction, pressed && styles.pressed]}><AppIcon color={colors.primary} name="image" size={22}/><Text style={styles.photoActionText}>앨범에서 선택</Text></Pressable></View>}
        {photoError ? <Text accessibilityLiveRegion="polite" style={styles.photoError}>{photoError}</Text> : null}

        <Text style={styles.sectionTitle}>남기고 싶은 메모 <Text style={styles.optional}>(선택)</Text></Text>
        <TextInput accessibilityLabel={`${dateLabel} 활동과 피부 메모`} maxLength={120} multiline onChangeText={(memo) => updateDraft({ memo })} placeholder="평소와 달랐던 점을 적어주세요." placeholderTextColor={colors.textMuted} style={styles.memo} textAlignVertical="top" value={draft.memo} />
        <Text style={styles.count}>{draft.memo.length} / 120</Text>
      </ScrollView>
      <View style={styles.footer}><Pressable accessibilityRole="button" accessibilityState={{ disabled: !canComplete, busy: isSubmitting }} disabled={!canComplete || isSubmitting} onPress={() => void submit()} style={({ pressed }) => [styles.completeButton, (!canComplete || isSubmitting) && styles.disabledButton, pressed && styles.pressed]}><Text style={[styles.completeText, !canComplete && styles.disabledText]}>{isSubmitting ? '저장 중…' : '기록 완료'}</Text></Pressable></View>
    </SafeAreaView>
  );
}
