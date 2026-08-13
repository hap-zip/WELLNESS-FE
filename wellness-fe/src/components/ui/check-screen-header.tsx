import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter, type Href } from 'expo-router';

import { AppIcon } from '@/components/app-icon';
import NavigationBackButton from '@/components/navigation-back-button';
import { colors, layout, motion, spacing, typography } from '@/theme/tokens';

type Props = {
  backLabel?: string;
  description: string;
  fallbackHref?: Href;
  leading?: ReactNode;
  onClose?: () => void;
  onSkip?: () => void;
  skipLabel?: string;
  step: number;
  title: string;
  total?: number;
};

export function CheckScreenHeader({ backLabel, description, fallbackHref, leading, onClose, onSkip, skipLabel = '건너뛰기', step, title, total = 4 }: Props) {
  return (
    <>
      <CheckFlowHeader backLabel={backLabel} fallbackHref={fallbackHref} leading={leading} onClose={onClose} step={step} total={total} />
      <CheckIntro description={description} step={step} title={title} total={total} />
      {onSkip ? <Pressable accessibilityRole="button" onPress={onSkip} style={({ pressed }) => [styles.skip, pressed && styles.pressed]}><Text style={styles.skipText}>{skipLabel}</Text></Pressable> : null}
    </>
  );
}

export function CheckFlowHeader({ backLabel, fallbackHref, leading, onClose, step, total = 4 }: Pick<Props, 'backLabel' | 'fallbackHref' | 'leading' | 'onClose' | 'step' | 'total'>) {
  const router = useRouter();
  const stage = (total === 4 ? ['자동 수집', '불편 기록', '자세·베개', '검토'] : ['자동 수집', '불편 부위', '강도·느낌', '수면', '활동·피부', '검토'])[step - 1] ?? '기록';
  return <>
    <View style={styles.topBar}>
      {leading ?? (fallbackHref && backLabel ? <NavigationBackButton accessibilityLabel={backLabel} fallbackHref={fallbackHref} /> : <View style={styles.touchPlaceholder} />)}
      <Text accessibilityRole="header" style={styles.stage}>{step} / {total} {stage}</Text>
      <Pressable accessibilityLabel="기록 닫기" accessibilityRole="button" hitSlop={4} onPress={onClose ?? (() => router.dismissTo('/(tabs)/home'))} style={({ pressed }) => [styles.close, pressed && styles.pressed]}><AppIcon color={colors.textMuted} name="close" size={22}/></Pressable>
    </View>
    <CheckProgress step={step} total={total} />
  </>;
}

export function CheckProgress({ step, total = 4 }: { step: number; total?: number }) {
  return <View accessibilityLabel={`오늘의 체크 ${step}단계, 전체 ${total}단계`} accessibilityRole="progressbar" accessibilityValue={{ min: 1, max: total, now: step }} style={styles.progressTrack}><View style={[styles.progressValue, { width: `${Math.round((step / total) * 100)}%` }]} /></View>;
}

export function CheckIntro({ description, inset = true, step, title, total = 4 }: Pick<Props, 'description' | 'step' | 'title' | 'total'> & { inset?: boolean }) {
  void step;
  void total;
  return <View style={[styles.copy, !inset && styles.copyEmbedded]}><Text accessibilityRole="header" style={styles.title}>{title.replaceAll('\\n', '\n')}</Text><Text style={styles.description}>{description}</Text></View>;
}

const styles = StyleSheet.create({
  progressTrack: { height: 4, marginHorizontal: layout.horizontalPadding, overflow: 'hidden', borderRadius: 3, backgroundColor: colors.surfaceStrong },
  progressValue: { height: '100%', backgroundColor: colors.primary },
  topBar: { minHeight: 52, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.xs },
  touchPlaceholder: { width: layout.minTouch, height: layout.minTouch },
  stage: { flex: 1, color: colors.textSecondary, textAlign: 'center', fontSize: 13, lineHeight: 19, fontWeight: '700', fontVariant: ['tabular-nums'] },
  close: { width: layout.minTouch, height: layout.minTouch, alignItems: 'center', justifyContent: 'center' },
  skip: { minHeight: layout.minTouch, alignSelf: 'flex-end', justifyContent: 'center', marginRight: layout.horizontalPadding, paddingHorizontal: spacing.sm },
  skipText: { color: colors.textSecondary, ...typography.label },
  copy: { paddingHorizontal: layout.horizontalPadding, paddingTop: spacing.xxl },
  copyEmbedded: { paddingHorizontal: 0 },
  title: { maxWidth: 360, color: colors.text, fontSize: 24, lineHeight: 34, fontWeight: '700', letterSpacing: -.96 },
  description: { maxWidth: 350, marginTop: spacing.sm, color: colors.textSecondary, ...typography.body },
  pressed: { opacity: motion.pressOpacity },
});
