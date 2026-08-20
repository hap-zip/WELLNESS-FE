import { useRouter } from "expo-router";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

import { BrandWordmarkImage } from "@/components/brand-logo";
import { EyeGlyph, EyeOffGlyph } from "@/components/glyphs";
import { useAuth } from "@/context/auth-context";
import { userFacingError } from "@/services/api-error";
import { authApi } from "@/services/auth-api";
import { text } from "@/theme/typography";
import { usePalette } from "@/theme/use-palette";

// BrandWordmarkImage는 3:2 비율 고정 이미지다 — logoBlock 높이는 항상 이 값에서 계산해야
// 폭을 바꿔도 잘리지 않는다. overflow:hidden은 혹시 이미지 쪽 크기 계산이 어긋나도
// 화면 전체를 뒤덮지 않도록 하는 안전장치다.
const LOGO_WIDTH = 220;
const LOGO_HEIGHT = (LOGO_WIDTH * 2) / 3;

/**
 * `Momgirok v8.dc.html` → `isLogin` 을 그대로 옮긴 것.
 * 개발 테스트 계정 자동 입력은 README 지시대로 제품 UI에 노출하지 않는다.
 */
export default function LoginScreen() {
  const c = usePalette();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { startSession } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [signingIn, setSigningIn] = useState(false);
  const [loginError, setLoginError] = useState("");
  const canSubmit =
    email.trim().length > 0 && password.length > 0 && !signingIn;

  const enter = async () => {
    setSigningIn(true);
    setLoginError("");
    try {
      const result = await authApi.signIn({ email, password });
      await startSession({
        accessToken: result.accessToken,
        userId: result.userId,
        mode: "authenticated",
        onboardingComplete: true,
        email: result.email,
        name: result.name,
      });
      router.replace("/(tabs)/home");
    } catch (reason) {
      setLoginError(
        userFacingError(reason, "로그인하지 못했어요. 다시 시도해 주세요."),
      );
    } finally {
      setSigningIn(false);
    }
  };

  return (
    <SafeAreaView
      edges={["top", "bottom"]}
      style={[
        s.screen,
        { backgroundColor: c.card, paddingBottom: 28 + insets.bottom },
      ]}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={s.flex1}
      >
        <ScrollView
          contentContainerStyle={s.main}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={s.logoBlock}>
            <BrandWordmarkImage width={LOGO_WIDTH} />
          </View>

          <Text
            style={[
              text({ size: 25, weight: 700, tracking: -0.04, leading: 1.4 }),
              s.title,
              { color: c.g900 },
            ]}
          >
            오늘의 몸을{"\n"}기록해볼까요?
          </Text>
          <Text
            style={[text({ size: 14, leading: 1.7 }), s.sub, { color: c.g600 }]}
          >
            3분이면 오늘 하루가 한 줄로 남아요.
          </Text>

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
              <Pressable
                accessibilityLabel={showPw ? "비밀번호 숨기기" : "비밀번호 보기"}
                accessibilityRole="button"
                hitSlop={8}
                onPress={() => setShowPw((v) => !v)}
              >
                {showPw ? (
                  <EyeGlyph color={c.g400} />
                ) : (
                  <EyeOffGlyph color={c.g400} />
                )}
              </Pressable>
            </View>
          </View>

          {loginError ? (
            <Text
              style={[
                text({ size: 12.5, weight: 600 }),
                s.error,
                { color: c.danger },
              ]}
            >
              {loginError}
            </Text>
          ) : null}

          <Pressable
            accessibilityRole="button"
            accessibilityState={{ disabled: !canSubmit }}
            disabled={!canSubmit}
            onPress={() => void enter()}
            style={({ pressed }) => [
              s.loginBtn,
              { backgroundColor: c.pri, opacity: canSubmit ? 1 : 0.5 },
              pressed && canSubmit && s.pressed,
            ]}
          >
            <Text style={[text({ size: 16, weight: 700 }), { color: "#fff" }]}>
              {signingIn ? "로그인하는 중…" : "로그인"}
            </Text>
          </Pressable>

          <View style={s.linksRow}>
            <Pressable
              accessibilityRole="button"
              onPress={() => router.push("/(auth)/signup")}
              style={s.linkBtn}
            >
              <Text style={[text({ size: 13, weight: 600 }), { color: c.g700 }]}>
                회원가입
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, paddingHorizontal: 20 },
  pressed: { transform: [{ scale: 0.975 }] },

  flex1: { flex: 1 },
  // ScrollView의 contentContainerStyle — 내용이 화면보다 짧으면(키보드 닫힘) 가운데 정렬되고,
  // 키보드가 올라와 공간이 모자라면 자연스럽게 위로 붙으며 스크롤 가능해진다.
  main: { flexGrow: 1, justifyContent: "center" },
  logoBlock: {
    height: LOGO_HEIGHT,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  title: { marginTop: 12, textAlign: "center" },
  sub: { marginTop: 10, textAlign: "center" },

  fields: { marginTop: 30, gap: 10 },
  field: {
    height: 54,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    borderWidth: 1,
    borderRadius: 16,
  },
  fieldInput: { flex: 1, minWidth: 0, height: "100%", padding: 0 },
  error: { marginTop: 10, textAlign: "center" },

  loginBtn: {
    marginTop: 16,
    height: 54,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  linksRow: {
    marginTop: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
  },
  linkBtn: { minHeight: 40, alignItems: "center", justifyContent: "center" },
});
