import { useState } from 'react';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { EyeGlyph, EyeOffGlyph } from '@/components/glyphs';
import { BrandWordmarkImage } from '@/components/brand-logo';
import { useAuth } from '@/context/auth-context';
import { text } from '@/theme/typography';
import { usePalette } from '@/theme/use-palette';

/**
 * `Momgirok v8.dc.html` → `isLogin` 을 그대로 옮긴 것.
 * 개발 테스트 계정 자동 입력은 README 지시대로 제품 UI에 노출하지 않는다.
 * 실제 API 연결 전이라 로그인은 입력값을 검증하지 않고 세션만 만든다 —
 * 다만 세션을 실제로 만들지 않으면 로그인 버튼을 눌러도 곧바로 로그인
 * 화면으로 되튕겨지므로(루트 네비게이터가 세션 없음을 감지) 이 부분만은
 * 반드시 진짜로 동작해야 한다.
 */
export default function LoginScreen() {
  const c = usePalette();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { startSession } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const canSubmit = email.trim().length > 0 && password.length > 0;

  const enter = async () => {
    await startSession({ accessToken: `session-${Date.now()}`, userId: email.trim() || 'user', mode: 'authenticated', onboardingComplete: true });
    router.replace('/(tabs)/home');
  };

  return (
    <SafeAreaView edges={['top', 'bottom']} style={[s.screen, { backgroundColor: c.card, paddingBottom: 28 + insets.bottom }]}>
      <View style={s.main}>
        <View style={s.logoBlock}>
          <BrandWordmarkImage width={260} />
        </View>

        <Text style={[text({ size: 25, weight: 700, tracking: -0.04, leading: 1.4 }), s.title, { color: c.g900 }]}>오늘의 몸을{'\n'}기록해볼까요?</Text>
        <Text style={[text({ size: 14, leading: 1.7 }), s.sub, { color: c.g600 }]}>3분이면 오늘 하루가 한 줄로 남아요.</Text>

        <View style={s.fields}>
          <View style={[s.field, { borderColor: c.g300 }]}>
            <TextInput
              autoCapitalize="none"
              autoComplete="email"
              keyboardType="email-address"
              onChangeText={setEmail}
              placeholder="이메일"
              placeholderTextColor={c.g400}
              style={[text({ size: 14.5 }), s.fieldInput, { color: c.g900 }]}
              value={email}
            />
          </View>
          <View style={[s.field, { borderColor: c.g300 }]}>
            <TextInput
              autoCapitalize="none"
              autoComplete="password"
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
        </View>

        <Pressable accessibilityRole="button" accessibilityState={{ disabled: !canSubmit }} disabled={!canSubmit} onPress={() => void enter()} style={({ pressed }) => [s.loginBtn, { backgroundColor: c.pri, opacity: canSubmit ? 1 : 0.5 }, pressed && canSubmit && s.pressed]}>
          <Text style={[text({ size: 16, weight: 700 }), { color: '#fff' }]}>로그인</Text>
        </Pressable>

        <View style={s.linksRow}>
          <Pressable accessibilityRole="button" onPress={() => router.push('/(auth)/signup')} style={s.linkBtn}>
            <Text style={[text({ size: 13, weight: 600 }), { color: c.g700 }]}>회원가입</Text>
          </Pressable>
          <View style={[s.divider, { backgroundColor: c.g300 }]} />
          <Text style={[text({ size: 13 }), { color: c.g600 }]}>비밀번호 찾기</Text>
        </View>
      </View>

    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, paddingHorizontal: 20 },
  pressed: { transform: [{ scale: 0.975 }] },

  main: { flex: 1, minHeight: 0, justifyContent: 'center' },
  logoBlock: { height: 134, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  title: { marginTop: 12, textAlign: 'center' },
  sub: { marginTop: 10, textAlign: 'center' },

  fields: { marginTop: 30, gap: 10 },
  field: { height: 54, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 18, borderWidth: 1, borderRadius: 16 },
  fieldInput: { flex: 1, minWidth: 0, height: '100%', padding: 0 },

  loginBtn: { marginTop: 16, height: 54, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
  linksRow: { marginTop: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 16 },
  linkBtn: { minHeight: 40, alignItems: 'center', justifyContent: 'center' },
  divider: { width: 1, height: 11 },

});
