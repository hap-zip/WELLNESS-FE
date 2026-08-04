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

export default function LoginScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.screen}>
      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 20 }]}
        keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Text style={styles.title}>
            몸의 신호를 검색하지 말고,{`\n`}내 기록으로 이해해 보세요
          </Text>
          <Text style={styles.description}>이메일로 로그인해 주세요.</Text>
        </View>

        <View style={styles.form}>
          <TextInput
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

        <Pressable accessibilityRole="button" style={styles.forgotButton}>
          <Text style={styles.forgotText}>비밀번호를 잊으셨나요?</Text>
        </Pressable>

        <View style={styles.spacer} />

        <View style={styles.footer}>
          <Pressable accessibilityRole="button" style={styles.guestButton}>
            <Text style={styles.guestText}>체험 데이터로 둘러보기</Text>
          </Pressable>

          <View style={styles.signupPrompt}>
            <Text style={styles.signupPromptText}>아직 계정이 없나요? </Text>
            <Pressable accessibilityRole="link" onPress={() => router.push('/signup')}>
              <Text style={styles.signupLink}>회원가입</Text>
            </Pressable>
          </View>

          <Pressable accessibilityRole="button" style={styles.loginButton}>
            <Text style={styles.loginButtonText}>로그인</Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
