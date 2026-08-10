import { StyleSheet } from 'react-native';
import { colors, layout, motion, radius, spacing, typography } from '@/theme/tokens';

export const styles = StyleSheet.create({
  screen: { flex: 1, alignItems: 'center', backgroundColor: colors.surface },
  shell: { flex: 1, maxWidth: layout.maxContentWidth },
  topBar: { minHeight: 68, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: layout.horizontalPadding },
  skipButton: { minHeight: layout.minTouch, justifyContent: 'center' },
  skipText: { color: colors.textMuted, ...typography.caption, fontWeight: '700' },
  progress: { height: 3, flexDirection: 'row', gap: spacing.xs, marginHorizontal: layout.horizontalPadding },
  progressItem: { flex: 1, backgroundColor: colors.surfaceStrong },
  progressActive: { backgroundColor: colors.primary },
  page: { paddingTop: spacing.lg },
  copy: { paddingHorizontal: layout.horizontalPadding, paddingTop: spacing.md },
  title: { maxWidth: 500, color: colors.text, ...typography.display },
  description: { maxWidth: 450, marginTop: spacing.sm, color: colors.textSecondary, ...typography.body },
  note: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: spacing.lg },
  noteLine: { width: 24, height: 3, borderRadius: 2, backgroundColor: colors.primary },
  noteText: { flex: 1, color: colors.textMuted, ...typography.caption },
  footer: { paddingHorizontal: layout.horizontalPadding, paddingTop: spacing.sm, paddingBottom: spacing.sm, backgroundColor: colors.surface },
  nextButton: { minHeight: layout.ctaHeight, alignItems: 'center', justifyContent: 'center', borderRadius: radius.md, backgroundColor: colors.primary },
  nextButtonText: { color: colors.white, fontSize: 16, fontWeight:'700' },
  pressed: { opacity: motion.pressOpacity },
});
