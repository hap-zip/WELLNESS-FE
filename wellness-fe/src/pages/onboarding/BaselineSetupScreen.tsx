import DateTimePicker from '@react-native-community/datetimepicker';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Modal, Platform, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppIcon } from '@/components/app-icon';
import NavigationBackButton from '@/components/navigation-back-button';
import { SetupProgress } from '@/components/ui/auth-flow';
import type { BaselineProfile } from '@/domain/wellness';
import { wellnessApi } from '@/services/wellness-api';
import { colors } from '@/theme/tokens';

import { styles } from './baseline.styles';

type TimeField = 'bedtime' | 'wakeTime' | 'notificationTime';
const AREAS = ['목', '어깨', '허리', '무릎', '손목'] as const;
const ACTIVITY_LEVELS = [
  { value: '낮음' as const, title: '주로 앉아서 보내요', description: '이동과 운동이 적은 편이에요.' },
  { value: '보통' as const, title: '생활 속에서 가볍게 움직여요', description: '출퇴근이나 산책 정도로 움직여요.' },
  { value: '높음' as const, title: '규칙적으로 많이 움직여요', description: '운동하거나 활동하는 시간이 길어요.' },
];

const atTime = (hours: number, minutes: number) => { const date = new Date(); date.setHours(hours, minutes, 0, 0); return date; };
const formatTime = (value: Date) => value.toLocaleTimeString('ko-KR', { hour: 'numeric', minute: '2-digit' });

