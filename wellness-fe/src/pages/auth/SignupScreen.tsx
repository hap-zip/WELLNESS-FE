import { useState } from 'react';
import { useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BigCheckGlyph, EyeGlyph, EyeOffGlyph } from '@/components/glyphs';
import { SubScreenHeader } from '@/components/ui/sub-screen-header';
import { useAuth } from '@/context/auth-context';
import { authApi } from '@/services/auth-api';
import { userFacingError } from '@/services/api-error';
import { text } from '@/theme/typography';
import { usePalette } from '@/theme/use-palette';
import { passwordRules } from './auth.data';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** `Momgirok v8.dc.html` → `isSignup` 을 실제 `/api/signup` 호출로 다시 짠 것. 백엔드에 이메일
 * 인증(OTP)이나 출생연도·성별 필드가 없어서, 그 부분은 프로토타입에서 가져오지 않았다. */
export default function SignupScreen() {
  const c = usePalette();
  const router = useRouter();
  const { startSession } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [nickname, setNickname] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const rules = passwordRules(password);
  const passwordValid = rules.every((rule) => rule.ok);
  const emailValid = EMAIL_PATTERN.test(email.trim());
  const confirmValid = confirmPassword.length > 0 && confirmPassword === password;
  const nicknameValid = nickname.trim().length > 0 && nickname.trim().length <= 12;
  const canSubmit = emailValid && passwordValid && confirmValid && nicknameValid && !submitting;

  const submit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    setError('');
    try {
      const result = await authApi.signUp({ email: email.trim(), password, nickname: nickname.trim() });
      await startSession({ accessToken: result.accessToken, userId: result.userId, mode: 'authenticated', onboardingComplete: false, email: result.email, name: result.name });
      router.replace('/(onboarding)/consent');
    } catch (reason) {
      setError(userFacingError(reason, '회원가입에 실패했어요. 다시 시도해 주세요.'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView edges={['top']} style={[s.screen, { backgroundColor: c.card }]}>
      <SubScreenHeader backLabel="로그인으로 돌아가기" fallback={() => router.replace('/(auth)/login')} title="회원가입" />
      <ScrollView contentContainerStyle={s.body} showsVerticalScrollIndicator={false}>
        <Text style={[text({ size: 12.5, weight: 700 }), s.label, { color: c.g500 }]}>이메일</Text>
        <View style={[s.field, { borderColor: c.g300 }]}>
          <TextInput
            autoCapitalize="none"
            autoComplete="email"
            keyboardType="email-address"
            onChangeText={setEmail}
            placeholder="이메일을 입력해 주세요"
            placeholderTextColor={c.g400}
            style={[text({ size: 14.5 }), s.fieldInput, { color: c.g900 }]}
            value={email}
          />
        </View>

        <Text style={[text({ size: 12.5, weight: 700 }), s.sectionLabel, s.label, { color: c.g500 }]}>비밀번호</Text>
        <View style={s.pwFields}>
          <View style={[s.field, { borderColor: c.g300 }]}>
            <TextInput
              autoCapitalize="none"
              autoComplete="password-new"
              onChangeText={setPassword}
              placeholder="비밀번호"
              placeholderTextColor={c.g400}
              secureTextEntry={!showPw}
              style={[text({ size: 14.5 }), s.fieldInput, { color: c.g900 }]}
              value={password}
            />
            <Pressable accessibilityLabel={showPw ? '비밀번호 숨기기' : '비밀번호 보기'} accessibilityRole="button" hitSlop={8} onPress={() => setShowPw((v) => !v)}>
              {showPw ? <EyeGlyph color={c.g400} /> : <EyeOffGlyph color={c.g400} />}
            </Pressable>
          </View>
          <View style={[s.field, { borderColor: c.g300 }]}>
            <TextInput
              autoCapitalize="none"
              autoComplete="password-new"
              onChangeText={setConfirmPassword}
              placeholder="비밀번호 확인"
              placeholderTextColor={c.g400}
              secureTextEntry={!showConfirmPw}
              style={[text({ size: 14.5 }), s.fieldInput, { color: confirmPassword && !confirmValid ? c.danger : c.g900 }]}
              value={confirmPassword}
            />
            <Pressable accessibilityLabel={showConfirmPw ? '비밀번호 숨기기' : '비밀번호 보기'} accessibilityRole="button" hitSlop={8} onPress={() => setShowConfirmPw((v) => !v)}>
              {showConfirmPw ? <EyeGlyph color={c.g400} /> : <EyeOffGlyph color={c.g400} />}
            </Pressable>
          </View>
        </View>
        <View style={s.ruleRow}>
          {rules.map((r) => (
            <View key={r.key} style={s.ruleItem}>
              <View style={[s.ruleDot, { backgroundColor: r.ok ? c.pri : c.g300 }]} />
              <Text style={[text({ size: 11.5, weight: 600 }), { color: r.ok ? c.priDk : c.g400 }]}>{r.label}</Text>
            </View>
          ))}
          {confirmPassword.length > 0 ? (
            <View style={s.ruleItem}>
              <View style={[s.ruleDot, { backgroundColor: confirmValid ? c.pri : c.g300 }]} />
              {confirmValid ? <BigCheckGlyph color={c.priDk} size={9} strokeWidth={3} /> : null}
              <Text style={[text({ size: 11.5, weight: 600 }), { color: confirmValid ? c.priDk : c.g400 }]}>비밀번호 일치</Text>
            </View>
          ) : null}
        </View>

        <Text style={[text({ size: 12.5, weight: 700 }), s.sectionLabel, s.label, { color: c.g500 }]}>닉네임</Text>
        <View style={[s.field, { borderColor: c.g300 }]}>
          <TextInput
            maxLength={12}
            onChangeText={setNickname}
            placeholder="사용하실 닉네임을 입력해 주세요"
            placeholderTextColor={c.g400}
            style={[text({ size: 14.5 }), s.fieldInput, { color: c.g900 }]}
            value={nickname}
          />
          <Text style={[text({ size: 11.5, tabular: true }), { color: c.g400 }]}>{nickname.length}/12</Text>
        </View>

        {error ? <Text style={[text({ size: 12.5, weight: 600 }), s.error, { color: c.danger }]}>{error}</Text> : null}
      </ScrollView>

      <View style={[s.footer, { borderTopColor: c.g200 }]}>
        <Pressable accessibilityRole="button" accessibilityState={{ disabled: !canSubmit }} disabled={!canSubmit} onPress={() => void submit()} style={[s.nextBtn, { backgroundColor: c.pri, opacity: canSubmit ? 1 : 0.5 }]}>
          <Text style={[text({ size: 16, weight: 700 }), { color: '#fff' }]}>{submitting ? '가입하는 중…' : '다음'}</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1 },
  body: { paddingTop: 22, paddingHorizontal: 20, paddingBottom: 20 },

  field: { height: 54, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 18, borderWidth: 1, borderRadius: 16 },
  fieldInput: { flex: 1, minWidth: 0, height: '100%', padding: 0 },

  label: { marginBottom: 10 },
  sectionLabel: { marginTop: 24 },
  pwFields: { gap: 10 },
  ruleRow: { marginTop: 9, flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  ruleItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  ruleDot: { width: 5, height: 5, borderRadius: 3 },

  error: { marginTop: 16, textAlign: 'center' },

  footer: { padding: 12, paddingHorizontal: 20, paddingBottom: 26, borderTopWidth: 1 },
  nextBtn: { height: 54, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
});
