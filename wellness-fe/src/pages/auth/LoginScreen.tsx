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

import { styles } from './login.styles';
import { authApi } from '@/services/auth-api';

export default function LoginScreen() {
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
    try { await authApi.signIn({ email: email.trim(), password }); router.replace('/(onboarding)/intro'); }
    catch (reason) { setError(reason instanceof Error ? reason.message : '로그인하지 못했어요.'); }
    finally { setIsSubmitting(false); }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.screen}>
      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 40, paddingBottom: insets.bottom + 20 }]}
        keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Text style={styles.title}>
            몸의 신호를 검색하지 말고,{`\n`}내 기록으로 이해해 보세요
          </Text>
          <Text style={styles.description}>이메일로 로그인해 주세요.</Text>
        </View>

        <View style={styles.form}>
          <TextInput
            accessibilityLabel="이메일"
            autoCapitalize="none"
            autoComplete="email"
            keyboardType="email-address"
            onChangeText={setEmail}
            placeholder="이메일"
            placeholderTextColor="#B0B5BD"
            style={styles.input}
            value={email}
          />
          <TextInput
            accessibilityLabel="비밀번호"
            autoCapitalize="none"
            autoComplete="password"
            onChangeText={setPassword}
            placeholder="비밀번호"
            placeholderTextColor="#B0B5BD"
            secureTextEntry
            style={[styles.input, styles.passwordInput]}
            value={password}
          />
        </View>
        {error ? <Text accessibilityRole="alert" style={styles.errorText}>{error}</Text> : null}

        <Pressable accessibilityRole="button" style={styles.forgotButton}>
          <Text style={styles.forgotText}>비밀번호를 잊으셨나요?</Text>
        </Pressable>

        <View style={styles.spacer} />

        <View style={styles.footer}>
          <Pressable accessibilityRole="button" onPress={() => router.replace('/(tabs)/home')} style={styles.guestButton}>
            <Text style={styles.guestText}>체험 데이터로 둘러보기</Text>
          </Pressable>

          <View style={styles.signupPrompt}>
            <Text style={styles.signupPromptText}>아직 계정이 없나요? </Text>
            <Pressable accessibilityRole="link" onPress={() => router.push('/signup')}>
              <Text style={styles.signupLink}>회원가입</Text>
            </Pressable>
          </View>

          <Pressable accessibilityRole="button" accessibilityState={{ disabled: !canSubmit, busy: isSubmitting }} disabled={!canSubmit || isSubmitting} onPress={() => void submit()} style={[styles.loginButton, (!canSubmit || isSubmitting) && styles.disabledButton]}>
            <Text style={styles.loginButtonText}>{isSubmitting ? '로그인 중…' : '로그인'}</Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
