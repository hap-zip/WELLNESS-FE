import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Image,
  Keyboard,
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

import { MonthPrevGlyph, SendArrowGlyph } from "@/components/glyphs";
import { CHEKI } from "@/lib/cheki";
import { userFacingError } from "@/services/api-error";
import { wellnessApi } from "@/services/wellness-api";
import type { Palette } from "@/theme/palette";
import { text } from "@/theme/typography";
import { usePalette } from "@/theme/use-palette";
import { toCurrentKoreanDateLabel } from "@/utils/date";
import {
  GENERATION_CANCELLED_NOTE,
  INTRO_MESSAGES,
  SUGGESTIONS,
} from "./assistant.data";

/**
 * `챗·기록 플로우 구현 프롬프트.md` A-1~A-10 을 실제 `/api/chat` 호출로 다시 짠 것.
 * 참고 기록 카드·후속 질문 칩은 백엔드 응답(reply만 있음)에 없는 정보라 뺐고,
 * 의학적 진단 요구에 대한 안전 안내는 백엔드 가드레일이 이미 처리해 준다.
 */

type ChatMessage = {
  id: string;
  role: "user" | "bot" | "system";
  text: string;
  muted?: boolean;
  createdAt: Date;
};

const INITIAL_CHAT: ChatMessage[] = [
  {
    id: "intro-0",
    role: "bot",
    text: INTRO_MESSAGES[0],
    createdAt: new Date(),
  },
  {
    id: "intro-1",
    role: "bot",
    text: INTRO_MESSAGES[1],
    muted: true,
    createdAt: new Date(),
  },
];

function messageTime(date: Date) {
  const hh = date.getHours();
  const mm = date.getMinutes();
  const period = hh < 12 ? "오전" : "오후";
  const hour12 = hh % 12 === 0 ? 12 : hh % 12;
  return `${period} ${hour12}:${String(mm).padStart(2, "0")}`;
}

