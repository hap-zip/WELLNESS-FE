import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Keyboard, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppIcon } from '@/components/app-icon';
import NavigationBackButton from '@/components/navigation-back-button';
import { BrandWordmark } from '@/components/ui/auth-flow';
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
  const [agreement, setAgreement] = useState(false);
  const [agreementOpen, setAgreementOpen] = useState(false);
  const [touched, setTouched] = useState({ nickname: false, email: false, password: false, passwordConfirm: false });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const passwordChecks = { length: password.length >= 8, letter: /[A-Za-z]/.test(password), number: /\d/.test(password) };
  const validPassword = Object.values(passwordChecks).every(Boolean);
  const nicknameError = touched.nickname && nickname.trim().length < 2 ? '이름은 2자 이상 입력해 주세요.' : '';
  const emailError = touched.email && !EMAIL_PATTERN.test(email.trim()) ? '이메일 형식을 확인해 주세요.' : '';
  const passwordError = touched.password && !validPassword ? '영문과 숫자를 포함해 8자 이상 입력해 주세요.' : '';
  const confirmError = touched.passwordConfirm && password !== passwordConfirm ? '입력한 비밀번호가 서로 달라요.' : '';
  const canSubmit = nickname.trim().length >= 2 && EMAIL_PATTERN.test(email.trim()) && validPassword && password === passwordConfirm && agreement;

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

  const hasDraft = nickname.length > 0 || email.length > 0 || password.length > 0 || passwordConfirm.length > 0 || agreement;

  return <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.screen}>
    <ScrollView automaticallyAdjustKeyboardInsets contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top, paddingBottom: insets.bottom + 28 }]} keyboardDismissMode="interactive" keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
      <View style={styles.topBar}><NavigationBackButton accessibilityLabel="로그인으로 돌아가기" confirmDiscard={hasDraft} fallbackHref="/(auth)/login"/><BrandWordmark/><View style={styles.topSpacer}/></View>
      <View style={styles.header}>
        <Text accessibilityRole="header" style={styles.title}>기록을 이어갈{`\n`}계정을 만들어요.</Text>
        <Text style={styles.description}>이름과 로그인 정보를 입력하면, 다음 단계에서 건강정보 이용 범위를 직접 선택할 수 있어요.</Text>
      </View>

      <View style={styles.form}>
        <FormField autoComplete="name" error={nicknameError} label="이름 또는 닉네임" maxLength={20} onBlur={() => setTouched((current) => ({ ...current, nickname: true }))} onChangeText={(value) => { setNickname(value); setError(''); }} placeholder="앱에서 사용할 이름" returnKeyType="next" textContentType="nickname" value={nickname}/>
        <FormField autoCapitalize="none" autoComplete="email" error={emailError} keyboardType="email-address" label="이메일" onBlur={() => setTouched((current) => ({ ...current, email: true }))} onChangeText={(value) => { setEmail(value); setError(''); }} placeholder="name@example.com" returnKeyType="next" textContentType="emailAddress" value={email}/>
        <FormField autoCapitalize="none" autoComplete="new-password" error={passwordError} label="비밀번호" onBlur={() => setTouched((current) => ({ ...current, password: true }))} onChangeText={(value) => { setPassword(value); setError(''); }} placeholder="영문·숫자 포함 8자 이상" returnKeyType="next" secureTextEntry showPasswordToggle textContentType="newPassword" value={password}/>
        <View style={styles.passwordRules}><Rule checked={passwordChecks.length} label="8자 이상"/><Rule checked={passwordChecks.letter} label="영문 포함"/><Rule checked={passwordChecks.number} label="숫자 포함"/></View>
        <FormField autoCapitalize="none" autoComplete="off" error={confirmError} label="비밀번호 확인" onBlur={() => setTouched((current) => ({ ...current, passwordConfirm: true }))} onChangeText={(value) => { setPasswordConfirm(value); setError(''); }} onSubmitEditing={() => void submit()} placeholder="비밀번호를 한 번 더 입력" returnKeyType="done" secureTextEntry showPasswordToggle value={passwordConfirm}/>
      </View>

      <View style={styles.agreementSection}>
        <Pressable accessibilityRole="checkbox" accessibilityState={{ checked: agreement }} onPress={() => setAgreement((current) => !current)} style={({ pressed }) => [styles.agreementRow, pressed && styles.pressed]}><View style={[styles.checkbox, agreement && styles.checkboxChecked]}>{agreement ? <AppIcon color={colors.white} name="check" size={16} strokeWidth={2.4}/> : null}</View><View style={styles.agreementCopy}><Text style={styles.agreementTitle}>이용약관 및 개인정보처리방침에 동의해요</Text><Text style={styles.agreementDescription}>계정 생성과 서비스 제공에 필요한 필수 동의</Text></View></Pressable>
        <Pressable accessibilityRole="button" accessibilityState={{ expanded: agreementOpen }} onPress={() => setAgreementOpen((current) => !current)} style={({ pressed }) => [styles.agreementDetailButton, pressed && styles.pressed]}><Text style={styles.agreementDetailText}>{agreementOpen ? '필수 동의 내용 닫기' : '필수 동의 내용 보기'}</Text><AppIcon color={colors.textMuted} name={agreementOpen ? 'minus' : 'plus'} size={18}/></Pressable>
        {agreementOpen ? <View style={styles.agreementDetail}><Text style={styles.detailText}>이용 목적: 계정 생성, 로그인, 기록 저장 및 서비스 운영</Text><Text style={styles.detailText}>필수 정보: 이메일, 암호화된 비밀번호, 앱에서 사용할 이름</Text><Text style={styles.detailText}>보관 기간: 회원 탈퇴 시까지. 건강정보 동의는 가입 후 별도로 선택합니다.</Text></View> : null}
      </View>

      {error ? <View accessibilityLiveRegion="assertive" style={styles.errorBand}><Text accessibilityRole="alert" style={styles.errorText}>{error}</Text></View> : null}
      <View style={styles.footer}><Text style={styles.notice}>계정 생성 후 건강정보 수집·이용 동의를 별도로 확인합니다.</Text><Pressable accessibilityRole="button" accessibilityState={{ disabled: !canSubmit, busy: isSubmitting }} disabled={!canSubmit || isSubmitting} onPress={() => void submit()} style={({ pressed }) => [styles.nextButton, (!canSubmit || isSubmitting) && styles.disabledButton, pressed && styles.pressed]}>{isSubmitting ? <ActivityIndicator color={colors.white}/> : <Text style={styles.nextButtonText}>계정 만들기</Text>}</Pressable></View>
    </ScrollView>
  </KeyboardAvoidingView>;
}

function Rule({ checked, label }: { checked: boolean; label: string }) {
  return <View style={styles.ruleItem}><View style={[styles.ruleDot, checked && styles.ruleDotChecked]}/><Text style={[styles.ruleText, checked && styles.ruleTextChecked]}>{label}</Text></View>;
}
