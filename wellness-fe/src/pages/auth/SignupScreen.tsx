import { useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BigCheckGlyph, DropdownGlyph, EyeOffGlyph } from '@/components/glyphs';
import { SubScreenHeader } from '@/components/ui/sub-screen-header';
import { text } from '@/theme/typography';
import { usePalette } from '@/theme/use-palette';
import { PW_RULES } from './auth.data';

/**
 * `Momgirok v8.dc.html` → `isSignup` 을 그대로 옮긴 것.
 * 프로토타입 자체가 "인증 요청 → 인증 완료 → 비밀번호 미완성" 상태를 정적으로
 * 보여주는 데모라, 여기서도 같은 고정 상태를 그린다 (실제 OTP 전송·검증은 없음).
 */
export default function SignupScreen() {
  const c = usePalette();
  const router = useRouter();

  return (
    <SafeAreaView edges={['top']} style={[s.screen, { backgroundColor: c.card }]}>
      <SubScreenHeader backLabel="로그인으로 돌아가기" fallback={() => router.replace('/(auth)/login')} title="회원가입" />
      <ScrollView contentContainerStyle={s.body} showsVerticalScrollIndicator={false}>
        <Text style={[text({ size: 12.5, weight: 700 }), { color: c.g500 }]}>이메일</Text>
        <View style={s.emailRow}>
          <View style={[s.field, s.flex1, { borderColor: c.g300 }]}>
            <Text style={[text({ size: 14.5 }), { color: c.g900 }]}>test@naver.com</Text>
          </View>
          <View style={[s.requestBtn, { backgroundColor: c.g900 }]}>
            <Text style={[text({ size: 13.5, weight: 700 }), { color: '#fff' }]}>인증 요청</Text>
          </View>
        </View>

        <View style={[s.codeRow, { borderColor: c.pri }]}>
          <Text style={[text({ size: 14.5, weight: 700, tabular: true }), s.codeText, { color: c.g900 }]}>184023</Text>
          <View style={s.codeRight}>
            <Text style={[text({ size: 12.5, weight: 700, tabular: true }), { color: c.priDk }]}>02:41</Text>
            <View style={[s.codeCheck, { backgroundColor: c.pri }]}>
              <BigCheckGlyph color="#fff" size={11} strokeWidth={3.4} />
            </View>
          </View>
        </View>
        <Text style={[text({ size: 11.5, weight: 600 }), s.verified, { color: c.priDk }]}>인증이 완료됐어요</Text>

        <Text style={[text({ size: 12.5, weight: 700 }), s.sectionLabel, { color: c.g500 }]}>비밀번호</Text>
        <View style={s.pwFields}>
          <View style={[s.field, { borderColor: c.g300 }]}>
            <Text style={[text({ size: 14.5 }), { color: c.g900 }]}>••••••••</Text>
            <EyeOffGlyph color={c.g500} />
          </View>
          <View style={[s.field, { borderColor: c.g300 }]}>
            <Text style={[text({ size: 14.5 }), { color: c.g400 }]}>비밀번호 확인</Text>
          </View>
        </View>
        <View style={s.ruleRow}>
          {PW_RULES.map((r) => (
            <View key={r.key} style={s.ruleItem}>
              <View style={[s.ruleDot, { backgroundColor: r.ok ? c.pri : c.g300 }]} />
              <Text style={[text({ size: 11.5, weight: 600 }), { color: r.ok ? c.priDk : c.g400 }]}>{r.label}</Text>
            </View>
          ))}
        </View>

        <Text style={[text({ size: 12.5, weight: 700 }), s.sectionLabel, { color: c.g500 }]}>닉네임</Text>
        <View style={[s.field, { borderColor: c.g300 }]}>
          <Text style={[text({ size: 14.5 }), { color: c.g900 }]}>하음 사용자</Text>
          <Text style={[text({ size: 11.5, tabular: true }), { color: c.g400 }]}>4/12</Text>
        </View>

        <View style={s.profileHead}>
          <Text style={[text({ size: 12.5, weight: 700 }), { color: c.g500 }]}>프로필 (선택)</Text>
          <Text style={[text({ size: 11.5 }), { color: c.g400 }]}>나중에 입력해도 돼요</Text>
        </View>
        <View style={s.profileRow}>
          <View style={[s.field, s.flex1, { borderColor: c.g300 }]}>
            <Text style={[text({ size: 14 }), { color: c.g400 }]}>출생연도</Text>
            <DropdownGlyph color={c.g400} />
          </View>
          <View style={[s.field, s.flex1, { borderColor: c.g300 }]}>
            <Text style={[text({ size: 14 }), { color: c.g400 }]}>성별</Text>
            <DropdownGlyph color={c.g400} />
          </View>
        </View>
      </ScrollView>

      <View style={[s.footer, { borderTopColor: c.g200 }]}>
        <Pressable accessibilityRole="button" onPress={() => router.replace('/(onboarding)/consent')} style={[s.nextBtn, { backgroundColor: c.pri }]}> 
          <Text style={[text({ size: 16, weight: 700 }), { color: '#fff' }]}>다음</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1 },
  flex1: { flex: 1, minWidth: 0 },
  body: { paddingTop: 22, paddingHorizontal: 20, paddingBottom: 20 },

  field: { height: 54, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 18, borderWidth: 1, borderRadius: 16 },
  emailRow: { marginTop: 10, flexDirection: 'row', gap: 8 },
  requestBtn: { height: 54, paddingHorizontal: 16, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },

  codeRow: { marginTop: 10, height: 54, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 18, borderWidth: 1.5, borderRadius: 16 },
  codeText: { letterSpacing: 3.5 },
  codeRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  codeCheck: { width: 20, height: 20, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  verified: { marginTop: 7 },

  sectionLabel: { marginTop: 24 },
  pwFields: { marginTop: 10, gap: 10 },
  ruleRow: { marginTop: 9, flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  ruleItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  ruleDot: { width: 5, height: 5, borderRadius: 3 },

  profileHead: { marginTop: 24, flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' },
  profileRow: { marginTop: 10, flexDirection: 'row', gap: 8 },

  footer: { padding: 12, paddingHorizontal: 20, paddingBottom: 26, borderTopWidth: 1 },
  nextBtn: { height: 54, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
});
