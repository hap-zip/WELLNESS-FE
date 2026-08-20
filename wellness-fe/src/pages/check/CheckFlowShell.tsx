import { useEffect } from 'react';
import type { ReactNode } from 'react';
import { Image, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View, type ImageSourcePropType, type StyleProp, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { Easing, useAnimatedStyle, useReducedMotion, useSharedValue, withTiming } from 'react-native-reanimated';

import { CloseGlyph, MonthPrevGlyph } from '@/components/glyphs';
import { text } from '@/theme/typography';
import { usePalette } from '@/theme/use-palette';
import { STEP_META } from './check.data';

/**
 * `Momgirok v8.dc.html` → `<sc-if value="{{ isCheck }}">` 의 공통 껍데기.
 * 헤더(뒤로·단계·닫기) + 진행바 + 제목/설명 + 본문 슬롯 + 하단 고정 CTA.
 */

export function CheckFlowShell({
  step, previousStep, character, cta, ctaDisabled, onBack, onClose, onNext, children,
}: {
  step: number;
  /** 진행바가 이 값 기준 너비에서 시작해 현재 단계까지 이어서 채워진다. */
  previousStep: number;
  character?: ImageSourcePropType;
  cta: string;
  ctaDisabled?: boolean;
  onBack: () => void;
  onClose: () => void;
  onNext: () => void;
  children: ReactNode;
}) {
  const c = usePalette();
  const insets = useSafeAreaInsets();
  const meta = STEP_META[step] ?? STEP_META[0];

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={[s.screen, { backgroundColor: c.card, paddingTop: insets.top }]}>
      <View style={s.header}>
        <Pressable accessibilityLabel="이전 단계" accessibilityRole="button" onPress={onBack} style={s.iconBtn}>
          <MonthPrevGlyph color={c.g800} size={20} />
        </Pressable>
        <Text style={[text({ size: 13, weight: 700 }), { color: c.g700 }]}>{meta.label}</Text>
        <Pressable accessibilityLabel="닫기" accessibilityRole="button" onPress={onClose} style={s.iconBtn}>
          <CloseGlyph color={c.g600} />
        </Pressable>
      </View>

      <View
        accessibilityLabel={`${STEP_META.length}단계 중 ${step + 1}단계`}
        accessibilityRole="progressbar"
        accessibilityValue={{ min: 1, max: STEP_META.length, now: step + 1 }}
        style={[s.progressTrack, { backgroundColor: c.g200 }]}>
        <ProgressFill from={(previousStep + 1) / STEP_META.length} style={[s.progressFill, { backgroundColor: c.pri }]} to={(step + 1) / STEP_META.length} />
      </View>

      <ScrollView contentContainerStyle={s.body} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <StepBody>
          <Text style={[text({ size: 24, weight: 700, tracking: -0.04, leading: 1.42 }), { color: c.g900 }]}>{meta.title}</Text>
          <View style={s.descRow}>
            {character ? <Image accessibilityIgnoresInvertColors resizeMode="contain" source={character} style={s.character} /> : null}
            <Text style={[text({ size: 14, leading: 1.7 }), s.descText, { color: c.g600 }]}>{meta.desc}</Text>
          </View>
          {children}
        </StepBody>
      </ScrollView>

      <View style={[s.footer, { borderTopColor: c.g200, paddingBottom: 26 + insets.bottom }]}>
        <CtaButton cta={cta} disabled={ctaDisabled} onPress={onNext} pri={c.pri} />
      </View>
    </KeyboardAvoidingView>
  );
}

/** B-10 하단 CTA. 누르는 동안 scale 0.975, 120ms. */
function CtaButton({ cta, disabled, onPress, pri }: { cta: string; disabled?: boolean; onPress: () => void; pri: string }) {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      onPressIn={() => { scale.value = withTiming(0.975, { duration: 120 }); }}
      onPressOut={() => { scale.value = withTiming(1, { duration: 120 }); }}>
      <Animated.View style={[s.cta, { backgroundColor: pri, opacity: disabled ? 0.5 : 1 }, animatedStyle]}>
        <Text style={[text({ size: 16, weight: 700, tracking: -0.02 }), { color: '#fff' }]}>{cta}</Text>
      </Animated.View>
    </Pressable>
  );
}

const STEP_EASE = Easing.bezier(0.22, 1, 0.36, 1);

/** B-11 단계 전환 등장 애니메이션 — opacity 0→1, translateY 10→0, 450ms. */
function StepBody({ children }: { children: ReactNode }) {
  const reduceMotion = useReducedMotion();
  const opacity = useSharedValue(reduceMotion ? 1 : 0);
  const translateY = useSharedValue(reduceMotion ? 0 : 10);
  useEffect(() => {
    if (!reduceMotion) {
      opacity.value = withTiming(1, { duration: 450, easing: STEP_EASE });
      translateY.value = withTiming(0, { duration: 450, easing: STEP_EASE });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const animatedStyle = useAnimatedStyle(() => ({ opacity: opacity.value, transform: [{ translateY: translateY.value }] }));
  return <Animated.View style={animatedStyle}>{children}</Animated.View>;
}

/**
 * B-2 진행바. 화면마다 새로 마운트되므로(단계 = 별도 라우트) `from`(직전 단계 비율)에서
 * 시작해 `to`(현재 단계 비율)까지 280ms 로 애니메이션한다 — 0으로 리셋되지 않고 이어진다.
 * 뒤로 갈 때는 `from` > `to` 라 같은 곡선으로 줄어든다.
 */
function ProgressFill({ from, to, style }: { from: number; to: number; style?: StyleProp<ViewStyle> }) {
  const reduceMotion = useReducedMotion();
  const scale = useSharedValue(reduceMotion ? to : from);
  useEffect(() => {
    if (!reduceMotion) scale.value = withTiming(to, { duration: 280, easing: STEP_EASE });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scaleX: scale.value }] }));
  return <Animated.View pointerEvents="none" style={[{ transformOrigin: 'left center' }, style, animatedStyle]} />;
}

const s = StyleSheet.create({
  screen: { flex: 1 },
  header: { height: 52, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 8 },
  iconBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  progressTrack: { marginHorizontal: 20, height: 4, borderRadius: 3, overflow: 'hidden' },
  progressFill: { ...StyleSheet.absoluteFillObject, borderRadius: 3 },
  body: { paddingTop: 24, paddingHorizontal: 20, paddingBottom: 20 },
  descRow: { marginTop: 12, flexDirection: 'row', alignItems: 'center', gap: 10 },
  character: { width: 96, height: 96, marginTop: -14, marginRight: -6, marginBottom: -14, marginLeft: -12 },
  descText: { flex: 1, minWidth: 0 },
  footer: { paddingHorizontal: 20, paddingTop: 12, borderTopWidth: 1 },
  cta: { height: 54, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
});
