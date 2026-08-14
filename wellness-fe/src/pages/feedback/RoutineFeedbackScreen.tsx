import { useState } from 'react';
import { useRouter } from 'expo-router';
import { KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BigCheckGlyph, TrendGlyph } from '@/components/glyphs';
import { text } from '@/theme/typography';
import { usePalette } from '@/theme/use-palette';
import { FB_OPTIONS, fbNoteFor } from '@/pages/routine/routine.data';

/**
 * `Momgirok v8.dc.html` → `isFeedback` (Bottom Sheet) 을 그대로 옮긴 것.
 * 루틴 완료 다음 날 알림을 눌러 들어오는 것을 가정한 시연이라 날짜·시각은 고정 문구다.
 */
export default function RoutineFeedbackScreen() {
  const c = usePalette();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [picked, setPicked] = useState<number | null>(null);
  const [memo, setMemo] = useState('');

  const close = () => router.back();

  return (
    <View style={s.overlay}>
      <Pressable accessibilityLabel="닫기" accessibilityRole="button" onPress={close} style={StyleSheet.absoluteFill} />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={[s.sheet, { backgroundColor: c.card }]}>
          <View style={s.handleWrap}><View style={[s.handle, { backgroundColor: c.g300 }]} /></View>
          <View style={[s.content, { paddingBottom: 30 + insets.bottom }]}>
            <Text style={[text({ size: 11.5, weight: 700 }), { color: c.g500 }]}>어제 오후 9:20 · 목 주변 가볍게 이완하기</Text>
            <Text style={[text({ size: 22, weight: 700, tracking: -0.04, leading: 1.42 }), s.title, { color: c.g900 }]}>어제 루틴이{'\n'}도움이 됐나요?</Text>
            <Text style={[text({ size: 12.5, leading: 1.7 }), s.sub, { color: c.g600 }]}>답해주시면 다음 루틴 추천에 반영해요.</Text>

            <View style={s.optionList}>
              {FB_OPTIONS.map((opt) => {
                const on = picked === opt.id;
                const tone = opt.tone === 'ok' ? c.pri : opt.tone === 'bad' ? c.danger : c.g500;
                const soft = opt.tone === 'ok' ? c.priLightest : opt.tone === 'bad' ? c.dangerBg : c.g100;
                return (
                  <Pressable key={opt.id} accessibilityRole="button" accessibilityState={{ selected: on }} onPress={() => setPicked(opt.id)} style={[s.optionRow, { borderColor: on ? tone : c.g200, backgroundColor: on ? soft : c.card }]}>
                    <View style={[s.optionIconWrap, { backgroundColor: on ? c.card : c.g100 }]}>
                      <TrendGlyph color={on ? tone : c.g500} kind={opt.icon} />
                    </View>
                    <Text style={[text({ size: 15.5, weight: 700, tracking: -0.03 }), s.flex1, { color: c.g900 }]}>{opt.label}</Text>
                    {on ? (
                      <View style={[s.optionCheck, { backgroundColor: tone }]}>
                        <BigCheckGlyph color="#fff" size={13} strokeWidth={3.4} />
                      </View>
                    ) : null}
                  </Pressable>
                );
              })}
            </View>

            <View style={s.memoHead}>
              <Text style={[text({ size: 12.5, weight: 700 }), { color: c.g700 }]}>메모 (선택)</Text>
              <Text style={[text({ size: 11 }), { color: c.g400 }]}>{memo.length}/100</Text>
            </View>
            <TextInput
              maxLength={100}
              multiline
              onChangeText={setMemo}
              placeholder="느낀 변화가 있다면 적어주세요"
              placeholderTextColor={c.g400}
              style={[s.memoInput, { borderColor: c.g300, color: c.g900 }]}
              value={memo}
            />

            {picked !== null ? (
              <View style={[s.noteBox, { backgroundColor: c.priLightest }]}>
                <Text style={[text({ size: 12.5, leading: 1.7 }), { color: c.priDk }]}>{fbNoteFor(picked)}</Text>
              </View>
            ) : null}

            <Pressable accessibilityRole="button" accessibilityState={{ disabled: picked === null }} disabled={picked === null} onPress={close} style={[s.submitBtn, { backgroundColor: picked === null ? c.g300 : c.pri }]}>
              <Text style={[text({ size: 16, weight: 700 }), { color: '#fff' }]}>답변 보내기</Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const s = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(22,25,29,.38)' },
  flex1: { flex: 1, minWidth: 0 },
  sheet: { borderTopLeftRadius: 26, borderTopRightRadius: 26 },
  handleWrap: { alignItems: 'center', paddingTop: 10, paddingBottom: 4 },
  handle: { width: 38, height: 4, borderRadius: 3 },
  content: { paddingTop: 10, paddingHorizontal: 20 },
  title: { marginTop: 8 },
  sub: { marginTop: 6 },

  optionList: { marginTop: 20, gap: 9 },
  optionRow: { minHeight: 58, flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, borderWidth: 1.5, borderRadius: 16 },
  optionIconWrap: { width: 32, height: 32, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  optionCheck: { width: 22, height: 22, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },

  memoHead: { marginTop: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  memoInput: { marginTop: 9, minHeight: 72, paddingVertical: 13, paddingHorizontal: 15, borderWidth: 1, borderRadius: 16, fontSize: 13.5, lineHeight: 23 },

  noteBox: { marginTop: 16, padding: 13, paddingHorizontal: 15, borderRadius: 14 },
  submitBtn: { marginTop: 18, height: 54, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
});
