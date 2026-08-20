import { useState } from 'react';
import { useRouter } from 'expo-router';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { EyeGlyph, EyeOffGlyph, MonthNextGlyph } from '@/components/glyphs';
import { SubScreenHeader } from '@/components/ui/sub-screen-header';
import { useAuth } from '@/context/auth-context';
import { authApi } from '@/services/auth-api';
import { userFacingError } from '@/services/api-error';
import { text } from '@/theme/typography';
import { usePalette } from '@/theme/use-palette';

/** `Momgirok v8.dc.html` → `isSubAccount` 를 그대로 옮긴 것.
 * 비밀번호 변경 섹션은 백엔드에 해당 엔드포인트가 없어서 빼뒀다. */
export default function AccountSettingsScreen() {
  const c = usePalette();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { session, signOut } = useAuth();
  const [confirmingWithdraw, setConfirmingWithdraw] = useState(false);
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

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

  const cancelWithdraw = () => {
    setConfirmingWithdraw(false);
    setPassword('');
    setError('');
  };

  const submitWithdraw = async () => {
    if (submitting) return;
    if (!session?.email) {
      setError('세션 정보가 없어요. 다시 로그인한 뒤 시도해 주세요.');
      return;
    }
    if (!password) {
      setError('비밀번호를 입력해 주세요.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      await authApi.withdraw({ email: session.email, password });
      await finishSignOut();
    } catch (reason) {
      setError(userFacingError(reason, '탈퇴하지 못했어요. 비밀번호를 확인해 주세요.'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView edges={['top']} style={[s.screen, { backgroundColor: c.bg }]}>
      <SubScreenHeader backLabel="마이 화면으로 돌아가기" fallback={() => router.replace('/(tabs)/me')} title="계정 관리" />
      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 20 }} showsVerticalScrollIndicator={false}>
        <View style={[s.section, s.dangerSection, { backgroundColor: c.card }]}>
          <Pressable accessibilityRole="button" onPress={logout} style={[s.dangerRow, { borderBottomColor: c.g200, borderBottomWidth: 1 }]}>
            <Text style={[text({ size: 14.5, weight: 600, tracking: -0.025 }), { color: c.g900 }]}>로그아웃</Text>
            <MonthNextGlyph color={c.g400} size={17} />
          </Pressable>
          <Pressable accessibilityRole="button" onPress={() => setConfirmingWithdraw((v) => !v)} style={[s.dangerRow, confirmingWithdraw && { borderBottomColor: c.g200, borderBottomWidth: 1 }]}>
            <Text style={[text({ size: 14.5, weight: 600, tracking: -0.025 }), { color: c.dangerDk }]}>회원 탈퇴</Text>
            <MonthNextGlyph color={c.g400} size={17} />
          </Pressable>

          {confirmingWithdraw ? (
            <View style={s.withdrawBox}>
              <Text style={[text({ size: 12.5, leading: 1.7 }), { color: c.g600 }]}>탈퇴하면 모든 기록이 삭제되고 되돌릴 수 없어요. 계속하려면 비밀번호를 입력해 주세요.</Text>
              <View style={[s.field, { borderColor: c.g300 }]}>
                <TextInput
                  autoCapitalize="none"
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
              {error ? <Text style={[text({ size: 12, weight: 600 }), s.errorText, { color: c.danger }]}>{error}</Text> : null}
              <View style={s.withdrawActions}>
                <Pressable accessibilityRole="button" onPress={cancelWithdraw} style={[s.cancelBtn, { borderColor: c.g300 }]}>
                  <Text style={[text({ size: 13.5, weight: 700 }), { color: c.g700 }]}>취소</Text>
                </Pressable>
                <Pressable accessibilityRole="button" accessibilityState={{ disabled: submitting }} disabled={submitting} onPress={() => void submitWithdraw()} style={[s.confirmBtn, { backgroundColor: c.danger, opacity: submitting ? 0.6 : 1 }]}>
                  <Text style={[text({ size: 13.5, weight: 700 }), { color: '#fff' }]}>{submitting ? '탈퇴하는 중…' : '탈퇴하기'}</Text>
                </Pressable>
              </View>
            </View>
          ) : null}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1 },
  section: { padding: 20 },

  dangerSection: { paddingTop: 16, paddingHorizontal: 20, paddingBottom: 8 },
  dangerRow: { minHeight: 58, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },

  withdrawBox: { paddingTop: 16, paddingBottom: 18 },
  field: { marginTop: 12, height: 50, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, borderWidth: 1, borderRadius: 14 },
  fieldInput: { flex: 1, minWidth: 0, height: '100%', padding: 0 },
  errorText: { marginTop: 8 },
  withdrawActions: { marginTop: 14, flexDirection: 'row', gap: 8 },
  cancelBtn: { flex: 1, height: 46, borderWidth: 1, borderRadius: 23, alignItems: 'center', justifyContent: 'center' },
  confirmBtn: { flex: 1, height: 46, borderRadius: 23, alignItems: 'center', justifyContent: 'center' },
});
