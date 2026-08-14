import { useRef, useState } from 'react';
import { useRouter } from 'expo-router';
import { Image, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { CHEKI } from '@/lib/cheki';
import { ChevronSmallGlyph, MonthPrevGlyph, MoreDotsGlyph, SendArrowGlyph } from '@/components/glyphs';
import { text } from '@/theme/typography';
import { usePalette } from '@/theme/use-palette';
import type { Palette } from '@/theme/palette';
import { BOT_REFERENCES, BOT_REPLY, BOT_REPLY_DELAY_MS, SUGGESTIONS } from './assistant.data';

/**
 * `Momgirok v8.dc.html` → `<sc-if value="{{ isChat }}">` 를 그대로 옮긴 것.
 *
 * v8 은 고정된 데모 응답 하나만 900ms 뒤에 붙이는 정적 챗이다 — README 의
 * "미구현" 목록에 실패·재전송·중단·대화 목록이 명시돼 있어 그대로 둔다.
 * (예전 구현에 있던 약 포장 사진 인식·공식 의약품 정보 카드는 v8 스펙에 없다.)
 */

type ChatMessage = { id: string; role: 'user' | 'bot'; text: string };

export default function AssistantScreen() {
  const c = usePalette();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const scrollRef = useRef<ScrollView>(null);

  const [chat, setChat] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [pending, setPending] = useState(false);

  const send = (raw: string) => {
    const t = raw.trim();
    if (!t || pending) return;
    setChat((cur) => [...cur, { id: `u${Date.now()}`, role: 'user', text: t }]);
    setInput('');
    setPending(true);
    setTimeout(() => {
      setPending(false);
      setChat((cur) => [...cur, { id: `b${Date.now()}`, role: 'bot', text: BOT_REPLY }]);
      requestAnimationFrame(() => scrollRef.current?.scrollToEnd({ animated: true }));
    }, BOT_REPLY_DELAY_MS);
    requestAnimationFrame(() => scrollRef.current?.scrollToEnd({ animated: true }));
  };

  return (
    <SafeAreaView edges={['top']} style={[s.screen, { backgroundColor: c.bg }]}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={s.flex1}>
        <View style={[s.header, { backgroundColor: c.card, borderBottomColor: c.g200 }]}>
          <Pressable accessibilityLabel="뒤로" accessibilityRole="button" onPress={() => router.back()} style={s.backBtn}>
            <MonthPrevGlyph color={c.g800} size={20} />
          </Pressable>
          <View style={[s.headerAvatar, { backgroundColor: c.priLightest }]}>
            <Image accessible={false} resizeMode="contain" source={CHEKI.base} style={s.headerAvatarImg} />
          </View>
          <View style={s.flex1}>
            <View style={s.headerNameRow}>
              <Text style={[text({ size: 15.5, weight: 700, tracking: -0.03 }), { color: c.g900 }]}>체키</Text>
              <View style={[s.onlineDot, { backgroundColor: c.pri }]} />
            </View>
            <Text numberOfLines={1} style={[text({ size: 11.5 }), { color: c.g500 }]}>내 기록을 바탕으로 답해요 · 최근 14일</Text>
          </View>
          <Pressable accessibilityLabel="더보기" accessibilityRole="button" style={s.moreBtn}>
            <MoreDotsGlyph color={c.g600} size={19} />
          </Pressable>
        </View>

        <ScrollView contentContainerStyle={s.body} ref={scrollRef} showsVerticalScrollIndicator={false}>
          {chat.length === 0 ? (
            <View>
              <View style={s.introHero}>
                <Image accessibilityIgnoresInvertColors accessibilityLabel="체키가 클립보드를 들고 안내할 준비를 하고 있어요" resizeMode="contain" source={CHEKI.chat} style={s.introMascot} />
                <Text style={[text({ size: 16.5, weight: 700, tracking: -0.03, leading: 1.55 }), s.introTitle, { color: c.g900 }]}>기록에서 무엇을 찾아볼까요?</Text>
                <Text style={[text({ size: 12.5, leading: 1.65 }), s.introSub, { color: c.g600 }]}>수면·불편·활동을 함께 읽어 정리해요. 진단이나 처방은 하지 않아요.</Text>
              </View>
              <View style={s.suggestionList}>
                {SUGGESTIONS.map((q) => (
                  <Pressable key={q} accessibilityRole="button" onPress={() => send(q)} style={[s.suggestionRow, { borderColor: c.g200, backgroundColor: c.card }]}>
                    <Text style={[text({ size: 13.5, weight: 600, tracking: -0.02 }), { color: c.g800 }]}>{q}</Text>
                    <ChevronSmallGlyph color={c.g400} />
                  </Pressable>
                ))}
              </View>
            </View>
          ) : null}

          {chat.map((item) => (
            <View key={item.id} style={item.role === 'user' ? s.userWrap : s.botWrap}>
              {item.role === 'user' ? (
                <View style={[s.userBubble, { backgroundColor: c.pri }]}>
                  <Text style={[text({ size: 14.5, weight: 500, leading: 1.6 }), { color: '#fff' }]}>{item.text}</Text>
                </View>
              ) : (
                <View style={s.botRow}>
                  <View style={[s.rule, { backgroundColor: c.pri }]} />
                  <View style={s.flex1}>
                    <Text style={[text({ size: 14.5, leading: 1.75 }), s.botBubble, { backgroundColor: c.card, borderColor: c.g200, color: c.g800 }]}>{item.text}</Text>
                    <View style={[s.refCard, { backgroundColor: c.card, borderColor: c.g200 }]}>
                      <Text style={[text({ size: 11.5, weight: 700 }), { color: c.g500 }]}>참고한 기록</Text>
                      {BOT_REFERENCES.map((ref, i) => (
                        <View key={ref.key} style={[s.refRow, i > 0 && { borderTopWidth: 1, borderTopColor: c.g200 }]}>
                          <Text style={[text({ size: 12.5 }), { color: c.g600 }]}>{ref.label}</Text>
                          <Text style={[text({ size: 12.5, weight: 700, tabular: true }), { color: ref.danger ? c.danger : c.g900 }]}>{ref.value}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                </View>
              )}
            </View>
          ))}

          {pending ? (
            <View style={s.pendingRow}>
              <View style={[s.pendingDot, { backgroundColor: c.pri }]} />
              <Text style={[text({ size: 12.5, weight: 600 }), { color: c.g500 }]}>기록을 읽는 중</Text>
            </View>
          ) : null}
        </ScrollView>

        <View style={[s.composer, { backgroundColor: c.card, borderTopColor: c.g200, paddingBottom: 14 + insets.bottom }]}>
          <View style={[s.inputRow, { backgroundColor: c.g100 }]}>
            <TextInput
              accessibilityLabel="질문 입력"
              onChangeText={setInput}
              onSubmitEditing={() => send(input)}
              placeholder="궁금한 내용을 입력하세요"
              placeholderTextColor={c.g400}
              returnKeyType="send"
              style={[s.input, { color: c.g900 }]}
              value={input}
            />
            <Pressable accessibilityLabel="보내기" accessibilityRole="button" accessibilityState={{ disabled: !input.trim() }} disabled={!input.trim()} onPress={() => send(input)} style={[s.sendBtn, { backgroundColor: input.trim() ? c.pri : c.g300 }]}>
              <SendArrowGlyph color="#fff" />
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1 },
  flex1: { flex: 1, minWidth: 0 },

  header: { height: 56, flexDirection: 'row', alignItems: 'center', gap: 8, paddingLeft: 4, paddingRight: 12, borderBottomWidth: 1 },
  backBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  headerAvatar: { width: 38, height: 38, borderRadius: 20, overflow: 'hidden', alignItems: 'center', justifyContent: 'flex-end' },
  headerAvatarImg: { width: 36, height: 36, marginBottom: -3 },
  headerNameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  onlineDot: { width: 6, height: 6, borderRadius: 4 },
  moreBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },

  body: { paddingTop: 20, paddingHorizontal: 20, paddingBottom: 8 },
  introHero: { alignItems: 'center', paddingHorizontal: 8 },
  introMascot: { width: 148, height: 148 },
  introTitle: { marginTop: 4, textAlign: 'center' },
  rule: { width: 3, alignSelf: 'stretch', borderRadius: 2 },
  introSub: { marginTop: 6, textAlign: 'center' },
  suggestionList: { marginTop: 20, gap: 8 },
  suggestionRow: { minHeight: 52, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10, paddingHorizontal: 16, borderWidth: 1, borderRadius: 26 },

  userWrap: { marginBottom: 16, flexDirection: 'row', justifyContent: 'flex-end' },
  userBubble: { maxWidth: '80%', paddingVertical: 12, paddingHorizontal: 16, borderTopLeftRadius: 18, borderTopRightRadius: 18, borderBottomLeftRadius: 18, borderBottomRightRadius: 4 },
  botWrap: { marginBottom: 16, flexDirection: 'row', justifyContent: 'flex-start' },
  botRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, width: '100%' },
  botBubble: { padding: 14, paddingHorizontal: 16, borderTopLeftRadius: 18, borderTopRightRadius: 18, borderBottomRightRadius: 18, borderBottomLeftRadius: 4, borderWidth: 1 },
  refCard: { marginTop: 8, padding: 14, borderRadius: 16, borderWidth: 1 },
  refRow: { marginTop: 10, minHeight: 30, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },

  pendingRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 4, paddingBottom: 14 },
  pendingDot: { width: 6, height: 6, borderRadius: 4 },

  composer: { paddingTop: 10, paddingHorizontal: 16, borderTopWidth: 1 },
  inputRow: { height: 48, flexDirection: 'row', alignItems: 'center', gap: 8, paddingLeft: 16, paddingRight: 5, borderRadius: 25 },
  input: { flex: 1, minWidth: 0, height: 44, fontSize: 14 },
  sendBtn: { width: 38, height: 38, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
});