export default function BaselineSetupScreen() {
  const router = useRouter();
  const [activePicker, setActivePicker] = useState<TimeField | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [profile, setProfile] = useState<BaselineProfile>({ bedtime: atTime(0, 30), wakeTime: atTime(7, 0), discomfortAreas: [], activityLevel: '보통', notificationTime: atTime(21, 0) });

  const updateTime = (field: TimeField, value: Date) => setProfile((current) => ({ ...current, [field]: value }));
  const openPicker = (field: TimeField) => {
    setSaveError('');
    if (Platform.OS === 'android') setActivePicker(field);
    else setActivePicker(field);
  };
  const toggleArea = (area: string) => setProfile((current) => ({ ...current, discomfortAreas: current.discomfortAreas.includes(area) ? current.discomfortAreas.filter((item) => item !== area) : [...current.discomfortAreas, area] }));
  const submit = async () => {
    if (isSaving) return;
    setIsSaving(true); setSaveError('');
    try { await wellnessApi.saveBaseline(profile); router.replace('/(onboarding)/health-connect'); }
    catch { setSaveError('기본 상태를 저장하지 못했어요. 입력은 그대로 두었으니 다시 시도해 주세요.'); }
    finally { setIsSaving(false); }
  };

  return <SafeAreaView edges={['top', 'bottom']} style={styles.screen}>
    <View style={styles.topBar}><NavigationBackButton accessibilityLabel="동의 화면으로 돌아가기" fallbackHref="/(onboarding)/consent"/><View style={styles.progressWrap}><SetupProgress current={2}/></View><View style={styles.topSpacer}/></View>
    <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      <View style={styles.header}><Text accessibilityRole="header" style={styles.title}>평소의 몸 상태를{`\n`}기준으로 남겨주세요.</Text><Text style={styles.description}>정답은 없어요. 지금 알고 있는 만큼만 선택하고 나중에 마이에서 바꿀 수 있어요.</Text></View>

      <View style={styles.sections}>
        <View style={styles.section}><Text style={styles.sectionTitle}>평소 수면</Text><Text style={styles.sectionDescription}>자동 건강 데이터가 없을 때 비교 기준으로 사용해요.</Text><TimeRow label="잠드는 시간" onPress={() => openPicker('bedtime')} value={formatTime(profile.bedtime)}/><TimeRow label="일어나는 시간" onPress={() => openPicker('wakeTime')} value={formatTime(profile.wakeTime)}/></View>

        <View style={styles.section}><Text style={styles.sectionTitle}>자주 불편한 부위 <Text style={styles.optional}>선택</Text></Text><Text style={styles.sectionDescription}>없다면 선택하지 않고 넘어가도 괜찮아요.</Text><View style={styles.chips}>{AREAS.map((area) => { const selected = profile.discomfortAreas.includes(area); return <Pressable accessibilityRole="checkbox" accessibilityState={{ checked: selected }} key={area} onPress={() => toggleArea(area)} style={({ pressed }) => [styles.chip, selected && styles.selectedChip, pressed && styles.pressed]}><Text style={[styles.chipText, selected && styles.selectedChipText]}>{area}</Text>{selected ? <AppIcon color={colors.body} name="check" size={15} strokeWidth={2.4}/> : null}</Pressable>; })}</View></View>

        <View style={styles.section}><Text style={styles.sectionTitle}>평소 활동량</Text><View accessibilityRole="radiogroup" style={styles.activityList}>{ACTIVITY_LEVELS.map((item) => { const selected = profile.activityLevel === item.value; return <Pressable accessibilityRole="radio" accessibilityState={{ checked: selected }} key={item.value} onPress={() => setProfile((current) => ({ ...current, activityLevel: item.value }))} style={({ pressed }) => [styles.activityRow, selected && styles.selectedActivityRow, pressed && styles.pressed]}><View style={[styles.radio, selected && styles.selectedRadio]}>{selected ? <View style={styles.radioDot}/> : null}</View><View style={styles.activityCopy}><Text style={[styles.activityTitle, selected && styles.selectedActivityTitle]}>{item.title}</Text><Text style={styles.activityDescription}>{item.description}</Text></View></Pressable>; })}</View></View>

        <View style={styles.section}><Text style={styles.sectionTitle}>기록 알림 시간</Text><Text style={styles.sectionDescription}>알림 권한은 앱을 시작한 뒤 다시 확인해요.</Text><TimeRow label="매일 알림" onPress={() => openPicker('notificationTime')} value={formatTime(profile.notificationTime)}/></View>
      </View>
      <View style={styles.notice}><View style={styles.noticeLine}/><Text style={styles.noticeText}>질환명이나 복용 약처럼 민감한 의료 정보는 이 단계에서 받지 않아요.</Text></View>
      {saveError ? <Text accessibilityRole="alert" accessibilityLiveRegion="assertive" style={styles.errorText}>{saveError}</Text> : null}
    </ScrollView>
    <View style={styles.footer}><Pressable accessibilityRole="button" accessibilityState={{ busy: isSaving }} disabled={isSaving} onPress={() => void submit()} style={({ pressed }) => [styles.nextButton, isSaving && styles.disabledButton, pressed && styles.pressed]}>{isSaving ? <ActivityIndicator color={colors.primaryText}/> : <Text style={styles.nextButtonText}>기준 저장하고 계속</Text>}</Pressable></View>

    <Modal animationType="slide" onRequestClose={() => setActivePicker(null)} transparent visible={activePicker !== null}><Pressable accessibilityLabel="시간 선택 닫기" accessibilityRole="button" onPress={() => setActivePicker(null)} style={styles.modalOverlay}><Pressable accessibilityRole="none" onPress={(event) => event.stopPropagation()} style={styles.pickerSheet}><View style={styles.pickerHandle}/><View style={styles.pickerHeader}><Text style={styles.pickerTitle}>{activePicker === 'bedtime' ? '잠드는 시간' : activePicker === 'wakeTime' ? '일어나는 시간' : '알림 시간'}</Text><Pressable accessibilityRole="button" onPress={() => setActivePicker(null)} style={styles.doneButton}><Text style={styles.doneText}>완료</Text></Pressable></View>{activePicker ? <DateTimePicker display="spinner" locale="ko-KR" mode="time" onChange={(_, value) => { if (value) updateTime(activePicker, value); }} value={profile[activePicker]}/> : null}</Pressable></Pressable></Modal>
  </SafeAreaView>;
}

function TimeRow({ label, onPress, value }: { label: string; onPress: () => void; value: string }) {
  return <Pressable accessibilityLabel={`${label}, ${value}, 변경하기`} accessibilityRole="button" onPress={onPress} style={({ pressed }) => [styles.timeRow, pressed && styles.pressed]}><Text style={styles.timeLabel}>{label}</Text><Text style={styles.timeValue}>{value}</Text><AppIcon color={colors.textMuted} name="chevron-right" size={20}/></Pressable>;
}
