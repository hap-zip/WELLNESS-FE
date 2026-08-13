import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Keyboard, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import NavigationBackButton from '@/components/navigation-back-button';
import { FormField } from '@/components/ui/form-field';
import { useAuth } from '@/context/auth-context';
import { userFacingError } from '@/services/api-error';
import { authApi } from '@/services/auth-api';
import { colors } from '@/theme/tokens';

import { styles } from './signup.styles';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function SignupScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { startSession } = useAuth();
  const [nickname, setNickname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [verificationRequested, setVerificationRequested] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [touched, setTouched] = useState({ nickname: false, email: false, password: false, passwordConfirm: false });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const passwordChecks = { length: password.length >= 8, letter: /[A-Za-z]/.test(password), number: /\d/.test(password) };
  const validPassword = Object.values(passwordChecks).every(Boolean);
  const emailVerified = verificationCode.length === 6;
  const nicknameError = touched.nickname && nickname.trim().length < 2 ? '이름은 2자 이상 입력해 주세요.' : '';
  const emailError = touched.email && !EMAIL_PATTERN.test(email.trim()) ? '이메일 형식을 확인해 주세요.' : '';
  const passwordError = touched.password && !validPassword ? '영문과 숫자를 포함해 8자 이상 입력해 주세요.' : '';
  const confirmError = touched.passwordConfirm && password !== passwordConfirm ? '입력한 비밀번호가 서로 달라요.' : '';
  const canSubmit = nickname.trim().length >= 2 && EMAIL_PATTERN.test(email.trim()) && emailVerified && validPassword && password === passwordConfirm;

  const submit = async () => {
    setTouched({ nickname: true, email: true, password: true, passwordConfirm: true });
    if (!canSubmit || isSubmitting) return;
    Keyboard.dismiss(); setError(''); setIsSubmitting(true);
    try {
      const result = await authApi.signUp({ nickname: nickname.trim(), email: email.trim(), password });
      await startSession({ ...result, mode: 'authenticated', onboardingComplete: false });
      router.replace('/(onboarding)/intro');
    } catch (reason) {
      setError(userFacingError(reason, '계정을 만들지 못했어요. 입력 내용을 확인하고 다시 시도해 주세요.'));
    } finally { setIsSubmitting(false); }
  };

  const hasDraft = nickname.length > 0 || email.length > 0 || password.length > 0 || passwordConfirm.length > 0;

  return <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.screen}>
    <ScrollView automaticallyAdjustKeyboardInsets contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top, paddingBottom: insets.bottom + 28 }]} keyboardDismissMode="interactive" keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
      <View style={styles.topBar}><NavigationBackButton accessibilityLabel="로그인으로 돌아가기" confirmDiscard={hasDraft} fallbackHref="/(auth)/login"/><Text style={styles.topTitle}>회원가입</Text><View style={styles.topSpacer}/></View>
      <View style={styles.header}>
        <Text accessibilityRole="header" style={styles.title}>몸기록을 시작할{`\n`}계정을 만들어요</Text>
        <Text style={styles.description}>이메일을 확인하고 안전하게 기록을 이어가세요.</Text>
      </View>

      <View style={styles.form}>
        <View><Text style={styles.fieldLabel}>이메일</Text><View style={styles.emailRow}><TextInput autoCapitalize="none" autoComplete="email" keyboardType="email-address" onBlur={() => setTouched((current) => ({ ...current, email: true }))} onChangeText={(value) => { setEmail(value); setVerificationRequested(false); setVerificationCode(''); setError(''); }} placeholder="name@example.com" placeholderTextColor={colors.placeholder} style={styles.emailInput} textContentType="emailAddress" value={email}/><Pressable accessibilityRole="button" disabled={!EMAIL_PATTERN.test(email.trim())} onPress={() => setVerificationRequested(true)} style={[styles.verifyButton, !EMAIL_PATTERN.test(email.trim()) && styles.verifyDisabled]}><Text style={styles.verifyButtonText}>{verificationRequested ? '다시 요청' : '인증 요청'}</Text></Pressable></View>{emailError ? <Text style={styles.fieldError}>{emailError}</Text> : null}</View>
        {verificationRequested ? <View><Text style={styles.fieldLabel}>인증 코드</Text><View style={[styles.codeField, emailVerified && styles.codeFieldDone]}><TextInput accessibilityLabel="이메일 인증 코드" keyboardType="number-pad" maxLength={6} onChangeText={(value) => setVerificationCode(value.replace(/\D/g, ''))} placeholder="000000" placeholderTextColor={colors.placeholder} style={styles.codeInput} value={verificationCode}/><Text style={styles.timer}>{emailVerified ? '✓' : '02:41'}</Text></View><Text style={emailVerified ? styles.verifiedText : styles.codeHint}>{emailVerified ? '인증이 완료됐어요' : '메일로 받은 6자리 코드를 입력해 주세요'}</Text></View> : null}
        <FormField autoCapitalize="none" autoComplete="new-password" error={passwordError} label="비밀번호" onBlur={() => setTouched((current) => ({ ...current, password: true }))} onChangeText={(value) => { setPassword(value); setError(''); }} placeholder="영문·숫자 포함 8자 이상" returnKeyType="next" secureTextEntry showPasswordToggle textContentType="newPassword" value={password}/>
        <View style={styles.passwordRules}><Rule checked={passwordChecks.length} label="8자 이상"/><Rule checked={passwordChecks.letter} label="영문 포함"/><Rule checked={passwordChecks.number} label="숫자 포함"/></View>
        <FormField autoCapitalize="none" autoComplete="off" error={confirmError} label="비밀번호 확인" onBlur={() => setTouched((current) => ({ ...current, passwordConfirm: true }))} onChangeText={(value) => { setPasswordConfirm(value); setError(''); }} onSubmitEditing={() => void submit()} placeholder="비밀번호를 한 번 더 입력" returnKeyType="done" secureTextEntry showPasswordToggle value={passwordConfirm}/>
        <FormField autoComplete="name" error={nicknameError} label="닉네임" maxLength={20} onBlur={() => setTouched((current) => ({ ...current, nickname: true }))} onChangeText={(value) => { setNickname(value); setError(''); }} placeholder="앱에서 사용할 이름" returnKeyType="done" textContentType="nickname" value={nickname}/>
        <View><View style={styles.profileHead}><Text style={styles.fieldLabel}>프로필 (선택)</Text><Text style={styles.profileHint}>나중에 입력해도 돼요</Text></View><View style={styles.profileRow}><View style={styles.profileField}><Text style={styles.profilePlaceholder}>출생연도</Text><Text style={styles.profileChevron}>⌄</Text></View><View style={styles.profileField}><Text style={styles.profilePlaceholder}>성별</Text><Text style={styles.profileChevron}>⌄</Text></View></View></View>
      </View>

      {error ? <View accessibilityLiveRegion="assertive" style={styles.errorBand}><Text accessibilityRole="alert" style={styles.errorText}>{error}</Text></View> : null}
      <View style={styles.footer}><Pressable accessibilityRole="button" accessibilityState={{ disabled: !canSubmit, busy: isSubmitting }} disabled={!canSubmit || isSubmitting} onPress={() => void submit()} style={({ pressed }) => [styles.nextButton, (!canSubmit || isSubmitting) && styles.disabledButton, pressed && styles.pressed]}>{isSubmitting ? <ActivityIndicator color={colors.primaryText}/> : <Text style={styles.nextButtonText}>다음</Text>}</Pressable></View>
    </ScrollView>
  </KeyboardAvoidingView>;
}

function Rule({ checked, label }: { checked: boolean; label: string }) {
  return <View style={styles.ruleItem}><View style={[styles.ruleDot, checked && styles.ruleDotChecked]}/><Text style={[styles.ruleText, checked && styles.ruleTextChecked]}>{label}</Text></View>;
}
