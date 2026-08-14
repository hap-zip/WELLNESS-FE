import { useState } from 'react';
import { useRouter } from 'expo-router';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { EyeGlyph, EyeOffGlyph, MonthNextGlyph, WarningCircleGlyph } from '@/components/glyphs';
import { SubScreenHeader } from '@/components/ui/sub-screen-header';
import { useAuth } from '@/context/auth-context';
import { text } from '@/theme/typography';
import { usePalette } from '@/theme/use-palette';

/** `Momgirok v8.dc.html` → `isSubAccount` 를 그대로 옮긴 것. */
export default function AccountSettingsScreen() {
  const c = usePalette();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { signOut } = useAuth();
  const [pwShown, setPwShown] = useState(false);

  const finishSignOut = async () => {
    await signOut();
    router.dismissAll();
    router.replace('/(auth)/login');
  };

  const logout = () => {
    Alert.alert('로그아웃', '정말 로그아웃할까요?', [
      { text: '취소', style: 'cancel' },
      { text: '로그아웃', style: 'destructive', onPress: () => { void finishSignOut(); } },
    ]);
  };
  const withdraw = () => {
    Alert.alert('회원 탈퇴', '탈퇴하면 모든 기록이 삭제되고 되돌릴 수 없어요.', [
      { text: '취소', style: 'cancel' },
      { text: '탈퇴하기', style: 'destructive', onPress: () => { void finishSignOut(); } },
    ]);
  };

  return (
    <SafeAreaView edges={['top']} style={[s.screen, { backgroundColor: c.bg }]}>
      <SubScreenHeader backLabel="마이 화면으로 돌아가기" fallback={() => router.replace('/(tabs)/me')} title="계정 관리" />
      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 20 }} showsVerticalScrollIndicator={false}>
        <View style={[s.section, { backgroundColor: c.card }]}>
          <Text style={[text({ size: 12.5, weight: 700 }), { color: c.g500 }]}>비밀번호 변경</Text>

          <View style={s.fields}>
            <View style={[s.field, { borderColor: c.g300 }]}>
              <Text style={[text({ size: 14.5 }), { color: c.g400 }]}>현재 비밀번호</Text>
              <Pressable accessibilityLabel="비밀번호 보기" accessibilityRole="button" onPress={() => setPwShown((v) => !v)} style={s.eyeBtn}>
                {pwShown ? <EyeGlyph color={c.g500} /> : <EyeOffGlyph color={c.g500} />}
              </Pressable>
            </View>

            <View style={[s.field, s.fieldError, { borderColor: c.danger }]}>
              <Text style={[text({ size: 14.5 }), { color: c.g400 }]}>새 비밀번호</Text>
              <Text style={[text({ size: 12, weight: 700 }), { color: c.dangerDk }]}>8자 이상</Text>
            </View>

            <View style={[s.field, { borderColor: c.g300 }]}>
              <Text style={[text({ size: 14.5 }), { color: c.g400 }]}>새 비밀번호 확인</Text>
            </View>
          </View>

          <View style={s.errorRow}>
            <WarningCircleGlyph color={c.dangerDk} />
            <Text style={[text({ size: 12, weight: 600 }), { color: c.dangerDk }]}>영문·숫자를 포함해 8자 이상 입력해주세요</Text>
          </View>

          <Pressable accessibilityRole="button" accessibilityState={{ disabled: true }} disabled style={[s.submitBtn, { backgroundColor: c.g300 }]}>
            <Text style={[text({ size: 15.5, weight: 700 }), { color: '#fff' }]}>변경하기</Text>
          </Pressable>
        </View>

        <View style={[s.section, s.dangerSection, { backgroundColor: c.card }]}>
          <Pressable accessibilityRole="button" onPress={logout} style={[s.dangerRow, { borderBottomColor: c.g200, borderBottomWidth: 1 }]}>
            <Text style={[text({ size: 14.5, weight: 600, tracking: -0.025 }), { color: c.g900 }]}>로그아웃</Text>
            <MonthNextGlyph color={c.g400} size={17} />
          </Pressable>
          <Pressable accessibilityRole="button" onPress={withdraw} style={s.dangerRow}>
            <Text style={[text({ size: 14.5, weight: 600, tracking: -0.025 }), { color: c.dangerDk }]}>회원 탈퇴</Text>
            <MonthNextGlyph color={c.g400} size={17} />
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1 },
  section: { padding: 20 },
  fields: { marginTop: 14, gap: 10 },
  field: { height: 54, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 18, borderWidth: 1, borderRadius: 16 },
  fieldError: { borderWidth: 1.5 },
  eyeBtn: { width: 38, height: 38, marginRight: -10, alignItems: 'center', justifyContent: 'center' },
  errorRow: { marginTop: 10, flexDirection: 'row', alignItems: 'center', gap: 6 },
  submitBtn: { marginTop: 16, height: 52, borderRadius: 27, alignItems: 'center', justifyContent: 'center' },

  dangerSection: { marginTop: 10, paddingTop: 16, paddingHorizontal: 20, paddingBottom: 8 },
  dangerRow: { minHeight: 58, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
});
