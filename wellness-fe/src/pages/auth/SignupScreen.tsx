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

import { styles } from './signup.styles';

export default function SignupScreen() {
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
        <View style={styles.progressTrack}>
          <View style={styles.progressValue} />
        </View>

        <Pressable
          accessibilityLabel="로그인으로 돌아가기"
          accessibilityRole="button"
          onPress={() => router.back()}
          style={styles.backButton}>
          <Text style={styles.backIcon}>‹</Text>
        </Pressable>

        <View style={styles.header}>
          <Text style={styles.step}>1 / 2</Text>
          <Text style={styles.title}>계정을 만들어요</Text>
          <Text style={styles.description}>이메일과 비밀번호를 입력해 주세요.</Text>
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
          <Text style={styles.helperText}>입력 완료 후 중복을 확인해요</Text>
          <TextInput
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

        <View style={styles.spacer} />

        <View style={styles.footer}>
          <Text style={styles.notice}>민감정보 동의는 다음 단계에서 별도로 받아요.</Text>
          <Pressable accessibilityRole="button" style={styles.nextButton}>
            <Text style={styles.nextButtonText}>다음</Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
