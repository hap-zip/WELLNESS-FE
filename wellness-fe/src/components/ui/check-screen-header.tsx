import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { Href } from 'expo-router';

import NavigationBackButton from '@/components/navigation-back-button';
import { colors, layout, motion, spacing, typography } from '@/theme/tokens';

type Props = {
  backLabel?: string;
  description: string;
  fallbackHref?: Href;
  leading?: ReactNode;
  onSkip?: () => void;
  skipLabel?: string;
  step: number;
  title: string;
  total?: number;
};

export function CheckScreenHeader({ backLabel, description, fallbackHref, leading, onSkip, skipLabel = '건너뛰기', step, title, total = 5 }: Props) {
  return (
    <>
      <CheckProgress step={step} total={total} />
      <View style={styles.topBar}>
        {leading ?? (fallbackHref && backLabel ? <NavigationBackButton accessibilityLabel={backLabel} fallbackHref={fallbackHref} /> : <View style={styles.touchPlaceholder} />)}
        {onSkip ? <Pressable accessibilityRole="button" onPress={onSkip} style={({ pressed }) => [styles.skip, pressed && styles.pressed]}><Text style={styles.skipText}>{skipLabel}</Text></Pressable> : null}
      </View>
      <CheckIntro description={description} step={step} title={title} total={total} />
    </>
  );
}

export function CheckProgress({ step, total = 5 }: { step: number; total?: number }) {
  return <View accessibilityLabel={`오늘의 체크 ${step}단계, 전체 ${total}단계`} accessibilityRole="progressbar" accessibilityValue={{ min: 1, max: total, now: step }} style={styles.progressTrack}><View style={[styles.progressValue, { width: `${Math.round((step / total) * 100)}%` }]} /></View>;
}

export function CheckIntro({ description, inset = true, step, title, total = 5 }: Pick<Props, 'description' | 'step' | 'title' | 'total'> & { inset?: boolean }) {
  return <View style={[styles.copy, !inset && styles.copyEmbedded]}><Text style={styles.step}>오늘의 기록 {step}/{total}</Text><Text accessibilityRole="header" style={styles.title}>{title}</Text><Text style={styles.description}>{description}</Text></View>;
}

const styles = StyleSheet.create({
  progressTrack: { height: 4, backgroundColor: colors.surfaceStrong },
  progressValue: { height: '100%', backgroundColor: colors.body },
  topBar: { minHeight: 64, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.xs, borderBottomWidth: 1, borderColor: colors.border },
  touchPlaceholder: { width: layout.minTouch, height: layout.minTouch },
  skip: { minHeight: layout.minTouch, justifyContent: 'center', paddingHorizontal: spacing.sm },
  skipText: { color: colors.textSecondary, ...typography.label },
  copy: { paddingHorizontal: layout.horizontalPadding, paddingTop: spacing.sm },
  copyEmbedded: { paddingHorizontal: 0 },
  step: { color: colors.body, ...typography.caption, fontWeight:'800', fontVariant: ['tabular-nums'] },
  title: { maxWidth: 360, marginTop: spacing.xs, color: colors.text, fontSize: 30, lineHeight: 37, fontWeight: '800', letterSpacing: -1.1 },
  description: { maxWidth: 350, marginTop: spacing.sm, color: colors.textSecondary, ...typography.body },
  pressed: { opacity: motion.pressOpacity },
});
