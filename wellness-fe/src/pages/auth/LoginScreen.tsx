import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BrandWordmark } from '@/components/ui/auth-flow';
import { FormField } from '@/components/ui/form-field';
import { useAuth } from '@/context/auth-context';
import { userFacingError } from '@/services/api-error';
import { authApi, TEMPORARY_TEST_ACCOUNT } from '@/services/auth-api';
import { colors } from '@/theme/tokens';

import { styles } from './login.styles';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function LoginScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { startSession } = useAuth();
  const [email, setEmail] = useState<string>(TEMPORARY_TEST_ACCOUNT.email);
  const [password, setPassword] = useState<string>(TEMPORARY_TEST_ACCOUNT.password);
  const [touched, setTouched] = useState({ email: false, password: false });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetBusy, setResetBusy] = useState(false);
  const [resetMessage, setResetMessage] = useState('');
  const [resetError, setResetError] = useState('');

  const emailError = touched.email && !EMAIL_PATTERN.test(email.trim()) ? '이메일 형식을 확인해 주세요.' : '';
  const passwordError = touched.password && password.length < 8 ? '비밀번호는 8자 이상 입력해 주세요.' : '';
  const canSubmit = EMAIL_PATTERN.test(email.trim()) && password.length >= 8;

  const submit = async () => {
    setTouched({ email: true, password: true });
    if (!canSubmit || isSubmitting) return;
    setError('');
    setIsSubmitting(true);
    try {
      const result = await authApi.signIn({ email: email.trim(), password });
      await startSession({ ...result, mode: 'authenticated', onboardingComplete: true });
      router.replace('/(tabs)/home');
    } catch (reason) {
      setError(userFacingError(reason, '로그인하지 못했어요. 이메일과 비밀번호를 다시 확인해 주세요.'));
    } finally { setIsSubmitting(false); }
  };

  const openReset = () => {
    setResetEmail(email.trim());
    setResetMessage('');
    setResetError('');
    setResetOpen(true);
  };
  const requestReset = async () => {
    if (!EMAIL_PATTERN.test(resetEmail.trim()) || resetBusy) { setResetError('가입한 이메일 주소를 정확히 입력해 주세요.'); return; }
    setResetBusy(true); setResetError(''); setResetMessage('');
    try { await authApi.requestPasswordReset(resetEmail.trim()); setResetMessage('비밀번호 재설정 안내를 보냈어요. 메일함을 확인해 주세요.'); }
    catch (reason) { setResetError(userFacingError(reason, '재설정 안내를 보내지 못했어요. 잠시 후 다시 시도해 주세요.')); }
    finally { setResetBusy(false); }
  };

  return <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.screen}>
    <ScrollView automaticallyAdjustKeyboardInsets contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 24 }]} keyboardDismissMode="interactive" keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
      <BrandWordmark/>
      <View style={styles.header}>
        <Text accessibilityRole="header" style={styles.title}>다시, 내 기록으로.</Text>
        <Text style={styles.description}>오늘의 상태부터 지난 변화까지 이어서 확인하세요.</Text>
      </View>

      <View style={styles.form}>
        <FormField autoCapitalize="none" autoComplete="email" error={emailError} keyboardType="email-address" label="이메일" onBlur={() => setTouched((current) => ({ ...current, email: true }))} onChangeText={(value) => { setEmail(value); setError(''); }} placeholder="name@example.com" returnKeyType="next" textContentType="emailAddress" value={email}/>
        <FormField autoCapitalize="none" autoComplete="current-password" error={passwordError} label="비밀번호" onBlur={() => setTouched((current) => ({ ...current, password: true }))} onChangeText={(value) => { setPassword(value); setError(''); }} onSubmitEditing={() => void submit()} placeholder="8자 이상 입력" returnKeyType="done" secureTextEntry showPasswordToggle textContentType="password" value={password}/>
      </View>
      <Pressable accessibilityRole="button" onPress={openReset} style={({ pressed }) => [styles.forgotButton, pressed && styles.pressed]}><Text style={styles.forgotText}>비밀번호를 잊으셨나요?</Text></Pressable>
      {error ? <View accessibilityLiveRegion="assertive" style={styles.errorBand}><Text accessibilityRole="alert" style={styles.errorText}>{error}</Text></View> : null}

      <View style={styles.actions}>
        <Pressable accessibilityRole="button" accessibilityState={{ disabled: !canSubmit, busy: isSubmitting }} disabled={!canSubmit || isSubmitting} onPress={() => void submit()} style={({ pressed }) => [styles.primaryButton, (!canSubmit || isSubmitting) && styles.disabledButton, pressed && styles.pressed]}>{isSubmitting ? <ActivityIndicator color={colors.white}/> : <Text style={styles.primaryButtonText}>로그인</Text>}</Pressable>
        <View style={styles.signupRow}><Text style={styles.signupText}>몸기록이 처음인가요?</Text><Pressable accessibilityRole="link" hitSlop={8} onPress={() => router.push('/(auth)/signup')} style={({ pressed }) => pressed && styles.pressed}><Text style={styles.signupLink}>회원가입</Text></Pressable></View>
      </View>

      <View style={styles.preview}><View style={styles.previewRule}/><Text style={styles.previewTitle}>건강 데이터 연결 테스트 계정</Text><Text style={styles.testAccount}>test@navr.com · qwer1234</Text></View>
    </ScrollView>

    <Modal animationType="slide" onRequestClose={() => setResetOpen(false)} transparent visible={resetOpen}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.modalRoot}><Pressable accessibilityRole="button" accessibilityLabel="비밀번호 재설정 닫기" onPress={() => setResetOpen(false)} style={styles.scrim}/><View accessibilityViewIsModal style={[styles.resetSheet, { paddingBottom: Math.max(insets.bottom, 20) }]}><View style={styles.sheetHandle}/><Text style={styles.resetTitle}>비밀번호를 다시 설정할까요?</Text><Text style={styles.resetDescription}>가입한 이메일로 재설정 안내를 보내드려요.</Text><View style={styles.resetField}><FormField autoCapitalize="none" autoComplete="email" error={resetError} keyboardType="email-address" label="이메일" onChangeText={(value) => { setResetEmail(value); setResetError(''); setResetMessage(''); }} placeholder="name@example.com" value={resetEmail}/></View>{resetMessage ? <Text accessibilityLiveRegion="polite" style={styles.resetSuccess}>{resetMessage}</Text> : null}<Pressable accessibilityRole="button" accessibilityState={{ busy: resetBusy }} disabled={resetBusy || Boolean(resetMessage)} onPress={() => void requestReset()} style={({ pressed }) => [styles.resetButton, Boolean(resetMessage) && styles.disabledButton, pressed && styles.pressed]}>{resetBusy ? <ActivityIndicator color={colors.white}/> : <Text style={styles.resetButtonText}>{resetMessage ? '안내 전송 완료' : '재설정 안내 받기'}</Text>}</Pressable></View></KeyboardAvoidingView>
    </Modal>
  </KeyboardAvoidingView>;
}
