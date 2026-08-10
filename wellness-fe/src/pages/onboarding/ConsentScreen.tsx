import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppIcon } from '@/components/app-icon';
import NavigationBackButton from '@/components/navigation-back-button';
import { SetupProgress } from '@/components/ui/auth-flow';
import { colors } from '@/theme/tokens';

import { styles } from './consent.styles';

type ConsentKey = 'terms' | 'privacy' | 'health' | 'photo';
type ConsentState = Record<ConsentKey, boolean>;

const ITEMS: readonly { key: ConsentKey; title: string; summary: string; required: boolean; details: readonly string[] }[] = [
  { key: 'terms', title: '서비스 이용약관', summary: '몸기록 서비스 이용에 필요한 기본 약속', required: true, details: ['목적: 서비스 이용 조건과 사용자·운영자의 권리 및 책임 안내', '철회 방법: 회원 탈퇴 시 이용 계약이 종료돼요.'] },
  { key: 'privacy', title: '개인정보 수집·이용', summary: '이메일, 이름, 계정 및 서비스 이용 정보', required: true, details: ['이용 목적: 계정 식별, 로그인, 고객 지원, 서비스 운영', '보관 기간: 회원 탈퇴 시까지. 법령상 의무가 있는 정보는 해당 기간까지 보관해요.'] },
  { key: 'health', title: '건강정보 수집·이용', summary: '불편 부위·강도, 수면, 활동, 피부 상태', required: true, details: ['이용 목적: 개인 기록 정리, 변화 비교, 패턴과 루틴 안내', '보관 기간: 회원 탈퇴 또는 동의 철회 시까지', '철회 방법: 마이 → 동의·데이터 관리에서 언제든 변경할 수 있어요.'] },
  { key: 'photo', title: '피부 사진 저장', summary: '피부 변화 비교에 사용할 사진', required: false, details: ['사진을 선택한 기록에만 저장하며 업로드 전 선택 화면을 제공해요.', '마이 → 동의·데이터 관리에서 사진만 따로 삭제할 수 있어요.'] },
];

const INITIAL: ConsentState = { terms: false, privacy: false, health: false, photo: false };

export default function ConsentScreen() {
  const router = useRouter();
  const [consents, setConsents] = useState<ConsentState>(INITIAL);
  const [openKey, setOpenKey] = useState<ConsentKey | null>(null);
  const allChecked = ITEMS.every((item) => consents[item.key]);
  const requiredChecked = ITEMS.filter((item) => item.required).every((item) => consents[item.key]);
  const hasDraft = Object.values(consents).some(Boolean);

  const toggle = (key: ConsentKey) => setConsents((current) => ({ ...current, [key]: !current[key] }));
  const toggleAll = () => setConsents(ITEMS.reduce<ConsentState>((next, item) => ({ ...next, [item.key]: !allChecked }), INITIAL));

  return <SafeAreaView edges={['top', 'bottom']} style={styles.screen}>
    <View style={styles.topBar}><NavigationBackButton accessibilityLabel="서비스 안내로 돌아가기" confirmDiscard={hasDraft} fallbackHref="/(onboarding)/intro"/><View style={styles.progressWrap}><SetupProgress current={1}/></View><View style={styles.topSpacer}/></View>
    <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      <View style={styles.header}><Text accessibilityRole="header" style={styles.title}>내 기록을 다루는 범위를{`\n`}직접 확인해 주세요.</Text><Text style={styles.description}>필수 동의와 선택 동의를 나누고, 수집 항목·목적·보관 기간을 각각 확인할 수 있어요.</Text></View>

      <View style={styles.list}>
        <Pressable accessibilityRole="checkbox" accessibilityState={{ checked: allChecked }} onPress={toggleAll} style={({ pressed }) => [styles.allRow, pressed && styles.pressed]}><Check checked={allChecked}/><View style={styles.allCopy}><Text style={styles.allTitle}>전체 동의</Text><Text style={styles.allDescription}>필수 3개와 선택 1개를 모두 선택해요.</Text></View></Pressable>
        {ITEMS.map((item) => <View key={item.key} style={styles.item}><View style={styles.itemTop}><Pressable accessibilityLabel={`${item.title} ${item.required ? '필수' : '선택'} 동의`} accessibilityRole="checkbox" accessibilityState={{ checked: consents[item.key] }} onPress={() => toggle(item.key)} style={({ pressed }) => [styles.itemToggle, pressed && styles.pressed]}><Check checked={consents[item.key]}/><View style={styles.itemCopy}><Text style={styles.itemTitle}>{item.title} <Text style={item.required ? styles.required : styles.optional}>{item.required ? '필수' : '선택'}</Text></Text><Text style={styles.itemSummary}>{item.summary}</Text></View></Pressable><Pressable accessibilityLabel={`${item.title} 상세 ${openKey === item.key ? '닫기' : '보기'}`} accessibilityRole="button" accessibilityState={{ expanded: openKey === item.key }} onPress={() => setOpenKey((current) => current === item.key ? null : item.key)} style={({ pressed }) => [styles.detailToggle, pressed && styles.pressed]}><AppIcon color={colors.textMuted} name={openKey === item.key ? 'minus' : 'plus'} size={19}/></Pressable></View>{openKey === item.key ? <View style={styles.details}>{item.details.map((detail) => <Text key={detail} style={styles.detailText}>{detail}</Text>)}</View> : null}</View>)}
      </View>
      <View style={styles.safetyNote}><View style={styles.safetyLine}/><Text style={styles.safetyText}>몸기록은 질환을 진단하거나 처방하지 않으며, 기록 기반 생활 참고 정보를 제공합니다.</Text></View>
    </ScrollView>
    <View style={styles.footer}><Pressable accessibilityRole="button" accessibilityState={{ disabled: !requiredChecked }} disabled={!requiredChecked} onPress={() => router.push('/(onboarding)/baseline')} style={({ pressed }) => [styles.continueButton, !requiredChecked && styles.disabledButton, pressed && styles.pressed]}><Text style={[styles.continueText, !requiredChecked && styles.disabledText]}>필수 동의하고 계속</Text></Pressable></View>
  </SafeAreaView>;
}

function Check({ checked }: { checked: boolean }) {
  return <View style={[styles.checkbox, checked && styles.checkedBox]}>{checked ? <AppIcon color={colors.white} name="check" size={16} strokeWidth={2.4}/> : null}</View>;
}