export default function AssistantScreen() {
  const c = usePalette();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const scrollRef = useRef<ScrollView>(null);

  const [chat, setChat] = useState<ChatMessage[]>(INITIAL_CHAT);
  const [input, setInput] = useState("");
  const [pending, setPending] = useState(false);
  const hasSent = chat.some((m) => m.role === "user");
  const requestIdRef = useRef(0);

  // 입력창을 눌러 키보드가 올라올 때도(전송 시점뿐 아니라) 마지막 메시지·입력창이
  // 키보드에 가려지지 않도록 맨 아래로 붙여준다.
  useEffect(() => {
    const showEvent =
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const sub = Keyboard.addListener(showEvent, () => {
      requestAnimationFrame(() =>
        scrollRef.current?.scrollToEnd({ animated: true }),
      );
    });
    return () => sub.remove();
  }, []);

  const introA = useRef(new Animated.Value(0)).current;
  const introB = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(introA, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
    const t = setTimeout(() => {
      Animated.timing(introB, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }).start();
    }, 80);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const send = async (raw: string) => {
    const t = raw.trim();
    if (!t || pending) return;
    setChat((cur) => [
      ...cur,
      { id: `u${Date.now()}`, role: "user", text: t, createdAt: new Date() },
    ]);
    setInput("");
    setPending(true);
    const requestId = (requestIdRef.current += 1);
    requestAnimationFrame(() =>
      scrollRef.current?.scrollToEnd({ animated: true }),
    );
    try {
      const reply = await wellnessApi.askRecordAssistant(t, []);
      if (requestIdRef.current !== requestId) return;
      setPending(false);
      setChat((cur) => [
        ...cur,
        {
          id: reply.message.id,
          role: "bot",
          text: reply.message.text,
          createdAt: new Date(reply.message.createdAt),
        },
      ]);
    } catch (reason) {
      if (requestIdRef.current !== requestId) return;
      setPending(false);
      setChat((cur) => [
        ...cur,
        {
          id: `err${Date.now()}`,
          role: "system",
          text: userFacingError(
            reason,
            "답변을 가져오지 못했어요. 다시 시도해 주세요.",
          ),
          createdAt: new Date(),
        },
      ]);
    } finally {
      requestAnimationFrame(() =>
        scrollRef.current?.scrollToEnd({ animated: true }),
      );
    }
  };

  /** A-10 — 생성 중단. 진행 중인 요청 결과는 무시하고 조용한 상태 메모를 남긴다. */
  const cancelGeneration = () => {
    requestIdRef.current += 1;
    setPending(false);
    setChat((cur) => [
      ...cur,
      {
        id: `sys${Date.now()}`,
        role: "system",
        text: GENERATION_CANCELLED_NOTE,
        createdAt: new Date(),
      },
    ]);
  };

  return (
    <SafeAreaView edges={["top"]} style={[s.screen, { backgroundColor: c.bg }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={s.flex1}
      >
        <View
          style={[
            s.header,
            { backgroundColor: c.card, borderBottomColor: c.g200 },
          ]}
        >
          <Pressable
            accessibilityLabel="뒤로"
            accessibilityRole="button"
            onPress={() => router.back()}
            style={s.backBtn}
          >
            <MonthPrevGlyph color={c.g800} size={20} />
          </Pressable>
          <View style={[s.headerAvatar, { backgroundColor: c.priLightest }]}>
            <Image
              accessible={false}
              resizeMode="contain"
              source={CHEKI.base}
              style={s.headerAvatarImg}
            />
          </View>
          <View style={s.flex1}>
            <View style={s.headerNameRow}>
              <Text
                style={[
                  text({ size: 15.5, weight: 700, tracking: -0.03 }),
                  { color: c.g900 },
                ]}
              >
                체키
              </Text>
              <View style={[s.onlineDot, { backgroundColor: c.pri }]} />
            </View>
            <Text
              numberOfLines={1}
              style={[text({ size: 11.5 }), s.headerSub, { color: c.g500 }]}
            >
              내 기록을 바탕으로 답해요
            </Text>
          </View>
        </View>

        <ScrollView
          contentContainerStyle={s.body}
          keyboardDismissMode={
            Platform.OS === "ios" ? "interactive" : "on-drag"
          }
          keyboardShouldPersistTaps="handled"
          ref={scrollRef}
          showsVerticalScrollIndicator={false}
          style={[s.flex1, { backgroundColor: c.chatBg }]}
        >
          <View style={s.dateDividerRow}>
            <View style={s.dateChip}>
              <Text
                style={[
                  text({ size: 11, weight: 700, tracking: -0.01 }),
                  { color: c.g600 },
                ]}
              >
                {toCurrentKoreanDateLabel()}
              </Text>
            </View>
          </View>

          {chat.map((item, i) => {
            const time = messageTime(item.createdAt);
            if (item.role === "system") {
              return (
                <View key={item.id} style={s.systemNoteRow}>
                  <View style={s.systemNoteChip}>
                    <Text
                      style={[
                        text({ size: 11, weight: 600 }),
                        { color: c.g600 },
                      ]}
                    >
                      {item.text}
                    </Text>
                  </View>
                </View>
              );
            }
            if (item.role === "user") {
              return (
                <View key={item.id} style={s.userRow}>
                  <View style={s.userInner}>
                    <View style={s.userStack}>
                      <Text style={[text({ size: 10.5 }), { color: c.g500 }]}>
                        {time}
                      </Text>
                    </View>
                    <View style={[s.userBubble, { backgroundColor: c.pri }]}>
                      <Text
                        style={[
                          text({ size: 14.5, weight: 500, leading: 1.6 }),
                          { color: "#fff" },
                        ]}
                      >
                        {item.text}
                      </Text>
                    </View>
                  </View>
                </View>
              );
            }

            const consecutive = i > 0 && chat[i - 1].role === "bot";
            const introAnim = i === 0 ? introA : i === 1 ? introB : null;
            const row = (
              <View style={s.botRow}>
                {consecutive ? (
                  <View style={s.avatarSpacer} />
                ) : (
                  <View style={[s.avatar, { backgroundColor: c.priLightest }]}>
                    <Image
                      accessible={false}
                      resizeMode="contain"
                      source={CHEKI.base}
                      style={s.avatarImg}
                    />
                  </View>
                )}
                <View style={s.flex1}>
                  {!consecutive ? (
                    <Text
                      style={[
                        text({ size: 11.5, weight: 600 }),
                        s.botName,
                        { color: c.g600 },
                      ]}
                    >
                      체키
                    </Text>
                  ) : null}
                  <View style={s.bubbleRow}>
                    <View
                      style={[
                        s.botBubble,
                        { backgroundColor: c.card },
                        consecutive && s.botBubbleFlat,
                      ]}
                    >
                      <Text
                        style={
                          item.muted
                            ? [
                                text({ size: 13.5 }),
                                { lineHeight: 22.3, color: c.g600 },
                              ]
                            : [
                                text({ size: 14.5, leading: 1.7 }),
                                { color: c.g900 },
                              ]
                        }
                      >
                        {item.text}
                      </Text>
                    </View>
                    <Text
                      style={[
                        text({ size: 10.5 }),
                        s.botTime,
                        { color: c.g500 },
                      ]}
                    >
                      {time}
                    </Text>
                  </View>
                </View>
              </View>
            );

            if (!introAnim) return <View key={item.id}>{row}</View>;
            return (
              <Animated.View
                key={item.id}
                style={{
                  opacity: introAnim,
                  transform: [
                    {
                      translateY: introAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [10, 0],
                      }),
                    },
                  ],
                }}
              >
                {row}
              </Animated.View>
            );
          })}

          {!hasSent ? (
            <View style={s.quickReplyWrap}>
              <Text
                style={[
                  text({ size: 11, weight: 700 }),
                  s.quickReplyLabel,
                  { color: c.g500 },
                ]}
              >
                이런 걸 물어볼 수 있어요
              </Text>
              {SUGGESTIONS.map((q) => (
                <ChipButton
                  borderRadius={20}
                  c={c}
                  key={q}
                  label={q}
                  minHeight={38}
                  onPress={() => void send(q)}
                  paddingHorizontal={15}
                />
              ))}
            </View>
          ) : null}

          {pending ? (
            <View style={s.typingRow}>
              <View style={[s.avatar, { backgroundColor: c.priLightest }]}>
                <Image
                  accessible={false}
                  resizeMode="contain"
                  source={CHEKI.base}
                  style={s.avatarImg}
                />
              </View>
              <View style={[s.typingBubble, { backgroundColor: c.card }]}>
                <TypingDot color={c.g400} delay={0} />
                <TypingDot color={c.g400} delay={180} />
                <TypingDot color={c.g400} delay={360} />
              </View>
              <Pressable
                accessibilityLabel="답변 생성 중단"
                accessibilityRole="button"
                onPress={cancelGeneration}
                style={s.stopBtn}
              >
                <Text
                  style={[text({ size: 11.5, weight: 700 }), { color: c.g500 }]}
                >
                  중단
                </Text>
              </Pressable>
            </View>
          ) : null}
        </ScrollView>

        <View
          style={[
            s.composer,
            {
              backgroundColor: c.card,
              borderTopColor: c.g200,
              paddingBottom: insets.bottom ? insets.bottom : 12,
            },
          ]}
        >
          <View style={s.composerRow}>
            <View style={[s.inputRow, { backgroundColor: c.g100 }]}>
              <TextInput
                accessibilityLabel="메시지 입력"
                multiline
                onChangeText={setInput}
                placeholder="메시지 입력"
                placeholderTextColor={c.g400}
                style={[s.input, { color: c.g900 }]}
                value={input}
              />
              <Pressable
                accessibilityLabel="보내기"
                accessibilityRole="button"
                accessibilityState={{ disabled: !input.trim() }}
                disabled={!input.trim()}
                onPress={() => void send(input)}
                style={[
                  s.sendBtn,
                  { backgroundColor: input.trim() ? c.pri : c.g300 },
                ]}
              >
                <SendArrowGlyph color="#fff" size={16} />
              </Pressable>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

/** A-8 타이핑 인디케이터의 점 하나. opacity 0.3 → 1 → 0.3, 1100ms 무한 반복. */
function TypingDot({ color, delay }: { color: string; delay: number }) {
  const opacity = useRef(new Animated.Value(0.3)).current;
  useEffect(() => {
    const pulse = Animated.sequence([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 550,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0.3,
        duration: 550,
        useNativeDriver: true,
      }),
    ]);
    const loop = Animated.loop(pulse);
    const t = setTimeout(() => loop.start(), delay);
    return () => {
      clearTimeout(t);
      loop.stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <Animated.View style={[s.typingDot, { backgroundColor: color, opacity }]} />
  );
}

/** A-5 / A-7 공용 칩. 누르는 동안 scale 0.97, 120ms. */
function ChipButton({
  c,
  label,
  onPress,
  minHeight,
  paddingHorizontal,
  borderRadius,
}: {
  c: Palette;
  label: string;
  onPress: () => void;
  minHeight: number;
  paddingHorizontal: number;
  borderRadius: number;
}) {
  const scale = useRef(new Animated.Value(1)).current;
  const pressIn = () =>
    Animated.timing(scale, {
      toValue: 0.97,
      duration: 120,
      useNativeDriver: true,
    }).start();
  const pressOut = () =>
    Animated.timing(scale, {
      toValue: 1,
      duration: 120,
      useNativeDriver: true,
    }).start();
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      onPressIn={pressIn}
      onPressOut={pressOut}
      style={s.chipPressable}
    >
      <Animated.View
        style={[
          s.chip,
          {
            minHeight,
            paddingHorizontal,
            borderRadius,
            borderColor: c.pri,
            backgroundColor: c.card,
            transform: [{ scale }],
          },
        ]}
      >
        <Text
          style={[
            text({ size: 13, weight: 600, tracking: -0.02 }),
            { color: c.priDk },
          ]}
        >
          {label}
        </Text>
      </Animated.View>
    </Pressable>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1 },
  flex1: { flex: 1, minWidth: 0 },

  header: {
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingLeft: 4,
    paddingRight: 12,
    borderBottomWidth: 1,
  },
  backBtn: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  headerAvatar: {
    width: 38,
    height: 38,
    borderRadius: 20,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "flex-end",
  },
  headerAvatarImg: { width: 36, height: 36, marginBottom: -3 },
  headerNameRow: { flexDirection: "row", alignItems: "center", gap: 5 },
  onlineDot: { width: 6, height: 6, borderRadius: 4 },
  headerSub: { marginTop: 1 },
  moreBtn: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },

  body: { paddingTop: 14, paddingHorizontal: 14, paddingBottom: 6 },

  dateDividerRow: { alignItems: "center", marginBottom: 16 },
  dateChip: {
    height: 24,
    paddingHorizontal: 12,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(22, 25, 29, 0.09)",
  },

  botRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    marginBottom: 18,
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 20,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "flex-end",
  },
  avatarImg: { width: 36, height: 36, marginBottom: -3 },
  avatarSpacer: { width: 38 },
  botName: { marginBottom: 5 },
  bubbleRow: { flexDirection: "row", alignItems: "flex-end", gap: 6 },
  botBubble: {
    maxWidth: 252,
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 16,
    borderBottomRightRadius: 16,
    borderBottomLeftRadius: 16,
  },
  botBubbleFlat: { borderTopLeftRadius: 16 },
  botTime: { paddingBottom: 2 },

  quickReplyWrap: {
    marginTop: 14,
    paddingLeft: 46,
    alignItems: "flex-start",
    gap: 7,
  },
  quickReplyLabel: { paddingLeft: 2 },
  chipPressable: { alignSelf: "flex-start", maxWidth: "100%" },
  chip: {
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 1,
  },

  userRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginBottom: 14,
  },
  userInner: {
    maxWidth: "88%",
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 6,
  },
  userStack: { alignItems: "flex-end", gap: 1, paddingBottom: 2 },
  userBubble: {
    paddingVertical: 11,
    paddingHorizontal: 14,
    borderTopRightRadius: 4,
    borderTopLeftRadius: 16,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },

  typingRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 8,
    paddingTop: 2,
    paddingBottom: 12,
  },
  typingBubble: {
    height: 38,
    paddingHorizontal: 16,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 16,
    borderBottomRightRadius: 16,
    borderBottomLeftRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  typingDot: { width: 7, height: 7, borderRadius: 4 },
  stopBtn: {
    height: 38,
    paddingHorizontal: 4,
    alignItems: "center",
    justifyContent: "center",
  },

  systemNoteRow: { alignItems: "center", marginBottom: 16 },
  systemNoteChip: {
    height: 24,
    paddingHorizontal: 12,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(22, 25, 29, 0.09)",
  },

  composer: { paddingTop: 8, paddingHorizontal: 10, borderTopWidth: 1 },
  composerRow: { flexDirection: "row", alignItems: "flex-end", gap: 4 },
  attachBtn: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  inputRow: {
    flex: 1,
    minHeight: 44,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingLeft: 15,
    paddingRight: 5,
    borderRadius: 23,
  },
  // 프로토타입은 웹 textarea라 px 상한이 없다 — "최대 4줄"을 14.5/1.4 줄간격 기준으로 환산해 높이 상한만 근사.
  input: {
    flex: 1,
    minWidth: 0,
    minHeight: 42,
    maxHeight: 42 + 20.3 * 3,
    fontSize: 14.5,
    paddingVertical: 10,
  },
  sendBtn: {
    width: 38,
    height: 38,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
});
