import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import NavigationBackButton from '@/components/navigation-back-button';
import { styles } from './signup.styles';
import { authApi } from '@/services/auth-api';

export default function SignupScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const canSubmit = email.trim().includes('@') && password.length >= 8;
  const submit = async () => {
    if (!canSubmit) return;
    setError(''); setIsSubmitting(true);
    try { await authApi.signUp({ email: email.trim(), password }); router.replace('/(onboarding)/intro'); }
    catch (reason) { setError(reason instanceof Error ? reason.message : '가입하지 못했어요.'); }
    finally { setIsSubmitting(false); }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.screen}>
      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top, paddingBottom: insets.bottom + 20 }]}
        keyboardShouldPersistTaps="handled">
        <View style={styles.progressTrack}>
          <View style={styles.progressValue} />
        </View>

        <View style={styles.backButton}><NavigationBackButton accessibilityLabel="로그인으로 돌아가기" confirmDiscard={email.length > 0 || password.length > 0} fallbackHref="/(auth)/login" /></View>

        <View style={styles.header}>
          <Text style={styles.step}>1 / 2</Text>
          <Text style={styles.title}>계정을 만들어요</Text>
          <Text style={styles.description}>이메일과 비밀번호를 입력해 주세요.</Text>
        </View>

        <View style={styles.form}>
          <TextInput
            accessibilityLabel="가입 이메일"
            autoCapitalize="none"
            autoComplete="email"
            keyboardType="email-address"
            onChangeText={setEmail}
            placeholder="이메일"
            placeholderTextColor="#B0B5BD"
            style={styles.input}
            value={email}
          />
          <Text style={styles.helperText}>입력 완료 후 중복을 확인해요</Text>
          <TextInput
            accessibilityLabel="가입 비밀번호"
            autoCapitalize="none"
            autoComplete="new-password"
            onChangeText={setPassword}
            placeholder="비밀번호 (8자 이상)"
            placeholderTextColor="#B0B5BD"
            secureTextEntry
            style={[styles.input, styles.passwordInput]}
            value={password}
          />
        </View>
        {error ? <Text accessibilityRole="alert" style={styles.errorText}>{error}</Text> : null}

        <View style={styles.spacer} />

        <View style={styles.footer}>
          <Text style={styles.notice}>민감정보 동의는 다음 단계에서 별도로 받아요.</Text>
          <Pressable accessibilityRole="button" accessibilityState={{ disabled: !canSubmit, busy: isSubmitting }} disabled={!canSubmit || isSubmitting} onPress={() => void submit()} style={[styles.nextButton, (!canSubmit || isSubmitting) && styles.disabledButton]}>
            <Text style={styles.nextButtonText}>{isSubmitting ? '계정 생성 중…' : '다음'}</Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
