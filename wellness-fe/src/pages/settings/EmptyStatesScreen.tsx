import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { BigCheckGlyph, StateIconGlyph } from '@/components/glyphs';
import { text } from '@/theme/typography';
import { usePalette } from '@/theme/use-palette';
import type { Palette } from '@/theme/palette';
import { STATES, type StateDef } from './states.data';

/**
 * `Momgirok v8.dc.html` → `<sc-if value="{{ isStates }}">` 를 그대로 옮긴 것.
 * 디자인 QA 용 상태 갤러리 — 실제 사용자 화면이 아니라 16종 상태를 한 곳에서
 * 훑어보는 개발자 도구다.
 */
export default function EmptyStatesScreen() {
  const c = usePalette();
  const [id, setId] = useState(STATES[0].id);
  const st = STATES.find((x) => x.id === id) ?? STATES[0];
  const idx = STATES.findIndex((x) => x.id === id) + 1;

  return (
    <View style={[s.screen, { backgroundColor: c.bg }]}>
      <View style={[s.header, { backgroundColor: c.card, borderBottomColor: c.g200 }]}>
        <Text style={[text({ size: 16, weight: 700, tracking: -0.03 }), { color: c.g900 }]}>공통 상태</Text>
        <Text style={[text({ size: 11.5, weight: 600 }), { color: c.g500 }]}>{idx} / 16</Text>
      </View>

      <ScrollView horizontal contentContainerStyle={[s.tabs, { backgroundColor: c.card, borderBottomColor: c.g200 }]} showsHorizontalScrollIndicator={false} style={s.tabsScroll}>
        {STATES.map((x) => {
          const active = x.id === id;
          return (
            <Pressable key={x.id} accessibilityRole="button" accessibilityState={{ selected: active }} onPress={() => setId(x.id)} style={[s.tab, { borderColor: active ? c.g900 : c.g200, backgroundColor: active ? c.g900 : 'transparent' }]}>
              <Text style={[text({ size: 11.5, weight: active ? 700 : 500 }), { color: active ? c.card : c.g500 }]}>{x.label}</Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <ScrollView contentContainerStyle={s.body} showsVerticalScrollIndicator={false}>
        {st.kind === 'skeleton' ? <Skeleton c={c} rows={st.rows ?? []} /> : null}
        {st.kind === 'message' ? <MessageState c={c} st={st} /> : null}
        {st.kind === 'toast' ? <ToastState c={c} st={st} /> : null}
      </ScrollView>
    </View>
  );
}

function Skeleton({ c, rows }: { c: Palette; rows: number[] }) {
  return (
    <View style={s.skelWrap}>
      {rows.map((h, i) => <SkeletonRow c={c} delay={i * 120} h={h} key={i} />)}
    </View>
  );
}

function SkeletonRow({ c, h, delay }: { c: Palette; h: number; delay: number }) {
  const opacity = useRef(new Animated.Value(0.55)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 650, delay, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.55, duration: 650, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [opacity, delay]);
  return <Animated.View style={{ height: h, borderRadius: h > 40 ? 16 : 8, backgroundColor: c.g200, opacity }} />;
}

function MessageState({ c, st }: { c: Palette; st: StateDef }) {
  const iconBg = st.tone === 'err' ? c.dangerBg : st.tone === 'warn' ? '#FFF6E5' : c.g100;
  const iconColor = st.tone === 'err' ? c.dangerDk : st.tone === 'warn' ? '#A2761E' : c.g600;
  return (
    <View style={[s.messageCard, { backgroundColor: c.card }]}>
      {st.icon ? (
        <View style={[s.messageIconWrap, { backgroundColor: iconBg }]}>
          <StateIconGlyph color={iconColor} id={st.icon} />
        </View>
      ) : null}
      <Text style={[text({ size: 18, weight: 700, tracking: -0.035 }), s.messageTitle, { color: c.g900 }]}>{st.title}</Text>
      <Text style={[text({ size: 13, leading: 1.7 }), s.messageBody, { color: c.g600 }]}>{st.body}</Text>
      {st.ctas?.length ? (
        <View style={s.ctaList}>
          {st.ctas.map((label, i) => (
            <Pressable key={label} accessibilityRole="button" style={[s.ctaBtn, i ? { borderWidth: 1, borderColor: c.g300 } : { backgroundColor: c.pri }]}>
              <Text style={[text({ size: 14.5, weight: 700 }), { color: i ? c.g700 : '#fff' }]}>{label}</Text>
            </Pressable>
          ))}
        </View>
      ) : null}
    </View>
  );
}

function ToastState({ c, st }: { c: Palette; st: StateDef }) {
  const bg = st.tone === 'err' ? c.dangerBg : st.tone === 'ok' ? c.priLightest : c.card;
  const border = st.tone === 'err' ? '#F5D6D6' : st.tone === 'ok' ? '#DCEBB8' : c.g200;
  const fg = st.tone === 'err' ? c.dangerDk : st.tone === 'ok' ? c.priDk : c.g700;
  const markBg = st.tone === 'err' ? c.dangerDk : c.pri;
  const btnBg = st.tone === 'err' ? c.dangerDk : c.g900;
  const btnLabel = st.ctas?.[0] ?? '다시 시도';

  return (
    <View style={s.toastWrap}>
      <View style={[s.toast, { backgroundColor: bg, borderColor: border }]}>
        {st.tone === 'busy' ? <PulsingDot color={fg} /> : null}
        {st.tone === 'ok' || st.tone === 'err' ? (
          <View style={[s.toastMark, { backgroundColor: markBg }]}>
            {st.tone === 'ok'
              ? <BigCheckGlyph color="#fff" size={12} strokeWidth={3.4} />
              : <Text style={[text({ size: 11, weight: 700 }), { color: c.card }]}>✕</Text>}
          </View>
        ) : null}
        <Text style={[text({ size: 13.5, weight: 600, leading: 1.55 }), s.flex1, { color: fg }]}>{st.title}</Text>
        {st.ctas?.length ? (
          <View style={[s.toastBtn, { backgroundColor: btnBg }]}>
            <Text style={[text({ size: 12, weight: 700 }), { color: c.card }]}>{btnLabel}</Text>
          </View>
        ) : null}
      </View>
      <Text style={[text({ size: 12, leading: 1.7 }), { color: c.g500 }]}>{st.body}</Text>
    </View>
  );
}

function PulsingDot({ color }: { color: string }) {
  const opacity = useRef(new Animated.Value(0.3)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.3, duration: 500, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [opacity]);
  return <Animated.View style={[s.dot, { backgroundColor: color, opacity }]} />;
}

const s = StyleSheet.create({
  screen: { flex: 1 },
  flex1: { flex: 1, minWidth: 0 },
  header: { height: 52, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingLeft: 20, paddingRight: 12, borderBottomWidth: 1 },

  tabsScroll: { flexGrow: 0, flexShrink: 0, borderBottomWidth: 1 },
  tabs: { paddingVertical: 12, paddingHorizontal: 20, gap: 6, alignItems: 'center' },
  tab: { minHeight: 32, paddingHorizontal: 12, borderRadius: 17, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },

  body: { padding: 20, flexGrow: 1 },
  skelWrap: { gap: 14 },

  messageCard: { paddingVertical: 34, paddingHorizontal: 22, borderRadius: 22, alignItems: 'center' },
  messageIconWrap: { width: 56, height: 56, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
  messageTitle: { marginTop: 18, textAlign: 'center' },
  messageBody: { marginTop: 8, maxWidth: 250, textAlign: 'center' },
  ctaList: { marginTop: 20, width: '100%', gap: 8 },
  ctaBtn: { width: '100%', minHeight: 50, borderRadius: 26, alignItems: 'center', justifyContent: 'center' },

  toastWrap: { paddingVertical: 20, gap: 12 },
  toast: { flexDirection: 'row', alignItems: 'center', gap: 11, padding: 15, paddingHorizontal: 16, borderRadius: 16, borderWidth: 1 },
  dot: { width: 8, height: 8, borderRadius: 5 },
  toastMark: { width: 22, height: 22, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  toastBtn: { minHeight: 34, paddingHorizontal: 12, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
});
