import type { ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CloseGlyph, MonthPrevGlyph } from '@/components/glyphs';
import { AnimatedProgressFill } from '@/components/ui/animated-progress-fill';
import { text } from '@/theme/typography';
import { usePalette } from '@/theme/use-palette';
import { STEP_META } from './check.data';

/**
 * `Momgirok v8.dc.html` → `<sc-if value="{{ isCheck }}">` 의 공통 껍데기.
 * 헤더(뒤로·단계·닫기) + 진행바 + 제목/설명 + 본문 슬롯 + 하단 고정 CTA.
 */

export function CheckFlowShell({
  step, cta, ctaDisabled, onBack, onClose, onNext, children,
}: {
  step: number;
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
      <View style={[s.header, { borderBottomColor: c.g200 }]}>
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
        <AnimatedProgressFill progress={(step + 1) / STEP_META.length} style={[s.progressFill, { backgroundColor: c.pri }]} />
      </View>

      <ScrollView contentContainerStyle={s.body} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <Text style={[text({ size: 24, weight: 700, tracking: -0.04, leading: 1.42 }), { color: c.g900 }]}>{meta.title}</Text>
        <Text style={[text({ size: 14, leading: 1.7 }), s.desc, { color: c.g600 }]}>{meta.desc}</Text>
        {children}
      </ScrollView>

      <View style={[s.footer, { borderTopColor: c.g200, paddingBottom: 26 + insets.bottom }]}>
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ disabled: ctaDisabled }}
          disabled={ctaDisabled}
          onPress={onNext}
          style={({ pressed }) => [s.cta, { backgroundColor: c.pri, opacity: ctaDisabled ? 0.5 : 1 }, pressed && !ctaDisabled && s.pressed]}>
          <Text style={[text({ size: 16, weight: 700, tracking: -0.02 }), { color: '#fff' }]}>{cta}</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1 },
  header: { height: 52, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 8, borderBottomWidth: StyleSheet.hairlineWidth },
  iconBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  progressTrack: { marginHorizontal: 20, height: 4, borderRadius: 3, overflow: 'hidden' },
  progressFill: { ...StyleSheet.absoluteFillObject, borderRadius: 3 },
  body: { paddingTop: 24, paddingHorizontal: 20, paddingBottom: 20 },
  desc: { marginTop: 10 },
  footer: { paddingHorizontal: 20, paddingTop: 12, borderTopWidth: 1 },
  cta: { height: 54, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
  pressed: { transform: [{ scale: 0.975 }] },
});
