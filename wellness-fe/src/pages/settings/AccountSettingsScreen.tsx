import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { PageHeader } from '@/components/ui/page-header';
import { FormField } from '@/components/ui/form-field';
import { AppIcon } from '@/components/app-icon';
import { useAuth } from '@/context/auth-context';
import { colors } from '@/theme/tokens';
import { styles } from './account-settings.styles';

export default function AccountSettingsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { session, signOut } = useAuth();
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const valid = current.length >= 8 && next.length >= 8 && next === confirm;

  const changePassword = () => {
    if (!valid) return;
    Alert.alert('아직 변경할 수 없어요', '계정 서버 연결 후 비밀번호 변경을 제공할 예정이에요.');
  };
  const logout = () => Alert.alert('로그아웃할까요?', '이 기기의 로그인 상태만 종료돼요.', [
    { text: '취소', style: 'cancel' },
    { text: '로그아웃', onPress: () => void signOut().then(() => router.replace('/(auth)/login')) },
  ]);
  const withdraw = () => Alert.alert(
    session?.mode === 'demo' ? '체험 모드입니다' : '아직 탈퇴할 수 없어요',
    session?.mode === 'demo' ? '체험 모드는 로그아웃하면 기기에 저장된 세션이 삭제돼요.' : '계정 서버 연결 후 안전한 본인 확인과 함께 제공할 예정이에요.',
  );

  return <SafeAreaView edges={['top']} style={styles.screen}>
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
      <PageHeader backLabel="마이 화면으로 돌아가기" fallbackHref="/(tabs)/me" title="계정 관리" />
      <ScrollView automaticallyAdjustKeyboardInsets contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 40 }]} keyboardDismissMode="interactive" keyboardShouldPersistTaps="handled">
        <Text style={styles.sectionTitle}>비밀번호 변경</Text>
        <Field autoComplete="current-password" label="현재 비밀번호" value={current} onChange={setCurrent} />
        <Field autoComplete="new-password" error={next.length > 0 && next.length < 8 ? '영문·숫자를 포함해 8자 이상 입력해 주세요.' : undefined} label="새 비밀번호" value={next} onChange={setNext} />
        <Field autoComplete="new-password" label="새 비밀번호 확인" value={confirm} onChange={setConfirm} />
        {confirm && next !== confirm ? <Text accessibilityLiveRegion="polite" style={styles.error}>새 비밀번호가 서로 다릅니다.</Text> : null}
        <Pressable accessibilityRole="button" accessibilityState={{ disabled: !valid }} disabled={!valid} onPress={changePassword} style={[styles.primary, !valid && styles.disabled]}><Text style={styles.primaryText}>비밀번호 변경</Text></Pressable>
        <Pressable accessibilityRole="button" onPress={logout} style={styles.menu}><Text style={styles.menuText}>로그아웃</Text><AppIcon color={colors.textMuted} name="chevron-right" size={18}/></Pressable>
        <Pressable accessibilityRole="button" onPress={withdraw} style={styles.menu}><Text style={styles.dangerText}>회원 탈퇴</Text><AppIcon color={colors.textMuted} name="chevron-right" size={18}/></Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  </SafeAreaView>;
}

function Field({ autoComplete, error, label, value, onChange }: { autoComplete: 'current-password' | 'new-password'; error?: string; label: string; value: string; onChange: (value: string) => void }) {
  return <View style={styles.field}><FormField autoCapitalize="none" autoComplete={autoComplete} error={error} hideLabel label={label} onChangeText={onChange} placeholder={label} showPasswordToggle value={value} /></View>;
}
